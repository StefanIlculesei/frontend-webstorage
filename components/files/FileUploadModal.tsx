'use client';

import type { ReactElement } from 'react';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { uploadFile } from '@/lib/api/files';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface FileUploadModalProps {
  folderId?: number | null;
}

export function FileUploadModal({ folderId = null }: FileUploadModalProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    setIsUploading(true);
    setProgress(0);
    try {
      await uploadFile(
        file,
        file.name,
        folderId,
        'private',
        ({ loadedBytes, totalBytes }) => {
          const pct = Math.round((loadedBytes / totalBytes) * 100);
          setProgress(pct);
        }
      );
      toast.success('File uploaded');
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Upload File</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload file</DialogTitle>
        </DialogHeader>
        <div
          {...getRootProps()}
          className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-6 text-center"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the file here...</p>
          ) : (
            <p className="text-sm text-muted-foreground">Drag and drop a file here, or click to select one</p>
          )}
        </div>
        {isUploading && (
          <div className="pt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">Uploading... {progress}%</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
