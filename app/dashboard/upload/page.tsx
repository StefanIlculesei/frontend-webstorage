'use client';

import { FileUploadModal } from '@/components/files/FileUploadModal';

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Upload Files</h1>
        <p className="text-sm text-muted-foreground">Upload new files to your storage</p>
      </div>
      <div className="rounded-lg border border-dashed border-muted-foreground/25 p-12 text-center">
        <FileUploadModal />
      </div>
    </div>
  );
}
