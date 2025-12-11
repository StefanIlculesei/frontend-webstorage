'use client';

import type { ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllFiles, getFilesByFolder, searchFiles } from '@/lib/api/files';
import type { File as FileDto } from '@/types';
import { FileCard } from './FileCard';

interface FileListProps {
  folderId?: number | null;
  searchQuery?: string;
}

export function FileList({ folderId = null, searchQuery }: FileListProps): ReactElement {
  const fetchFiles = async (): Promise<FileDto[]> => {
    if (searchQuery && searchQuery.trim().length > 0) {
      return searchFiles(searchQuery.trim());
    }
    if (folderId !== null) {
      return getFilesByFolder(folderId);
    }
    return getAllFiles();
  };

  const { data, isLoading } = useQuery({
    queryKey: ['files', { folderId, searchQuery }],
    queryFn: fetchFiles,
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading files...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No files found.</div>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((file) => (
        <FileCard key={file.id} file={file} />
      ))}
    </div>
  );
}
