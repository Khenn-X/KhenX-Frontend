import api from './axios';
import type { ApiResponse } from '../types/api.types';
import type { IListing, ListingStatus } from '../types/listing.types';
import type { IAgent } from '../types/agent.types';
import type { IUser } from '../types/auth.types';

export type AdminListingStatus = 'all' | ListingStatus;

export interface AdminAgentEntry {
  agent: IAgent;
  user: Pick<IUser, '_id' | 'fullName' | 'email' | 'createdAt'>;
  listingCount: number;
}

export interface AdminStats {
  totalListings: number;
  pendingListings: number;
  activeListings: number;
  totalAgents: number;
  pendingKYC: number;
  openFraudReports: number;
  totalSeekers: number;
}

export const adminApi = {
  // Admin — get platform-wide stats
  getStats: async (): Promise<ApiResponse<{
    data: any; stats: AdminStats 
}>> => {
    const { data } = await api.get('/admin/stats');
    return data;
  },

  // Admin — get listings for the selected review tab, or all listings by default
  getAdminListings: async (status?: AdminListingStatus): Promise<ApiResponse<{ listings: IListing[] }>> => {
    const params = status && status !== 'all' ? { status } : undefined;
    const { data } = await api.get('/admin/listings', { params });
    return data;
  },

  getPendingListings: async (): Promise<ApiResponse<{ listings: IListing[] }>> => {
    const { data } = await api.get('/admin/listings', { params: { status: 'pending' } });
    return data;
  },

  // Admin — approve a listing
  approveListing: async (id: string): Promise<ApiResponse<{ listing: IListing }>> => {
    const { data } = await api.patch(`/admin/listings/${id}/approve`);
    return data;
  },

  // Admin — reject a listing with reason
  rejectListing: async (
    id: string,
    reason: string
  ): Promise<ApiResponse<{ listing: IListing }>> => {
    const { data } = await api.patch(`/admin/listings/${id}/reject`, { reason });
    return data;
  },

  // Admin — toggle featured status on a listing
  featureListing: async (
    id: string,
    isFeatured: boolean
  ): Promise<ApiResponse<{ listing: IListing }>> => {
    const { data } = await api.patch(`/admin/listings/${id}/feature`, { isFeatured });
    return data;
  },

  // Admin — get all agents with their KYC status
  getAllAgents: async (): Promise<ApiResponse<{ agents: AdminAgentEntry[] }>> => {
    const { data } = await api.get('/admin/agents');
    return data;
  },

  // Admin — suspend an agent with reason
  suspendAgent: async (
    id: string,
    reason: string
  ): Promise<ApiResponse> => {
    const { data } = await api.patch(`/admin/agents/${id}/suspend`, { reason });
    return data;
  },
};
