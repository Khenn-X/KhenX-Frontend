export type KYCStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected' | 'suspended';
export type AgentTier = 'free' | 'professional' | 'agency';

export interface IAgent {
  _id: string;
  userId: string | {
    _id?: string;
    fullName?: string;
    avatarUrl?: string;
    email?: string;
    createdAt?: string;
  };
  fullName?: string;
  businessName?: string;
  phone?: string;
  bio?: string;
  kycStatus: KYCStatus;
  kycDocuments: string[];
  kycRejectionReason?: string;
  verifiedAt?: string;
  tier: AgentTier;
  listingPlan?: string;
  listingPlanStatus?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Request Payloads ────────────────────────────────────────────────────────

export interface UpdateAgentProfilePayload {
  fullName?: string;
  avatarUrl?: string;
  businessName?: string;
  phone?: string;
  bio?: string;
}

export interface KYCSubmitPayload {
  document: File;
  selfie: File;
}
