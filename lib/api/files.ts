import { apiClient, uploadFileInChunks } from './client';
import { File as FileDto, FileUpdateRequest, BulkMoveResponse } from '@/types';

// ============================================================================
// File Services
// ============================================================================

/**
 * Get all files for the authenticated user
 */
export async function getAllFiles(): Promise<FileDto[]> {
  const response = await apiClient.get<FileDto[]>('/files');
  return response.data;
}

/**
 * Get all files in a specific folder
 */
export async function getFilesByFolder(folderId: number): Promise<FileDto[]> {
  const response = await apiClient.get<FileDto[]>(`/files/folder/${folderId}`);
  return response.data;
}

/**
 * Get details of a specific file
 */
export async function getFileById(id: number): Promise<FileDto> {
  const response = await apiClient.get<FileDto>(`/files/${id}`);
  return response.data;
}

/**
 * Download a file
 */
export async function downloadFile(id: number): Promise<Blob> {
  const response = await apiClient.get(`/files/${id}/download`, {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Upload a file with chunked upload support
 */
export async function uploadFile(
  file: File,
  fileName: string,
  folderId?: number | null,
  visibility: 'private' | 'shared' | 'public' = 'private',
  onProgress?: (progress: { loadedBytes: number; totalBytes: number }) => void
): Promise<{ success: boolean; fileName: string; size: number }> {
  const response = await uploadFileInChunks(
    '/files/upload',
    file,
    {
      fileName,
      folderId: folderId ?? undefined,
      visibility,
    },
    onProgress
  );
  return response;
}

/**
 * Update file metadata (rename, change visibility, move)
 */
export async function updateFile(id: number, data: FileUpdateRequest): Promise<FileDto> {
  const response = await apiClient.put<FileDto>(`/files/${id}`, data);
  return response.data;
}

/**
 * Delete a file (soft delete)
 */
export async function deleteFile(id: number): Promise<void> {
  await apiClient.delete(`/files/${id}`);
}

/**
 * Search files by name
 */
export async function searchFiles(query: string): Promise<FileDto[]> {
  const response = await apiClient.get<FileDto[]>('/files/search', {
    params: { query },
  });
  return response.data;
}

/**
 * Move a file to a different folder
 */
export async function moveFile(id: number, targetFolderId: number | null): Promise<FileDto> {
  const response = await apiClient.patch<FileDto>(`/files/${id}/move`, {
    targetFolderId,
  });
  return response.data;
}

/**
 * Move multiple files to a folder at once
 */
export async function bulkMoveFiles(fileIds: number[], targetFolderId: number | null): Promise<BulkMoveResponse> {
  const response = await apiClient.post<BulkMoveResponse>('/files/bulk-move', {
    fileIds,
    targetFolderId,
  });
  return response.data;
}

/**
 * Get recently uploaded files
 */
export async function getRecentFiles(limit: number = 10): Promise<FileDto[]> {
  const response = await apiClient.get<FileDto[]>('/files/recent', {
    params: { limit },
  });
  return response.data;
}
