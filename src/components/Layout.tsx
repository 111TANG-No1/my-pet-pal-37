import { NavLink, useLocation } from 'react-router-dom';
import { PawPrint, MessageSquare, Search, User } from 'lucide-react';

const tabs = [
  { path: '/', label: '档案', icon: PawPrint },
  { path: '/assistant', label: '助手', icon: MessageSquare },
  { path: '/discover', label: '发现', icon: Search },
  { path: '/mine', label: '我的', icon: User },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const hideTab = location.pathname.includes('/pet/') || location.pathname.includes('/profile/') || location.pathname.includes('/board/') || location.pathname.includes('/friend-records');

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>
      {!hideTab && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border">
          <div className="max-w-lg mx-auto flex justify-around items-center h-16 px-4">
            {tabs.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 text-xs transition-colors ${
                    isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
