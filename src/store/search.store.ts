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
  // Human-readable filter chips for display
  filterChips: string[];
  // Loading state for the AI call
  isSearching: boolean;
  // Whether results are currently being displayed
  hasSearched: boolean;
  // Error message if search failed
  searchError: string | null;

  // Actions
  setQuery: (query: string) => void;
  setFilters: (filters: ParsedListingFilters) => void;
  setResults: (results: IListing[], interpretedQuery?: string, filterChips?: string[]) => void;
  setIsSearching: (value: boolean) => void;
  setSearchError: (error: string | null) => void;
  clearSearch: () => void;
}

const DEFAULT_FILTERS: ParsedListingFilters = {};

export const useSearchStore = create<SearchState>()((set) => ({
  query: '',
  filters: DEFAULT_FILTERS,
  results: [],
  interpretedQuery: '',
  filterChips: [],
  isSearching: false,
  hasSearched: false,
  searchError: null,

  setQuery: (query) => set({ query }),

  setFilters: (filters) => set({ filters }),

  setResults: (results, interpretedQuery = '', filterChips = []) =>
    set({ results, interpretedQuery, filterChips, hasSearched: true, searchError: null }),

  setIsSearching: (value) => set({ isSearching: value }),

  setSearchError: (error) => set({ searchError: error }),

  clearSearch: () =>
    set({
      query: '',
      filters: DEFAULT_FILTERS,
      results: [],
      interpretedQuery: '',
      filterChips: [],
      isSearching: false,
      hasSearched: false,
      searchError: null,
    }),
}));

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectQuery = (state: SearchState) => state.query;
export const selectSearchResults = (state: SearchState) => state.results;
export const selectIsSearching = (state: SearchState) => state.isSearching;
export const selectHasSearched = (state: SearchState) => state.hasSearched;
export const selectInterpretedQuery = (state: SearchState) => state.interpretedQuery;
export const selectFilterChips = (state: SearchState) => state.filterChips;
export const selectFilters = (state: SearchState) => state.filters;
export const selectSearchError = (state: SearchState) => state.searchError;
