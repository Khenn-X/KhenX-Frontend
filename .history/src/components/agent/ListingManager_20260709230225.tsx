import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2, PauseCircle, PlayCircle, Plus, MapPin } from 'lucide-react';
import { useMyListings, useDeleteListing, useTogglePauseListing } from '../../hooks/useListings';
import type { IListing, ListingStatus } from '../../types/listing.types';
import { ROUTES } from '../../constants/routes';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import EmptyState from '../shared/EmptyState';
import ConfirmModal from '../shared/ConfirmModal';
import ImageWithFallback from '../shared/ImageWithFallback';
import { formatPriceWithPeriod, cn } from '../../lib/utils';

const STATUS_META: Record<ListingStatus, { badge: string; dot: string }> = {
  active:   { badge: 'bg-[#00C9A7]/10 text-[#00A88C]', dot: 'bg-[#00C9A7]' },
  pending:  { badge: 'bg-[#F59E0B]/10 text-[#B45309]', dot: 'bg-[#F59E0B]' },
  paused:   { badge: 'bg-slate-100 text-slate-500',    dot: 'bg-slate-400' },
  rejected: { badge: 'bg-[#DC2626]/10 text-[#DC2626]', dot: 'bg-[#DC2626]' },
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
            to={ROUTES.AGENT_LISTINGS_NEW}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00C9A7] px-4 py-2.5 text-sm font-semibold text-[#0A1628] shadow-sm shadow-[#00C9A7]/30 hover:bg-[#00b396] hover:-translate-y-0.5 transition-all"
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
        {listings.map((listing) => {
          const status = STATUS_META[listing.status];
          return (
            <div
              key={listing._id}
              className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/60 hover:border-slate-200"
            >
              {/* Thumbnail */}
              <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl ring-1 ring-slate-100">
                <ImageWithFallback
                  src={listing.photos?.[0]}
                  alt={listing.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-[#0F172A] text-sm truncate">{listing.title}</p>
                  <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize', status.badge)}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
                    {listing.status}
                  </span>
                  {listing.isFeatured && (
                    <span className="rounded-full bg-[#F59E0B]/10 text-[#B45309] px-2 py-0.5 text-[11px] font-semibold">
                      Featured
                    </span>
                  )}
                </div>

                <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {listing.areaName}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="font-medium text-slate-500">
                    {formatPriceWithPeriod(listing.price, listing.pricePeriod)}
                  </span>
                </div>

                {listing.status === 'rejected' && listing.rejectionReason && (
                  <p className="mt-1.5 text-xs text-[#DC2626] leading-snug line-clamp-1 bg-[#DC2626]/5 rounded-md px-2 py-1 inline-block">
                    Reason: {listing.rejectionReason}
                  </p>
                )}

                <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {listing.viewCount.toLocaleString()} views
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5 shrink-0 rounded-xl border border-slate-100 bg-slate-50/60 p-1">
                <Link
                  to={ROUTES.LISTING_DETAIL(listing._id)}
                  target="_blank"
                  className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-[#0F172A] hover:shadow-sm transition-all"
                  title="View listing"
                >
                  <Eye className="h-4 w-4" />
                </Link>
                <Link
                  to={ROUTES.AGENT_LISTING_EDIT(listing._id)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-[#0F172A] hover:shadow-sm transition-all"
                  title="Edit listing"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                {['active', 'paused'].includes(listing.status) && (
                  <button
                    onClick={() => togglePause(listing._id)}
                    disabled={isToggling}
                    title={listing.status === 'active' ? 'Pause listing' : 'Reactivate listing'}
                    className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-[#0F172A] hover:shadow-sm disabled:opacity-50 transition-all"
                  >
                    {listing.status === 'active'
                      ? <PauseCircle className="h-4 w-4" />
                      : <PlayCircle className="h-4 w-4 text-[#00C9A7]" />}
                  </button>
                )}
                <button
                  onClick={() => setDeleteTarget(listing)}
                  title="Delete listing"
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-[#DC2626] hover:shadow-sm transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

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