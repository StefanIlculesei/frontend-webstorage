// ============================================================================
// API Data Transfer Objects (DTOs) - Match backend API responses
// ============================================================================

export interface User {
  id: number;
  email: string;
  userName: string;
  storageUsed: number;
  storageLimit: number;
  createdAt: string;
  deletedAt?: string;
}

export interface File {
  id: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadDate: string;
  visibility: 'private' | 'shared' | 'public';
  folderId: number | null;
  folderName?: string;
  storagePath?: string;
  userId?: number;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface Folder {
  id: number;
  name: string;
  parentFolderId: number | null;
  createdAt: string;
  updatedAt: string;
  fileCount: number;
  subFolderCount: number;
  userId?: number;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface FolderTree extends Folder {
  subFolders: FolderTree[];
}

export interface FolderContents extends Folder {
  subFolders: Folder[];
  files: File[];
}

export interface Plan {
  id: number;
  name: string;
  storageLimit: number;
  price: number;
  features: string;
  currency: string;
}

export interface Subscription {
  id: number;
  userId: number;
  planId: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  autoRenew: boolean;
  createdAt: string;
  plan?: Plan;
}

// ============================================================================
// Authentication DTOs
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  email: string;
  userName: string;
  storageUsed: number;
  storageLimit: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  userName: string;
}

export interface RegisterResponse {
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

// ============================================================================
// File Operation DTOs
// ============================================================================

export interface FileUploadRequest {
  file: File;
  fileName: string;
  folderId?: number | null;
  visibility?: 'private' | 'shared' | 'public';
}

export interface FileUpdateRequest {
  fileName?: string;
  visibility?: 'private' | 'shared' | 'public';
  folderId?: number | null;
}

export interface FileMoveRequest {
  targetFolderId: number | null;
}

export interface BulkMoveRequest {
  fileIds: number[];
  targetFolderId: number | null;
}

export interface BulkMoveResponse {
  message: string;
  movedCount: number;
}

// ============================================================================
// Folder Operation DTOs
// ============================================================================

export interface FolderCreateRequest {
  name: string;
  parentFolderId?: number | null;
}

export interface FolderUpdateRequest {
  name?: string;
  parentFolderId?: number | null;
}

export interface FolderMoveRequest {
  targetParentFolderId: number | null;
}

// ============================================================================
// User Profile DTOs
// ============================================================================

export interface UserProfile {
  id: number;
  userName: string;
  email: string;
  storageUsed: number;
  storageLimit: number;
  createdAt: string;
  rootFolderId: number;
}

export interface UserProfileUpdateRequest {
  userName?: string;
  email?: string;
}

export interface StorageInfo {
  storageUsed: number;
  storageLimit: number;
}

export interface DashboardStats {
  storageUsed: number;
  storageLimit: number;
  storagePercentage: number;
  totalFiles: number;
  totalFolders: number;
}

// ============================================================================
// Subscription DTOs
// ============================================================================

export interface SubscriptionCreateRequest {
  planId: number;
  autoRenew?: boolean;
}

// ============================================================================
// API Error Response
// ============================================================================

export interface ApiError {
  message?: string;
  errors?: string[];
}

// ============================================================================
// Pagination & Search
// ============================================================================

export interface SearchParams {
  query: string;
}

export interface RecentFilesParams {
  limit?: number;
}

// ============================================================================
// Client-side State Types
// ============================================================================

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

// ============================================================================
// File Upload Chunk Types
// ============================================================================

export interface FileChunk {
  chunk: Blob;
  chunkIndex: number;
  totalChunks: number;
  fileName: string;
}

export interface ChunkUploadResponse {
  chunkIndex: number;
  uploaded: boolean;
}
