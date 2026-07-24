import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentsApi } from '../api/agents.api';
import { queryKeys } from '../constants/queryKeys';
import type { UpdateAgentProfilePayload } from '../types/agent.types';

export const useAgents = (params?: { limit?: number; page?: number }) => {
  return useQuery({
    queryKey: ['agents', 'list', params] as const,
    queryFn: () => agentsApi.getAllAgents(params),
  });
};

export const useAgentProfile = (id: string) => {
  return useQuery({
    queryKey: queryKeys.agents.profile(id),
    queryFn: () => agentsApi.getAgentProfile(id),
    enabled: !!id,
  });
};

export const useUpdateAgentProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAgentProfilePayload) => agentsApi.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kyc.status });
    },
  });
};