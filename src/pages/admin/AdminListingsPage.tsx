import { useMemo, useState } from 'react';
import {
  Building2, RefreshCw, Search, LayoutGrid, List as ListIcon,
  MapPin, Bed, Bath, Check, X, Star, Clock, CheckCircle2, PauseCircle, XCircle,
} from 'lucide-react';
import { useAdminListings, useApproveListing, useRejectListing, useFeatureListing } from '../../hooks/useAdmin';
import type { IListing, ListingStatus } from '../../types/listing.types';
import { getListingSummaryMeta } from '../../lib/utils';

type AdminTabStatus = 'all' | ListingStatus;
type StatusKey = Exclude<AdminTabStatus, 'all'>;

const STATUS_VISUALS = {
  pending: { label: 'Pending', icon: Clock, bg: '#F59E0B', color: '#B45309', softBg: '#FEF3C7' },
  active: { label: 'Active', icon: CheckCircle2, bg: '#00C9A7', color: '#0F766E', softBg: '#CCFBEF' },
  paused: { label: 'Paused', icon: PauseCircle, bg: '#6366F1', color: '#4338CA', softBg: '#E0E7FF' },
  rejected: { label: 'Rejected', icon: XCircle, bg: '#EF4444', color: '#B91C1C', softBg: '#FEE2E2' },
};

const formatNaira = (n: number | string | null | undefined) => `₦${Number(n || 0).toLocaleString()}`;
const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const StatusPill = ({ status, size = 'sm' }: { status: StatusKey; size?: 'sm' | 'md' }) => {
  const v = STATUS_VISUALS[status];
  const Icon = v.icon;
  const pad = size === 'sm' ? 'px-2 py-1' : 'px-2.5 py-1.5';
  const text = size === 'sm' ? 'text-[11px]' : 'text-xs';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full ${pad} ${text} font-semibold`} style={{ backgroundColor: v.softBg, color: v.color }}>
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {v.label}
    </span>
  );
};

const TypeBadge = ({ listingType }: { listingType: IListing['listingType'] }) => (
  <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#0A1628] shadow-sm">
    {listingType === 'sale' ? 'For Sale' : 'For Rent'}
  </span>
);

const PriceDisplay = ({ price, pricePeriod }: { price: number; pricePeriod: IListing['pricePeriod'] | null }) => {
  const periodLabel = pricePeriod === 'yearly' ? 'yr' : pricePeriod === 'monthly' ? 'mo' : pricePeriod === 'nightly' ? 'night' : '';
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-base font-bold text-[#0F172A]">{formatNaira(price)}</span>
      {pricePeriod && <span className="text-xs text-slate-400">/{periodLabel}</span>}
    </div>
  );
};

const ActionRow = ({ listing }: { listing: IListing }) => {
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const { mutate: approve, isPending: isApproving } = useApproveListing();
  const { mutate: reject, isPending: isRejecting } = useRejectListing();

  if (rejectMode) {
    const canConfirm = rejectReason.trim().length >= 10;
    return (
      <div className="space-y-2">
        <textarea
          value={rejectReason}
          onChange={(event) => setRejectReason(event.target.value)}
          placeholder="Reason for rejection (min. 10 chars)..."
          rows={2}
          className="w-full resize-none rounded-lg border border-red-200 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
        />
        <div className="flex gap-2">
          <button
            onClick={() => reject({ id: listing._id, reason: rejectReason }, { onSuccess: () => { setRejectMode(false); setRejectReason(''); } })}
            disabled={!canConfirm || isRejecting}
            className="flex-1 rounded-lg bg-red-600 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRejecting ? 'Rejecting' : 'Confirm reject'}
          </button>
          <button onClick={() => setRejectMode(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50">Cancel</button>
        </div>
      </div>
    );
  }
  if (listing.status === 'pending') {
    return (
      <div className="flex gap-2">
        <button onClick={() => approve(listing._id)} disabled={isApproving} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#00C9A7] py-2.5 text-xs font-semibold text-[#0A1628] hover:bg-[#00b396] disabled:opacity-50 disabled:cursor-not-allowed">
          <Check className="h-3.5 w-3.5" /> {isApproving ? 'Approving' : 'Approve'}
        </button>
        <button onClick={() => setRejectMode(true)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50">
          <X className="h-3.5 w-3.5" /> Reject
        </button>
      </div>
    );
  }
  if (listing.status === 'active') {
    return (
      <div className="flex gap-2">
        <button onClick={() => setRejectMode(true)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50">
          <X className="h-3.5 w-3.5" /> Reject
        </button>
        <button className="flex items-center justify-center rounded-lg border border-[#F59E0B]/30 px-3 py-2.5 text-[#F59E0B] hover:bg-[#F59E0B]/10">
          <Star className={listing.isFeatured ? 'h-3.5 w-3.5 fill-[#F59E0B]' : 'h-3.5 w-3.5'} />
        </button>
      </div>
    );
  }
  if (listing.status === 'rejected') {
    return (
      <div className="flex gap-2">
        <button onClick={() => approve(listing._id)} disabled={isApproving} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#00C9A7] py-2.5 text-xs font-semibold text-[#0A1628] hover:bg-[#00b396] disabled:opacity-50 disabled:cursor-not-allowed">
          <Check className="h-3.5 w-3.5" /> {isApproving ? 'Approving' : 'Approve'}
        </button>
        <button className="flex items-center justify-center rounded-lg border border-[#F59E0B]/30 px-3 py-2.5 text-[#F59E0B] hover:bg-[#F59E0B]/10">
          <Star className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }
  return (
    <div className="flex-1 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2.5 text-center text-xs text-slate-500">
      View-only for now
    </div>
  );
};

const ListingCard = ({ listing }: { listing: IListing }) => {
  const v = STATUS_VISUALS[listing.status as StatusKey];
  const summaryMeta = getListingSummaryMeta({
    propertyCategory: listing.propertyCategory,
    propertyType: listing.propertyType,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
  });

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/70" style={{ borderTop: `3px solid ${v.bg}` }}>
      <div className="relative h-48 overflow-hidden">
        <img src={listing.photos[0]} alt={listing.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-black/0 to-black/0" />
        <div className="absolute left-3 top-3"><TypeBadge listingType={listing.listingType} /></div>
        <div className="absolute right-3 top-3"><StatusPill status={listing.status} /></div>
        {listing.isFeatured && (
          <div className="absolute left-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-[#F59E0B] px-2 py-1 text-[11px] font-semibold text-white shadow-sm">
            <Star className="h-3 w-3 fill-white" /> Featured
          </div>
        )}
        <span className="absolute right-3 bottom-3 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
          {listing.photos.length} photo{listing.photos.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="space-y-3.5 p-4">
        <div>
          <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug text-[#0F172A]">{listing.title}</h3>
          <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#00C9A7]" />
            <span className="line-clamp-1">{listing.estateName ? `${listing.estateName}, ` : ''}{listing.areaName}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
          {summaryMeta.showBedBath ? (
            <>
              <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5 text-slate-400" />{summaryMeta.bedLabel}</span>
              <span className="h-3 w-px bg-slate-200" />
              <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5 text-slate-400" />{summaryMeta.bathLabel}</span>
              <span className="h-3 w-px bg-slate-200" />
              <span>{summaryMeta.propertyLabel}</span>
            </>
          ) : (
            <span>{summaryMeta.propertyLabel}</span>
          )}
        </div>
        <div className="flex items-end justify-between">
          <PriceDisplay price={listing.price} pricePeriod={listing.pricePeriod} />
          {listing.serviceCharge ? <span className="text-[11px] text-slate-400">+{formatNaira(listing.serviceCharge)} SC</span> : null}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0A1628]/5 text-[10px] font-semibold text-[#0A1628]">{listing.agentId ? 'A' : 'O'}</span>
            <span className="line-clamp-1 max-w-27.5">{listing.agentId ? 'Agent' : 'Owner'}</span>
          </div>
          <span className="text-[11px] text-slate-400">{timeAgo(listing.createdAt)}</span>
        </div>
        {listing.status === 'rejected' && listing.rejectionReason && (
          <div className="rounded-lg border border-red-100 bg-red-50 p-2.5 text-[11px] leading-relaxed text-red-700">
            <p className="font-semibold">Previously rejected</p>
            <p className="mt-0.5 text-red-600">{listing.rejectionReason}</p>
          </div>
        )}
        <ActionRow listing={listing} />
      </div>
    </div>
  );
};

const ListingRow = ({ listing }: { listing: IListing }) => {
  const v = STATUS_VISUALS[listing.status as StatusKey];
  const { mutate: approve, isPending: isApproving } = useApproveListing();
  const { mutate: feature, isPending: isFeaturing } = useFeatureListing();
  const summaryMeta = getListingSummaryMeta({
    propertyCategory: listing.propertyCategory,
    propertyType: listing.propertyType,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
  });

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40 transition-shadow hover:shadow-md hover:shadow-slate-200/60" style={{ borderLeft: `3px solid ${v.bg}` }}>
      <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-lg sm:h-16 sm:w-24">
          <img src={listing.photos[0]} alt={listing.title} className="h-full w-full object-cover" />
          {listing.isFeatured && <span className="absolute left-1 top-1 rounded-full bg-[#F59E0B] p-0.5"><Star className="h-2.5 w-2.5 fill-white text-white" /></span>}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="line-clamp-1 text-sm font-semibold text-[#0F172A]">{listing.title}</h3>
            <StatusPill status={listing.status} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-[#00C9A7]" />{listing.estateName ? `${listing.estateName}, ` : ''}{listing.areaName}</span>
            {summaryMeta.showBedBath ? (
              <>
                <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{summaryMeta.bedLabel}</span>
                <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{summaryMeta.bathLabel}</span>
              </>
            ) : null}
            <span>{summaryMeta.propertyLabel}</span>
            <span className="text-slate-400">{listing.agentId ? 'Agent' : 'Owner'}</span>
            <span className="text-slate-400">{timeAgo(listing.createdAt)}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
          <PriceDisplay price={listing.price} pricePeriod={listing.pricePeriod} />
          <div className="flex items-center gap-1.5">
            {listing.status === 'pending' && (
              <>
                <button onClick={() => approve(listing._id)} disabled={isApproving} className="inline-flex items-center gap-1 rounded-lg bg-[#00C9A7] px-3 py-2 text-xs font-semibold text-[#0A1628] hover:bg-[#00b396] disabled:opacity-50 disabled:cursor-not-allowed"><Check className="h-3.5 w-3.5" /><span className="hidden md:inline">{isApproving ? 'Approving' : 'Approve'}</span></button>
                <button className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"><X className="h-3.5 w-3.5" /><span className="hidden md:inline">Reject</span></button>
              </>
            )}
            {listing.status === 'active' && (
              <>
                <button className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"><X className="h-3.5 w-3.5" /><span className="hidden md:inline">Reject</span></button>
                <button onClick={() => feature({ id: listing._id, isFeatured: !listing.isFeatured })} disabled={isFeaturing} className="inline-flex items-center justify-center rounded-lg border border-[#F59E0B]/30 p-2 text-[#F59E0B] hover:bg-[#F59E0B]/10 disabled:opacity-50 disabled:cursor-not-allowed"><Star className={listing.isFeatured ? 'h-3.5 w-3.5 fill-[#F59E0B]' : 'h-3.5 w-3.5'} /></button>
              </>
            )}
            {listing.status === 'rejected' && (
              <>
                <button className="inline-flex items-center gap-1 rounded-lg bg-[#00C9A7] px-3 py-2 text-xs font-semibold text-[#0A1628] hover:bg-[#00b396]"><Check className="h-3.5 w-3.5" /><span className="hidden md:inline">Approve</span></button>
                <button className="inline-flex items-center justify-center rounded-lg border border-[#F59E0B]/30 p-2 text-[#F59E0B] hover:bg-[#F59E0B]/10"><Star className="h-3.5 w-3.5" /></button>
              </>
            )}
            {listing.status === 'paused' && <span className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">View-only</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

const TABS: Array<{ value: AdminTabStatus; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'rejected', label: 'Rejected' },
];

export default function AdminListingsPreview() {
  const [status, setStatus] = useState<AdminTabStatus>('all');
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, isFetching, refetch } = useAdminListings(status);
  const { data: allData, isLoading: isLoadingAll, isError: isErrorAll, isFetching: isFetchingAll, refetch: refetchAll } = useAdminListings('all');
  const listings = useMemo<IListing[]>(() => data?.data?.listings ?? [], [data]);
  const allListings = useMemo<IListing[]>(() => allData?.data?.listings ?? [], [allData]);

  const breakdown = useMemo(() => {
    return allListings.reduce<Record<string, number>>((acc, listing) => {
      acc[listing.status] = (acc[listing.status] ?? 0) + 1;
      return acc;
    }, {});
  }, [allListings]);

  const handleRefresh = () => {
    void Promise.all([refetch(), refetchAll()]);
  };

  const isRefreshing = isFetching || isFetchingAll;
  const isLoadingListings = isLoading || isLoadingAll;
  const hasLoadError = isError || isErrorAll;

  const filtered = useMemo(() => {
    let list = status === 'all' ? listings : listings.filter((listing) => listing.status === status);
    const term = search.trim().toLowerCase();
    if (term) {
      list = list.filter((listing) => `${listing.title} ${listing.areaName} ${listing.estateName ?? ''}`.toLowerCase().includes(term));
    }
    return list;
  }, [listings, search, status]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 bg-[#F8FAFC] p-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-linear-to-br from-[#0A1628] to-[#0F172A] p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00C9A7]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#00C9A7]">Admin</span>
          <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Listing Review</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">Review and manage listings across all review states from one place.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-3 py-1.5 text-sm font-semibold text-amber-300 ring-1 ring-inset ring-amber-400/20">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {filtered.length} {status === 'all' ? 'listings' : status}
          </span>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/60">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const isActive = status === tab.value;
            const v = tab.value !== 'all' ? STATUS_VISUALS[tab.value as StatusKey] : null;
            const count = tab.value !== 'all' ? breakdown[tab.value] : undefined;
            return (
              <button key={tab.value} onClick={() => setStatus(tab.value)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-[#00C9A7] text-[#0A1628]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {v && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: isActive ? '#0A1628' : v.bg }} />}
                {tab.label}
                {typeof count === 'number' && <span className={`rounded-full px-1.5 text-[11px] ${isActive ? 'bg-[#0A1628]/15 text-[#0A1628]' : 'bg-white text-slate-500'}`}>{count}</span>}
              </button>
            );
          })}
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1">
          <button onClick={() => setView('grid')} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${view === 'grid' ? 'bg-white text-[#0A1628] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <LayoutGrid className="h-3.5 w-3.5" /> Grid
          </button>
          <button onClick={() => setView('list')} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${view === 'list' ? 'bg-white text-[#0A1628] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <ListIcon className="h-3.5 w-3.5" /> List
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, address, or agent"
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none focus:border-[#00C9A7] focus:bg-white focus:ring-2 focus:ring-[#00C9A7]/20" />
        </div>
      </div>

      {isLoadingListings ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
          <p className="text-sm font-semibold text-slate-500">Loading listings…</p>
        </div>
      ) : hasLoadError ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <Building2 className="h-8 w-8 text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">Could not load listings right now.</p>
          <button onClick={handleRefresh} className="mt-2 text-sm font-semibold text-[#00C9A7]">Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <Building2 className="h-8 w-8 text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">No listings found</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => <ListingCard key={l._id} listing={l} />)}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((l) => <ListingRow key={l._id} listing={l} />)}
        </div>
      )}
    </div>
  );
}