import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle } from 'lucide-react';
import { getLikes, getThreads, getThreadMessages, getPets } from '@/lib/storage';
import { mockDiscoverPets } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

export default function FriendRecords() {
  const navigate = useNavigate();
  const likes = getLikes();
  const threads = getThreads();
  const myPets = getPets();

  const likedPets = mockDiscoverPets.filter(p => likes.includes(p.id));
  const mutualPets = likedPets.filter(p => p.mutualLike);

  // Chat threads with last message
  const chatThreads = threads
    .map(t => {
      const peer = mockDiscoverPets.find(p => p.id === t.peerPetId);
      const msgs = getThreadMessages(t.threadId);
      const lastMsg = msgs[msgs.length - 1];
      return { thread: t, peer, lastMsg, count: msgs.length };
    })
    .filter(x => x.peer && x.count > 0)
    .sort((a, b) => b.thread.lastMessageAt - a.thread.lastMessageAt);

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
          <TabsTrigger value="chats">聊天</TabsTrigger>
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
                <Button variant="outline" size="sm" onClick={() => navigate(`/chat/${pet.id}`)}>
                  <MessageCircle className="h-3.5 w-3.5 mr-1" />聊天
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="chats" className="mt-4 space-y-2">
          {chatThreads.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">还没有聊天记录</p>
          ) : chatThreads.map(({ thread, peer, lastMsg, count }) => peer && (
            <Card key={thread.threadId} className="p-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/chat/${peer.id}`)}>
              <div className="flex items-center gap-3">
                <div className="text-2xl">{peer.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{peer.name}</span>
                    <Badge variant="secondary" className="text-xs">{count}条</Badge>
                  </div>
                  {lastMsg && <p className="text-xs text-muted-foreground truncate mt-0.5">{lastMsg.text}</p>}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {lastMsg && new Date(lastMsg.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric' })}
                </span>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
