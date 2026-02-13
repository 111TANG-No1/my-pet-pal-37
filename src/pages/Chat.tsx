import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { mockDiscoverPets } from '@/lib/mock-data';
import { getChats, addChat, generateId } from '@/lib/storage';
import { ChatMessage } from '@/types/pet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const autoReplies = ['你好呀！', '今天天气不错~', '有空一起遛弯吗？', '😊', '好的！', '在呢~'];

export default function Chat() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const pet = mockDiscoverPets.find(p => p.id === petId);
  const [messages, setMessages] = useState<ChatMessage[]>(petId ? getChats(petId) : []);
  const [input, setInput] = useState('');

  if (!pet) return <div className="p-4">找不到对方</div>;

  const sendMessage = () => {
    if (!input.trim() || !petId) return;
    const msg: ChatMessage = { id: generateId(), petId, text: input, fromMe: true, timestamp: Date.now() };
    addChat(petId, msg);
    const updated = [...messages, msg];

    // Auto reply
    const reply: ChatMessage = {
      id: generateId(), petId, text: autoReplies[Math.floor(Math.random() * autoReplies.length)],
      fromMe: false, timestamp: Date.now() + 1000
    };
    addChat(petId, reply);
    setMessages([...updated, reply]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto">
      <header className="flex items-center gap-3 p-4 border-b bg-background">
        <button onClick={() => navigate(`/profile/${petId}`)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-xl">{pet.avatar}</span>
        <span className="font-semibold">{pet.name}</span>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">开始聊天吧 👋</p>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
              msg.fromMe
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-muted rounded-bl-md'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t bg-background flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="输入消息..."
          className="flex-1"
        />
        <Button size="icon" onClick={sendMessage} disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
