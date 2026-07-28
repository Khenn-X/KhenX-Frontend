import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Phone, Mail, Home } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { useAgentProfile } from '../../hooks/useAgent';
import { ROUTES } from '../../constants/routes';
import type { IListing } from '../../types/listing.types';

export default function AgentProfilePage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useAgentProfile(id);

  const agent = data?.data?.agent ?? null;
  const listings = (data?.data as { listings?: IListing[] } | undefined)?.listings ?? [];
  const profileUser = (agent as any)?.userId ?? null;
  const displayName = agent?.businessName || profileUser?.fullName || 'Verified agent';
  const avatarUrl = profileUser?.avatarUrl;
  const isVerified = agent?.kycStatus === 'approved';

  return (
    <PageWrapper className="py-16 sm:py-20">
      <Link to={ROUTES.AGENTS} className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
        <ArrowLeft className="h-4 w-4" />
        Back to directory
      </Link>

      {isLoading ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <LoadingSpinner size="lg" label="Loading agent profile..." />
        </div>
      ) : isError || !agent ? (
        <ErrorMessage message="This agent profile could not be found." onRetry={refetch} />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#00C9A7] to-[#00A88C] text-lg font-bold text-white">
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-[#0F172A]">{displayName}</h1>
                  {isVerified && <BadgeCheck className="h-5 w-5 text-[#00C9A7]" />}
                </div>
                <p className="text-sm text-slate-500">KYC-approved property professional</p>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-sm text-slate-600">
              {agent.bio ? <p>{agent.bio}</p> : <p>This agent has not added a bio yet.</p>}
              {agent.phone ? (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#00C9A7]" />
                  {agent.phone}
                </div>
              ) : null}
              {profileUser?.email ? (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#00C9A7]" />
                  {profileUser.email}
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#0F172A]">Active listings</h2>
              <span className="text-sm font-semibold text-[#00C9A7]">{listings.length} live</span>
            </div>

            {listings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                This agent does not have any active listings right now.
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map((listing) => (
                  <Link key={listing._id} to={ROUTES.LISTING_DETAIL(listing._id)} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:border-[#00C9A7] hover:shadow-sm">
                    <div>
                      <p className="font-semibold text-[#0F172A]">{listing.title}</p>
                      <p className="text-sm text-slate-500">{listing.areaName}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#00C9A7]">
                      <Home className="h-4 w-4" />
                      ₦{listing.price.toLocaleString('en-NG')}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
