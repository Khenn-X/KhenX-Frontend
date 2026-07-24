import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // 5 minutes — data stays fresh
      gcTime: 1000 * 60 * 10,          // 10 minutes — cache retained
      retry: 1,                         // Retry failed requests once
      refetchOnWindowFocus: false,      // Don't refetch on tab switch
    },
    mutations: {
      retry: 0,                         // Never retry mutations
    },
  },
});

export default queryClient;
