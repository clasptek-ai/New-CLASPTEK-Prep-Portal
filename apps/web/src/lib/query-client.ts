import { QueryClient } from '@tanstack/react-query';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        retry(failureCount, error: any) {
          const status = error?.status || error?.statusCode;
          const code = error?.code;
          // Never retry authentication/authorization errors
          if (status === 401 || status === 403 || code === 'UNAUTHORIZED' || code === 'FORBIDDEN') {
            return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
      },
      mutations: {
        retry: 1,
      },
    },
  });
}
