import { useQuery } from '@tanstack/react-query';
import { lifestylesApi } from '../api/lifestyles.api';

export interface LifestyleRecommendationQueryParams {
  limit?: number;
  minScore?: number;
}

export const useLifestyleRecommendations = (
  slug?: string,
  params: LifestyleRecommendationQueryParams = {},
) =>
  useQuery({
    queryKey: ['lifestyle-recommendations', slug, params.limit ?? 10, params.minScore ?? null],
    queryFn: () => lifestylesApi.getRecommendations(slug ?? '', params),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });