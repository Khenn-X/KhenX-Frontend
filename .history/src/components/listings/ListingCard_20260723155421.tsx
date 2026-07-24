import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Eye, Heart, HeartOff, ShieldCheck, Zap, Shield, Droplets, ArrowLeftRight } from 'lucide-react';
import type { IListing } from '../../types/listing.types';
import { ROUTES } from '../../constants/routes';
import { useAuthStore } from '../../store/auth.store';
import { useIsListingSaved, useSaveListing, useUnsaveListing } from '../../hooks/useSaved';
import { TypeBadge } from './ListingBadge';
import PriceDisplay from './PriceDisplay';
import ImageWithFallback from '../shared/ImageWithFallback';
import { cn, capitalize, formatNaira } from '../../lib/utils';
import {  } from './listingType.config';

// Real area-level scores, looked up by the page from useFeaturedNeighbourhoods and
// passed down per-card — NOT fabricated per-listing. Areas outside the featured
// set simply won't have this prop, and the pill row won't render.
export interface ListingIntelligence {
  powerScore?: number;
  securityScore?: number;
  floodRisk?: 'low' | 'medium' | 'high';
}

interface ListingCardProps {
  listing: IListing;
  intelligence?: ListingIntelligence;
  className?: string;
  viewMode?: 'grid' | 'list';
}

const scoreColor = (score?: number) => {
  if (score === undefined) return 'bg-slate-500';
  if (score >= 7.5) return 'bg-[#00C9A7]';
  if (score >= 5) return 'bg-amber-500';
  return 'bg-red-500';
};

const floodColor = (risk?: 'low' | 'medium' | 'high') => {
  if (risk === 'low') return 'bg-[#00C9A7]';
  if (risk === 'medium') return 'bg-amber-500';
  if (risk === 'high') return 'bg-red-500';
  return 'bg-slate-500';
};

const ListingCard = ({ listing, intelligence, className, viewMode = 'grid' }: ListingCardProps) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isSaved = useIsListingSaved(listing._id);
  const { mutate: save, isPending: isSaving } = useSaveListing();
  const { mutate: unsave, isPending: isUnsaving } = useUnsaveListing();

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    (isSaved ? unsave : save)(listing._id);
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    // Cosmetic only for now — no compare feature wired up yet.
    e.preventDefault();
    e.stopPropagation();
  };

  const hasIntel = intelligence && (
    intelligence.powerScore !== undefined ||
    intelligence.securityScore !== undefined ||
    intelligence.floodRisk !== undefined
  );

  const isListView = viewMode === 'list';
  const typeVisual = getTypeVisual(listing.listingType);

  // Grid cards get a top rail (matches the admin review card); list rows get
  // a left rail instead, same convention the admin list view uses.
  const railStyle = isListView
    ? { borderLeft: `3px solid ${typeVisual.rail}` }
    : { borderTop: `3px solid ${typeVisual.rail}` };

  const agentName = (listing as any).agent?.name ?? (listing as any).agentName ?? null;
  const agentInitial = agentName ? agentName.charAt(0).toUpperCase() : null;

  return (
    <Link
      to={ROUTES.LISTING_DETAIL(listing._id)}
      style={railStyle}
      className={cn(
        'group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50',
        'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/70',
        isListView ? 'flex flex-row' : 'flex flex-col',
        className
      )}
    >
      {/* Photo */}
      <div className={cn('relative overflow-hidden', isListView ? 'w-48 shrink-0' : 'w-full')}>
        <ImageWithFallback
          src={listing.photos[0]}
          alt={listing.title}
          className={cn(
            'transition-transform duration-300 group-hover:scale-[1.03]',
            isListView ? 'h-40 w-48 object-cover' : 'h-48 w-full object-cover'
          )}
        />

        {/* Gradient scrim — keeps badges legible over bright photos */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <TypeBadge listingType={listing.listingType} />
        </div>

        {/* NOTE: 'Verified' is temporarily mapped from isFeatured — these are
            semantically different (promoted placement vs. KYC/fraud-checked).
            Swap this for a real isVerified field on IListing when available. */}
        {listing.isFeatured && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-[#0A1628]/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            <ShieldCheck className="h-3 w-3 text-[#00C9A7]" />
            Verified
          </span>
        )}

        {/* Intel score overlay — only renders when real scores were passed down */}
        {hasIntel && (
          <div className="absolute bottom-3 left-3 flex gap-1.5">
            {intelligence?.powerScore !== undefined && (
              <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold text-white', scoreColor(intelligence.powerScore))}>
                <Zap className="h-3 w-3" />
                {intelligence.powerScore.toFixed(1)}
              </span>
            )}
            {intelligence?.securityScore !== undefined && (
              <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold text-white', scoreColor(intelligence.securityScore))}>
                <Shield className="h-3 w-3" />
                {intelligence.securityScore.toFixed(1)}
              </span>
            )}
            {intelligence?.floodRisk && (
              <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold text-white', floodColor(intelligence.floodRisk))}>
                <Droplets className="h-3 w-3" />
                {capitalize(intelligence.floodRisk)}
              </span>
            )}
          </div>
        )}

        {/* Photo count */}
        {listing.photos.length > 0 && (
          <span className="absolute right-3 bottom-3 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
            {listing.photos.length} photo{listing.photos.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Content */}
      <div className={cn('flex flex-1 flex-col gap-3 p-4', isListView ? 'justify-between' : '')}>
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug text-[#0F172A] group-hover:text-[#00C9A7] transition-colors">
              {listing.title}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              {isAuthenticated && (
                <button
                  onClick={handleSaveToggle}
                  disabled={isSaving || isUnsaving}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                    isSaved ? 'text-red-500' : 'text-slate-300 hover:text-red-400'
                  )}
                  aria-label={isSaved ? 'Unsave listing' : 'Save listing'}
                >
                  {isSaved ? <HeartOff className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
                </button>
              )}
              <button
                onClick={handleCompareToggle}
                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-300 hover:text-[#00C9A7] transition-colors"
                aria-label="Add to compare"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#00C9A7]" />
            <span className="line-clamp-1">
              {listing.estateName ? `${listing.estateName}, ` : ''}{listing.areaName}
            </span>
          </div>
        </div>

        {/* Bed / bath / type — boxed row, matches the admin card's spec strip */}
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
          <span className="flex items-center gap-1">
            <Bed className="h-3.5 w-3.5 text-slate-400" />
            {listing.bedrooms === 0 ? 'Self-con' : `${listing.bedrooms} bed`}
          </span>
          <span className="h-3 w-px bg-slate-200" />
          <span className="flex items-center gap-1">
            <Bath className="h-3.5 w-3.5 text-slate-400" />
            {listing.bathrooms} bath
          </span>
          <span className="h-3 w-px bg-slate-200" />
          <span>{capitalize(listing.propertyType)}</span>
        </div>

        {/* Price + service charge — same pairing as the admin card */}
        <div className="flex items-end justify-between">
          <PriceDisplay price={listing.price} pricePeriod={listing.pricePeriod} size="sm" />
          {listing.serviceCharge ? (
            <span className="text-[11px] text-slate-400">+{formatNaira(listing.serviceCharge)} SC</span>
          ) : null}
        </div>

        {/* Footer — agent identity on the left, engagement signal on the right */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          {agentName ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0A1628]/5 text-[10px] font-semibold text-[#0A1628]">
                {agentInitial}
              </span>
              <span className="line-clamp-1 max-w-[110px]">{agentName}</span>
            </div>
          ) : (
            <span />
          )}
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Eye className="h-3 w-3" />
            {listing.viewCount}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;