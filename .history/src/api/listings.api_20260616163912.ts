import api from './axios';
import type { ApiResponse, PaginatedResponse } from '../types/api.types';
import type { IListing, CreateListingPayload, UpdateListingPayload } from '../types/listing.types';
import type { ParsedListingFilters } from '../types/search.types';

export interface ListingsQueryParams extends ParsedListingFilters {
  page?: number;
  limit?: number;
}

export const listingsApi = {
  // Public — browse all active listings
  getListings: async (params?: ListingsQueryParams): Promise<PaginatedResponse<IListing>> => {
    const { data } = await api.get('/listings', { params });
    console.log();
    
    return data;
  },

  // Public — single listing detail
  getListing: async (id: string): Promise<ApiResponse<{ listing: IListing }>> => {
    const { data } = await api.get(`/listings/${id}`);
    return data;
  },

  // Agent + KYC approved — submit new listing with photos as FormData
  createListing: async (payload: CreateListingPayload, photos: File[]): Promise<ApiResponse<{ listing: IListing }>> => {
    const formData = new FormData();

    // Append all text fields
    (Object.keys(payload) as (keyof CreateListingPayload)[]).forEach((key) => {
      const value = payload[key];
      if (key === 'features' && typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    // Append photos
    photos.forEach((photo) => formData.append('photos', photo));

    const { data } = await api.post('/listings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // Agent — edit own listing
  updateListing: async (id: string, payload: UpdateListingPayload): Promise<ApiResponse<{ listing: IListing }>> => {
    const { data } = await api.patch(`/listings/${id}`, payload);
    return data;
  },

  // Agent — delete own listing
  deleteListing: async (id: string): Promise<ApiResponse> => {
    const { data } = await api.delete(`/listings/${id}`);
    return data;
  },

  // Agent — own listings (all statuses)
  getMyListings: async (): Promise<ApiResponse<{ listings: IListing[] }>> => {
    const { data } = await api.get('/listings/agent/my-listings');
    return data;
  },
};
