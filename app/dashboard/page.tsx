'use client';

import type { ReactElement } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/lib/api/users';
import { getRecentFiles } from '@/lib/api/files';
import { FileList } from '@/components/files/FileList';
import { FileUploadModal } from '@/components/files/FileUploadModal';
import { FolderTree } from '@/components/folders/FolderTree';

export default function DashboardPage(): ReactElement {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  const { data: recent } = useQuery({
    queryKey: ['files', 'recent'],
    queryFn: () => getRecentFiles(6),
    refetchInterval: 30000,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back! Manage your storage and files.</p>
        </div>
        <FileUploadModal />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats ? `${Math.round(stats.storagePercentage)}%` : '—'}</div>
            <p className="text-sm text-muted-foreground">of your quota</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats?.totalFiles ?? 0}</div>
            <p className="text-sm text-muted-foreground">Total files</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Folders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats?.totalFolders ?? 0}</div>
            <p className="text-sm text-muted-foreground">Total folders</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent files</h2>
          </div>
          {recent && recent.length > 0 ? <FileList /> : <p className="text-sm text-muted-foreground">No recent files.</p>}
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Folders</h2>
          <FolderTree />
        </div>
      </div>
    </div>
  );
}
