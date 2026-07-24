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

export type RentBucketKey = '1' | '2' | '3' | 'detached_terrace';

export interface RentBucketResolution {
  source: 'live' | 'override' | 'insufficient_data';
  min: number | null;
  max: number | null;
  currency: string;
  sampleSize: number;
  updatedAt: string | null;
  updatedBy: string | null;
  reason: string | null;
}

export interface RentSummary {
  min: number | null;
  max: number | null;
  avg: number | null;
  sampleSize: number;
}

export interface INeighbourhoodIntelligence {
  _id:       string;
  areaName:  string;
  displayName: string;
  lga?: string | null;
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
  imageUrlSchool?:   string | null;  // school/local education landmark image
  imageUrlStreet?:   string | null;  // street/local area image
  imageUrlBank?:     string | null;  // bank/high-street image
  imageUrlMarket?:   string | null;  // market/local shopping image
  overallScore?:     number | null;  // 0–10 single headline score on card badge
  avgRentMin?:       number | null;  // lower bound yearly rent in Naira
  avgRentMax?:       number | null;  // upper bound yearly rent in Naira
  rentCurrency?:     string;         // defaults to "NGN" if omitted
  propertiesCount?:  number | null;  // active verified listings in this area
  isActive?:         boolean;        // whether this area is visible on the live site
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