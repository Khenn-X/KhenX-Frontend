export type EnquiryStatus = 'new' | 'read' | 'responded';

export interface IEnquiry {
  _id: string;
  listingId: string;
  agentId: string;
  seekerName: string;
  seekerEmail: string;
  seekerPhone?: string;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Request Payloads ────────────────────────────────────────────────────────

export interface SubmitEnquiryPayload {
  listingId: string;
  seekerName: string;
  seekerEmail: string;
  seekerPhone?: string;
  message: string;
}

export interface UpdateEnquiryStatusPayload {
  status: 'read' | 'responded';
}
