'use client';

import type { ReactElement } from 'react';
import { FileList } from '@/components/files/FileList';

export default function FilesPage(): ReactElement {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Files</h1>
        <p className="text-sm text-muted-foreground">Browse and manage all your files</p>
      </div>
      <FileList />
    </div>
  );
}
