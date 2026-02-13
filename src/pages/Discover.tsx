import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, List, Map, Filter, Heart } from 'lucide-react';
import { mockDiscoverPets } from '@/lib/mock-data';
import { getLikes, toggleLike, getSettings } from '@/lib/storage';
import { DiscoverPet } from '@/types/pet';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function Discover() {
  const navigate = useNavigate();
  const [likes, setLikes] = useState<string[]>(getLikes());
  const [filters, setFilters] = useState({ species: '', gender: '', neutered: '', vaccinated: '' });
  const [view, setView] = useState<'list' | 'map'>('list');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const settings = getSettings();

  const filteredPets = mockDiscoverPets.filter(p => {
    if (filters.species && p.species !== filters.species) return false;
    if (filters.gender && p.gender !== filters.gender) return false;
    if (filters.neutered && (filters.neutered === '是' ? !p.neutered : p.neutered)) return false;
    if (filters.vaccinated && (filters.vaccinated === '是' ? !p.vaccinated : p.vaccinated)) return false;
    return true;
  });

  const handleLike = (e: React.MouseEvent, petId: string) => {
    e.stopPropagation();
    setLikes(toggleLike(petId));
  };

  useEffect(() => {
    if (view === 'map' && mapRef.current && !mapInstanceRef.current) {
      import('leaflet').then(L => {
        // Add CSS
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        const map = L.map(mapRef.current!).setView([39.9042, 116.4074], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
        }).addTo(map);

        filteredPets.forEach(pet => {
          const icon = L.divIcon({
            html: `<div style="font-size:24px;text-align:center">${pet.avatar}</div>`,
            className: 'bg-transparent',
            iconSize: [32, 32],
          });
          L.marker([pet.lat, pet.lng], { icon })
            .addTo(map)
            .bindPopup(`<b>${pet.name}</b><br/>${pet.species}·${pet.breed}<br/>${pet.distance}`);
        });

        mapInstanceRef.current = map;
        setTimeout(() => map.invalidateSize(), 100);
      });
    }
    return () => {
      if (view !== 'map' && mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [view]);

  return (
    <div className="p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">🗺️ 同城发现</h1>
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
              <Button variant="outline" className="w-full" onClick={() => setFilters({ species: '', gender: '', neutered: '', vaccinated: '' })}>重置筛选</Button>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Label className="text-sm">同城可见</Label>
          <Switch checked={settings.discoverEnabled} onCheckedChange={() => {}} />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-0.5">
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${view === 'list' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'}`}
          >
            <List className="h-4 w-4 inline mr-1" />列表
          </button>
          <button
            onClick={() => setView('map')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${view === 'map' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'}`}
          >
            <Map className="h-4 w-4 inline mr-1" />地图
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="space-y-3">
          {filteredPets.map(pet => (
            <Card
              key={pet.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
              onClick={() => navigate(`/profile/${pet.id}`)}
            >
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
                <button
                  onClick={e => handleLike(e, pet.id)}
                  className={`p-2 rounded-full transition-colors ${likes.includes(pet.id) ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'}`}
                >
                  <Heart className={`h-5 w-5 ${likes.includes(pet.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div ref={mapRef} className="w-full h-[60vh] rounded-xl overflow-hidden border" />
      )}
    </div>
  );
}
