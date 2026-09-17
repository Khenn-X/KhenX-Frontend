import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { evidenceApi } from '../api/evidence.api';
import { queryKeys } from '../constants/queryKeys';

export const usePendingEvidenceSummary = () => {
  return useQuery({
    queryKey: queryKeys.evidence.summary,
    queryFn: () => evidenceApi.listEvidenceSummary(),
    select: (response) => response.data ?? [],
  });
};

export const useNeighbourhoodEvidence = (neighbourhoodId: string | null, page: number, limit: number, enabled: boolean) => {
  return useQuery({
    queryKey: neighbourhoodId ? queryKeys.evidence.neighbourhood(neighbourhoodId, page, limit) : ['evidence', 'neighbourhood', 'none'],
    queryFn: () => evidenceApi.listPendingEvidence({ neighbourhoodId: neighbourhoodId ?? undefined, page, limit }),
    enabled: enabled && Boolean(neighbourhoodId),
    select: (response) => response.data ?? { items: [], pagination: { total: 0, page, limit, totalPages: 1 } },
  });
};

export const useEvidenceCorroboration = (evidenceId: string | null, enabled: boolean) => {
  return useQuery({
    queryKey: ['evidence', 'corroboration', evidenceId],
    queryFn: () => evidenceApi.getEvidenceCorroboration(evidenceId!),
    enabled: enabled && Boolean(evidenceId),
    select: (response) => response.data,
  });
};

export const useSubmitEvidence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => evidenceApi.submitEvidence(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evidence.pending });
    },
  });
};

export const useApproveEvidence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (evidenceId: string) => evidenceApi.approveEvidence(evidenceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidence'] });
    },
  });
};

export const useRejectEvidence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ evidenceId, reason }: { evidenceId: string; reason: string }) =>
      evidenceApi.rejectEvidence(evidenceId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidence'] });
    },
  });
};
