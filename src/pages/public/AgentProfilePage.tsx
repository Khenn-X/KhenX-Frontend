import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Briefcase,
  Clock3,
  Eye,
  Globe2,
  Home,
  Languages,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import ListingCard from '../../components/listings/ListingCard';
import { useAgentProfile } from '../../hooks/useAgent';
import { ROUTES } from '../../constants/routes';
import type { IListing } from '../../types/listing.types';

// ---------------------------------------------------------------------------
// NOTE: same situation as the dashboard page — the client-side `agent.types.ts`
// hasn't been re-shared with me since the backend added these fields, so
// these are read defensively (optional chaining, `as any` fallbacks) rather
// than assumed to exist on the typed `IAgent`. Once you confirm the real
// client type includes them, this can be tightened up.
// ---------------------------------------------------------------------------

const EXPERTISE_LABELS: Record<string, string> = {
  buying: 'Buying',
  selling: 'Selling',
  renting: 'Renting',
  investment: 'Investment',
  relocation: 'Relocation',
};

export default function AgentProfilePage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useAgentProfile(id);

  // Tracks whether the avatar URL we were given actually loaded. Avatars
  // saved from the "upload from device" flow can end up as a blob: URL
  // that's only valid in the browser tab that created it — anywhere else
  // (this page included) that 404s, so we fall back to initials instead of
  // showing the browser's broken-image icon.
  const [avatarFailed, setAvatarFailed] = useState(false);

  const agent = data?.data?.agent ?? null;
  const listings = (data?.data as { listings?: IListing[] } | undefined)?.listings ?? [];
  // Public-audience performance snapshot — deliberately excludes enquiry
  // counts, which are only ever meant for the agent's own dashboard view.
  const snapshot = (data?.data as { performanceSnapshot?: { totalListings?: number; activeListings?: number; totalViews?: number; audience?: string } } | undefined)?.performanceSnapshot;

  const profileUser = (agent as any)?.userId ?? null;
  const displayName = agent?.businessName || profileUser?.fullName || 'Verified agent';
  const avatarUrl = profileUser?.avatarUrl;
  const showAvatarImage = !!avatarUrl && !avatarFailed;
  const isVerified = agent?.kycStatus === 'approved';
  const areaNames = Array.from(new Set(listings.map((listing) => listing.areaName).filter(Boolean))) as string[];
  const profileUserEmail = typeof profileUser?.email === 'string' ? profileUser.email : null;
  const profileUserPhone = typeof agent?.phone === 'string' ? agent.phone : null;
  const joinedAt = profileUser?.createdAt ? new Date(profileUser.createdAt) : agent?.createdAt ? new Date(agent.createdAt) : null;
  const verifiedAt = agent?.verifiedAt ? new Date(agent.verifiedAt) : null;
  const planLabel = agent?.listingPlan ? agent.listingPlan.replace(/_/g, ' ') : 'free';

  // -- newly surfaced credential fields (all optional/defensive) --
  const a = agent as any;
  const location = [a?.city, a?.state, a?.country].filter(Boolean).join(', ');
  const agentType: 'independent' | 'agency' | undefined = a?.agentType;
  const licenseNumber: string | undefined = a?.licenseNumber;
  const yearsOfExperience: number | undefined = a?.yearsOfExperience;
  const availability: string | undefined = a?.availability;
  const website: string | undefined = a?.website;
  const businessAddress: string | undefined = a?.businessAddress;
  const specializations: string[] = a?.specializations ?? [];
  const languages: string[] = a?.languages ?? [];
  const serviceAreas: string[] = a?.serviceAreas ?? [];
  const expertiseAreas: string[] = a?.expertiseAreas ?? [];
  const isPhoneVerified: boolean = !!a?.isPhoneVerified;

  const hasCredentials = agentType || licenseNumber || yearsOfExperience != null || availability || website || businessAddress;
  const hasSkills = specializations.length > 0 || languages.length > 0;

  return (
    <PageWrapper className="py-16 sm:py-20">
      <Link
        to={ROUTES.AGENTS}
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#0F172A] transition hover:text-[#00A88C]"
      >
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
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          {/* LEFT: agent identity card */}
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              {/* Portrait */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-[#00C9A7] to-[#0F172A]">
                {showAvatarImage ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    onError={() => setAvatarFailed(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-7xl font-bold tracking-tight text-white/90">
                      {displayName.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Verified chip, floating top-left */}
                {isVerified && (
                  <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#0F172A] shadow-sm backdrop-blur">
                    <BadgeCheck className="h-3.5 w-3.5 text-[#00C9A7]" />
                    KYC Verified
                  </div>
                )}

                {/* Name plate, gradient fade over bottom of portrait */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-6 pb-5 pt-14">
                  <h1 className="text-2xl font-bold leading-tight text-white">{displayName}</h1>
                  <p className="text-sm text-white/80">
                    {agentType === 'agency' ? 'Agency' : agentType === 'independent' ? 'Independent agent' : 'Property professional'}
                  </p>
                </div>
              </div>

              {/* Bio + contact */}
              <div className="space-y-5 p-6">
                <p className="text-sm leading-relaxed text-slate-600">
                  {agent.bio || 'This agent has not added a bio yet.'}
                </p>

                {expertiseAreas.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {expertiseAreas.map((v) => (
                      <span key={v} className="inline-flex items-center gap-1.5 rounded-full bg-[#00A88C]/10 px-3 py-1.5 text-xs font-medium text-[#00A88C]">
                        <Sparkles className="h-3 w-3" />
                        {EXPERTISE_LABELS[v] ?? v}
                      </span>
                    ))}
                  </div>
                )}

                {(agent.phone || profileUser?.email) && (
                  <div className="space-y-2 border-t border-slate-100 pt-5">
                    {agent.phone && (
                      <a
                        href={`tel:${agent.phone}`}
                        className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-[#0F172A] transition hover:bg-[#F0FDFA]"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E6FBF6] text-[#00A88C]">
                          <Phone className="h-4 w-4" />
                        </span>
                        {agent.phone}
                        {isPhoneVerified && <ShieldCheck className="h-3.5 w-3.5 text-[#00C9A7]" />}
                      </a>
                    )}
                    {profileUser?.email && (
                      <a
                        href={`mailto:${profileUser.email}`}
                        className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-[#0F172A] transition hover:bg-[#F0FDFA]"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E6FBF6] text-[#00A88C]">
                          <Mail className="h-4 w-4" />
                        </span>
                        {profileUser.email}
                      </a>
                    )}
                    {website && (
                      <a
                        href={website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-[#0F172A] transition hover:bg-[#F0FDFA]"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E6FBF6] text-[#00A88C]">
                          <Globe2 className="h-4 w-4" />
                        </span>
                        {website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                    {(location || businessAddress) && (
                      <div className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-[#0F172A]">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E6FBF6] text-[#00A88C]">
                          <MapPin className="h-4 w-4" />
                        </span>
                        {businessAddress || location}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick stat strip */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
              <div>
                <p className="text-2xl font-bold text-[#0F172A]">{snapshot?.totalListings ?? listings.length}</p>
                <p className="text-xs font-medium text-slate-500">Active listings</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <p className="text-2xl font-bold text-[#0F172A]">{isVerified ? 'Yes' : 'Pending'}</p>
                <p className="text-xs font-medium text-slate-500">Verification status</p>
              </div>
              {typeof snapshot?.totalViews === 'number' && (
                <>
                  <div className="h-8 w-px bg-slate-200" />
                  <div>
                    <p className="text-2xl font-bold text-[#0F172A]">{snapshot.totalViews}</p>
                    <p className="text-xs font-medium text-slate-500">Total views</p>
                  </div>
                </>
              )}
            </div>

            {/* Credentials */}
            {hasCredentials && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                  <Briefcase className="h-4 w-4 text-[#00C9A7]" />
                  Credentials
                </div>
                <dl className="mt-4 space-y-3 text-sm text-slate-600">
                  {agentType && (
                    <div className="flex items-center justify-between gap-3">
                      <dt>Agent type</dt>
                      <dd className="font-semibold text-[#0F172A]">{agentType === 'agency' ? 'Agency' : 'Independent'}</dd>
                    </div>
                  )}
                  {licenseNumber && (
                    <div className="flex items-center justify-between gap-3">
                      <dt>License number</dt>
                      <dd className="font-semibold text-[#0F172A]">{licenseNumber}</dd>
                    </div>
                  )}
                  {yearsOfExperience != null && (
                    <div className="flex items-center justify-between gap-3">
                      <dt>Experience</dt>
                      <dd className="font-semibold text-[#0F172A]">{yearsOfExperience} years</dd>
                    </div>
                  )}
                  {availability && (
                    <div className="flex items-center justify-between gap-3">
                      <dt>Availability</dt>
                      <dd className="font-semibold text-[#0F172A]">{availability}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Specializations & languages */}
            {hasSkills && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                {specializations.length > 0 && (
                  <div className={languages.length > 0 ? 'mb-5' : ''}>
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                      <Award className="h-4 w-4 text-[#00C9A7]" />
                      Specializations
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {specializations.map((s) => (
                        <span key={s} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {languages.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                      <Languages className="h-4 w-4 text-[#00C9A7]" />
                      Languages
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {languages.map((l) => (
                        <span key={l} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                <ShieldCheck className="h-4 w-4 text-[#00C9A7]" />
                Verification details
              </div>
              <dl className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-3">
                  <dt>Status</dt>
                  <dd className="font-semibold text-[#0F172A]">{isVerified ? 'KYC approved' : 'Pending review'}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt>Verified since</dt>
                  <dd className="font-semibold text-[#0F172A]">{verifiedAt ? verifiedAt.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not yet verified'}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt>Phone verified</dt>
                  <dd className="font-semibold text-[#0F172A]">{isPhoneVerified ? 'Yes' : 'Not yet'}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt>Plan</dt>
                  <dd className="font-semibold text-[#0F172A]">{planLabel}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* RIGHT: listings */}
          <div>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#0F172A]">Active listings</h2>
                <p className="text-sm text-slate-500">Properties currently managed by {displayName}</p>
              </div>
              <span className="rounded-full bg-[#E6FBF6] px-3 py-1 text-sm font-semibold text-[#00A88C]">
                {listings.length} live
              </span>
            </div>

            <div className="mb-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                  <MapPin className="h-4 w-4 text-[#00C9A7]" />
                  Areas covered
                </div>
                {areaNames.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {areaNames.map((area) => (
                      <span key={area} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600">
                        {area}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">No area coverage details are available yet.</p>
                )}
                {/* Distinct from the derived list above: this is the agent's
                    own declared coverage, not just where they currently have
                    listings. Only shown when they've actually added it. */}
                {serviceAreas.length > 0 && (
                  <>
                    <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Also serves
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {serviceAreas
                        .filter((s) => !areaNames.includes(s))
                        .map((area) => (
                          <span key={area} className="rounded-full border border-dashed border-slate-200 px-3 py-1 text-sm font-medium text-slate-500">
                            {area}
                          </span>
                        ))}
                    </div>
                  </>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                  <Phone className="h-4 w-4 text-[#00C9A7]" />
                  Contact agent
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  Reach out directly for viewings, pricing, or to discuss available properties.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {profileUserPhone ? (
                    <a href={`tel:${profileUserPhone}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-[#0F172A] transition hover:border-[#00C9A7] hover:text-[#00C9A7]">
                      <Phone className="h-4 w-4" />
                      Call now
                    </a>
                  ) : null}
                  {profileUserEmail ? (
                    <a href={`mailto:${profileUserEmail}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-[#0F172A] transition hover:border-[#00C9A7] hover:text-[#00C9A7]">
                      <Mail className="h-4 w-4" />
                      Email agent
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mb-6 rounded-3xl border border-slate-200 bg-[#F8FAFC] p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                <Clock3 className="h-4 w-4 text-[#00C9A7]" />
                Activity snapshot
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Member since</p>
                  <p className="mt-1 text-sm font-semibold text-[#0F172A]">{joinedAt ? joinedAt.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently joined'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Active portfolio</p>
                  <p className="mt-1 text-sm font-semibold text-[#0F172A]">
                    {snapshot?.activeListings ?? listings.length} live listings
                  </p>
                </div>
              </div>
            </div>

            {listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 p-12 text-center">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E6FBF6] text-[#00A88C]">
                  <Home className="h-5 w-5" />
                </span>
                <p className="text-sm font-medium text-slate-500">
                  This agent does not have any active listings right now.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {listings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  );
}