import React from 'react';
import { Link } from 'react-router-dom';
import type { AgentPublicProfile } from '../../api/agents.api';
import type { AgentTier } from '../../types/agent.types';

interface AgentCardProps {
  profile: AgentPublicProfile;
}

const TIER_LABELS: Record<AgentTier, string> = {
  free: 'Agent',
  professional: 'Pro Agent',
  agency: 'Agency',
};

const TIER_STYLES: Record<AgentTier, string> = {
  free: 'bg-slate-100 text-slate-600',
  professional: 'bg-[#E6FBF7] text-[#0A7A61]',
  agency: 'bg-[#EEF2FF] text-[#4338CA]',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default function AgentCard({ profile }: AgentCardProps) {
  const { agent, user } = profile;
  const displayName = agent.businessName || user.fullName;
  const tier = agent.tier;

  return (
    <Link
      to={`/agents/${agent._id}`}
      className="group block bg-white border border-slate-100 rounded-2xl p-5 hover:border-[#00C9A7] hover:shadow-[0_0_0_1px_#00C9A7] transition-all duration-200"
    >
      {/* Avatar + verified badge */}
      <div className="relative w-fit mb-4">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            className="w-14 h-14 rounded-full object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-[#E6FBF7] flex items-center justify-center text-[#0A7A61] font-semibold text-base">
            {getInitials(user.fullName)}
          </div>
        )}
        {agent.kycStatus === 'approved' && (
          <span
            className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00C9A7] rounded-full flex items-center justify-center"
            title="KYC Verified"
            aria-label="Verified agent"
          >
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>

      {/* Name + tier pill */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-[#0F172A] font-semibold text-sm leading-snug line-clamp-1">
          {displayName}
        </p>
        <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${TIER_STYLES[tier]}`}>
          {TIER_LABELS[tier]}
        </span>
      </div>

      {/* Full name if business name is shown */}
      {agent.businessName && (
        <p className="text-xs text-slate-400 mb-2">{user.fullName}</p>
      )}

      {/* Bio */}
      {agent.bio && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
          {agent.bio}
        </p>
      )}

      {/* CTA */}
      <div className="flex items-center gap-1 text-[#00C9A7] text-xs font-semibold mt-auto pt-1">
        View profile
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">
          <path d="M2.5 6H9.5M6.5 3.5L9.5 6L6.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  );
}