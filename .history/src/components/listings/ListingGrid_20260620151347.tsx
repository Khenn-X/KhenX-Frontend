import type { IListing } from '../../types/listing.types';
import ListingCard, { type ListingIntelligence } from './ListingCard';
import EmptyState from '../shared/EmptyState';
import LoadingSpinner from '../shared/LoadingSpinner';
import { Building2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ListingGridProps {
  listings?: IListing[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onEmptyAction?: () => void;
  emptyActionLabel?: string;
  className?: string;
  // areaName -> intel scores, built by the page from useFeaturedNeighbourhoods.
  // Areas not present in this map simply render without the intel pill row.
  intelligenceByArea?: Record<string, ListingIntelligence>;
}

const ListingGrid = ({
  listings,
  isLoading,
  emptyTitle = 'No listings found',
  emptyDescription = 'Try adjusting your search or filters.',
  onEmptyAction,
  emptyActionLabel,
  className,
  intelligenceByArea,
}: ListingGridProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Loading listings..." />
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title={emptyTitle}
        description={emptyDescription}
        action={
          onEmptyAction && emptyActionLabel
            ? { label: emptyActionLabel, onClick: onEmptyAction }
            : undefined
        }
        className="py-16"
      />
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {listings.map((listing) => (
        <ListingCard
          key={listing._id}
          listing={listing}
          intelligence={intelligenceByArea?.[listing.areaName]}
        />
      ))}
    </div>
  );
};

export default ListingGrid;