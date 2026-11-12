import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/lib/api/client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      // Erro 4xx é resposta definitiva; só falha de rede ou 5xx merece nova tentativa.
      retry: (failureCount, error) =>
        failureCount < 2 && !(error instanceof ApiError && error.status < 500),
    },
  },
});
