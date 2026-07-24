import { Eye, MessageSquare, Home, CheckCircle, Clock, PauseCircle, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ListingCounts {
  active: number;
  pending: number;
  paused: number;
  rejected: number;
}

interface DashboardStatsProps {
  listings: ListingCounts;
  totalEnquiries: number;
  totalViews: number;
  className?: string;
}

// ─── Top summary card ──────────────────────────────────────────────────────

const StatCard = ({
  icon: Icon,
  label,
  value,
  iconBg,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  iconBg: string;
  iconColor: string;
}) => (
  <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/60">
    <div className={cn('mb-4 flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105', iconBg)}>
      <Icon className={cn('h-5 w-5', iconColor)} />
    </div>
    <p className="text-2xl font-bold text-[#0F172A] tabular-nums tracking-tight">{value.toLocaleString()}</p>
    <p className="mt-1 text-sm text-slate-500">{label}</p>
  </div>
);

// ─── Listing breakdown row ─────────────────────────────────────────────────

const ListingStatRow = ({
  icon: Icon,
  label,
  count,
  total,
  barColor,
  textColor,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  total: number;
  barColor: string;
  textColor: string;
}) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-3.5 w-3.5', textColor)} />
          <span className="text-sm text-slate-600">{label}</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={cn('text-sm font-semibold tabular-nums', textColor)}>{count}</span>
          <span className="text-[10px] text-slate-400 tabular-nums w-8 text-right">{pct}%</span>
        </div>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ─── Main ────────────────────────────────────────────────────────────────

const DashboardStats = ({ listings, totalEnquiries, totalViews, className }: DashboardStatsProps) => {
  const totalListings = Object.values(listings).reduce((a, b) => a + b, 0);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Top stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Home}
          label="Total listings"
          value={totalListings}
          iconBg="bg-[#0A1628]/8"
          iconColor="text-[#0A1628]"
        />
        <StatCard
          icon={Eye}
          label="Total views"
          value={totalViews}
          iconBg="bg-[#00C9A7]/12"
          iconColor="text-[#00A88C]"
        />
        <StatCard
          icon={MessageSquare}
          label="Total enquiries"
          value={totalEnquiries}
          iconBg="bg-[#F59E0B]/12"
          iconColor="text-[#B45309]"
        />
      </div>

      {/* Listing breakdown */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-[#0F172A]">Listing breakdown</p>
          <span className="text-xs text-slate-400">{totalListings} total</span>
        </div>
        <div className="divide-y divide-slate-100">
          <ListingStatRow
            icon={CheckCircle}
            label="Active"
            count={listings.active}
            total={totalListings}
            barColor="bg-[#00C9A7]"
            textColor="text-[#00A88C]"
          />
          <ListingStatRow
            icon={Clock}
            label="Pending review"
            count={listings.pending}
            total={totalListings}
            barColor="bg-[#F59E0B]"
            textColor="text-[#B45309]"
          />
          <ListingStatRow
            icon={PauseCircle}
            label="Paused"
            count={listings.paused}
            total={totalListings}
            barColor="bg-slate-300"
            textColor="text-slate-400"
          />
          <ListingStatRow
            icon={XCircle}
            label="Rejected"
            count={listings.rejected}
            total={totalListings}
            barColor="bg-[#DC2626]"
            textColor="text-[#DC2626]"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;