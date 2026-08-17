import type { ParsedListingFilters } from '../types/search.types';
import type { ListingStatus } from '../types/listing.types';

export type AdminListingStatus = 'all' | ListingStatus;

/**
 * All React Query key factories.
 * Never hardcode query key strings anywhere else — always import from here.
 */
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },

  listings: {
    all: (filters?: ParsedListingFilters) =>
      filters ? (['listings', 'all', filters] as const) : (['listings', 'all'] as const),
    detail: (id: string) => ['listings', 'detail', id] as const,
    myListings: ['listings', 'mine'] as const,
    usage: ['listings', 'usage'] as const,
    pending: ['listings', 'pending'] as const,
    admin: (status?: AdminListingStatus) =>
      status && status !== 'all'
        ? (['listings', 'admin', status] as const)
        : (['listings', 'admin'] as const),
  },

  search: {
    natural: (query: string) => ['search', 'natural', query] as const,
  },

  neighbourhood: {
    area: (name: string) => ['neighbourhood', name] as const,
    featured: (query?: { limit?: number }) =>
      query ? (['neighbourhood', 'featured', query] as const) : (['neighbourhood', 'featured'] as const),
  },

  enquiries: {
    mine: (status?: string) =>
      status ? (['enquiries', 'mine', status] as const) : (['enquiries', 'mine'] as const),
  },

  saved: {
    all: ['saved', 'all'] as const,
  },

  fraud: {
    all: ['fraud', 'all'] as const,
  },

  kyc: {
    status: ['kyc', 'status'] as const,
    all: ['kyc', 'all'] as const,
  },

  agents: {
    profile: (id: string) => ['agents', 'profile', id] as const,
  },

  landlords: {
    list: (params?: { limit?: number; page?: number }) => ['landlords', 'list', params] as const,
    profile: (id: string) => ['landlords', 'profile', id] as const,
  },

  admin: {
    stats: ['admin', 'stats'] as const,
    agents: ['admin', 'agents'] as const,
    payments: ['admin', 'payments'] as const,
  },

  superadmin: {
    pendingAdmins: ['superadmin', 'pending-admins'] as const,
  },
} as const;