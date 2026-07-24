import { Sparkles, X } from 'lucide-react';
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
    isSearching,
    hasSearched,
    query,
    clearSearch,
  } = useSearchStore();

  // Nothing to show yet
  if (!hasSearched && !isSearching) return null;

  return (
    <div className={cn('space-y-5', className)}>

      {/* Interpreted query banner */}
      {interpretedQuery && !isSearching && (
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

      {/* Grid */}
      <ListingGrid
        listings={results}
        isLoading={isSearching}
        emptyTitle="No properties matched your search"
        emptyDescription="Try rephrasing — for example: 'studio flat in Surulere with borehole under ₦600k'"
      />
    </div>
  );
};

export default SearchResults;
