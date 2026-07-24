import { useState } from 'react';
import { useListings } from '../../hooks/useListings';
import { useSearchStore } from '../../store/search.store';
import NaturalSearchBar from '../../components/search/NaturalSearchBar';
import SearchResults from '../../components/search/SearchResults';
import FilterPanel from '../../components/search/FilterPanel';
import ListingFilters from '../../components/listings/ListingFilters';
import ListingGrid from '../../components/listings/ListingGrid';
import Pagination from '../../components/shared/Pagination';
import PageWrapper from '../../components/layout/PageWrapper';
import type { ParsedListingFilters } from '../../types/search.types';

const LIMIT = 12;

const ListingsPage = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ParsedListingFilters>({});
  const { hasSearched } = useSearchStore();

  const { data, isLoading } = useListings({ ...filters, page, limit: LIMIT });
  const listings = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.data?.listings)
    ? data.data.listings
    : [];
  const meta = data?.meta ?? data?.data?.meta;

  const handleFilterChange = (newFilters: ParsedListingFilters) => {
    setFilters(newFilters);
    setPage(1); // reset to page 1 on filter change
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

      {/* Manual filter panel */}
      <FilterPanel />

      {/* AI search results take over when a search has been run */}
      {hasSearched ? (
        <SearchResults />
      ) : (
        <div className="flex gap-6">
          {/* Sidebar filters — desktop */}
          <ListingFilters filters={filters} onChange={handleFilterChange} />

          {/* Listings grid */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Result count */}
            {meta && !isLoading && (
              <p className="text-sm text-slate-500">
                {meta.total} propert{meta.total === 1 ? 'y' : 'ies'} found
                {filters.areaName ? ` in ${filters.areaName}` : ' in Lagos'}
              </p>
            )}

            <ListingGrid
              listings={listings}
              isLoading={isLoading}
              emptyTitle="No properties found"
              emptyDescription="Try adjusting your filters or search in a different area."
            />

            {/* Pagination */}
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
      )}
    </PageWrapper>
  );
};

export default ListingsPage;
