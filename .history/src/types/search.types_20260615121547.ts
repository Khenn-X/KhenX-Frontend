import ty { IListing } from './listing.types';

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
}

export interface NaturalSearchResult {
  listings: IListing[];
  parsedFilters: ParsedListingFilters;
  interpretedQuery: string; // Claude's plain-English summary of what it understood
}
