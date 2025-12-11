'use client';

import { type ReactElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider as TanStackQueryClientProvider } from '@tanstack/react-query';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes before garbage collection
      gcTime: 10 * 60 * 1000,
      // Retry failed requests once
      retry: 1,
      // Don't retry on 404 or 401 errors
      retryOnMount: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});

export function QueryClientProvider({ children }: { children: ReactNode }): ReactElement {
  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
    </TanStackQueryClientProvider>
  );
}
