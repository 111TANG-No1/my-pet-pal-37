import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { getPets, deletePet, addPet, generateId } from '@/lib/storage';
import { PET_AVATARS, SPECIES_OPTIONS } from '@/lib/mock-data';
import { Pet } from '@/types/pet';
import PetAvatar from '@/components/PetAvatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PetList() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', species: '狗', breed: '', avatar: '🐕' });
  const navigate = useNavigate();

  useEffect(() => { setPets(getPets()); }, []);

  const handleAdd = () => {
    if (!form.name.trim()) return;
    const pet: Pet = {
      id: generateId(),
      name: form.name,
      species: form.species,
      breed: form.breed,
      gender: '未知',
      birthday: '',
      neutered: false,
      vaccinated: false,
      personality: [],
      temperamentNote: '',
      allergies: [],
      avatar: form.avatar,
      medicalHistory: [],
      reminders: [],
      photos: [],
    };
    addPet(pet);
    setPets(getPets());
    setForm({ name: '', species: '狗', breed: '', avatar: '🐕' });
    setOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('确定删除该宠物？')) {
      deletePet(id);
      setPets(getPets());
    }
  };

  return (
    <div className="p-4">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">🐾 我的宠物</h1>
          <p className="text-sm text-muted-foreground mt-1">管理您的宠物健康档案</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="rounded-full h-10 w-10 shadow-md">
              <Plus className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>添加宠物</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="flex gap-2 flex-wrap">
                {PET_AVATARS.map(a => (
                  <button
                    key={a}
                    onClick={() => setForm(f => ({ ...f, avatar: a }))}
                    className={`text-2xl p-2 rounded-xl transition-all ${form.avatar === a ? 'bg-primary/10 ring-2 ring-primary scale-110' : 'hover:bg-muted'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <div>
                <Label>名字</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="宠物名字" />
              </div>
              <div>
                <Label>种类</Label>
                <Select value={form.species} onValueChange={v => setForm(f => ({ ...f, species: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SPECIES_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>品种</Label>
                <Input value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} placeholder="如：金毛、英短" />
              </div>
              <Button onClick={handleAdd} className="w-full">添加</Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {pets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <span className="text-6xl mb-4">🐾</span>
          <p className="text-lg font-medium">还没有宠物</p>
          <p className="text-sm">点击右上角 + 添加您的第一只宠物</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {pets.map(pet => (
            <Card
              key={pet.id}
              className="flex items-center gap-4 p-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
              onClick={() => navigate(`/pet/${pet.id}`)}
            >
              <div className="text-4xl w-14 h-14 flex items-center justify-center rounded-2xl bg-muted">
                {pet.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base truncate">{pet.name}</h3>
                <p className="text-sm text-muted-foreground">{pet.species}{pet.breed ? `·${pet.breed}` : ''}</p>
              </div>
              <button
                onClick={(e) => handleDelete(e, pet.id)}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
