import { Star } from 'lucide-react';
import type { ListingStatus, ListingType } from '../../types/listing.types';
import { cn } from '../../lib/utils';

// ─── Status Badge ─────────────────────────────────────────────────────────────
interface StatusBadgeProps {
  status: ListingStatus;
  className?: string;
}

const statusConfig: Record<ListingStatus, { label: string; className: string }> = {
  pending:  { label: 'Pending review', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  active:   { label: 'Active',         className: 'bg-[#00C9A7]/10 text-[#00C9A7] border-[#00C9A7]/20' },
  paused:   { label: 'Paused',         className: 'bg-slate-100 text-slate-500 border-slate-200' },
  rejected: { label: 'Rejected',       className: 'bg-red-100 text-red-600 border-red-200' },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};

// ─── Listing Type Badge ───────────────────────────────────────────────────────
interface TypeBadgeProps {
  listingType: ListingType;
  className?: string;
}

const typeConfig: Record<ListingType, { label: string; className: string }> = {
  rent:      { label: 'For Rent',      className: 'bg-blue-100 text-blue-700' },
  sale:      { label: 'For Sale',      className: 'bg-purple-100 text-purple-700' },
  'short-let': { label: 'Short Let',  className: 'bg-orange-100 text-orange-700' },
};

export const TypeBadge = ({ listingType, className }: TypeBadgeProps) => {
  const config = typeConfig[listingType];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};

// ─── Featured Badge ───────────────────────────────────────────────────────────
interface FeaturedBadgeProps {
  className?: string;
}

export const FeaturedBadge = ({ className }: FeaturedBadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-md bg-[#F59E0B] px-2 py-0.5 text-xs font-semibold text-white',
      className
    )}
  >
    <Star className="h-3 w-3 fill-white" />
    Featured
  </span>
);
