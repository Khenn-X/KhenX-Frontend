import api from './axios';
import type { ApiResponse } from '../types/api.types';
import type { IListing } from '../types/listing.types';

export const savedApi = {
  // Auth required — get all saved listings for current user
  getSavedListings: async (): Promise<ApiResponse<{ listings: IListing[] }>> => {
    const { data } = await api.get('/saved');
    return data;
  },

  // Auth required — save a listing
  saveListing: async (listingId: string): Promise<ApiResponse> => {
    const { data } = await api.post('/saved', { listingId });
    return data;
  },

  // Auth required — unsave a listing
  unsaveListing: async (listingId: string): Promise<ApiResponse> => {
    const { data } = await api.delete(`/saved/${listingId}`);
    return data;
  },
};
