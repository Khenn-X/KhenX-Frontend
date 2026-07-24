export type KYCStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type AgentTier = 'free' | 'professional' | 'agency';

export interface IAgent {
  _id: string;
  userId: string;
  businessName?: string;
  phone?: string;
  bio?: string;
  kycStatus: KYCStatus;
  kycDocuments: string[];
  kycRejectionReason?: string;
  verifiedAt?: string;
  tier: AgentTier;
  createdAt: string;
  updatedAt: string;
}

// ─── Request Payloads ────────────────────────────────────────────────────────

export interface UpdateAgentProfilePayload {
  businessName?: string;
  phone?: string;
  bio?: string;
}

export interface KYCSubmitPayload {
  document: File;
  selfie: File;
}
