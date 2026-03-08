import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { mockDiscoverPets, GREETING_TEMPLATES } from '@/lib/mock-data';
import { getOrCreateThread, getThreadMessages, addThreadMessage, getPets, generateId } from '@/lib/storage';
import { ThreadMessage } from '@/types/pet';
import { getRandomReply } from '@/lib/chat-replies';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ChatThread() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const peer = mockDiscoverPets.find(p => p.id === petId);
  const myPets = getPets();
  const myPet = myPets[0];

  const threadRef = useRef(
    petId ? getOrCreateThread(myPet?.id || 'me', petId) : null
  );
  const thread = threadRef.current;

  const [messages, setMessages] = useState<ThreadMessage[]>(
    thread ? getThreadMessages(thread.threadId) : []
  );
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!peer || !thread) return <div className="p-4">找不到对方</div>;

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    // My message
    const myMsg: ThreadMessage = {
      id: generateId(),
      threadId: thread.threadId,
      sender: 'me',
      text: text.trim(),
      createdAt: Date.now(),
    };
    addThreadMessage(myMsg);
    setMessages(prev => [...prev, myMsg]);
    setInput('');

    // Auto reply after 1-2s
    setTimeout(() => {
      const reply: ThreadMessage = {
        id: generateId(),
        threadId: thread.threadId,
        sender: 'peer',
        text: getRandomReply(),
        createdAt: Date.now(),
      };
      addThreadMessage(reply);
      setMessages(prev => [...prev, reply]);
    }, 1000 + Math.random() * 1000);
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b bg-background shrink-0">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-xl">{peer.avatar}</span>
        <div className="min-w-0">
          <span className="font-semibold">{peer.name}</span>
          <span className="text-xs text-muted-foreground ml-1">（{peer.species}·{peer.breed}）</span>
        </div>
      </header>

      {/* Greeting chips */}
      <div className="px-4 py-2 border-b bg-muted/30 shrink-0">
        <p className="text-xs text-muted-foreground mb-1.5">快捷打招呼：</p>
        <div className="flex flex-wrap gap-1.5">
          {GREETING_TEMPLATES.map((t, i) => (
            <Badge
              key={i}
              variant="outline"
              className="cursor-pointer text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => sendMessage(t)}
            >
              {t}
            </Badge>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            还没有消息，打个招呼吧 👋
          </p>
        )}
        {messages.map(msg => {
          const isMe = msg.sender === 'me';
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              <div className="text-xl w-8 h-8 flex items-center justify-center shrink-0 rounded-full bg-muted">
                {isMe
                  ? (myPet?.avatar && !myPet.avatar.startsWith('data:') ? myPet.avatar : '🐾')
                  : peer.avatar}
              </div>
              <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleString('zh-CN', {
                      month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                <div
                  className={`text-sm px-3 py-2 rounded-2xl inline-block ${
                    isMe
                      ? 'bg-primary text-primary-foreground rounded-tr-md'
                      : 'bg-muted rounded-tl-md'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-background flex gap-2 shrink-0">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
          placeholder="输入消息..."
          className="flex-1"
        />
        <Button size="icon" onClick={() => sendMessage(input)} disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
