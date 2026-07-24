export type FloodRisk = 'low' | 'medium' | 'high';
export type DataConfidence = 'low' | 'medium' | 'high';
export type FloodSeverity = 'minor' | 'moderate' | 'severe';

export interface INeighbourhoodIntelligence {
  _id: string;
  areaName: string;
  powerScore?: number;       // 0–10
  floodRisk?: FloodRisk;
  securityScore?: number;    // 0–10
  commuteScore?: number;     // 0–10
  dataConfidence: DataConfidence;
  dataSources: string[];
  lastUpdated?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Request Payloads ────────────────────────────────────────────────────────

export interface WaitlistPayload {
  email: string;
  areaName: string;
}

export interface ResidentReportPayload {
  areaName: string;
  reporterEmail?: string;
  powerHoursDaily?: number;
  floodedLastSeason?: boolean;
  floodSeverity?: FloodSeverity;
  securityRating?: number;   // 1–5
  incidentCategory?: string;
}
