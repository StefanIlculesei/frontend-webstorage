'use client';

import type { ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRootFolders } from '@/lib/api/folders';
import { Folder } from 'lucide-react';

export function FolderTree(): ReactElement {
  const { data, isLoading, error } = useQuery({
    queryKey: ['folders', 'root'],
    queryFn: getRootFolders,
    refetchInterval: 30000, // Refetch every 30 seconds to keep counts up-to-date
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading folders...</div>;
  }

  if (error) {
    return <div className="text-sm text-destructive">Failed to load folders</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No folders yet.</div>;
  }

  return (
    <div className="space-y-2">
      {data.map((folder) => (
        <div key={folder.id} className="flex items-center gap-2 text-sm">
          <Folder className="h-4 w-4 text-muted-foreground" aria-hidden />
          <span className="font-medium">{folder.name}</span>
          <span className="text-xs text-muted-foreground">
            ({folder.subFolderCount ?? 0} sub {folder.subFolderCount === 1 ? 'folder' : 'folders'}, {folder.fileCount ?? 0} {folder.fileCount === 1 ? 'file' : 'files'})
          </span>
        </div>
      ))}
    </div>
  );
}
