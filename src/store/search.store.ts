import { create } from 'zustand';
import type { IListing } from '../types/listing.types';
import type { ParsedListingFilters } from '../types/search.types';

interface SearchState {
  // The raw natural language query the user typed
  query: string;
  // Structured filters — either from AI parse or manual filter panel
  filters: ParsedListingFilters;
  // Results returned from the natural search endpoint
  results: IListing[];
  // Claude's interpretation of the query (shown to user as confirmation)
  interpretedQuery: string;
  // Loading state for the AI call
  isSearching: boolean;
  // Whether results are currently being displayed
  hasSearched: boolean;

  // Actions
  setQuery: (query: string) => void;
  setFilters: (filters: ParsedListingFilters) => void;
  setResults: (results: IListing[], interpretedQuery?: string) => void;
  setIsSearching: (value: boolean) => void;
  clearSearch: () => void;
}

const DEFAULT_FILTERS: ParsedListingFilters = {};

export const useSearchStore = create<SearchState>()((set) => ({
  query: '',
  filters: DEFAULT_FILTERS,
  results: [],
  interpretedQuery: '',
  isSearching: false,
  hasSearched: false,

  setQuery: (query) => set({ query }),

  setFilters: (filters) => set({ filters }),

  setResults: (results, interpretedQuery = '') =>
    set({ results, interpretedQuery, hasSearched: true }),

  setIsSearching: (value) => set({ isSearching: value }),

  clearSearch: () =>
    set({
      query: '',
      filters: DEFAULT_FILTERS,
      results: [],
      interpretedQuery: '',
      isSearching: false,
      hasSearched: false,
    }),
}));

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectQuery = (state: SearchState) => state.query;
export const selectSearchResults = (state: SearchState) => state.results;
export const selectIsSearching = (state: SearchState) => state.isSearching;
export const selectHasSearched = (state: SearchState) => state.hasSearched;
export const selectInterpretedQuery = (state: SearchState) => state.interpretedQuery;
export const selectFilters = (state: SearchState) => state.filters;
