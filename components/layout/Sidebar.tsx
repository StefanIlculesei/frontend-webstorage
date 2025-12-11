'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';
import { StorageQuota } from './StorageQuota';
import { Home, Folder, UploadCloud, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/files', label: 'Files', icon: Folder },
  { href: '/dashboard/upload', label: 'Upload', icon: UploadCloud },
];

export function Sidebar(): ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="hidden border-r bg-card lg:block">
      <div className="flex h-full flex-col justify-between p-4">
        <div>
          <div className="px-2 pb-6 text-lg font-semibold">WebStorage</div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="space-y-4">
          <StorageQuota />
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
