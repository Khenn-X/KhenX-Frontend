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

  const handleReject = () => {
    if (!reason.trim() || reason.trim().length < 10) return;
    reject({ id: listing._id, reason });
    setRejectMode(false);
    setReason('');
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Photo */}
      <div className="relative">
        <ImageWithFallback
          src={listing.photos[0]}
          alt={listing.title}
          className="h-44 w-full"
        />
        <div className="absolute top-2 left-2">
          <TypeBadge listingType={listing.listingType} />
        </div>
        <span className="absolute top-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
          {listing.photos.length} photo{listing.photos.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-[#0F172A] line-clamp-1">{listing.title}</h3>
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

        {/* Reject reason input */}
        {rejectMode && (
          <div className="space-y-2">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for rejection (min. 10 chars)..."
              rows={2}
              className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleReject}
                disabled={reason.trim().length < 10 || isRejecting}
                className="flex-1 rounded-lg bg-red-600 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isRejecting ? 'Rejecting...' : 'Confirm reject'}
              </button>
              <button
                onClick={() => { setRejectMode(false); setReason(''); }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {!rejectMode && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => approve(listing._id)}
              disabled={isApproving}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#00C9A7] py-2 text-xs font-semibold text-[#0A1628] hover:bg-[#00b396] disabled:opacity-50 transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              {isApproving ? 'Approving...' : 'Approve'}
            </button>
            <button
              onClick={() => setRejectMode(true)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Reject
            </button>
            <button
              onClick={() => feature({ id: listing._id, isFeatured: !listing.isFeatured })}
              disabled={isFeaturing}
              className="flex items-center justify-center rounded-lg border border-[#F59E0B]/30 px-3 py-2 text-[#F59E0B] hover:bg-[#F59E0B]/10 disabled:opacity-50 transition-colors"
              title={listing.isFeatured ? 'Remove featured' : 'Mark as featured'}
            >
              <Star className={listing.isFeatured ? 'h-3.5 w-3.5 fill-[#F59E0B]' : 'h-3.5 w-3.5'} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingReviewCard;
