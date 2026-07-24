import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getAllAreas,
  getFeaturedAreas,
  getAreaIntelligence,
  submitResidentReport,
  joinWaitlist,
} from '../services/neighbourhood.service';
import type {
  ResidentReportPayload,
  WaitlistPayload,
} from '../types/neighbourhood.types';

export const neighbourhoodKeys = {
  all:      ['neighbourhood'] as const,
  lists:    () => [...neighbourhoodKeys.all, 'list'] as const,
  featured: (limit?: number) => [...neighbourhoodKeys.all, 'featured', limit] as const,
  area:     (name: string) => [...neighbourhoodKeys.all, 'area', name] as const,
};

// Single area — used in NeighbourhoodPage and listing detail
export const useNeighbourhood = (area: string) =>
  useQuery({
    queryKey: neighbourhoodKeys.area(area),
    queryFn:  () => getAreaIntelligence(area),
    enabled:  !!area,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

// All areas — Intelligence Hub
export const useAllAreas = () =>
  useQuery({
    queryKey: neighbourhoodKeys.lists(),
    queryFn:  getAllAreas,
    staleTime: 1000 * 60 * 10,
  });

// Featured areas — Homepage + improved NeighbourhoodPage
export const useFeaturedAreas = (limit?: number) =>
  useQuery({
    queryKey: neighbourhoodKeys.featured(limit),
    queryFn:  () => getFeaturedAreas(limit),
    staleTime: 1000 * 60 * 10,
  });

// Submit resident report — ContributeDataPage
export const useSubmitResidentReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ResidentReportPayload) => submitResidentReport(data),
    onSuccess: (_, variables) => {
      toast.success('Report submitted. Thank you for helping your community!');
      queryClient.invalidateQueries({
        queryKey: neighbourhoodKeys.area(variables.areaName),
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Something went wrong. Please try again.'
      );
    },
  });
};

// Join waitlist — FallbackPanel + ContributeDataPage
export const useJoinWaitlist = () =>
  useMutation({
    mutationFn: (data: WaitlistPayload) => joinWaitlist(data),
    onSuccess: (res: any) => {
      toast.success(res?.message || "You're on the list!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Something went wrong. Please try again.'
      );
    },
  });