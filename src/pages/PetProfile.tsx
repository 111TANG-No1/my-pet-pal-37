import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, MapPin } from 'lucide-react';
import { mockDiscoverPets } from '@/lib/mock-data';
import { getLikes, toggleLike } from '@/lib/storage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function PetProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pet = mockDiscoverPets.find(p => p.id === id);
  const [likes, setLikes] = useState(getLikes());

  if (!pet) return <div className="p-4">宠物不存在</div>;

  const isLiked = likes.includes(pet.id);

  return (
    <div className="p-4 max-w-lg mx-auto">
      <button onClick={() => navigate('/discover')} className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> 返回
      </button>

      <div className="text-center mb-6">
        <div className="text-6xl mb-3">{pet.avatar}</div>
        <h1 className="text-2xl font-bold">{pet.name}</h1>
        <p className="text-muted-foreground">{pet.species}·{pet.breed}</p>
        <div className="flex items-center justify-center gap-1 mt-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {pet.distance}
        </div>
      </div>

      <Card className="p-4 space-y-3 mb-4">
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div><p className="text-muted-foreground">性别</p><p className="font-medium">{pet.gender}</p></div>
          <div><p className="text-muted-foreground">绝育</p><p className="font-medium">{pet.neutered ? '是' : '否'}</p></div>
          <div><p className="text-muted-foreground">疫苗</p><p className="font-medium">{pet.vaccinated ? '已更新' : '待更新'}</p></div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1.5">性格</p>
          <div className="flex gap-1.5 flex-wrap">
            {pet.personality.map(p => <Badge key={p} variant="secondary">{p}</Badge>)}
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant={isLiked ? 'default' : 'outline'} className="flex-1" onClick={() => setLikes(toggleLike(pet.id))}>
          <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
          {isLiked ? '已点赞' : '点赞'}
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => navigate(`/board/${pet.id}`)}>
          <MessageCircle className="h-4 w-4 mr-1" /> 打招呼
        </Button>
      </div>
    </div>
  );
}
