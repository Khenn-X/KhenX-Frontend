import { MapPin, Bed, Bath, Eye, Calendar, Building2 } from 'lucide-react';
import type { IListing } from '../../types/listing.types';
import { TypeBadge, FeaturedBadge } from './ListingBadge';
import PriceDisplay from './PriceDisplay';
import ListingPhotos from './ListingPhotos';
import { FeaturesDisplay } from './FeaturesCheckbox';
import FraudReportButton from '../shared/FraudReportButton';
import { capitalize, timeAgo } from '../../lib/utils';

interface ListingDetailProps {
  listing: IListing;
}

const ListingDetail = ({ listing }: ListingDetailProps) => {
  return (
    <div className="space-y-8">
      {/* Photos */}
      <ListingPhotos photos={listing.photos} title={listing.title} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left: Main info ───────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Title & badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <TypeBadge listingType={listing.listingType} />
              {listing.isFeatured && <FeaturedBadge />}
            </div>
            <h1 className="text-2xl font-bold text-[#0F172A]">{listing.title}</h1>
            <div className="mt-2 flex items-center gap-1.5 text-slate-500">
              <MapPin className="h-4 w-4 shrink-0 text-[#00C9A7]" />
              <span>
                {listing.estateName ? `${listing.estateName}, ` : ''}{listing.areaName}, Lagos
              </span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-5 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Bed className="h-4 w-4 text-[#00C9A7]" />
              <span className="font-medium">
                {listing.bedrooms === 0 ? 'Self-contained' : `${listing.bedrooms} bedroom${listing.bedrooms > 1 ? 's' : ''}`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Bath className="h-4 w-4 text-[#00C9A7]" />
              <span className="font-medium">{listing.bathrooms} bathroom{listing.bathrooms > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Building2 className="h-4 w-4 text-[#00C9A7]" />
              <span className="font-medium">{capitalize(listing.propertyType)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Eye className="h-4 w-4" />
              <span>{listing.viewCount} view{listing.viewCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Calendar className="h-4 w-4" />
              <span>Listed {timeAgo(listing.createdAt)}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="mb-3 text-lg font-semibold text-[#0F172A]">About this property</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>

          {/* Features */}
          {Object.values(listing.features).some(Boolean) && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-[#0F172A]">Amenities & features</h2>
              <FeaturesDisplay features={listing.features} />
            </div>
          )}

          {/* Report */}
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <FraudReportButton listingId={listing._id} />
          </div>
        </div>

        {/* ── Right: Price card ──────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <PriceDisplay
              price={listing.price}
              pricePeriod={listing.pricePeriod}
              serviceCharge={listing.serviceCharge}
              size="lg"
            />
            <p className="mt-4 text-xs text-slate-400">
              Price shown is the asking price. Confirm final amount with the agent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
