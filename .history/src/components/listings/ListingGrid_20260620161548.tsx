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
  viewMode?: 'grid' | 'list';
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
  viewMode = 'grid',
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

  const gridClassNames = viewMode === 'grid'
    ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'
    : 'flex flex-col gap-3';

  return (
    <div
      className={cn(
        gridClassNames,
        className
      )}
    >
      {listings.map((listing) => (
        <div
          key={listing._id}
          className={viewMode === 'list' ? 'flex' : ''}
        >
          <ListingCard
            listing={listing}
            intelligence={intelligenceByArea?.[listing.areaName]}
          />
        </div>
      ))}
    </div>
  );
};

export default ListingGrid;