import { apiClient } from './client';
import {
  Folder,
  FolderTree,
  FolderContents,
  FolderCreateRequest,
  FolderUpdateRequest,
  FolderMoveRequest,
} from '@/types';

// ============================================================================
// Folder Services
// ============================================================================

/**
 * Get all folders for the authenticated user
 */
export async function getAllFolders(): Promise<Folder[]> {
  const response = await apiClient.get<Folder[]>('/folders');
  return response.data;
}

/**
 * Get root-level folders (folders without parent)
 */
export async function getRootFolders(): Promise<Folder[]> {
  const response = await apiClient.get<Folder[]>('/folders/root');
  return response.data;
}

/**
 * Get details of a specific folder
 */
export async function getFolderById(id: number): Promise<Folder> {
  const response = await apiClient.get<Folder>(`/folders/${id}`);
  return response.data;
}

/**
 * Get folder with all its subfolders (recursive tree structure)
 */
export async function getFolderTree(id: number): Promise<FolderTree> {
  const response = await apiClient.get<FolderTree>(`/folders/${id}/tree`);
  return response.data;
}

/**
 * Get folder with its direct subfolders and files
 */
export async function getFolderContents(id: number): Promise<FolderContents> {
  const response = await apiClient.get<FolderContents>(`/folders/${id}/contents`);
  return response.data;
}

/**
 * Create a new folder
 */
export async function createFolder(data: FolderCreateRequest): Promise<Folder> {
  const response = await apiClient.post<Folder>('/folders', data);
  return response.data;
}

/**
 * Update folder (rename or move)
 */
export async function updateFolder(id: number, data: FolderUpdateRequest): Promise<Folder> {
  const response = await apiClient.put<Folder>(`/folders/${id}`, data);
  return response.data;
}

/**
 * Delete a folder (soft delete)
 */
export async function deleteFolder(id: number): Promise<void> {
  await apiClient.delete(`/folders/${id}`);
}

/**
 * Move folder to a different parent folder
 */
export async function moveFolder(id: number, targetParentFolderId: number | null): Promise<Folder> {
  const response = await apiClient.patch<Folder>(`/folders/${id}/move`, {
    targetParentFolderId,
  });
  return response.data;
}
