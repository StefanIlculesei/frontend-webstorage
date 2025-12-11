'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type ReactElement } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';

export function Header(): ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');

  const searchPath = useMemo(() => {
    if (pathname?.startsWith('/dashboard/files')) return '/dashboard/files';
    return '/dashboard/search';
  }, [pathname]);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (query.trim().length > 0) {
        router.push(`${searchPath}?q=${encodeURIComponent(query.trim())}`);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [query, router, searchPath]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value);

  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className={cn('relative w-full max-w-xl')}> 
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={onChange}
            placeholder="Search files..."
            className="pl-9"
            aria-label="Search files"
          />
        </div>
      </div>
    </header>
  );
}
