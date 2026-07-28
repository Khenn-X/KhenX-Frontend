import { Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { useLandlords } from '../../hooks/useLandlords';
import { ROUTES } from '../../constants/routes';

export default function LandlordsPage() {
  const { data, isLoading, isError, refetch } = useLandlords({ limit: 24 });
  const profiles = data?.data?.landlords ?? [];

  return (
    <PageWrapper className="py-16 sm:py-20">
      <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#00C9A7]">Verified landlords</p>
          <h1 className="text-3xl font-bold text-[#0F172A]">Browse approved landlords</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            These landlords have completed KYC and are ready to show properties to serious buyers and renters.
          </p>
        </div>
        <Link to={ROUTES.AGENTS} className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
          Explore agents
          <BadgeCheck className="h-4 w-4 text-[#00C9A7]" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <LoadingSpinner size="lg" label="Loading verified landlords..." />
        </div>
      ) : isError ? (
        <ErrorMessage message="We could not load these profiles right now." onRetry={refetch} />
      ) : profiles.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          There are no verified landlords available yet.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => {
            const landlord = profile.landlord;
            const user = profile.user;
            const displayName = user?.fullName || 'Verified landlord';
            const avatarLabel = user?.fullName || 'Verified landlord';
            const initials = avatarLabel.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();

            return (
              <div key={landlord?._id ?? user?._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center gap-4">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={displayName} className="h-14 w-14 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#00C9A7] to-[#00A88C] font-bold text-white">
                      {initials}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-[#0F172A]">{displayName}</h2>
                      {landlord?.kycStatus === 'approved' ? <BadgeCheck className="h-4 w-4 text-[#00C9A7]" /> : null}
                    </div>
                    <p className="text-sm text-slate-500">Verified landlord</p>
                  </div>
                </div>

                <div className="mt-5">
                  <Link to={ROUTES.LANDLORD_DETAIL(landlord?._id || '')} className="inline-flex items-center gap-2 text-sm font-semibold text-[#00A88C]">
                    View profile
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
