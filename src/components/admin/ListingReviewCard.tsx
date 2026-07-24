import { useState } from 'react';
import { MapPin, Bed, Bath, Check, X, Star } from 'lucide-react';
import type { IListing } from '../../types/listing.types';
import { useApproveListing, useRejectListing, useFeatureListing } from '../../hooks/useAdmin';
import { TypeBadge } from '../listings/ListingBadge';
import PriceDisplay from '../listings/PriceDisplay';
import ImageWithFallback from '../shared/ImageWithFallback';
import { formatNaira, capitalize, timeAgo } from '../../lib/utils';

interface ListingReviewCardProps {
  listing: IListing;
}

const ListingReviewCard = ({ listing }: ListingReviewCardProps) => {
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState('');

  const { mutate: approve, isPending: isApproving } = useApproveListing();
  const { mutate: reject, isPending: isRejecting } = useRejectListing();
  const { mutate: feature, isPending: isFeaturing } = useFeatureListing();

  const isPending = listing.status === 'pending';
  const isActive = listing.status === 'active';
  const isRejected = listing.status === 'rejected';
  const isPaused = listing.status === 'paused';

  const handleReject = () => {
    if (!reason.trim() || reason.trim().length < 10) return;
    reject({ id: listing._id, reason });
    setRejectMode(false);
    setReason('');
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="relative">
        <ImageWithFallback
          src={listing.photos[0]}
          alt={listing.title}
          className="h-44 w-full"
        />
        <div className="absolute left-2 top-2">
          <TypeBadge listingType={listing.listingType} />
        </div>
        <span className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
          {listing.photos.length} photo{listing.photos.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="line-clamp-1 font-semibold text-[#0F172A]">{listing.title}</h3>
          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3 w-3 text-[#00C9A7]" />
            {listing.estateName ? `${listing.estateName}, ` : ''}{listing.areaName}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Bed className="h-3 w-3" />
            {listing.bedrooms === 0 ? 'Self-con' : `${listing.bedrooms} bed`}
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1">
            <Bath className="h-3 w-3" />
            {listing.bathrooms} bath
          </span>
          <span className="text-slate-300">·</span>
          <span>{capitalize(listing.propertyType)}</span>
        </div>

        <div className="flex items-center justify-between">
          <PriceDisplay price={listing.price} pricePeriod={listing.pricePeriod} size="sm" />
          {listing.serviceCharge && (
            <span className="text-xs text-slate-400">+{formatNaira(listing.serviceCharge)} SC</span>
          )}
        </div>

        <p className="text-xs text-slate-400">Submitted {timeAgo(listing.createdAt)}</p>

        {isRejected && listing.rejectionReason && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-[11px] text-red-700">
            <p className="font-semibold">Previously rejected</p>
            <p className="mt-1 text-red-600">{listing.rejectionReason}</p>
          </div>
        )}

        {rejectMode && (
          <div className="space-y-2">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for rejection (min. 10 chars)..."
              rows={2}
              className="w-full resize-none rounded-lg border border-red-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
            />
            <div className="flex gap-2">
              <button
                onClick={handleReject}
                disabled={reason.trim().length < 10 || isRejecting}
                className="flex-1 rounded-lg bg-red-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isRejecting ? 'Rejecting...' : 'Confirm reject'}
              </button>
              <button
                onClick={() => { setRejectMode(false); setReason(''); }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {!rejectMode && (
          <div className="flex gap-2 pt-1">
            {isPending && (
              <>
                <button
                  onClick={() => approve(listing._id)}
                  disabled={isApproving}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#00C9A7] py-2 text-xs font-semibold text-[#0A1628] transition-colors hover:bg-[#00b396] disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  {isApproving ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => setRejectMode(true)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Reject
                </button>
              </>
            )}

            {isActive && (
              <>
                <button
                  onClick={() => setRejectMode(true)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Reject
                </button>
                <button
                  onClick={() => feature({ id: listing._id, isFeatured: !listing.isFeatured })}
                  disabled={isFeaturing}
                  className="flex items-center justify-center rounded-lg border border-[#F59E0B]/30 px-3 py-2 text-[#F59E0B] transition-colors hover:bg-[#F59E0B]/10 disabled:opacity-50"
                  title={listing.isFeatured ? 'Remove featured' : 'Mark as featured'}
                >
                  <Star className={listing.isFeatured ? 'h-3.5 w-3.5 fill-[#F59E0B]' : 'h-3.5 w-3.5'} />
                </button>
              </>
            )}

            {isRejected && (
              <>
                <button
                  onClick={() => approve(listing._id)}
                  disabled={isApproving}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#00C9A7] py-2 text-xs font-semibold text-[#0A1628] transition-colors hover:bg-[#00b396] disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  {isApproving ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => feature({ id: listing._id, isFeatured: !listing.isFeatured })}
                  disabled={isFeaturing}
                  className="flex items-center justify-center rounded-lg border border-[#F59E0B]/30 px-3 py-2 text-[#F59E0B] transition-colors hover:bg-[#F59E0B]/10 disabled:opacity-50"
                  title={listing.isFeatured ? 'Remove featured' : 'Mark as featured'}
                >
                  <Star className={listing.isFeatured ? 'h-3.5 w-3.5 fill-[#F59E0B]' : 'h-3.5 w-3.5'} />
                </button>
              </>
            )}

            {isPaused && (
              <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">
                View-only for now
                {/* TODO: wire reactivate using existing pause toggle from ListingManager.tsx */}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingReviewCard;
