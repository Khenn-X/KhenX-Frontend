import { Building2, ShieldCheck, AlertTriangle, Users, Eye, TrendingUp } from 'lucide-react';
import type { AdminStats as AdminStatsType } from '../../api/admin.api';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  urgent?: boolean;
  color?: 'teal' | 'amber' | 'red' | 'navy' | 'slate';
}

const colorMap = {
  teal:  { bg: 'bg-[#00C9A7]/10', icon: 'text-[#00C9A7]', value: 'text-[#00C9A7]' },
  amber: { bg: 'bg-[#F59E0B]/10', icon: 'text-[#F59E0B]', value: 'text-[#F59E0B]' },
  red:   { bg: 'bg-red-100',      icon: 'text-red-500',    value: 'text-red-600'   },
  navy:  { bg: 'bg-[#0A1628]/10', icon: 'text-[#0A1628]',  value: 'text-[#0A1628]' },
  slate: { bg: 'bg-slate-100',    icon: 'text-slate-500',   value: 'text-slate-700' },
};

const StatCard = ({ label, value, icon: Icon, urgent, color = 'teal' }: StatCardProps) => {
  const c = colorMap[color];
  return (
    <div className={cn(
      'flex items-center gap-4 rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md',
      urgent && value > 0 ? 'border-red-200' : 'border-slate-200'
    )}>
      <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', c.bg)}>
        <Icon className={cn('h-6 w-6', c.icon)} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500 truncate">{label}</p>
        <p className={cn('text-2xl font-bold', c.value)}>{value.toLocaleString()}</p>
        {urgent && value > 0 && (
          <p className="text-xs text-red-500 font-medium mt-0.5">Needs attention</p>
        )}
      </div>
    </div>
  );
};

interface AdminStatsProps {
  stats: AdminStatsType;
}

const AdminStats = ({ stats }: AdminStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <StatCard
        label="Pending listings"
        value={stats.pendingListings}
        icon={Building2}
        urgent
        color="amber"
      />
      <StatCard
        label="Pending KYC"
        value={stats.pendingKYC}
        icon={ShieldCheck}
        urgent
        color="amber"
      />
      <StatCard
        label="Open fraud reports"
        value={stats.openFraudReports}
        icon={AlertTriangle}
        urgent
        color="red"
      />
      <StatCard
        label="Total listings"
        value={stats.totalListings}
        icon={TrendingUp}
        color="navy"
      />
      <StatCard
        label="Total agents"
        value={stats.totalAgents}
        icon={Users}
        color="teal"
      />
      <StatCard
        label="Total seekers"
        value={stats.totalSeekers}
        icon={Eye}
        color="slate"
      />
    </div>
  );
};

export default AdminStats;
