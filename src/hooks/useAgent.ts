import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentsApi } from '../api/agents.api';
import { queryKeys } from '../constants/queryKeys';
import { dashboardQueryOptions, invalidateDashboardQueries } from '../lib/dashboardQuery';
import type { UpdateAgentProfilePayload } from '../types/agent.types';

export const useAgents = (params?: { limit?: number; page?: number }) => {
  return useQuery(
    dashboardQueryOptions({
      queryKey: ['agents', 'list', params] as const,
      queryFn: () => agentsApi.getAllAgents(params),
    }),
  );
};

export const useAgentProfile = (id: string) => {
  return useQuery(
    dashboardQueryOptions({
      queryKey: queryKeys.agents.profile(id),
      queryFn: () => agentsApi.getAgentProfile(id),
      enabled: !!id,
    }),
  );
};

export const useAgentOwnProfile = () => {
  return useQuery(
    dashboardQueryOptions({
      queryKey: ['agents', 'me'] as const,
      queryFn: () => agentsApi.getOwnProfile(),
    }),
  );
};

export const useUpdateAgentProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAgentProfilePayload) => agentsApi.updateProfile(payload),
    onSuccess: () => {
      invalidateDashboardQueries(queryClient, queryKeys.kyc.status, ['agents', 'me'] as const);
    },
  });
};

export const useAgentDashboard = () => {
  return useQuery(
    dashboardQueryOptions({
      queryKey: ['agent', 'dashboard'] as const,
      queryFn: () => agentsApi.getDashboard(),
    }),
  );
};