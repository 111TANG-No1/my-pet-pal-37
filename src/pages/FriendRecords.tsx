import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Users, MessageCircle } from 'lucide-react';
import { getLikes, getBoardMessages, getPets } from '@/lib/storage';
import { mockDiscoverPets } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

export default function FriendRecords() {
  const navigate = useNavigate();
  const likes = getLikes();
  const boardMsgs = getBoardMessages();
  const myPetIds = getPets().map(p => p.id);

  const likedPets = mockDiscoverPets.filter(p => likes.includes(p.id));
  const mutualPets = likedPets.filter(p => p.mutualLike);

  // Messages I sent or received
  const myMessages = boardMsgs.filter(m => myPetIds.includes(m.fromPetId) || myPetIds.includes(m.toPetId));

  // Group messages by pet
  const messagePetIds = [...new Set(myMessages.map(m => myPetIds.includes(m.fromPetId) ? m.toPetId : m.fromPetId))];
  const messagePets = messagePetIds.map(pid => {
    const pet = mockDiscoverPets.find(p => p.id === pid);
    const msgs = myMessages.filter(m => m.toPetId === pid || m.fromPetId === pid);
    const lastMsg = msgs[msgs.length - 1];
    return { pet, lastMsg, count: msgs.length };
  }).filter(x => x.pet);

  return (
    <div className="p-4 max-w-lg mx-auto">
      <button onClick={() => navigate('/mine')} className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> 返回
      </button>
      <h1 className="text-xl font-bold mb-4">宠友记录</h1>

      <Tabs defaultValue="liked" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="liked">点赞过</TabsTrigger>
          <TabsTrigger value="mutual">互赞</TabsTrigger>
          <TabsTrigger value="messages">留言</TabsTrigger>
        </TabsList>

        <TabsContent value="liked" className="mt-4 space-y-2">
          {likedPets.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">还没有点赞过的宠友</p>
          ) : likedPets.map(pet => (
            <Card key={pet.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/profile/${pet.id}`)}>
              <div className="flex items-center gap-3">
                <div className="text-2xl">{pet.avatar}</div>
                <div className="flex-1">
                  <span className="font-medium text-sm">{pet.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{pet.species}·{pet.breed}</span>
                </div>
                <Heart className="h-4 w-4 text-red-500 fill-current" />
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="mutual" className="mt-4 space-y-2">
          {mutualPets.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">还没有互赞的宠友</p>
          ) : mutualPets.map(pet => (
            <Card key={pet.id} className="p-3">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{pet.avatar}</div>
                <div className="flex-1">
                  <span className="font-medium text-sm">{pet.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{pet.species}·{pet.breed}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate(`/board/${pet.id}`)}>
                  <MessageCircle className="h-3.5 w-3.5 mr-1" />留言
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="messages" className="mt-4 space-y-2">
          {messagePets.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">还没有留言记录</p>
          ) : messagePets.map(({ pet, lastMsg, count }) => pet && (
            <Card key={pet.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/board/${pet.id}`)}>
              <div className="flex items-center gap-3">
                <div className="text-2xl">{pet.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{pet.name}</span>
                    <Badge variant="secondary" className="text-xs">{count}条</Badge>
                  </div>
                  {lastMsg && <p className="text-xs text-muted-foreground truncate mt-0.5">{lastMsg.text}</p>}
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
