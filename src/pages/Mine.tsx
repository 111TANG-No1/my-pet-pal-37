import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, PawPrint, Eye, EyeOff, ChevronRight, Users } from 'lucide-react';
import { getSettings, saveSettings, exportData, getPets } from '@/lib/storage';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function Mine() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(getSettings());
  const pets = getPets();

  const toggleDiscover = (v: boolean) => {
    const s = { ...settings, discoverEnabled: v };
    setSettings(s);
    saveSettings(s);
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mypet_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">👤 我的</h1>
      </header>

      <div className="space-y-4">
        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PawPrint className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">我的宠物</p>
                <p className="text-xs text-muted-foreground">{pets.length} 只宠物</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/friend-records')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">宠友记录</p>
                <p className="text-xs text-muted-foreground">查看点赞、互赞、留言</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.discoverEnabled ? <Eye className="h-5 w-5 text-primary" /> : <EyeOff className="h-5 w-5 text-muted-foreground" />}
              <div>
                <p className="font-medium">同城可见</p>
                <p className="text-xs text-muted-foreground">允许附近的人发现你的宠物</p>
              </div>
            </div>
            <Switch checked={settings.discoverEnabled} onCheckedChange={toggleDiscover} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">数据备份</p>
                <p className="text-xs text-muted-foreground">导出所有数据为 JSON 文件</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>导出</Button>
          </div>
        </Card>

        <div className="text-center py-8 text-xs text-muted-foreground">
          <p>MyPet v1.1</p>
          <p>所有数据存储在本地浏览器中</p>
        </div>
      </div>
    </div>
  );
}
