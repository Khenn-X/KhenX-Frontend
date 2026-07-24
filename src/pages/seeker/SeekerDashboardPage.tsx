import { Link, useNavigate } from 'react-router-dom';
import { Heart, Search, MapPin, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useSavedListings } from '../../hooks/useSaved';
import ListingCard from '../../components/listings/ListingCard';
import NaturalSearchBar from '../../components/search/NaturalSearchBar';
import PageWrapper from '../../components/layout/PageWrapper';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { ROUTES } from '../../constants/routes';

const SeekerDashboardPage = () => {
  const { user } = useAuthStore();
  const { data, isLoading } = useSavedListings();
  const navigate = useNavigate();

  const savedListings = Array.isArray(data?.data?.listings) ? data.data.listings : [];
  const recentSaved = savedListings.slice(0, 3);

  const firstName = user?.fullName.split(' ')[0] ?? 'there';

  return (
    <PageWrapper className="py-10 space-y-10">

      {/* Welcome */}
      <div className="rounded-2xl bg-[#0A1628] px-8 py-8 text-white">
        <p className="text-sm text-slate-400 mb-1">Welcome back</p>
        <h1 className="text-2xl font-bold">Hi, {firstName} 👋</h1>
        <p className="mt-2 text-slate-300 text-sm">
          Before you pay, know the area. Use AI search to find your next home.
        </p>
        <div className="mt-6">
          <NaturalSearchBar
            size="large"
            showSuggestions={false}
            onSearchComplete={() => navigate(ROUTES.LISTINGS)}
          />
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Search,
            label: 'Browse all listings',
            description: 'Filter by area, type, price and more',
            to: ROUTES.LISTINGS,
            color: 'bg-[#00C9A7]/10 text-[#00C9A7]',
          },
          {
            icon: Heart,
            label: 'Saved listings',
            description: `${savedListings.length} propert${savedListings.length === 1 ? 'y' : 'ies'} saved`,
            to: ROUTES.SAVED,
            color: 'bg-rose-100 text-rose-500',
          },
          {
            icon: MapPin,
            label: 'Neighbourhood intel',
            description: 'Check power, flood risk, and security',
            to: ROUTES.NEIGHBOURHOOD,
            color: 'bg-blue-100 text-blue-500',
          },
        ].map(({ icon: Icon, label, description, to, color }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#0F172A] text-sm">{label}</p>
              <p className="text-xs text-slate-400 truncate">{description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#00C9A7] transition-colors shrink-0" />
          </Link>
        ))}
      </div>

      {/* Recently saved */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#0F172A]">Recently saved</h2>
          {savedListings.length > 3 && (
            <Link
              to={ROUTES.SAVED}
              className="flex items-center gap-1 text-sm text-[#00C9A7] hover:underline"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <LoadingSpinner label="Loading saved listings..." />
        ) : recentSaved.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
            <Heart className="mx-auto h-8 w-8 text-slate-300 mb-3" />
            <p className="font-medium text-slate-600">No saved listings yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Browse properties and tap the heart icon to save them here.
            </p>
            <Link
              to={ROUTES.LISTINGS}
              className="mt-4 inline-block rounded-lg bg-[#00C9A7] px-5 py-2 text-sm font-semibold text-[#0A1628] hover:bg-[#00b396] transition-colors"
            >
              Browse listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentSaved.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default SeekerDashboardPage;
