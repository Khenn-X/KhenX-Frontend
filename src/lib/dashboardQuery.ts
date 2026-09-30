import type { Query, QueryClient, UseQueryOptions } from '@tanstack/react-query';

export type QueryScope = 'public' | 'dashboard';

export const publicQueryDefaults = {
  staleTime: 1000 * 60 * 5,
  gcTime: 1000 * 60 * 30,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

export const dashboardQueryDefaults = {
  staleTime: 0,
  refetchOnMount: 'always' as const,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
};

export const isPageDashboardQuery = (query: Query<unknown, unknown>) => {
  const meta = query.meta as { scope?: string } | undefined;
  return meta?.scope === 'page';
};

export const buildQueryOptions = <
  TQueryFnData,
  TError = Error,
  TData = TQueryFnData,
>(
  scope: QueryScope,
  options: Omit<
    UseQueryOptions<TQueryFnData, TError, TData>,
    'staleTime' | 'gcTime' | 'refetchOnMount' | 'refetchOnWindowFocus' | 'refetchOnReconnect'
  > & {
    meta?: Record<string, unknown>;
  },
): UseQueryOptions<TQueryFnData, TError, TData> => {
  const defaults = scope === 'dashboard' ? dashboardQueryDefaults : publicQueryDefaults;

  return {
    ...options,
    ...defaults,
    meta: {
      ...(options.meta ?? {}),
      scope: scope === 'dashboard' ? 'page' : 'public',
    },
    placeholderData: (previousData: TData | undefined) => previousData,
  };
};

export const publicQueryOptions = <
  TQueryFnData,
  TError = Error,
  TData = TQueryFnData,
>(
  options: Omit<
    UseQueryOptions<TQueryFnData, TError, TData>,
    'staleTime' | 'gcTime' | 'refetchOnMount' | 'refetchOnWindowFocus' | 'refetchOnReconnect'
  > & {
    meta?: Record<string, unknown>;
  },
): UseQueryOptions<TQueryFnData, TError, TData> => buildQueryOptions('public', options);

export const hasCachedPageDashboardData = (queryClient: QueryClient) =>
  queryClient.getQueryCache().findAll({
    predicate: (query) => isPageDashboardQuery(query) && query.state.data !== undefined,
  }).length > 0;

export const dashboardQueryOptions = <
  TQueryFnData,
  TError = Error,
  TData = TQueryFnData,
>(
  options: Omit<
    UseQueryOptions<TQueryFnData, TError, TData>,
    'staleTime' | 'refetchOnMount' | 'refetchOnWindowFocus' | 'refetchOnReconnect'
  > & {
    meta?: Record<string, unknown>;
  },
): UseQueryOptions<TQueryFnData, TError, TData> => buildQueryOptions('dashboard', options);

export const invalidateDashboardQueries = (
  queryClient: QueryClient,
  ...queryKeys: Array<readonly unknown[] | string[] | string | undefined>
) => {
  queryKeys.forEach((key) => {
    if (!key || (Array.isArray(key) && key.length === 0)) return;
    void queryClient.invalidateQueries({ queryKey: key as readonly unknown[] });
  });
};
