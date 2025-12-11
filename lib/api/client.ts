import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError, RefreshTokenResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5226/api';
const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

// Create axios instance - use relative path /api for browser requests (Next.js rewrites to backend)
// For server-side, use absolute URL
const baseURL = typeof window !== 'undefined' ? '/api' : API_BASE_URL;

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// Token Management
// ============================================================================

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
};

const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
};

const setRefreshToken = (refreshToken: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// ============================================================================
// Refresh Token Rotation
// ============================================================================

let isRefreshing = false;
type QueuedRequest = {
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
};

let failedQueue: QueuedRequest[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null): void => {
  failedQueue.forEach((prom: QueuedRequest) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

/**
 * Attempt to refresh the authentication token using the refresh token.
 * Note: This assumes the backend supports a refresh token endpoint.
 * If not implemented in the backend, remove this function and rely on re-login.
 */
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearTokens();
      return null;
    }

    // Create a new axios instance to avoid interceptor recursion
    // Use absolute URL for refresh since it's a special case
    const response = await axios.post<RefreshTokenResponse>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const { token, refreshToken: newRefreshToken } = response.data;

    setToken(token);
    if (newRefreshToken) {
      setRefreshToken(newRefreshToken);
    }

    return token;
  } catch (error: unknown) {
    clearTokens();
    // Redirect to login (handled by client-side navigation in AuthContext)
    return null;
  }
};

// ============================================================================
// Request Interceptor - Add JWT Token
// ============================================================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// Response Interceptor - Handle 401 & Token Refresh
// ============================================================================

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError): Promise<unknown> => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If request is not retryable or already retried, reject
    if (!originalRequest || originalRequest._retry) {
      clearTokens();
      // Dispatch custom event to notify app of logout
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      if (isRefreshing) {
        // Queue the request while refreshing
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      originalRequest._retry = true;

      const newToken = await refreshAccessToken();

      if (newToken) {
        processQueue(null, newToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } else {
        processQueue(error);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// File Upload Helper - Chunked Upload
// ============================================================================

export interface ChunkUploadProgress {
  loadedBytes: number;
  totalBytes: number;
}

/**
 * Upload a file in chunks with progress tracking
 * @param endpoint - API endpoint for uploading chunks
 * @param file - File to upload
 * @param formData - Additional form data to send with each chunk
 * @param onProgress - Callback to track upload progress
 */
export async function uploadFileInChunks(
  endpoint: string,
  file: File,
  formData: Record<string, string | number | undefined> = {},
  onProgress?: (progress: ChunkUploadProgress) => void
): Promise<{ success: boolean; fileName: string; size: number }> {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  let uploadedBytes = 0;

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const form = new FormData();
    form.append('file', chunk);
    form.append('fileName', file.name);
    form.append('chunkIndex', chunkIndex.toString());
    form.append('totalChunks', totalChunks.toString());

    // Add additional form data
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        form.append(key, value.toString());
      }
    });

    try {
      await apiClient.post(endpoint, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      uploadedBytes += chunk.size;
      onProgress?.({
        loadedBytes: uploadedBytes,
        totalBytes: file.size,
      });
    } catch (error: unknown) {
      throw new Error(`Failed to upload chunk ${chunkIndex + 1} of ${totalChunks}`);
    }
  }

  return { success: true, fileName: file.name, size: file.size };
}

// ============================================================================
// Error Handling
// ============================================================================

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError;

    if (data?.message) {
      return data.message;
    }

    if (data?.errors && Array.isArray(data.errors)) {
      return data.errors.join(', ');
    }

    if (error.response?.status === 401) {
      return 'Unauthorized. Please login again.';
    }

    if (error.response?.status === 403) {
      return 'You do not have permission to perform this action.';
    }

    if (error.response?.status === 404) {
      return 'The requested resource was not found.';
    }

    if (error.response?.status === 500) {
      return 'An internal server error occurred.';
    }

    return error.message || 'An error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

export { API_BASE_URL, CHUNK_SIZE };
