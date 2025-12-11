'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactElement } from 'react';

export function Breadcrumbs(): ReactElement {
  const pathname = usePathname();
  const segments = pathname?.split('/').filter(Boolean) ?? [];

  if (segments.length === 0) return <></>;

  const buildHref = (index: number) => '/' + segments.slice(0, index + 1).join('/');

  return (
    <div className="text-sm text-muted-foreground">
      {segments.map((segment, index) => {
        const href = buildHref(index);
        const isLast = index === segments.length - 1;
        const label = segment.charAt(0).toUpperCase() + segment.slice(1);
        if (isLast) {
          return (
            <span key={href} className="text-foreground">
              {label}
            </span>
          );
        }
        return (
          <span key={href}>
            <Link href={href} className="hover:underline">
              {label}
            </Link>
            <span className="px-2">/</span>
          </span>
        );
      })}
    </div>
  );
}
