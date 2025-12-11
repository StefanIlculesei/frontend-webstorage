'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ReactElement } from 'react';
import { FileList } from '@/components/files/FileList';

function SearchContent(): ReactElement {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Search Results</h1>
        {query && (
          <p className="text-sm text-muted-foreground">
            Results for: <span className="font-medium text-foreground">{query}</span>
          </p>
        )}
      </div>
      <FileList searchQuery={query} />
    </div>
  );
}

export default function SearchPage(): ReactElement {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <SearchContent />
    </Suspense>
  );
}
