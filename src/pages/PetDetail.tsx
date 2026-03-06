import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Edit, Trash2, Plus, X, Bell } from 'lucide-react';
import { getPetById, updatePet, generateId } from '@/lib/storage';
import { COMMON_ALLERGIES, PERSONALITY_OPTIONS, SPECIES_OPTIONS } from '@/lib/mock-data';
import { Pet, MedicalRecord, Reminder } from '@/types/pet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { format, differenceInDays, parseISO } from 'date-fns';
import PetAvatar from '@/components/PetAvatar';
import PhotoGallery from '@/components/PhotoGallery';

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [editInfo, setEditInfo] = useState(false);
  const [allergyInput, setAllergyInput] = useState('');
  const [medicalOpen, setMedicalOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [medicalForm, setMedicalForm] = useState({ date: '', symptom: '', note: '' });
  const [reminderForm, setReminderForm] = useState({ date: '', type: '驱虫' as Reminder['type'], customType: '', note: '', advanceDays: 3 });

  useEffect(() => {
    if (id) {
      const p = getPetById(id);
      if (p) {
        // Migrate old data missing new fields
        setPet({ temperamentNote: '', photos: [], ...p });
      } else navigate('/');
    }
  }, [id]);

  const save = (updated: Pet) => {
    setPet(updated);
    updatePet(updated);
  };

  if (!pet) return null;

  const upcomingReminders = pet.reminders
    .filter(r => !r.completed)
    .sort((a, b) => a.date.localeCompare(b.date));
  const nextReminder = upcomingReminders[0];

  const toggleAllergy = (a: string) => {
    const allergies = pet.allergies.includes(a)
      ? pet.allergies.filter(x => x !== a)
      : [...pet.allergies, a];
    save({ ...pet, allergies });
  };

  const addCustomAllergy = () => {
    if (allergyInput.trim() && !pet.allergies.includes(allergyInput.trim())) {
      save({ ...pet, allergies: [...pet.allergies, allergyInput.trim()] });
      setAllergyInput('');
    }
  };

  const addMedicalRecord = () => {
    if (!medicalForm.date || !medicalForm.symptom) return;
    const record: MedicalRecord = { id: editingRecord?.id || generateId(), ...medicalForm, images: editingRecord?.images || [] };
    const history = editingRecord
      ? pet.medicalHistory.map(r => r.id === record.id ? record : r)
      : [...pet.medicalHistory, record];
    save({ ...pet, medicalHistory: history });
    setMedicalForm({ date: '', symptom: '', note: '' });
    setEditingRecord(null);
    setMedicalOpen(false);
  };

  const deleteRecord = (rid: string) => {
    save({ ...pet, medicalHistory: pet.medicalHistory.filter(r => r.id !== rid) });
  };

  const addReminder = () => {
    if (!reminderForm.date) return;
    const reminder: Reminder = {
      id: generateId(),
      date: reminderForm.date,
      type: reminderForm.type,
      customType: reminderForm.customType,
      note: reminderForm.note,
      advanceDays: reminderForm.advanceDays,
      completed: false,
    };
    save({ ...pet, reminders: [...pet.reminders, reminder] });
    setReminderForm({ date: '', type: '驱虫', customType: '', note: '', advanceDays: 3 });
    setReminderOpen(false);
  };

  const toggleReminder = (rid: string) => {
    save({
      ...pet,
      reminders: pet.reminders.map(r => r.id === rid ? { ...r, completed: !r.completed } : r),
    });
  };

  const togglePersonality = (p: string) => {
    const personality = pet.personality.includes(p)
      ? pet.personality.filter(x => x !== p)
      : [...pet.personality, p];
    save({ ...pet, personality });
  };

  return (
    <div className="p-4">
      <button onClick={() => navigate('/')} className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> 返回
      </button>

      {/* Header with uploadable avatar */}
      <div className="flex items-center gap-4 mb-6">
        <PetAvatar
          avatar={pet.avatar}
          size="md"
          editable
          onAvatarChange={(url) => save({ ...pet, avatar: url })}
        />
        <div>
          <h1 className="text-xl font-bold">{pet.name}</h1>
          <p className="text-sm text-muted-foreground">{pet.species}{pet.breed ? `·${pet.breed}` : ''}</p>
        </div>
      </div>

      <Tabs defaultValue="health" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="health">健康档案</TabsTrigger>
          <TabsTrigger value="gallery">图库</TabsTrigger>
          <TabsTrigger value="reminders">提醒</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-6 mt-4">
          {/* Basic Info */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">基本信息</h3>
              <Button variant="ghost" size="sm" onClick={() => setEditInfo(!editInfo)}>
                <Edit className="h-4 w-4 mr-1" />{editInfo ? '完成' : '编辑'}
              </Button>
            </div>
            {editInfo ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">性别</Label>
                    <Select value={pet.gender} onValueChange={v => save({ ...pet, gender: v as Pet['gender'] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="公">公</SelectItem>
                        <SelectItem value="母">母</SelectItem>
                        <SelectItem value="未知">未知</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">生日</Label>
                    <Input type="date" value={pet.birthday} onChange={e => save({ ...pet, birthday: e.target.value })} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>已绝育</Label>
                  <Switch checked={pet.neutered} onCheckedChange={v => save({ ...pet, neutered: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>疫苗已更新</Label>
                  <Switch checked={pet.vaccinated} onCheckedChange={v => save({ ...pet, vaccinated: v })} />
                </div>
                <div>
                  <Label className="text-xs mb-2 block">性格标签</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {PERSONALITY_OPTIONS.map(p => (
                      <Badge
                        key={p}
                        variant={pet.personality.includes(p) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => togglePersonality(p)}
                      >{p}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">自定义性格描述</Label>
                  <Textarea
                    value={pet.temperamentNote}
                    onChange={e => save({ ...pet, temperamentNote: e.target.value })}
                    placeholder="用自己的话描述宠物的性格特点…"
                    className="min-h-[60px]"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex gap-4">
                  <span className="text-muted-foreground">性别</span><span>{pet.gender}</span>
                  <span className="text-muted-foreground">生日</span><span>{pet.birthday || '未设置'}</span>
                </div>
                <div className="flex gap-3">
                  <Badge variant={pet.neutered ? 'default' : 'outline'}>{pet.neutered ? '已绝育' : '未绝育'}</Badge>
                  <Badge variant={pet.vaccinated ? 'default' : 'outline'}>{pet.vaccinated ? '疫苗已更新' : '疫苗待更新'}</Badge>
                </div>
                {pet.personality.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {pet.personality.map(p => <Badge key={p} variant="secondary">{p}</Badge>)}
                  </div>
                )}
                {pet.temperamentNote && (
                  <p className="text-muted-foreground text-xs leading-relaxed whitespace-pre-wrap">{pet.temperamentNote}</p>
                )}
              </div>
            )}
          </Card>

          {/* Allergies */}
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold">过敏原</h3>
            {pet.allergies.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {pet.allergies.map(a => (
                  <Badge key={a} variant="destructive" className="cursor-pointer gap-1" onClick={() => toggleAllergy(a)}>
                    {a} <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">常用：</p>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_ALLERGIES.map(a => (
                  <Badge
                    key={a}
                    variant={pet.allergies.includes(a) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleAllergy(a)}
                  >{a}</Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                value={allergyInput}
                onChange={e => setAllergyInput(e.target.value)}
                placeholder="自定义过敏原"
                onKeyDown={e => e.key === 'Enter' && addCustomAllergy()}
                className="flex-1"
              />
              <Button size="sm" variant="outline" onClick={addCustomAllergy}>添加</Button>
            </div>
          </Card>

          {/* Medical History */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">病史时间线</h3>
              <Button size="sm" variant="outline" onClick={() => {
                setEditingRecord(null);
                setMedicalForm({ date: format(new Date(), 'yyyy-MM-dd'), symptom: '', note: '' });
                setMedicalOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-1" />新增
              </Button>
            </div>
            {pet.medicalHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">暂无病史记录</p>
            ) : (
              <div className="space-y-3">
                {[...pet.medicalHistory].sort((a, b) => b.date.localeCompare(a.date)).map(record => (
                  <div key={record.id} className="border rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{record.date}</span>
                        <span className="font-medium text-sm">{record.symptom}</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          className="p-1 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setEditingRecord(record);
                            setMedicalForm({ date: record.date, symptom: record.symptom, note: record.note });
                            setMedicalOpen(true);
                          }}
                        ><Edit className="h-3.5 w-3.5" /></button>
                        <button
                          className="p-1 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteRecord(record.id)}
                        ><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                    {record.note && <p className="text-xs text-muted-foreground">{record.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Dialog open={medicalOpen} onOpenChange={setMedicalOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>{editingRecord ? '编辑病史' : '新增病史'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>日期</Label>
                  <Input type="date" value={medicalForm.date} onChange={e => setMedicalForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <Label>症状</Label>
                  <Input value={medicalForm.symptom} onChange={e => setMedicalForm(f => ({ ...f, symptom: e.target.value }))} placeholder="如：软便、咳嗽" />
                </div>
                <div>
                  <Label>备注</Label>
                  <Textarea value={medicalForm.note} onChange={e => setMedicalForm(f => ({ ...f, note: e.target.value }))} placeholder="详细描述..." />
                </div>
                <Button onClick={addMedicalRecord} className="w-full">保存</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="mt-4">
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold">📸 {pet.name}的图库</h3>
            <PhotoGallery
              photos={pet.photos || []}
              petId={pet.id}
              onPhotosChange={(photos) => save({ ...pet, photos })}
            />
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-6 mt-4">
          {nextReminder && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <Bell className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-primary">下一个提醒</span>
              </div>
              <p className="font-semibold">
                {nextReminder.date} {nextReminder.type === '自定义' ? nextReminder.customType : nextReminder.type}
              </p>
              <p className="text-xs text-muted-foreground">
                提前 {nextReminder.advanceDays} 天提醒
                {(() => {
                  const days = differenceInDays(parseISO(nextReminder.date), new Date());
                  return days >= 0 ? `（还有 ${days} 天）` : `（已过期 ${-days} 天）`;
                })()}
              </p>
            </Card>
          )}

          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">提醒列表</h3>
              <Button size="sm" variant="outline" onClick={() => {
                setReminderForm({ date: '', type: '驱虫', customType: '', note: '', advanceDays: 3 });
                setReminderOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-1" />新建
              </Button>
            </div>
            {pet.reminders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">暂无提醒</p>
            ) : (
              <div className="space-y-2">
                {[...pet.reminders].sort((a, b) => a.date.localeCompare(b.date)).map(r => (
                  <div key={r.id} className={`flex items-center gap-3 p-3 border rounded-lg ${r.completed ? 'opacity-50' : ''}`}>
                    <button
                      onClick={() => toggleReminder(r.id)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        r.completed ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'
                      }`}
                    >
                      {r.completed && <span className="text-xs">✓</span>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${r.completed ? 'line-through' : ''}`}>
                        {r.type === '自定义' ? r.customType : r.type}
                      </p>
                      <p className="text-xs text-muted-foreground">{r.date}{r.note ? ` · ${r.note}` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Dialog open={reminderOpen} onOpenChange={setReminderOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>新建提醒</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>日期</Label>
                  <Input type="date" value={reminderForm.date} onChange={e => setReminderForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <Label>类型</Label>
                  <Select value={reminderForm.type} onValueChange={v => setReminderForm(f => ({ ...f, type: v as Reminder['type'] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="驱虫">驱虫</SelectItem>
                      <SelectItem value="复诊">复诊</SelectItem>
                      <SelectItem value="疫苗">疫苗</SelectItem>
                      <SelectItem value="自定义">自定义</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {reminderForm.type === '自定义' && (
                  <div>
                    <Label>自定义类型</Label>
                    <Input value={reminderForm.customType} onChange={e => setReminderForm(f => ({ ...f, customType: e.target.value }))} placeholder="如：洗牙" />
                  </div>
                )}
                <div>
                  <Label>提前提醒（天）</Label>
                  <Input type="number" value={reminderForm.advanceDays} onChange={e => setReminderForm(f => ({ ...f, advanceDays: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>备注</Label>
                  <Input value={reminderForm.note} onChange={e => setReminderForm(f => ({ ...f, note: e.target.value }))} placeholder="可选备注" />
                </div>
                <Button onClick={addReminder} className="w-full">添加提醒</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
