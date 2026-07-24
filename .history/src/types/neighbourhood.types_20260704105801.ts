export type FloodRisk      = 'low' | 'medium' | 'high';
export type DataConfidence = 'low' | 'medium' | 'high';
export type FloodSeverity  = 'minor' | 'moderate' | 'severe';

import type { NeighbourhoodIntelligenceSummary } from './intelligence.types';

export interface TravelTimesToHubs {
  victoriaIsland?: number | null;
  ikeja?:          number | null;
  lekki?:          number | null;
  maryland?:       number | null;
}

export interface INeighbourhoodIntelligence {
  displayName: any;
  _id:       string;
  areaName:  string;
  createdAt: string;
  updatedAt: string;

  // ── Intelligence scores (all optional — null means no data yet) ──
  powerScore?:          number | null; // 0–10
  powerAvgHoursDaily?:  number | null; // e.g. 6.5 hrs/day
  floodRisk?:           FloodRisk | null;
  floodNotes?:          string | null;
  securityScore?:       number | null; // 0–10
  commuteScore?:        number | null; // 0–10
  travelTimesToHubs?:   TravelTimesToHubs;

  // ── Structured intelligence (from Intelligence Engine) ──────────
  intelligence?:        NeighbourhoodIntelligenceSummary | null;

  // ── Data quality metadata ────────────────────────────────────────
  dataConfidence:    DataConfidence;
  totalReportsUsed?: number;
  dataSources:       string[];
  lastUpdated?:      string | null;
  notes?:            string | null;

  // ── Homepage / discovery card fields (data team populates) ───────
  imageUrl?:         string | null;  // hero image for the area card
  overallScore?:     number | null;  // 0–10 single headline score on card badge
  avgRentMin?:       number | null;  // lower bound yearly rent in Naira
  avgRentMax?:       number | null;  // upper bound yearly rent in Naira
  rentCurrency?:     string;         // defaults to "NGN" if omitted
  propertiesCount?:  number | null;  // active verified listings in this area
  isFeatured?:       boolean;        // surfaces on homepage grid if true

  // ── Area detail (optional long-form content) ─────────────────────
  description?: string | null;
}

// ─── API Response Wrappers ───────────────────────────────────────────────────

export interface AreaIntelligenceResponse {
  area:          INeighbourhoodIntelligence;
  waitlistCount: number;
}

export interface CompareAreasResponse {
  areaA: INeighbourhoodIntelligence | null;
  areaB: INeighbourhoodIntelligence | null;
}

// ─── Request Payloads ────────────────────────────────────────────────────────

export interface WaitlistPayload {
  email:    string;
  areaName: string;
}

export interface ResidentReportPayload {
  areaName:           string;
  reporterEmail?:     string;
  powerHoursDaily?:   number;
  floodedLastSeason?: boolean;
  floodSeverity?:     FloodSeverity;
  securityRating?:    number; // 1–5
  incidentCategory?:  string;
}

export interface FeaturedAreasQuery {
  limit?: number;
}