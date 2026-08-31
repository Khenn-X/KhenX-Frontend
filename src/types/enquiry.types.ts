export type EnquiryStatus = 'new' | 'read' | 'responded';
export type BuyerIntent = 'self' | 'family' | 'investment' | 'relocation';
export type BuyerLocation = 'in_nigeria' | 'outside_nigeria';
export type ContactPreference = 'whatsapp' | 'email' | 'phone';

export interface IEnquiry {
  _id: string;
  listingId: string;
  agentId: string;
  seekerName: string;
  seekerEmail: string;
  seekerPhone?: string;
  message: string;
  buyerIntent?: BuyerIntent | null;
  buyerLocation?: BuyerLocation | null;
  contactPreference?: ContactPreference | null;
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
  buyerIntent?: BuyerIntent;
  buyerLocation?: BuyerLocation;
  contactPreference?: ContactPreference;
}

export interface UpdateEnquiryStatusPayload {
  status: 'read' | 'responded';
}
