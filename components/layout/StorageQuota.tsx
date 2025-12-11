'use client';

import type { ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStorageInfo } from '@/lib/api/users';
import { Progress } from '@/components/ui/progress';
import { formatBytes } from '@/lib/utils/format';

export function StorageQuota(): ReactElement {
  const { data, isLoading } = useQuery({
    queryKey: ['storage-info'],
    queryFn: getStorageInfo,
  });

  const used = data?.storageUsed ?? 0;
  const limit = data?.storageLimit ?? 1;
  const percentage = Math.min(100, Math.round((used / limit) * 100));

  return (
    <div className="space-y-2 rounded-lg border bg-muted/50 p-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium">Storage</span>
        {isLoading ? <span className="text-xs text-muted-foreground">Loading...</span> : <span>{percentage}%</span>}
      </div>
      <Progress value={percentage} className="h-2" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Used: {formatBytes(used)}</span>
        <span>Limit: {formatBytes(limit)}</span>
      </div>
    </div>
  );
}
