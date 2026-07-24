interface ListingsStatsBarProps {
  totalActive?: number; // real — from query meta.total
}

// NOTE: 'Verified' count, 'Avg. Rent', and 'New listings this week' all need a
// dedicated stats endpoint (e.g. GET /listings/stats) — there's no aggregation
// for these yet. They render as '—' rather than fabricated numbers until that
// endpoint exists.
const ListingsStatsBar = ({ totalActive }: ListingsStatsBarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-2 rounded-xl bg-slate-50 border border-slate-200 px-5 py-3 text-sm">
      <span className="text-slate-600">
        <strong className="text-[#0F172A] font-bold">
          {totalActive !== undefined ? totalActive.toLocaleString() : '—'}
        </strong>{' '}
        Active Listings
      </span>
      <span className="text-slate-600">
        <strong className="text-[#00C9A7] font-bold">—</strong> Verified
      </span>
      <span className="text-slate-600">
        <strong className="text-[#0F172A] font-bold">—</strong> Avg. Rent
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-[#00C9A7]/10 px-2.5 py-1 text-xs font-semibold text-[#00C9A7]">
        New listings this week: —
      </span>
    </div>
  );
};

export default ListingsStatsBar;