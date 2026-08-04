import { Users, Building2, ShieldCheck, AlertTriangle, UserCheck, ClipboardList } from 'lucide-react';

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
  amber: { bg: 'bg-[#D97706]/8',  icon: 'bg-[#D97706] text-white', value: 'text-[#B45309]' },
  teal:  { bg: 'bg-[#006A61]/8',  icon: 'bg-[#006A61] text-white', value: 'text-[#006A61]' },
  red:   { bg: 'bg-[#DC2626]/8',  icon: 'bg-[#DC2626] text-white', value: 'text-[#DC2626]' },
  slate: { bg: 'bg-white',        icon: 'bg-[#002948] text-white', value: 'text-[#002948]' },
};

const StatCard = ({ label, value, sub, icon: Icon, accent = 'slate' }: StatCardProps) => {
  const c = accentMap[accent];
  return (
    <div className={`rounded-xl border border-slate-200/80 ${c.bg} p-3.5`}>
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 truncate">{label}</p>
          <p className={`mt-0.5 text-xl font-bold ${c.value}`}>{value}</p>
          {sub && <p className="mt-0.5 text-[10px] text-slate-400 truncate">{sub}</p>}
        </div>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${c.icon}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

const AdminStats = ({ stats }: AdminStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <StatCard label="Total users" value={stats.users?.total ?? 0} icon={Users} accent="slate" />
      <StatCard
        label="Listings"
        value={stats.listings?.total ?? 0}
        sub={`${stats.listings?.active ?? 0} active · ${stats.listings?.pending ?? 0} pending`}
        icon={Building2}
        accent={(stats.listings?.pending ?? 0) > 0 ? 'amber' : 'slate'}
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
      <StatCard label="Enquiries" value={stats.enquiries?.total ?? 0} icon={ClipboardList} accent="teal" />
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