import api from './axios';
import type { ApiResponse } from '../types/api.types';
import type {
  INeighbourhoodIntelligence,
  WaitlistPayload,
  ResidentReportPayload,
  FeaturedAreasQuery,
} from '../types/neighbourhood.types';

export const neighbourhoodApi = {
  // Public — get all areas, optional ?sortBy=power|security|commute|flood
  getAllAreas: async (sortBy?: string): Promise<ApiResponse<{ areas: INeighbourhoodIntelligence[] }>> => {
    const { data } = await api.get('/neighbourhood', { params: sortBy ? { sortBy } : undefined });
    return data;
  },

  // Public — get intelligence data for a single Lagos area
  getAreaIntelligence: async (areaName: string): Promise<ApiResponse<{ area: INeighbourhoodIntelligence }>> => {
    const { data } = await api.get(`/neighbourhood/${encodeURIComponent(areaName)}`);
    return data;
  },

  // Public — get a list of featured areas for homepage / discovery grids
  getFeaturedAreas: async (query?: FeaturedAreasQuery): Promise<ApiResponse<{ areas: INeighbourhoodIntelligence[] }>> => {
    const { data } = await api.get('/neighbourhood/featured', { params: query });
    return data;
  },

  // Public — join waitlist for an area not yet covered
  joinWaitlist: async (payload: WaitlistPayload): Promise<ApiResponse> => {
    const { data } = await api.post('/neighbourhood/waitlist', payload);
    return data;
  },

  // Public — submit a resident data report for an area
  submitResidentReport: async (payload: ResidentReportPayload): Promise<ApiResponse> => {
    const { data } = await api.post('/neighbourhood/submit', payload);
    return data;
  },
};