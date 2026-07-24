import React from 'react';
import { Link } from 'react-router-dom';
import type { AgentPublicProfile } from '../../api/agents.api';

interface AgentCardProps {
  profile: AgentPublicProfile;
}

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

  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col items-center text-center shadow-sm">
      {/* Avatar */}
      <div className="relative mb-3">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: '#00C9A7' }}
          >
            {getInitials(user.fullName)}
          </div>
        )}
        {agent.kycStatus === 'approved' && (
          <span
            className="absolute bottom-0 right-0 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#00C9A7' }}
            aria-label="Verified"
          >
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
              <path
                d="M1 4L3.5 6.5L9 1"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>

      {/* Name + specialty */}
      <p className="font-bold text-[#0F172A] text-base leading-tight">{displayName}</p>
      {agent.bio && (
        <p className="text-xs text-slate-400 mt-0.5 mb-3 line-clamp-1">{agent.bio}</p>
      )}

      {/* Stats row */}
      <div className="w-full flex justify-around border-t border-slate-100 pt-3 mb-4">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Verified Sales
          </span>
          <span className="text-sm font-bold text-[#0F172A]">28+</span>
        </div>
        <div className="w-px bg-slate-100" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            User Rating
          </span>
          <span className="text-sm font-bold text-[#0F172A] flex items-center gap-0.5">
            <span style={{ color: '#00C9A7' }}>★</span> 4.8/5
          </span>
        </div>
      </div>

      {/* CTA */}
      <Link
        to={`/agents/${agent._id}`}
        className="w-full text-center text-sm font-semibold py-2 px-4 rounded-lg border transition-colors  hover:text-[#000000] hover:bg-[#00C9A7]"
        style={{ borderColor: '#00C9A7', color: '#00C9A7' }}
      >
        See Agent Properties
      </Link>
    </div>
  );
}