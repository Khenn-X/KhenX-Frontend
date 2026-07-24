import { useState, useMemo } from 'react';
import { Grid3x3, List, ChevronDown } from 'lucide-react';
import { useListings } from '../../hooks/useListings';
import { useFeaturedNeighbourhoods } from '../../hooks/useNeighbourhood';
import { useSearchStore } from '../../store/search.store';
import NaturalSearchBar from '../../components/search/NaturalSearchBar';
import SearchResults from '../../components/search/SearchResults';
import ListingFilters, { type ExtendedListingFilters } from '../../components/listings/ListingFilters';
import ListingCategoryNav from '../../components/listings/ListingCategoryNav';
import ListingsStatsBar from '../../components/listings/ListingsStatsBar';
import ListingGrid from '../../components/listings/ListingGrid';
import Pagination from '../../components/shared/Pagination';
import PageWrapper from '../../components/layout/PageWrapper';

const LIMIT = 24;

const ListingsPage = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ExtendedListingFilters>({});
  const [activeTab, setActiveTab] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { hasSearched } = useSearchStore();

  // NOTE: areaNames (multi-select), minPowerScore, minSecurityScore, maxFloodRisk,
  // and features aren't supported by the /listings endpoint yet — only the
  // original single-value fields (areaName, listingType, propertyType, bedrooms,
  // minPrice, maxPrice) are actually sent through and filtered server-side until
  // the backend is extended to accept the new ones.
  const { areaNames, minPowerScore, minSecurityScore, maxFloodRisk, features, ...serverFilters } = filters;

  const effectiveFilters = {
    ...serverFilters,
    propertyType: activeTab && activeTab !== 'land' && activeTab !== 'commercial' && activeTab !== 'short-let-tab'
      ? activeTab
      : serverFilters.propertyType,
  };

  const { data, isLoading } = useListings({ ...effectiveFilters, page, limit: LIMIT });
  const listings = Array.isArray(data?.data)
    ? data.data
    : Array.isArray((data?.data as any)?.listings)
    ? (data?.data as any).listings
    : [];
  const meta = !Array.isArray(data?.data) ? data?.meta ?? (data?.data as any)?.meta : data?.meta;

  // Real intel scores for the 4 areas we currently have full data for —
  // matched to listings by areaName. Listings outside this set won't show
  // an intel pill until coverage expands.
  const { data: featuredData } = useFeaturedNeighbourhoods();
  const intelligenceByArea = useMemo(() => {
    const areas = featuredData?.data?.areas ?? [];
    return Object.fromEntries(
      areas.map((a) => [
        a.areaName,
        { powerScore: a.powerScore, securityScore: a.securityScore, floodRisk: a.floodRisk },
      ])
    );
  }, [featuredData]);

  const handleFilterChange = (newFilters: ExtendedListingFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <PageWrapper className="py-8 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Browse properties</h1>
        <p className="mt-1 text-sm text-slate-500">
          Search naturally with AI or use filters to find your perfect Lagos home.
        </p>
      </div>

      {/* AI Search bar */}
      <NaturalSearchBar size="default" showSuggestions />

      {hasSearched ? (
        <SearchResults />
      ) : (
        <>
          {/* Category tabs + quick filter pills */}
          <ListingCategoryNav
            activeTab={activeTab}
            onTabChange={(t) => {
              setActiveTab(t);
              setPage(1);
            }}
            activeQuickFilter={activeQuickFilter}
            onQuickFilterChange={setActiveQuickFilter}
          />

          {/* Stats bar */}
          <ListingsStatsBar totalActive={meta?.total} />

          <div className="flex gap-6">
            {/* Sidebar filters — desktop */}
            <ListingFilters filters={filters} onChange={handleFilterChange} />

            {/* Listings grid */}
            <div className="flex-1 min-w-0 space-y-5">
              {/* Result count + sort/view controls */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                {meta && !isLoading ? (
                  <div>
                    <p className="text-sm font-medium text-[#0F172A]">
                      Showing {meta.total.toLocaleString()} Propert{meta.total === 1 ? 'y' : 'ies'}
                    </p>
                    <p className="text-xs text-slate-400">Intelligence scores updated periodically</p>
                  </div>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-[#00C9A7] focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20"
                      defaultValue="newest"
                    >
                      <option value="newest">Newest</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      {/* NOTE: sort isn't wired to the backend yet — /listings has
                          no sort param support currently. */}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>

                  <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex h-8 w-8 items-center justify-center ${viewMode === 'grid' ? 'bg-[#0A1628] text-white' : 'bg-white text-slate-400'}`}
                      aria-label="Grid view"
                    >
                      <Grid3x3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex h-8 w-8 items-center justify-center ${viewMode === 'list' ? 'bg-[#0A1628] text-white' : 'bg-white text-slate-400'}`}
                      aria-label="List view"
                    >
                      <List className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <ListingGrid
                listings={listings}
                isLoading={isLoading}
                emptyTitle="No properties found"
                emptyDescription="Try adjusting your filters or search in a different area."
                viewMode={viewMode}
                intelligenceByArea={intelligenceByArea}
              />

              {meta && meta.totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={meta.totalPages}
                  onPageChange={(p) => {
                    setPage(p);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="pt-4"
                />
              )}
            </div>
          </div>
        </>
      )}
    </PageWrapper>
  );
};

export default ListingsPage;    