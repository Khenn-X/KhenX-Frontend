import { BadgeCheck, Phone, Building2, MessageSquare } from 'lucide-react';
import type { IAgent } from '../../types/agent.types';
import { IUser } from '../../types/auth.types';
import { IListing } from '../../types/listing.types';
import ImageWithFallback from '../shared/ImageWithFallback';
import ListingGrid from '../listings/ListingGrid';
import { cn } from '../../lib/utils';

interface AgentProfileProps {
  agent: IAgent & { userId: Pick<IUser, 'fullName' | 'avatarUrl' | 'createdAt'> };
  listings: IListing[];
}

const tierLabel: Record<string, string> = {
  free: 'Free',
  professional: 'Professional',
  agency: 'Agency',
};

const AgentProfile = ({ agent, listings }: AgentProfileProps) => {
  const user = agent.userId;
  const isVerified = agent.kycStatus === 'approved';
  const joinedYear = user.createdAt ? new Date(user.createdAt).getFullYear() : null;

  return (
    <div className="space-y-8">
      {/* Profile header card */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {/* Navy banner */}
        <div className="h-24 bg-[#0A1628]" />

        <div className="px-6 pb-6">
          {/* Avatar — overlaps banner */}
          <div className="relative -mt-10 mb-4 flex items-end justify-between">
            <div className="relative">
              <ImageWithFallback
                src={user?.avatarUrl}
                alt={user?.fullName}
                className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-md"
                  fallbackInitials={user?.fullName?.[0] as string}
              />
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow">
                  <BadgeCheck className="h-5 w-5 text-[#00C9A7]" />
                </div>
              )}
            </div>
          </div>

          {/* Name + badges */}
          <div className="flex flex-wrap items-start gap-2 mb-1">
            <h1 className="text-xl font-bold text-[#0F172A]">{user?.fullName}</h1>
            {isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#00C9A7]/10 px-2.5 py-1 text-xs font-semibold text-[#00C9A7]">
                <BadgeCheck className="h-3.5 w-3.5" />
                KhenX Verified
              </span>
            )}
            <span className={cn(
              'rounded-full px-2.5 py-1 text-xs font-semibold',
              agent.tier === 'professional' ? 'bg-[#00C9A7]/10 text-[#00C9A7]'
              : agent.tier === 'agency' ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
              : 'bg-slate-100 text-slate-500'
            )}>
              {tierLabel[agent.tier]}
            </span>
          </div>

          {/* Business name */}
          {agent.businessName && (
            <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-1">
              <Building2 className="h-3.5 w-3.5" />
              {agent.businessName}
            </div>
          )}

          {/* Phone */}
          {agent.phone && (
            <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-3">
              <Phone className="h-3.5 w-3.5" />
              <a href={`tel:${agent.phone}`} className="hover:text-[#00C9A7] transition-colors">
                {agent.phone}
              </a>
            </div>
          )}

          {/* Bio */}
          {agent.bio && (
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{agent.bio}</p>
          )}

          {/* Stats row */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
            <div className="text-center">
              <p className="text-lg font-bold text-[#0F172A]">{listings.length}</p>
              <p className="text-xs text-slate-400">Active listings</p>
            </div>
            {joinedYear && (
              <div className="text-center">
                <p className="text-lg font-bold text-[#0F172A]">{joinedYear}</p>
                <p className="text-xs text-slate-400">Member since</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Listings */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 text-[#00C9A7]" />
          <h2 className="text-lg font-bold text-[#0F172A]">
            Active Listings ({listings.length})
          </h2>
        </div>
        {listings.length > 0
          ? <ListingGrid listings={listings} />
          : <p className="text-sm text-slate-400">No active listings at the moment.</p>
        }
      </div>
    </div>
  );
};

export default AgentProfile;
