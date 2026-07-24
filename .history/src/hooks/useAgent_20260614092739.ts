import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentsApi } from '../api/agents.api';
import { queryKeys } from '../constants/queryKeys';
import { UpdateAgentProfilePayload } from '../types/agent.types';

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
      // Invalidate KYC status so agent profile re-fetches with latest data
      queryClient.invalidateQueries({ queryKey: queryKeys.kyc.status });
    },
  });
};
