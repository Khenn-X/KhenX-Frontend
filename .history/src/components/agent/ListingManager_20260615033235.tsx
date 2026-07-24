import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2, PauseCircle, PlayCircle, Plus } from 'lucide-react';
import { useMyListings, useDeleteListing, useTogglePauseListing } from '../../hooks/useListings';
import { IListing, ListingStatus } from '../../types/listing.types';
import { ROUTES } from '../../constants/routes';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import EmptyState from '../shared/EmptyState';
import ConfirmModal from '../shared/ConfirmModal';
import ImageWithFallback from '../shared/ImageWithFallback';
import { formatPrice, cn } from '../../lib/utils';

const statusBadge: Record<ListingStatus, string> = {
  active:   'bg-[#00C9A7]/10 text-[#00C9A7]',
  pending:  'bg-[#F59E0B]/10 text-[#F59E0B]',
  paused:   'bg-slate-100 text-slate-500',
  rejected: 'bg-[#DC2626]/10 text-[#DC2626]',
};

const ListingManager = () => {
  const { data, isLoading, isError, error, refetch } = useMyListings();
  const { mutate: deleteListing, isPending: isDeleting } = useDeleteListing();
  const { mutate: togglePause, isPending: isToggling } = useTogglePauseListing();

  const [deleteTarget, setDeleteTarget] = useState<IListing | null>(null);

  const listings = data?.data?.listings ?? [];

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={error?.message} onRetry={refetch} />;

  if (listings.length === 0) {
    return (
      <EmptyState
        icon={Plus}
        title="No listings yet"
        description="Create your first listing to start attracting seekers."
        action={
          <Link
            to={ROUTES.AGENT.CREATE_LISTING}
            className="inline-flex items-center gap-2 rounded-lg bg-[#00C9A7] px-4 py-2 text-sm font-semibold text-[#0A1628] hover:bg-[#00b396] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create listing
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="space-y-3">
        {listings.map((listing) => (
          <div
            key={listing._id}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4"
          >
            {/* Thumbnail */}
            <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg">
              <ImageWithFallback
                src={listing.photos?.[0]}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-[#0F172A] text-sm truncate">{listing.title}</p>
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold capitalize', statusBadge[listing.status])}>
                  {listing.status}
                </span>
                {listing.isFeatured && (
                  <span className="rounded-full bg-[#F59E0B]/10 text-[#F59E0B] px-2 py-0.5 text-xs font-semibold">
                    Featured
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                {listing.areaName} · {formatPrice(listing.price)}/{listing.pricePeriod}
              </p>
              {listing.status === 'rejected' && listing.rejectionReason && (
                <p className="mt-1 text-xs text-[#DC2626] leading-snug line-clamp-1">
                  Reason: {listing.rejectionReason}
                </p>
              )}
              <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {listing.viewCount} views
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <Link
                to={`/listings/${listing._id}`}
                target="_blank"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                title="View listing"
              >
                <Eye className="h-4 w-4" />
              </Link>
              <Link
                to={ROUTES.AGENT.EDIT_LISTING(listing._id)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                title="Edit listing"
              >
                <Pencil className="h-4 w-4" />
              </Link>
              {['active', 'paused'].includes(listing.status) && (
                <button
                  onClick={() => togglePause(listing._id)}
                  disabled={isToggling}
                  title={listing.status === 'active' ? 'Pause listing' : 'Reactivate listing'}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 disabled:opacity-50 transition-colors"
                >
                  {listing.status === 'active'
                    ? <PauseCircle className="h-4 w-4" />
                    : <PlayCircle className="h-4 w-4 text-[#00C9A7]" />}
                </button>
              )}
              <button
                onClick={() => setDeleteTarget(listing)}
                title="Delete listing"
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-[#DC2626] transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirm modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete listing?"
        description={`"${deleteTarget?.title}" will be permanently deleted along with all its photos. This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={() => {
          if (deleteTarget) {
            deleteListing(deleteTarget._id, { onSuccess: () => setDeleteTarget(null) });
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default ListingManager;
