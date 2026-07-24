import { Link } from 'react-router-dom';
import { Star, BadgeCheck } from 'lucide-react';
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
  const isVerified = agent.kycStatus === 'approved';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/60">
      {/* Avatar */}
      <div className="relative mb-3">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            className="w-16 h-16 rounded-full object-cover ring-1 ring-slate-100"
          />
        ) : (
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-[#00C9A7] to-[#00A88C] text-white font-bold text-lg shadow-sm">
            {getInitials(user.fullName)}
          </div>
        )}
        {isVerified && (
          <span
            className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#00C9A7] ring-2 ring-white"
            aria-label="Verified"
          >
            <BadgeCheck className="h-3 w-3 text-white" strokeWidth={2.5} />
          </span>
        )}
      </div>

      {/* Name + specialty */}
      <p className="font-bold text-[#0F172A] text-base leading-tight">{displayName}</p>
      {agent.bio && (
        <p className="text-xs text-slate-400 mt-0.5 mb-3 line-clamp-1">{agent.bio}</p>
      )}
      {!agent.bio && <div className="mb-3" />}

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
          <span className="text-sm font-bold text-[#0F172A] flex items-center gap-1">
            <Star className="h-3 w-3 fill-[#00C9A7] text-[#00C9A7]" />
            4.8/5
          </span>
        </div>
      </div>

      {/* CTA */}
      <Link
        to={`/agents/${agent._id}`}
        className="w-full text-center text-sm font-semibold py-2.5 px-4 rounded-xl border border-[#00C9A7] text-[#00A88C] transition-all hover:bg-[#00C9A7] hover:text-white hover:shadow-sm hover:shadow-[#00C9A7]/30"
      >
        See Agent Properties
      </Link>
    </div>
  );
}