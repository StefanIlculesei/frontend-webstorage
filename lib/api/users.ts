import { apiClient } from './client';
import {
  UserProfile,
  UserProfileUpdateRequest,
  StorageInfo,
  DashboardStats,
} from '@/types';

// ============================================================================
// User Services
// ============================================================================

/**
 * Get current user's profile information
 */
export async function getUserProfile(): Promise<UserProfile> {
  const response = await apiClient.get<UserProfile>('/users/profile');
  return response.data;
}

/**
 * Update user profile information
 */
export async function updateUserProfile(data: UserProfileUpdateRequest): Promise<UserProfile> {
  const response = await apiClient.put<UserProfile>('/users/profile', data);
  return response.data;
}

/**
 * Get storage usage information
 */
export async function getStorageInfo(): Promise<StorageInfo> {
  const response = await apiClient.get<StorageInfo>('/users/storage');
  return response.data;
}

/**
 * Get dashboard statistics for user
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await apiClient.get<DashboardStats>('/users/dashboard-stats');
  return response.data;
}
