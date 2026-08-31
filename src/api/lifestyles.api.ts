import api from './axios';
import type { ApiResponse } from '../types/api.types';

export type LifestyleStatus = 'active' | 'draft';

export interface LifestyleProfile {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  heroHeadline: string;
  heroSubtext: string;
  heroImage: string;
  cardImage: string;
  weights: Record<string, number>;
  factorDescriptions: Record<string, string>;
  status: LifestyleStatus;
  priority: number;
}

export interface LifestyleFactorBreakdown {
  factor: string;
  score: number;
  weight: number;
}

export interface LifestyleRecommendation {
  neighbourhoodId: string;
  name: string;
  slug: string | null;
  score: number;
  factorBreakdown: LifestyleFactorBreakdown[];
  explanation: string;
  matchingPropertyCount: number;
}

export interface LifestyleRecommendationsResponse {
  profile: Pick<LifestyleProfile, 'id' | 'slug' | 'name' | 'shortDescription' | 'status' | 'priority'>;
  recommendations: LifestyleRecommendation[];
  excludedForInsufficientData: number;
  totalActiveNeighbourhoods: number;
  reason?: string;
}

export const lifestylesApi = {
  getAll: async (): Promise<ApiResponse<{ profiles: LifestyleProfile[] }>> => {
    const { data } = await api.get('/lifestyles');
    return data;
  },

  getBySlug: async (slug: string): Promise<ApiResponse<LifestyleProfile>> => {
    const { data } = await api.get(`/lifestyles/${encodeURIComponent(slug)}`);
    return data;
  },

  getRecommendations: async (
    slug: string,
    params?: { limit?: number; minScore?: number },
  ): Promise<ApiResponse<LifestyleRecommendationsResponse>> => {
    const { data } = await api.get(`/lifestyles/${encodeURIComponent(slug)}/recommendations`, { params });
    return data;
  },
};