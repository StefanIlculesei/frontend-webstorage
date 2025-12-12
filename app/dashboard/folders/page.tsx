'use client';

import { useMemo, useState, type ReactElement } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRootFolders, createFolder, deleteFolder, getFolderTree } from '@/lib/api/folders';
import { getFilesByFolder } from '@/lib/api/files';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Folder as FolderIcon, Plus, Trash2, FolderOpen } from 'lucide-react';
import type { Folder } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function FoldersPage(): ReactElement {
  const { user } = useAuth();
  const rootFolderId = useMemo(() => user?.rootFolderId ?? null, [user]);
  const queryClient = useQueryClient();
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: number | null; name: string }>>([
    { id: null, name: 'Root' },
  ]);

  const effectiveFolderId = currentFolderId ?? rootFolderId ?? null;

  // Get current folder's subfolders
  const { data: folders = [], isLoading: foldersLoading } = useQuery({
    queryKey: ['folders', effectiveFolderId ?? 'root'],
    queryFn: () => {
      // Use tree endpoint when we know a folder id (root or nested)
      if (effectiveFolderId) {
        return getFolderTree(effectiveFolderId).then((tree) => tree.subFolders);
      }
      return getRootFolders();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get files in current folder
  const { data: files = [] } = useQuery({
    queryKey: ['files', 'folder', effectiveFolderId ?? 'root'],
    queryFn: () => {
      if (effectiveFolderId === null || effectiveFolderId === undefined) {
        return Promise.resolve([]);
      }
      return getFilesByFolder(effectiveFolderId);
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: (name: string) =>
      createFolder({
        name,
        parentFolderId: currentFolderId ?? rootFolderId ?? undefined,
      }),
    onSuccess: (newFolder) => {
      // Invalidate all folder queries to update counts
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      setNewFolderName('');
      setIsCreateDialogOpen(false);
      toast.success(`Folder "${newFolder.name}" created`);
    },
    onError: () => {
      toast.error('Failed to create folder');
    },
  });

  // Delete folder mutation
  const deleteFolderMutation = useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => {
      // Invalidate all folder queries to update counts
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success('Folder deleted');
    },
    onError: () => {
      toast.error('Failed to delete folder');
    },
  });

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error('Folder name is required');
      return;
    }
    createFolderMutation.mutate(newFolderName);
  };

  const handleNavigateFolder = (folder: Folder) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
  };

  const handleNavigateBreadcrumb = (id: number | null, index: number) => {
    setCurrentFolderId(id);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  const handleDeleteFolder = (id: number) => {
    if (confirm('Are you sure you want to delete this folder?')) {
      deleteFolderMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Folders</h1>
          <p className="text-sm text-muted-foreground">Organize your files into folders</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create new folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <Button onClick={handleCreateFolder} className="w-full" disabled={createFolderMutation.isPending}>
                {createFolderMutation.isPending ? 'Creating...' : 'Create Folder'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Breadcrumbs */}
      <div className="flex gap-1 flex-wrap">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigateBreadcrumb(crumb.id, index)}
              className="text-xs"
            >
              {crumb.name}
            </Button>
            {index < breadcrumbs.length - 1 && <span className="text-muted-foreground">/</span>}
          </div>
        ))}
      </div>

      {/* Folders Grid */}
      {foldersLoading ? (
        <div className="text-center text-muted-foreground">Loading folders...</div>
      ) : folders.length === 0 ? (
        <Card className="p-8 text-center">
          <FolderIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <p className="mt-2 text-sm text-muted-foreground">No folders yet. Create one to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => (
            <Card key={folder.id} className="p-4 hover:bg-muted transition-colors">
              <div className="flex items-start justify-between">
                <button
                  onClick={() => handleNavigateFolder(folder)}
                  className="flex flex-1 items-center gap-3 text-left hover:text-primary"
                >
                  <FolderOpen className="h-8 w-8 text-yellow-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{folder.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {folder.fileCount} files • {folder.subFolderCount} folders
                    </p>
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteFolder(folder.id)}
                  disabled={deleteFolderMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Files in current folder */}
      {files.length > 0 && (
        <div className="mt-8 pt-8 border-t">
          <h2 className="text-lg font-semibold mb-4">Files in this folder</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {files.map((file) => (
              <Card key={file.id} className="p-4">
                <p className="font-medium text-sm truncate">{file.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
