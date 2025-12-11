'use client';

import type { ReactElement } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { File as FileIcon, Download, Trash } from 'lucide-react';
import type { File as FileDto } from '@/types';
import { downloadFile, deleteFile } from '@/lib/api/files';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatBytes } from '@/lib/utils/format';

interface FileCardProps {
  file: FileDto;
}

export function FileCard({ file }: FileCardProps): ReactElement {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteFile(file.id),
    onSuccess: () => {
      toast.success('File deleted');
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: () => toast.error('Failed to delete file'),
  });

  const onDownload = async () => {
    try {
      const blob = await downloadFile(file.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.fileName;
      a.click();
      toast.success('Download started');
    } catch (err) {
      console.error(err);
      toast.error('Download failed');
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileIcon className="h-4 w-4" aria-hidden />
          <span className="truncate" title={file.fileName}>{file.fileName}</span>
        </CardTitle>
        <div className="text-xs text-muted-foreground">{formatBytes(file.fileSize)}</div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <div>Type: {file.mimeType}</div>
        <div>Visibility: {file.visibility}</div>
        {file.folderName && <div>Folder: {file.folderName}</div>}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" aria-hidden />
          Download
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
        >
          <Trash className="mr-2 h-4 w-4" aria-hidden />
          {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
        </Button>
      </CardFooter>
    </Card>
  );
}
