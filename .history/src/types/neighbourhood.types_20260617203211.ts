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

  // ── Homepage / discovery card fields ──────────────────────────────
  imageUrl?: string;          // hero image for the area card
  overallScore?: number;      // 0–10, single headline score shown on the card badge
  avgRentMin?: number;        // lower bound of yearly rent range (e.g. naira)
  avgRentMax?: number;        // upper bound of yearly rent range
  rentCurrency?: string;      // e.g. "NGN" — frontend defaults to NGN if omitted
  propertiesCount?: number;   // number of active verified listings in the area
  isFeatured?: boolean;       // true if this area should be surfaced on the homepage grid
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

export interface FeaturedAreasQuery {
  limit?: number; // optional cap, e.g. homepage only wants 5
}