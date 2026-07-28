import { useQuery } from '@tanstack/react-query';
import { landlordsApi } from '../api/landlords.api';
import { queryKeys } from '../constants/queryKeys';

export const useLandlords = (params?: { limit?: number; page?: number }) => {
  return useQuery({
    queryKey: queryKeys.landlords.list(params),
    queryFn: () => landlordsApi.getAllLandlords(params),
  });
};

export const useLandlordProfile = (id: string) => {
  return useQuery({
    queryKey: queryKeys.landlords.profile(id),
    queryFn: () => landlordsApi.getLandlordProfile(id),
    enabled: !!id,
  });
};
