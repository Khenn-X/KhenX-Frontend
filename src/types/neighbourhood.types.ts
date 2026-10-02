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

export type RentByBedroom = Partial<
  Record<RentBucketKey, RentBucketResolution>
>;

export interface NamedPlaceListItem {
  name?: string | null;
  distanceKm?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  brand?: string | null;
  osmType?: string | null;
  osmId?: number | null;
}

export interface INeighbourhoodIntelligence {
   resolvedRentByBedroom: RentByBedroom;
  lagosWideRentByBedroom: RentByBedroom;
  _id:       string;
  areaName:  string;
  displayName: string;
  lga?: string | null;
  createdAt: string;
  updatedAt: string;

  nearestPoliceStation?: {
    name?: string | null;
    distanceKm?: number | null;
    responseTimeMin?: number | null;
  } | null;
  airQualityRating?: number | null;
  schoolNearestList?: NamedPlaceListItem[] | null;
  bankNearestList?: NamedPlaceListItem[] | null;
  marketNearestList?: NamedPlaceListItem[] | null;

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

export interface NeighbourhoodMatchRequest {
  budget?: string | number;
  workplace?: string;
  priority?: string | string[];
  tags?: string[];
  currentArea?: string;
}

export type NeighbourhoodMatchTag =
  | 'family'
  | 'student'
  | 'remoteWork'
  | 'safety'
  | 'power'
  | 'flood'
  | 'commute'
  | 'value'
  | 'luxury';

export interface NeighbourhoodMatchCandidate {
  name: string;
  areaName: string;
  rentAvg: number | null;
  commuteMinutes: number | null;
  securityScore: number | null;
  powerScore: number | null;
  floodRisk: string | null;
  matchScore: number;
  reason: string;
  tags: NeighbourhoodMatchTag[];
}

export interface NeighbourhoodMatchResult {
  filters: {
    budgetMin?: number;
    budgetMax?: number;
    workplace?: string;
    tags: NeighbourhoodMatchTag[];
    currentArea?: string;
  };
  matchedArea: NeighbourhoodMatchCandidate;
  summary: string;
  alternates: NeighbourhoodMatchCandidate[];
}

// ─── Request Payloads ────────────────────────────────────────────────────────

export interface WaitlistPayload {
  email:    string;
  areaName: string;
}

export interface ResidentReportPayload {
  areaName?: string;
  reporterEmail: string;
  reporterName?: string;
  streetEstate?: string;
  reportDate?: string;
  season?: 'rainy' | 'dry';
  powerHoursDaily?: number;
  powerTrend?: 'better' | 'same' | 'worse';
  waterSource?: 'public_mains' | 'borehole' | 'tanker' | 'no_reliable_source';
  boreholeStatus?: 'functioning' | 'reduced_flow' | 'dry';
  waterAffectedByFlood?: boolean;
  floodedLastSeason?: boolean;
  floodSeverity?: FloodSeverity | 'none';
  floodingLevel?: 'none' | 'minor' | 'moderate' | 'severe';
  drainageRating?: number;
  lastFloodMonth?: string;
  dustIntensity?: 'none' | 'mild' | 'moderate' | 'heavy';
  fireIncidentNearby?: boolean;
  securityIncidents?: 'none' | 'one' | 'multiple';
  incidentTypes?: string[];
  incidentCategory?: 'none' | 'petty_theft' | 'robbery' | 'area_boys' | 'other';
  securityRating?: number; // 1–5
  nightSafetyRating?: number; // 1–5
  vigilantePresent?: 'yes_active' | 'yes_rarely' | 'no';
  roadCondition?: 'good' | 'fair' | 'poor' | 'impassable';
  roadChangedRecently?: 'no_change' | 'got_worse' | 'got_better';
  streetLighting?: 'fully_lit' | 'partially_lit' | 'not_lit';
  noiseLevel?: number;
  estateSecurityType?: 'none' | 'manned_gate' | 'cctv' | 'patrol' | 'smart_access';
  wasteCollectionReliability?: 'reliable' | 'irregular' | 'none';
  commuteTimeIslandMin?: number;
  commuteTimeIkejaMin?: number;
  trafficCongestionRating?: number;
  publicTransportAccess?: 'none' | 'limited' | 'available' | 'strong';
  internetQualityRating?: number;
  mobileNetworkQuality?: 'none' | '3g' | '4g' | '5g';
  has4G5GCoverage?: boolean;
  neighbourRelationsRating?: number;
  commercialActivityLevel?: 'quiet' | 'mixed' | 'busy' | 'very_busy';
  additionalNotes?: string;
  source?: 'resident_form' | 'admin_import' | 'disco_data' | 'satellite' | 'partner';
  isVerified?: boolean;
  ipAddress?: string;
}

export interface FeaturedAreasQuery {
  limit?: number;
}