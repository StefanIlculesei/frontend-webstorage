'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types';
import * as authService from '@/lib/api/auth';
import { getUserProfile } from '@/lib/api/users';
import { getErrorMessage } from '@/lib/api/client';

// ============================================================================
// Auth Context Type
// ============================================================================

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userName: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// ============================================================================
// Create Context
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Auth Provider Component
// ============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========================================================================
  // Initialize Auth from localStorage
  // ========================================================================

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken) {
          setToken(storedToken);

          // Validate token by fetching user profile
          try {
            const profile = await getUserProfile();
            setUser(profile);
          } catch (err) {
            // Token is invalid, clear it
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        } else if (storedUser) {
          // Restore user from localStorage if available
          try {
            setUser(JSON.parse(storedUser));
          } catch (err) {
            localStorage.removeItem('user');
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for logout events (from API interceptor)
    const handleLogout = () => {
      logout();
    };

    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  // ========================================================================
  // Login Handler
  // ========================================================================

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login({ email, password });

      // Store token and user
      localStorage.setItem('token', response.token);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }

      setToken(response.token);

      // Fetch full user profile
      const profile = await getUserProfile();
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));

      router.push('/dashboard');
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // ========================================================================
  // Register Handler
  // ========================================================================

  const register = useCallback(async (email: string, password: string, userName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.register({ email, password, userName });

      // Auto-login after registration
      await login(email, password);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  // ========================================================================
  // Logout Handler
  // ========================================================================

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setError(null);
    router.push('/login');
  }, [router]);

  // ========================================================================
  // Clear Error
  // ========================================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ========================================================================
  // Provide Context
  // ========================================================================

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// useAuth Hook
// ============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
