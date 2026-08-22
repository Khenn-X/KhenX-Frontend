import type { IListing } from './listing.types';

export interface ParsedListingFilters {
  areaName?: string;
  bedrooms?: number;
  maxPrice?: number;
  minPrice?: number;
  propertyType?: string;
  listingType?: string;
  features?: string[];
}

export interface NaturalSearchPayload {
  query: string;
  currentArea?: string;
  budget?: string;
  workplace?: string;
}

export interface NaturalSearchResult {
  listings: IListing[];
  parsedFilters?: ParsedListingFilters;
  interpretedQuery?: string;
  filters?: ParsedListingFilters;
  source?: 'ai' | 'keyword' | 'none';
  total?: number;
  resolvedArea?: string;
  budgetOnly?: boolean;
  inCurrentArea?: IListing[];
  otherAreas?: IListing[];
}
