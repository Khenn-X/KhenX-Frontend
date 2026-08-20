import api from './axios';
import type { ApiResponse } from '../types/api.types';
import type {
  INeighbourhoodIntelligence,
  WaitlistPayload,
  ResidentReportPayload,
  FeaturedAreasQuery,
  NeighbourhoodMatchRequest,
  NeighbourhoodMatchResult,
} from '../types/neighbourhood.types';

export const neighbourhoodApi = {
  // Public — get all areas, optional ?sortBy=power|security|commute|flood
  getAllAreas: async (params?: { sortBy?: string; page?: number; pageSize?: number; search?: string }): Promise<ApiResponse<{ areas?: INeighbourhoodIntelligence[]; total?: number }>> => {
    const { data } = await api.get('/neighbourhood', { params });
    return data;
  },

  // Public — get intelligence data for a single Lagos area
  getAreaIntelligence: async (areaName: string): Promise<ApiResponse<{ area: INeighbourhoodIntelligence }>> => {
    const { data } = await api.get(`/neighbourhood/${encodeURIComponent(areaName)}`);
    return data;
  },

  matchNeighbourhood: async (
    payload: NeighbourhoodMatchRequest,
  ): Promise<ApiResponse<NeighbourhoodMatchResult>> => {
    const { data } = await api.post('/neighbourhood/match', payload);
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

  // Admin: bulk CSV import with preview / explicit commit
  importNeighbourhoodCsv: async (
    file: File,
    commit = false,
  ): Promise<{
    commit: boolean;
    headers: string[];
    rows: Array<{ rowNumber: number; areaName: string; displayName: string; validation: string | null; action: string | null; status: 'ok' | 'error' }>;
    errors: string[];
    counts?: { total: number; created: number; updated: number; failed: number };
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/neighbourhood/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: commit ? { commit: true } : undefined,
    });
    return data.data;
  },

  // Admin: update or upsert area scores/intelligence (admin routes)
  updateAreaScores: async (areaName: string, payload: Record<string, unknown>): Promise<ApiResponse<{ area: INeighbourhoodIntelligence }>> => {
    const { data } = await api.patch(`/neighbourhood/${encodeURIComponent(areaName)}/scores`, payload);
    return data;
  },

  // Admin: delete a neighbourhood
  deleteNeighbourhood: async (areaName: string): Promise<ApiResponse> => {
    const { data } = await api.delete(`/neighbourhood/${encodeURIComponent(areaName)}`);
    return data;
  },
};