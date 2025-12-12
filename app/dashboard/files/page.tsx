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

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Files</h2>
        {/* No folder navigation here; show all files */}
        <FileList />
      </div>
    </div>
  );
}
