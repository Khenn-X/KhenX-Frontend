import { Heart } from 'lucide-react';
import { useSavedListings } from '../../hooks/useSaved';
import ListingGrid from '../../components/listings/ListingGrid';
import PageWrapper from '../../components/layout/PageWrapper';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import ErrorMessage from '../../components/shared/ErrorMessage';

const SavedListingsPage = () => {
  const { data, isLoading, isError, refetch } = useSavedListings();
  const navigate = useNavigate();

  const listings = Array.isArray(data?.data?.listings) ? data.data.listings : [];

  return (
    <PageWrapper className="py-10">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A1628]">
          <Heart className="h-5 w-5 text-[#00C9A7]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Saved listings</h1>
          <p className="text-sm text-slate-500">
            {listings.length > 0
              ? `${listings.length} propert${listings.length === 1 ? 'y' : 'ies'} saved`
              : 'Properties you save will appear here'}
          </p>
        </div>
      </div>

      {isError && <ErrorMessage onRetry={refetch} className="mb-6" />}

      <ListingGrid
        listings={listings}
        isLoading={isLoading}
        emptyTitle="No saved listings yet"
        emptyDescription="Browse properties and tap the heart icon to save ones you like."
        onEmptyAction={() => navigate(ROUTES.LISTINGS)}
        emptyActionLabel="Browse listings"
      />
    </PageWrapper>
  );
};

export default SavedListingsPage;
