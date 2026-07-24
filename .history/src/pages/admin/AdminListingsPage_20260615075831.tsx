import { Building2 } from 'lucide-react';
import { useAdminPendingListings } from '../../hooks/useAdmin';
import ListingReviewCard from '../../components/admin/ListingReviewCard';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import EmptyState from '../../components/shared/EmptyState';

const AdminListingsPage = () => {
  const { data, isLoading, isError, refetch } = useAdminPendingListings();
  const listings = data?.data.listings ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Listing Review</h1>
          <p className="mt-1 text-sm text-slate-500">
            Approve or reject listings submitted by agents.
          </p>
        </div>
        {listings.length > 0 && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
            {listings.length} pending
          </span>
        )}
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

      {listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((listing) => (
            <ListingReviewCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminListingsPage;
