import { useMemo, useState } from 'react';
import { Building2, RefreshCw, Search } from 'lucide-react';
import { useAdminPendingListings } from '../../hooks/useAdmin';
import ListingReviewCard from '../../components/admin/ListingReviewCard';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import EmptyState from '../../components/shared/EmptyState';

type SortOption = 'newest' | 'oldest' | 'price-high' | 'price-low';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price-high', label: 'Price: high to low' },
  { value: 'price-low', label: 'Price: low to high' },
];

const AdminListingsPage = () => {
  const { data, isLoading, isError, isFetching, refetch } = useAdminPendingListings();
  const listings: any[] = data?.data.listings ?? [];

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const visibleListings = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = term
      ? listings.filter((listing) => {
          const haystack = [
            listing.title,
            listing.address,
            listing.location,
            listing.agentName,
            listing.agent?.name,
            listing.areaName,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return haystack.includes(term);
        })
      : listings;

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime();
        case 'price-high':
          return (b.price ?? 0) - (a.price ?? 0);
        case 'price-low':
          return (a.price ?? 0) - (b.price ?? 0);
        case 'newest':
        default:
          return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      }
    });

    return sorted;
  }, [listings, search, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-[#0A1628] to-[#0F172A] p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00C9A7]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#00C9A7]">
            Admin
          </span>
          <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Listing Review</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Approve or reject listings submitted by agents before they go live.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {listings.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-3 py-1.5 text-sm font-semibold text-amber-300 ring-1 ring-inset ring-amber-400/20">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              {listings.length} pending
            </span>
          )}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {isLoading && <LoadingSpinner label="Loading pending listings..." />}
      {isError && <ErrorMessage onRetry={refetch} />}

      {!isLoading && !isError && listings.length === 0 && (
        <EmptyState
          icon={Building2}
          title="No pending listings"
          description="All listing submissions have been reviewed. Check back later."
        />
      )}

      {!isLoading && !isError && listings.length > 0 && (
        <>
          {/* Toolbar */}
          <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, address, or agent"
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none transition-colors focus:border-[#00C9A7] focus:bg-white focus:ring-2 focus:ring-[#00C9A7]/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-xs font-medium text-slate-400">
                Sort by
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-full border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-[#00C9A7] focus:bg-white focus:ring-2 focus:ring-[#00C9A7]/20"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {visibleListings.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No matching listings"
              description="Try a different search term or clear the filter."
            />
          ) : (
            <>
              <p className="text-xs text-slate-400">
                Showing <span className="font-semibold text-slate-600">{visibleListings.length}</span> of{' '}
                <span className="font-semibold text-slate-600">{listings.length}</span> pending listings
              </p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visibleListings.map((listing) => (
                  <ListingReviewCard key={listing._id} listing={listing} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AdminListingsPage;