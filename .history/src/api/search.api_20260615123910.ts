import api from './axios';
import type { ApiResponse } from '../types/api.types';
import type { NaturalSearchPayload, NaturalSearchResult } from '../types/search.types';

export const searchApi = {
  // Public — AI natural language property search
  // Rate limited: 30 req/min per IP
  naturalSearch: async (payload: NaturalSearchPayload): Promise<ApiResponse<NaturalSearchResult>> => {
    const { data } = await api.post('/search/natural', payload);
    return data;
  },
};
