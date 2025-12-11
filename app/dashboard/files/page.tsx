'use client';

import { useState, type ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRootFolders, getFolderById } from '@/lib/api/folders';
import { FileList } from '@/components/files/FileList';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FolderOpen, ChevronRight } from 'lucide-react';
import type { Folder } from '@/types';

export default function FilesPage(): ReactElement {
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: number | null; name: string }>>([
    { id: null, name: 'Root' },
  ]);

  // Get root folders
  const { data: folders = [] } = useQuery({
    queryKey: ['folders', currentFolderId],
    queryFn: () => {
      if (currentFolderId === null) {
        return getRootFolders();
      }
      // For now, just return empty - could implement nested folder fetching
      return Promise.resolve([]);
    },
  });

  const handleNavigateFolder = (folder: Folder) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
  };

  const handleNavigateBreadcrumb = (id: number | null, index: number) => {
    setCurrentFolderId(id);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Files</h1>
        <p className="text-sm text-muted-foreground">Browse and manage all your files</p>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 flex-wrap">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigateBreadcrumb(crumb.id, index)}
              className="text-sm"
            >
              {crumb.name}
            </Button>
            {index < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Subfolders */}
      {folders.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Folders</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => handleNavigateFolder(folder)}
                className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted transition-colors text-left"
              >
                <FolderOpen className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{folder.name}</p>
                  <p className="text-xs text-muted-foreground">{folder.fileCount} files</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Files</h2>
        <FileList folderId={currentFolderId} />
      </div>
    </div>
  );
}
