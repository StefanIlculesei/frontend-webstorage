'use client';

import { useState, type ReactElement } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { File as FileIcon, Download, Trash, FolderOpen } from 'lucide-react';
import type { File as FileDto } from '@/types';
import { downloadFile, deleteFile, moveFile } from '@/lib/api/files';
import { getAllFolders } from '@/lib/api/folders';
import { toast } from 'sonner';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { formatBytes } from '@/lib/utils/format';
import type { Folder } from '@/types';

interface FileCardProps {
  file: FileDto;
}

export function FileCard({ file }: FileCardProps): ReactElement {
  const queryClient = useQueryClient();
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  // Get available folders
  const { data: folders = [] } = useQuery({
    queryKey: ['folders', 'all'],
    queryFn: getAllFolders,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteFile(file.id),
    onSuccess: () => {
      toast.success('File deleted');
      // Invalidate both files and folders to update counts
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      // Explicitly refetch all folder queries so FolderTree updates immediately
      queryClient.refetchQueries({ queryKey: ['folders'] });
    },
    onError: () => toast.error('Failed to delete file'),
  });

  const moveMutation = useMutation({
    mutationFn: (targetFolderId: number | null) => moveFile(file.id, targetFolderId),
    onSuccess: () => {
      toast.success('File moved');
      // Invalidate all file and folder queries to refresh counts and contents
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      // Explicitly refetch all folder queries so FolderTree updates immediately
      queryClient.refetchQueries({ queryKey: ['folders'] });
      setIsMoveDialogOpen(false);
      setSelectedFolderId(null);
    },
    onError: () => toast.error('Failed to move file'),
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

  const handleMove = () => {
    moveMutation.mutate(selectedFolderId);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileIcon className="h-4 w-4" aria-hidden />
          <span className="truncate" title={file.fileName}>{file.fileName}</span>
        </CardTitle>
        <div className="text-xs text-muted-foreground">{formatBytes(file.fileSize)}</div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground flex-1">
        <div>Type: {file.mimeType}</div>
        <div>Visibility: {file.visibility}</div>
        {file.folderName && <div>Folder: {file.folderName}</div>}
      </CardContent>
      <CardFooter className="flex gap-2 flex-wrap">
        <Button variant="secondary" size="sm" onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" aria-hidden />
          Download
        </Button>
        <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm">
              <FolderOpen className="mr-2 h-4 w-4" aria-hidden />
              Move
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Move file to folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              <button
                onClick={() => setSelectedFolderId(null)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedFolderId === null
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:bg-muted'
                }`}
              >
                Root (No folder)
              </button>
              {folders.map((folder: Folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedFolderId === folder.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="font-medium text-sm">{folder.name}</div>
                  <div className="text-xs opacity-75">{folder.fileCount} files</div>
                </button>
              ))}
            </div>
            <Button
              onClick={handleMove}
              disabled={moveMutation.isPending}
              className="w-full"
            >
              {moveMutation.isPending ? 'Moving...' : 'Move File'}
            </Button>
          </DialogContent>
        </Dialog>
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
