  import { useQuery, useMutation } from '@tanstack/react-query';
  import { neighbourhoodApi } from '../api/neighbourhood.api';
  import { queryKeys } from '../constants/queryKeys';
  import type { WaitlistPayload, ResidentReportPayload, FeaturedAreasQuery } from '../types/neighbourhood.types';

  export const useNeighbourhood = (areaName: string) => {
    return useQuery({
      queryKey: queryKeys.neighbourhood.area(areaName),
      queryFn: () => neighbourhoodApi.getAreaIntelligence(areaName),
      enabled: !!areaName.trim(),
      staleTime: 1000 * 60 * 30, // 30 min — neighbourhood data changes slowly
    });
  };

  // Homepage / discovery grids — list of featured areas with image, rent range, score, etc.
  export const useFeaturedNeighbourhoods = (query?: FeaturedAreasQuery) => {
    return useQuery({
      queryKey: queryKeys.neighbourhood.featured(query),
      queryFn: () => neighbourhoodApi.getFeaturedAreas(query),
      staleTime: 1000 * 60 * 30,
    });
  };

  export const useJoinWaitlist = () => {
    return useMutation({
      mutationFn: (payload: WaitlistPayload) => neighbourhoodApi.joinWaitlist(payload),
    });
  };

  export const useSubmitResidentReport = () => {
    return useMutation({
      mutationFn: (payload: ResidentReportPayload) =>
        neighbourhoodApi.submitResidentReport(payload),
    });
  };