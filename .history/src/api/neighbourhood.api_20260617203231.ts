import api from './axios';
import type { ApiResponse } from '../types/api.types';
import type {
  INeighbourhoodIntelligence,
  WaitlistPayload,
  ResidentReportPayload,
  FeaturedAreasQuery,
} from '../types/neighbourhood.types';

export const neighbourhoodApi = {
  // Public — get intelligence data for a single Lagos area
  getAreaIntelligence: async (areaName: string): Promise<ApiResponse<{ intelligence: INeighbourhoodIntelligence | null }>> => {
    const { data } = await api.get('/neighbourhood', { params: { areaName } });
    return data;
  },

  // Public — get a list of featured areas for homepage / discovery grids.
  // Backend should populate imageUrl, overallScore, avgRentMin/Max, propertiesCount
  // on each returned area.
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
    const { data } = await api.post('/neighbourhood/resident-report', payload);
    return data;
  },
};