import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { mockDiscoverPets, GREETING_TEMPLATES } from '@/lib/mock-data';
import { getBoardMessagesForPet, addBoardMessage, getPets, generateId } from '@/lib/storage';
import { BoardMessage } from '@/types/pet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function MessageBoard() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const pet = mockDiscoverPets.find(p => p.id === petId);
  const myPets = getPets();
  const myPet = myPets[0]; // Use first pet as sender

  const [messages, setMessages] = useState<BoardMessage[]>(petId ? getBoardMessagesForPet(petId) : []);
  const [input, setInput] = useState('');

  if (!pet) return <div className="p-4">找不到对方</div>;

  const sendMessage = (text: string) => {
    if (!text.trim() || !petId) return;

    const msg: BoardMessage = {
      id: generateId(),
      toPetId: petId,
      fromPetId: myPet?.id || 'me',
      fromPetName: myPet?.name || '我',
      fromPetAvatar: myPet?.avatar || '🐾',
      text: text.trim(),
      createdAt: Date.now(),
    };
    addBoardMessage(msg);
    setMessages(prev => [...prev, msg]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto">
      <header className="flex items-center gap-3 p-4 border-b bg-background">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-xl">{pet.avatar}</span>
        <div>
          <span className="font-semibold">{pet.name}</span>
          <span className="text-xs text-muted-foreground ml-2">留言板</span>
        </div>
      </header>

      {/* Greeting templates */}
      <div className="px-4 py-3 border-b bg-muted/30">
        <p className="text-xs text-muted-foreground mb-2">快速打招呼：</p>
        <div className="flex flex-wrap gap-1.5">
          {GREETING_TEMPLATES.map((t, i) => (
            <Badge key={i} variant="outline" className="cursor-pointer text-xs hover:bg-primary hover:text-primary-foreground transition-colors" onClick={() => sendMessage(t)}>
              {t}
            </Badge>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">还没有留言，打个招呼吧 👋</p>
        )}
        {messages.map(msg => (
          <div key={msg.id} className="flex gap-2">
            <div className="text-xl w-8 h-8 flex items-center justify-center shrink-0">
              {msg.fromPetAvatar?.startsWith('data:') ? '🐾' : msg.fromPetAvatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{msg.fromPetName}</span>
                <span className="text-xs text-muted-foreground">{new Date(msg.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="mt-0.5 text-sm bg-muted px-3 py-2 rounded-2xl rounded-tl-md inline-block">
                {msg.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-background flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
          placeholder="输入留言..."
          className="flex-1"
        />
        <Button size="icon" onClick={() => sendMessage(input)} disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
