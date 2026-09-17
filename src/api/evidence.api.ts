import api from './axios';
import type { ApiResponse } from '../types/api.types';

export interface EvidenceSource {
  _id: string;
  name: string;
  organization?: string;
  domain: string;
  tier: number;
  sourceType?: 'government' | 'commercial' | 'open_data' | 'community' | 'internal_submission' | 'field_verification';
  trustScore?: number;
  isActive?: boolean;
}

export interface EvidenceSubmitter {
  _id: string;
  fullName?: string;
  email?: string;
}

export interface PendingEvidence {
  _id: string;
  sourceId: EvidenceSource | string;
  submittedBy?: EvidenceSubmitter | string;
  entityType: 'neighbourhood' | 'property';
  entityId: string;
  neighbourhoodName?: string | null;
  claimType: string;
  value: unknown;
  observedAt: string;
  confidence: number;
  retrievedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  status: 'pending_review' | 'verified' | 'rejected' | 'superseded';
  rawValueBeforeNormalization?: string;
  sourceDocumentPublicId?: string;
  reviewNote?: string;
  aiSummary?: string;
  aiSummaryGeneratedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface EvidenceSummaryItem {
  neighbourhoodId: string;
  neighbourhoodName: string;
  count: number;
}

export interface EvidenceListResponse {
  items: PendingEvidence[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EvidenceCorroboration {
  peerCount: number;
  otherSourceCount: number;
  sourceNames: string[];
}

export interface SourceListItem {
  _id: string;
  name: string;
  organization?: string;
  domain: string;
  tier: number;
  trustScore?: number;
  isActive?: boolean;
}

export interface CreateSourcePayload {
  name: string;
  organization?: string;
  domain: string;
  tier: number;
  sourceType: string;
  url?: string;
}

export interface ClaimTypeCatalogItem {
  value: string;
  label: string;
  valueType: 'number' | 'select' | 'text';
  helper: string;
  unitLabel?: string;
  options?: string[];
  isSyncConfigured: boolean;
}

export const evidenceApi = {
  listSources: async (): Promise<ApiResponse<SourceListItem[]>> => {
    const { data } = await api.get('/admin/sources');
    return data;
  },

  createSource: async (payload: CreateSourcePayload): Promise<ApiResponse<SourceListItem>> => {
    const { data } = await api.post('/admin/sources', payload);
    return data;
  },

  listClaimTypes: async (): Promise<ApiResponse<ClaimTypeCatalogItem[]>> => {
    const { data } = await api.get('/admin/claim-types');
    return data;
  },

  submitEvidence: async (formData: FormData): Promise<ApiResponse<PendingEvidence>> => {
    const { data } = await api.post('/admin/evidence', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  listEvidenceSummary: async (): Promise<ApiResponse<EvidenceSummaryItem[]>> => {
    const { data } = await api.get('/admin/evidence/summary', {
      params: { status: 'pending_review' },
    });
    return data;
  },

  listPendingEvidence: async (params?: { neighbourhoodId?: string; page?: number; limit?: number }): Promise<ApiResponse<EvidenceListResponse>> => {
    const { data } = await api.get('/admin/evidence', {
      params: {
        status: 'pending_review',
        ...(params?.neighbourhoodId ? { neighbourhoodId: params.neighbourhoodId } : {}),
        ...(params?.page ? { page: params.page } : { page: 1 }),
        ...(params?.limit ? { limit: params.limit } : { limit: 20 }),
      },
    });
    return data;
  },

  getEvidenceCorroboration: async (id: string): Promise<ApiResponse<EvidenceCorroboration>> => {
    const { data } = await api.get(`/admin/evidence/${id}/corroboration`);
    return data;
  },

  approveEvidence: async (id: string): Promise<ApiResponse<PendingEvidence>> => {
    const { data } = await api.patch(`/admin/evidence/${id}/approve`);
    return data;
  },

  rejectEvidence: async (id: string, reason: string): Promise<ApiResponse<PendingEvidence>> => {
    const { data } = await api.patch(`/admin/evidence/${id}/reject`, { reason });
    return data;
  },

  getEvidenceDocumentUrl: async (id: string): Promise<ApiResponse<{ url: string; kind?: 'document' | 'source_reference' }>> => {
    const { data } = await api.get(`/admin/evidence/${id}/document-url`);
    return data;
  },

  getEvidenceSourceReference: async (id: string): Promise<ApiResponse<{ url: string; contentType: string; body: string }>> => {
    const { data } = await api.get(`/admin/evidence/${id}/source-reference`);
    return data;
  },
};
