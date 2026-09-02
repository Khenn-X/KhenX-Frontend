import { Sparkles, X, AlertCircle } from 'lucide-react';
import { useSearchStore } from '../../store/search.store';
import ListingGrid from '../listings/ListingGrid';
import { cn } from '../../lib/utils';

interface SearchResultsProps {
  className?: string;
}

const SearchResults = ({ className }: SearchResultsProps) => {
  const {
    results,
    interpretedQuery,
    filterChips,
    isSearching,
    hasSearched,
    query,
    searchError,
    clearSearch,
  } = useSearchStore();

  // Nothing to show yet
  if (!hasSearched && !isSearching) return null;

  return (
    <div className={cn('space-y-5', className)}>

      {/* Filter chips */}
      {filterChips && filterChips.length > 0 && !isSearching && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-[#00C9A7]/8 border border-[#00C9A7]/20 px-4 py-3">
          <Sparkles className="h-4 w-4 shrink-0 text-[#00C9A7]" />
          <p className="text-xs font-semibold text-[#00C9A7] uppercase tracking-wide mr-1">Applied filters:</p>
          {filterChips.map((chip, idx) => (
            <span
              key={idx}
              className="inline-flex items-center rounded-full bg-white border border-[#00C9A7]/30 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      {/* Interpreted query banner (fallback if no filter chips) */}
      {interpretedQuery && !isSearching && (!filterChips || filterChips.length === 0) && (
        <div className="flex items-start justify-between gap-4 rounded-xl bg-[#00C9A7]/8 border border-[#00C9A7]/20 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#00C9A7]" />
            <div>
              <p className="text-xs font-semibold text-[#00C9A7] uppercase tracking-wide mb-0.5">
                AI understood your search as
              </p>
              <p className="text-sm text-slate-700">{interpretedQuery}</p>
            </div>
          </div>
          <button
            onClick={clearSearch}
            className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition-colors"
            aria-label="Clear search results"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Result count */}
      {hasSearched && !isSearching && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {results.length === 0
              ? `No properties found for "${query}"`
              : `${results.length} propert${results.length === 1 ? 'y' : 'ies'} found`}
          </p>
          <button
            onClick={clearSearch}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Clear results
          </button>
        </div>
      )}

      {/* Error state */}
      {searchError && !isSearching && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="font-medium text-red-900">Search failed</p>
            <p className="text-sm text-red-700 mt-0.5">{searchError}</p>
            <button
              onClick={clearSearch}
              className="text-sm text-red-600 hover:text-red-700 font-medium mt-2 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Grid (skip if there's an error) */}
      {!searchError && (
        <ListingGrid
          listings={results}
          isLoading={isSearching}
          emptyTitle="No properties matched your search"
          emptyDescription="Try rephrasing — for example: 'studio flat in Surulere with borehole under ₦600k'"
        />
      )}
    </div>
  );
};

export default SearchResults;
