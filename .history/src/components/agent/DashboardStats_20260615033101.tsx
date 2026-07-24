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

const StatCard = ({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  accent: string;
}) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5">
    <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-full', accent)}>
      <Icon className="h-5 w-5" />
    </div>
    <p className="text-2xl font-bold text-[#0F172A]">{value.toLocaleString()}</p>
    <p className="mt-0.5 text-sm text-slate-500">{label}</p>
  </div>
);

const ListingStatRow = ({
  icon: Icon,
  label,
  count,
  color,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  color: string;
}) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-2">
      <Icon className={cn('h-4 w-4', color)} />
      <span className="text-sm text-slate-600">{label}</span>
    </div>
    <span className={cn('text-sm font-semibold', color)}>{count}</span>
  </div>
);

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
          accent="bg-[#0A1628]/10 text-[#0A1628]"
        />
        <StatCard
          icon={Eye}
          label="Total views"
          value={totalViews}
          accent="bg-[#00C9A7]/10 text-[#00C9A7]"
        />
        <StatCard
          icon={MessageSquare}
          label="Total enquiries"
          value={totalEnquiries}
          accent="bg-[#F59E0B]/10 text-[#F59E0B]"
        />
      </div>

      {/* Listing breakdown */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="mb-3 text-sm font-semibold text-slate-700">Listing breakdown</p>
        <div className="divide-y divide-slate-100">
          <ListingStatRow
            icon={CheckCircle}
            label="Active"
            count={listings.active}
            color="text-[#00C9A7]"
          />
          <ListingStatRow
            icon={Clock}
            label="Pending review"
            count={listings.pending}
            color="text-[#F59E0B]"
          />
          <ListingStatRow
            icon={PauseCircle}
            label="Paused"
            count={listings.paused}
            color="text-slate-400"
          />
          <ListingStatRow
            icon={XCircle}
            label="Rejected"
            count={listings.rejected}
            color="text-[#DC2626]"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
