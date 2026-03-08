import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, List, Map, Filter, Heart, Plus, Phone, Clock, Search, X } from 'lucide-react';
import { mockDiscoverPets, PLACE_CATEGORIES, PLACE_CATEGORY_ICONS, PLACE_CATEGORY_LABELS } from '@/lib/mock-data';
import { getLikes, toggleLike, getSettings, getPlaces, addPlace, generateId } from '@/lib/storage';
import { PetPlace, PlaceCategory } from '@/types/pet';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Discover() {
  const navigate = useNavigate();
  const [likes, setLikes] = useState<string[]>(getLikes());
  const [filters, setFilters] = useState({ species: '', gender: '', neutered: '', vaccinated: '' });
  const [petView, setPetView] = useState<'list' | 'map'>('list');
  const [placeView, setPlaceView] = useState<'list' | 'map'>('list');
  const [places, setPlaces] = useState<PetPlace[]>(getPlaces());
  const [visibleCategories, setVisibleCategories] = useState<Set<PlaceCategory>>(new Set(PLACE_CATEGORIES));
  const [addPlaceOpen, setAddPlaceOpen] = useState(false);
  const [placeForm, setPlaceForm] = useState({ name: '', category: '医院/诊所' as PlaceCategory, address: '', phone: '', hours: '' });
  const [placeSearch, setPlaceSearch] = useState('');
  const [activeTab, setActiveTab] = useState('pets');
  const petMapRef = useRef<HTMLDivElement>(null);
  const placeMapRef = useRef<HTMLDivElement>(null);
  const petMapInstanceRef = useRef<any>(null);
  const placeMapInstanceRef = useRef<any>(null);
  const settings = getSettings();

  const filteredPets = mockDiscoverPets.filter(p => {
    if (filters.species && p.species !== filters.species) return false;
    if (filters.gender && p.gender !== filters.gender) return false;
    if (filters.neutered && (filters.neutered === '是' ? !p.neutered : p.neutered)) return false;
    if (filters.vaccinated && (filters.vaccinated === '是' ? !p.vaccinated : p.vaccinated)) return false;
    return true;
  });

  const filteredPlaces = places.filter(p => {
    if (!visibleCategories.has(p.category)) return false;
    if (placeSearch.trim()) {
      const q = placeSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.address.toLowerCase().includes(q) || (p.tags || []).some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  const handleLike = (e: React.MouseEvent, petId: string) => {
    e.stopPropagation();
    setLikes(toggleLike(petId));
  };

  const toggleCategory = (cat: PlaceCategory) => {
    setVisibleCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const handleAddPlace = () => {
    if (!placeForm.name || !placeForm.address) return;
    const newPlace: PetPlace = {
      id: generateId(),
      name: placeForm.name,
      category: placeForm.category,
      address: placeForm.address,
      phone: placeForm.phone || undefined,
      hours: placeForm.hours || undefined,
      lat: 39.9042 + (Math.random() - 0.5) * 0.03,
      lng: 116.4074 + (Math.random() - 0.5) * 0.03,
    };
    addPlace(newPlace);
    setPlaces(prev => [...prev, newPlace]);
    setPlaceForm({ name: '', category: '医院/诊所', address: '', phone: '', hours: '' });
    setAddPlaceOpen(false);
  };

  // Pet map
  useEffect(() => {
    if (activeTab === 'pets' && petView === 'map' && petMapRef.current && !petMapInstanceRef.current) {
      import('leaflet').then(L => {
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }
        const map = L.map(petMapRef.current!).setView([39.9042, 116.4074], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
        filteredPets.forEach(pet => {
          const icon = L.divIcon({ html: `<div style="font-size:24px;text-align:center">${pet.avatar}</div>`, className: 'bg-transparent', iconSize: [32, 32] });
          L.marker([pet.lat, pet.lng], { icon }).addTo(map).bindPopup(`<b>${pet.name}</b><br/>${pet.species}·${pet.breed}<br/>${pet.distance}`);
        });
        petMapInstanceRef.current = map;
        setTimeout(() => map.invalidateSize(), 100);
      });
    }
    return () => {
      if ((activeTab !== 'pets' || petView !== 'map') && petMapInstanceRef.current) {
        petMapInstanceRef.current.remove();
        petMapInstanceRef.current = null;
      }
    };
  }, [activeTab, petView, filteredPets]);

  // Place map
  useEffect(() => {
    if (activeTab === 'places' && placeView === 'map' && placeMapRef.current && !placeMapInstanceRef.current) {
      import('leaflet').then(L => {
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }
        const map = L.map(placeMapRef.current!).setView([39.9042, 116.4074], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
        filteredPlaces.forEach(place => {
          const emoji = PLACE_CATEGORY_ICONS[place.category];
          const icon = L.divIcon({
            html: `<div style="font-size:20px;text-align:center;background:white;border-radius:50%;width:32px;height:32px;line-height:32px;box-shadow:0 2px 6px rgba(0,0,0,0.2)">${emoji}</div>`,
            className: 'bg-transparent', iconSize: [32, 32],
          });
          let popup = `<b>${emoji} ${place.name}</b><br/><span style="color:#888;font-size:12px">${place.category}</span><br/>${place.address}`;
          if (place.phone) popup += `<br/>📞 ${place.phone}`;
          if (place.hours) popup += `<br/>🕐 ${place.hours}`;
          L.marker([place.lat, place.lng], { icon }).addTo(map).bindPopup(popup);
        });
        placeMapInstanceRef.current = map;
        setTimeout(() => map.invalidateSize(), 100);
      });
    }
    return () => {
      if ((activeTab !== 'places' || placeView !== 'map') && placeMapInstanceRef.current) {
        placeMapInstanceRef.current.remove();
        placeMapInstanceRef.current = null;
      }
    };
  }, [activeTab, placeView, filteredPlaces]);

  const ViewToggle = ({ view, setView }: { view: 'list' | 'map'; setView: (v: 'list' | 'map') => void }) => (
    <div className="flex gap-1 bg-muted rounded-lg p-0.5">
      <button onClick={() => setView('list')} className={`px-3 py-1 text-sm rounded-md transition-colors ${view === 'list' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'}`}>
        <List className="h-4 w-4 inline mr-1" />列表
      </button>
      <button onClick={() => setView('map')} className={`px-3 py-1 text-sm rounded-md transition-colors ${view === 'map' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'}`}>
        <Map className="h-4 w-4 inline mr-1" />地图
      </button>
    </div>
  );

  return (
    <div className="p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">发现</h1>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="pets">🐾 宠友</TabsTrigger>
          <TabsTrigger value="places">📍 地点</TabsTrigger>
        </TabsList>

        {/* 宠友 Tab */}
        <TabsContent value="pets" className="space-y-3 mt-0">
          <div className="flex items-center justify-between">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1" />筛选</Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[60vh]">
                <SheetHeader><SheetTitle>筛选条件</SheetTitle></SheetHeader>
                <div className="space-y-4 py-4">
                  {[
                    { label: '种类', key: 'species', options: ['狗', '猫', '兔', '仓鼠', '鸟'] },
                    { label: '性别', key: 'gender', options: ['公', '母'] },
                    { label: '绝育', key: 'neutered', options: ['是', '否'] },
                    { label: '疫苗', key: 'vaccinated', options: ['是', '否'] },
                  ].map(({ label, key, options }) => (
                    <div key={key}>
                      <Label>{label}</Label>
                      <Select value={(filters as any)[key]} onValueChange={v => setFilters(f => ({ ...f, [key]: v }))}>
                        <SelectTrigger><SelectValue placeholder="全部" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value=" ">全部</SelectItem>
                          {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={() => setFilters({ species: '', gender: '', neutered: '', vaccinated: '' })}>重置</Button>
                </div>
              </SheetContent>
            </Sheet>
            <ViewToggle view={petView} setView={setPetView} />
          </div>

          {petView === 'list' ? (
            <div className="space-y-3">
              {filteredPets.map(pet => (
                <Card key={pet.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]" onClick={() => navigate(`/profile/${pet.id}`)}>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl w-12 h-12 flex items-center justify-center rounded-xl bg-muted">{pet.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{pet.name}</span>
                        <span className="text-xs text-muted-foreground">{pet.species}·{pet.breed}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{pet.distance}</span>
                      </div>
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {pet.personality.map(p => <Badge key={p} variant="secondary" className="text-xs px-1.5 py-0">{p}</Badge>)}
                        <Badge variant={pet.vaccinated ? 'default' : 'outline'} className="text-xs px-1.5 py-0">
                          {pet.vaccinated ? '已免疫' : '待免疫'}
                        </Badge>
                      </div>
                    </div>
                    <button onClick={e => handleLike(e, pet.id)} className={`p-2 rounded-full transition-colors ${likes.includes(pet.id) ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'}`}>
                      <Heart className={`h-5 w-5 ${likes.includes(pet.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div ref={petMapRef} className="w-full h-[55vh] rounded-xl overflow-hidden border" />
          )}
        </TabsContent>

        {/* 地点 Tab */}
        <TabsContent value="places" className="space-y-3 mt-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={placeSearch}
                onChange={e => setPlaceSearch(e.target.value)}
                placeholder="搜索名称/类别/地址..."
                className="pl-9 h-9"
              />
              {placeSearch && (
                <button onClick={() => setPlaceSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <ViewToggle view={placeView} setView={setPlaceView} />
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-1.5">
            {PLACE_CATEGORIES.map(cat => (
              <Badge key={cat} variant={visibleCategories.has(cat) ? 'default' : 'outline'} className="cursor-pointer text-xs" onClick={() => toggleCategory(cat)}>
                {PLACE_CATEGORY_ICONS[cat]} {PLACE_CATEGORY_LABELS[cat]}
              </Badge>
            ))}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setAddPlaceOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />新增地点
            </Button>
          </div>

          {placeView === 'list' ? (
            <div className="space-y-2">
              {filteredPlaces.length > 0 ? filteredPlaces.map(place => (
                <Card key={place.id} className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg bg-muted shrink-0">
                      {PLACE_CATEGORY_ICONS[place.category]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{place.name}</span>
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">{place.category}</Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">{place.address}</span>
                      </div>
                      <div className="flex gap-3 mt-1">
                        {place.phone && <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Phone className="h-3 w-3" />{place.phone}</span>}
                        {place.hours && <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Clock className="h-3 w-3" />{place.hours}</span>}
                      </div>
                    </div>
                  </div>
                </Card>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">未找到相关地点</p>
                  <Button variant="link" size="sm" className="mt-1" onClick={() => setAddPlaceOpen(true)}>去新增地点</Button>
                </div>
              )}
            </div>
          ) : (
            <div ref={placeMapRef} className="w-full h-[55vh] rounded-xl overflow-hidden border" />
          )}
        </TabsContent>
      </Tabs>

      {/* Add Place Dialog */}
      <Dialog open={addPlaceOpen} onOpenChange={setAddPlaceOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>新增地点</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>名称 *</Label><Input value={placeForm.name} onChange={e => setPlaceForm(f => ({ ...f, name: e.target.value }))} placeholder="如：爱宠动物医院" /></div>
            <div>
              <Label>类别</Label>
              <Select value={placeForm.category} onValueChange={v => setPlaceForm(f => ({ ...f, category: v as PlaceCategory }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLACE_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{PLACE_CATEGORY_ICONS[cat]} {cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>地址 *</Label><Input value={placeForm.address} onChange={e => setPlaceForm(f => ({ ...f, address: e.target.value }))} placeholder="详细地址" /></div>
            <div><Label>电话（可选）</Label><Input value={placeForm.phone} onChange={e => setPlaceForm(f => ({ ...f, phone: e.target.value }))} placeholder="联系电话" /></div>
            <div><Label>营业时间（可选）</Label><Input value={placeForm.hours} onChange={e => setPlaceForm(f => ({ ...f, hours: e.target.value }))} placeholder="如：09:00-21:00" /></div>
            <Button onClick={handleAddPlace} className="w-full">保存地点</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
