import api from './axios';
import type { ApiResponse } from '../types/api.types';
import type { IUser } from '../types/auth.types';
import type { IListing } from '../types/listing.types';

export interface LandlordPublicProfile {
  landlord: {
    _id: string;
    userId: string;
    phone?: string;
    bio?: string;
    kycStatus: string;
    verifiedAt?: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  user: Pick<IUser, '_id' | 'fullName' | 'avatarUrl'> | null;
}

export interface LandlordsListResponse {
  landlords: LandlordPublicProfile[];
  total: number;
}

export const landlordsApi = {
  getAllLandlords: async (params?: { limit?: number; page?: number }): Promise<ApiResponse<LandlordsListResponse>> => {
    const { data } = await api.get('/landlords', { params });
    return data;
  },

  getLandlordProfile: async (id: string): Promise<ApiResponse<{ landlord: LandlordPublicProfile['landlord']; listings: IListing[] }>> => {
    const { data } = await api.get(`/landlords/${id}`);
    return data;
  },
};
