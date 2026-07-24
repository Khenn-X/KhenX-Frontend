import { Link } from 'react-router-dom';
import { BadgeCheck, Home } from 'lucide-react';
import { IAgent } from '../../types/agent.types';
import { IUser } from '../../types/auth.types';
import ImageWithFallback from '../shared/ImageWithFallback';
import { ROUTES } from '../../constants/routes';
import { cn } from '../../lib/utils';

interface AgentCardProps {
  agent: IAgent & { userId: Pick<IUser, 'fullName' | 'avatarUrl'> };
  listingCount?: number;
  className?: string;
}

const tierBadge: Record<string, string> = {
  free:         'bg-slate-100 text-slate-500',
  professional: 'bg-[#00C9A7]/10 text-[#00C9A7]',
  agency:       'bg-[#F59E0B]/10 text-[#F59E0B]',
};

const AgentCard = ({ agent, listingCount, className }: AgentCardProps) => {
  const user = agent.userId;
  const isVerified = agent.kycStatus === 'approved';

  return (
    <Link
      to={ROUTES.AGENT_PROFILE(agent._id)}
      className={cn(
        'block rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow',
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative h-14 w-14 shrink-0">
          <ImageWithFallback
            src={user?.avatarUrl}
            alt={user?.fullName}
            className="h-full w-full rounded-full object-cover"
            fallbackInitials={user?.fullName?.[0]}
          />
          {isVerified && (
            <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white">
              <BadgeCheck className="h-4 w-4 text-[#00C9A7]" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-[#0F172A] truncate">{user?.fullName}</p>
            {isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#00C9A7]/10 px-2 py-0.5 text-xs font-semibold text-[#00C9A7]">
                <BadgeCheck className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>

          {agent.businessName && (
            <p className="mt-0.5 text-sm text-slate-500 truncate">{agent.businessName}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold capitalize', tierBadge[agent.tier])}>
              {agent.tier}
            </span>
            {typeof listingCount === 'number' && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Home className="h-3 w-3" />
                {listingCount} listing{listingCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {agent.bio && (
            <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">{agent.bio}</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default AgentCard;
