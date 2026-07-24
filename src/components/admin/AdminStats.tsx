import { Users, Building2, ShieldCheck, AlertTriangle, UserCheck, ClipboardList } from 'lucide-react';

// Matches the nested shape from GET /admin/stats
interface AdminStatsProps {
  stats: {
    users?:          { total: number };
    listings?:       { total: number; active: number; pending: number };
    agents?:         { total: number; pendingKYC: number };
    fraud?:          { open: number };
    enquiries?:      { total: number };
    adminApprovals?: { pending: number };
    landlords?:      { total: number; pendingKYC: number };
  };
}

interface StatCardProps {
  label: string;
  value: number;
  sub?: string;
  icon: React.ElementType;
  accent?: 'amber' | 'teal' | 'red' | 'slate';
}

const accentMap = {
  amber: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', value: 'text-amber-700' },
  teal:  { bg: 'bg-teal-50',  icon: 'bg-teal-100  text-teal-600',  value: 'text-teal-700'  },
  red:   { bg: 'bg-red-50',   icon: 'bg-red-100   text-red-600',   value: 'text-red-700'   },
  slate: { bg: 'bg-white',    icon: 'bg-slate-100 text-slate-600', value: 'text-[#0F172A]' },
};

const StatCard = ({ label, value, sub, icon: Icon, accent = 'slate' }: StatCardProps) => {
  const c = accentMap[accent];
  return (
    <div className={`rounded-xl border border-slate-200 ${c.bg} p-5 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className={`mt-1 text-3xl font-bold ${c.value}`}>{value}</p>
          {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

const AdminStats = ({ stats }: AdminStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
      <StatCard
        label="Total users"
        value={stats.users?.total ?? 0}
        icon={Users}
        accent="slate"
      />
      <StatCard
        label="Listings"
        value={stats.listings?.total ?? 0}
        sub={`${stats.listings?.active ?? 0} active · ${stats.listings?.pending ?? 0} pending`}
        icon={Building2}
        accent={( stats.listings?.pending ?? 0) > 0 ? 'amber' : 'slate'}
      />
      <StatCard
        label="Agents"
        value={stats.agents?.total ?? 0}
        sub={`${stats.agents?.pendingKYC ?? 0} pending KYC`}
        icon={UserCheck}
        accent={(stats.agents?.pendingKYC ?? 0) > 0 ? 'amber' : 'slate'}
      />
      <StatCard
        label="Fraud reports"
        value={stats.fraud?.open ?? 0}
        sub="open reports"
        icon={AlertTriangle}
        accent={(stats.fraud?.open ?? 0) > 0 ? 'red' : 'slate'}
      />
      <StatCard
        label="Enquiries"
        value={stats.enquiries?.total ?? 0}
        icon={ClipboardList}
        accent="teal"
      />
      <StatCard
        label="Admin approvals"
        value={stats.adminApprovals?.pending ?? 0}
        sub="pending approval"
        icon={ShieldCheck}
        accent={(stats.adminApprovals?.pending ?? 0) > 0 ? 'amber' : 'slate'}
      />
    </div>
  );
};

export default AdminStats;