import { useState, useRef, useEffect } from 'react';
import { Camera, Mic, Keyboard, Image as ImageIcon, Send, AtSign } from 'lucide-react';
import { getPets, getAIChatHistory, addAIChatMessage, generateId } from '@/lib/storage';
import { AI_TEMPLATE_REPLIES } from '@/lib/mock-data';
import { AIChatMessage, Pet } from '@/types/pet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const quickActions = [
  { label: '🩺 健康分流', key: 'health', prompt: '我的宠物出现了一些健康问题，请帮我分析一下。' },
  { label: '🍽 喂养训练', key: 'feeding', prompt: '请给我一些宠物喂养和训练的建议。' },
  { label: '🗂 记录回溯', key: 'retrospect', prompt: '' },
];

export default function Assistant() {
  const [messages, setMessages] = useState<AIChatMessage[]>(getAIChatHistory());
  const [input, setInput] = useState('');
  const [pets] = useState<Pet[]>(getPets());
  const [currentPetId, setCurrentPetId] = useState<string>('');
  const [atPetId, setAtPetId] = useState<string>('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiOnline, setAiOnline] = useState(false);
  const [retrospectOpen, setRetrospectOpen] = useState(false);
  const [retrospectResult, setRetrospectResult] = useState<{ records: string[]; summary: string } | null>(null);
  const [atSelectOpen, setAtSelectOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getContextPetId = () => atPetId || currentPetId;
  const getContextPet = () => {
    const pid = getContextPetId();
    return pid ? pets.find(p => p.id === pid) : undefined;
  };

  const getTemplateReply = (category: string): string => {
    const replies = AI_TEMPLATE_REPLIES[category] || AI_TEMPLATE_REPLIES.general;
    return replies[Math.floor(Math.random() * replies.length)];
  };

  const detectCategory = (text: string): string => {
    if (/健康|症状|生病|不舒服|呕吐|拉稀|咳嗽|发烧|不吃/.test(text)) return 'health';
    if (/喂养|训练|吃|粮|零食|遛/.test(text)) return 'feeding';
    return 'general';
  };

  const sendMessage = async (text: string, images?: string[]) => {
    if (!text.trim() && (!images || images.length === 0)) return;

    const effectivePetId = getContextPetId();
    const pet = getContextPet();

    // Add user message
    const userMsg: AIChatMessage = {
      id: generateId(),
      role: 'user',
      text: text.trim() + (pet ? `\n[@${pet.name}]` : ''),
      petId: effectivePetId || undefined,
      timestamp: Date.now(),
      images,
    };
    const updated = [...messages, userMsg];
    setMessages(updated);
    addAIChatMessage(userMsg);
    setInput('');
    setIsLoading(true);

    // Reset @本条宠物
    setAtPetId('');

    // Helper: generate local fallback reply
    const generateFallback = (): string => {
      const category = detectCategory(text);
      let replyText = '';
      if (images && images.length > 0) {
        replyText = '当前版本暂不解析图片，仅基于文字回答。\n\n' + getTemplateReply(category);
      } else if (pet) {
        replyText = `关于${pet.name}（${pet.species}${pet.breed ? '·' + pet.breed : ''}）：\n\n` + getTemplateReply(category);
      } else {
        replyText = getTemplateReply(category);
      }
      return replyText + '\n\n（演示模式）';
    };

    try {
      // Try real AI first
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const apiMessages = updated
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-10)
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.text }));

      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          context: pet ? { petName: pet.name } : undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const data = await res.json();

      let replyText: string;
      if (data.ok && data.reply) {
        replyText = data.reply;
        setAiOnline(true);
      } else {
        replyText = generateFallback();
        setAiOnline(false);
      }

      const assistantMsg: AIChatMessage = {
        id: generateId(),
        role: 'assistant',
        text: replyText,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      addAIChatMessage(assistantMsg);
    } catch {
      // Network error / timeout / API not available → fallback
      setAiOnline(false);
      const fallbackMsg: AIChatMessage = {
        id: generateId(),
        role: 'assistant',
        text: generateFallback(),
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, fallbackMsg]);
      addAIChatMessage(fallbackMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    if (action.key === 'retrospect') {
      doRetrospect();
      return;
    }
    sendMessage(action.prompt);
  };

  const doRetrospect = () => {
    const pet = getContextPet();
    if (!pet) {
      // Search all pets
      const allPets = getPets();
      const records: string[] = [];
      allPets.forEach(p => {
        p.medicalHistory.forEach(r => {
          records.push(`[${p.name}] ${r.date} - ${r.symptom}：${r.note || '无备注'}`);
        });
        p.reminders.forEach(r => {
          const type = r.type === '自定义' ? (r.customType || '自定义') : r.type;
          records.push(`[${p.name}] ${r.date} - ${type}${r.completed ? '（已完成）' : ''}：${r.note || '无备注'}`);
        });
      });
      setRetrospectResult({
        records: records.length > 0 ? records : [],
        summary: records.length > 0
          ? `共找到 ${records.length} 条记录，涵盖 ${allPets.filter(p => p.medicalHistory.length > 0 || p.reminders.length > 0).length} 只宠物。`
          : '',
      });
    } else {
      const records: string[] = [];
      pet.medicalHistory.forEach(r => {
        records.push(`${r.date} - ${r.symptom}：${r.note || '无备注'}`);
      });
      pet.reminders.forEach(r => {
        const type = r.type === '自定义' ? (r.customType || '自定义') : r.type;
        records.push(`${r.date} - ${type}${r.completed ? '（已完成）' : ''}：${r.note || '无备注'}`);
      });
      setRetrospectResult({
        records: records.length > 0 ? records : [],
        summary: records.length > 0
          ? `${pet.name} 共有 ${pet.medicalHistory.length} 条病史记录和 ${pet.reminders.length} 条提醒。`
          : '',
      });
    }
    setRetrospectOpen(true);
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        sendMessage('请帮我看看这张图片', [dataUrl]);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleCamera = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        sendMessage('请帮我看看这张图片', [dataUrl]);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-lg mx-auto">
      {/* Header */}
      <header className="p-4 border-b bg-background space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">宠物AI助手</h1>
          <span className={`text-xs px-2 py-0.5 rounded-full ${aiOnline ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
            {aiOnline ? 'AI在线' : 'AI离线（模板回复）'}
          </span>
        </div>

        {/* Pet selector */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground whitespace-nowrap">当前宠物：</span>
          <Select value={currentPetId} onValueChange={setCurrentPetId}>
            <SelectTrigger className="h-8 text-sm flex-1">
              <SelectValue placeholder="选择 ▼" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">不选择</SelectItem>
              {pets.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.avatar?.startsWith('data:') ? '🐾' : p.avatar} {p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">当前宠物=默认上下文；下方 @ =本条指定宠物</p>

        {/* Quick actions */}
        <div className="flex gap-2">
          {quickActions.map(a => (
            <Button key={a.key} variant="outline" size="sm" className="text-xs flex-1" onClick={() => handleQuickAction(a)}>
              {a.label}
            </Button>
          ))}
        </div>
      </header>

      {/* Message list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-3xl mb-2">🐾</p>
            <p className="text-sm">有什么宠物问题？尽管问我吧~</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : msg.role === 'error'
                ? 'bg-destructive/10 text-destructive rounded-bl-md border border-destructive/20'
                : 'bg-muted rounded-bl-md'
            }`}>
              {msg.images && msg.images.length > 0 && (
                <div className="mb-2">
                  {msg.images.map((img, i) => (
                    <img key={i} src={img} alt="" className="w-32 h-32 object-cover rounded-lg" />
                  ))}
                </div>
              )}
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-md text-sm text-muted-foreground">
              正在思考...
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t bg-background p-3 space-y-2">
        {/* Row 1: Camera | Input/Voice | Mic/Keyboard toggle */}
        <div className="flex items-center gap-2">
          <button onClick={handleCamera} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Camera className="h-5 w-5" />
          </button>
          {isVoiceMode ? (
            <div className="flex-1 h-10 bg-muted rounded-full flex items-center justify-center text-sm text-muted-foreground">
              按住说话（功能开发中）
            </div>
          ) : (
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder="输入消息..."
              className="flex-1 rounded-full h-10"
            />
          )}
          {isVoiceMode ? (
            <button onClick={() => setIsVoiceMode(false)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Keyboard className="h-5 w-5" />
            </button>
          ) : input.trim() ? (
            <Button size="icon" className="rounded-full h-9 w-9" onClick={() => sendMessage(input)} disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            <button onClick={() => setIsVoiceMode(true)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Mic className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Row 2: @Pet | Upload image */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => setAtSelectOpen(true)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <AtSign className="h-3.5 w-3.5" />
            {atPetId ? `@${pets.find(p => p.id === atPetId)?.name || '宠物'}` : '@本条宠物'}
          </button>
          <button onClick={handleImageUpload} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ImageIcon className="h-3.5 w-3.5" />
            上传图片
          </button>
        </div>
      </div>

      {/* @ Pet select dialog */}
      <Dialog open={atSelectOpen} onOpenChange={setAtSelectOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle>@本条宠物</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground mb-2">仅作用于本条消息，发送后自动回到默认上下文</p>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => { setAtPetId(''); setAtSelectOpen(false); }}>
              不指定
            </Button>
            {pets.map(p => (
              <Button
                key={p.id}
                variant={atPetId === p.id ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => { setAtPetId(p.id); setAtSelectOpen(false); }}
              >
                {p.avatar?.startsWith('data:') ? '🐾' : p.avatar} {p.name}
              </Button>
            ))}
            {pets.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">暂无宠物，请先添加</p>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Retrospect dialog */}
      <Dialog open={retrospectOpen} onOpenChange={setRetrospectOpen}>
        <DialogContent className="max-w-sm max-h-[70vh] overflow-hidden flex flex-col">
          <DialogHeader><DialogTitle>AI助手 · 记录回溯</DialogTitle></DialogHeader>
          <ScrollArea className="flex-1">
            {retrospectResult && retrospectResult.records.length > 0 ? (
              <div className="space-y-3 pr-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">匹配记录</h4>
                  <div className="space-y-1.5">
                    {retrospectResult.records.map((r, i) => (
                      <div key={i} className="text-xs p-2 bg-muted rounded-lg">{r}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">AI 总结</h4>
                  <p className="text-xs text-muted-foreground">{retrospectResult.summary}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">未找到相关记录</p>
                <p className="text-xs mt-1">请先在宠物档案中添加病史或提醒</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
