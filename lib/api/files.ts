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
 * Upload a file
 */
export async function uploadFile(
  file: File,
  fileName: string,
  folderId?: number | null,
  visibility: 'private' | 'shared' | 'public' = 'private',
  onProgress?: (progress: { loadedBytes: number; totalBytes: number }) => void
): Promise<FileDto> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', fileName);
  if (folderId !== null && folderId !== undefined) {
    formData.append('folderId', folderId.toString());
  }
  formData.append('visibility', visibility);

  // Use XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (e: ProgressEvent) => {
      if (e.lengthComputable && onProgress) {
        onProgress({
          loadedBytes: e.loaded,
          totalBytes: e.total,
        });
      }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status === 201 || xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch {
          resolve({ fileName, fileSize: file.size } as FileDto);
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.message || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });

    // Setup request
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    xhr.open('POST', '/api/files/upload');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    // Send request
    xhr.send(formData);
  });
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
