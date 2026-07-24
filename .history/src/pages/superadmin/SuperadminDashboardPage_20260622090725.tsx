import { useNavigate } from 'react-router-dom';
import { Building2, ShieldCheck, AlertTriangle, UserCheck } from 'lucide-react';
import { useAdminStats } from '../../hooks/useAdmin';
import AdminStats from '../../components/admin/AdminStats';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { ROUTES } from '../../constants/routes';

/** Same extractor as AdminDashboardPage — handles all axios/backend nesting depths */
function extractStats(data: unknown): Record<string, any> | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, any>;
  const candidates = [d?.data?.data, d?.data, d];
  for (const candidate of candidates) {
    if (candidate && typeof candidate === 'object' && 'listings' in candidate) {
      return candidate;
    }
  }
  return null;
}

const SuperadminDashboardPage = () => {
  const { data, isLoading, isError, refetch } = useAdminStats();
  const navigate = useNavigate();

  const stats = extractStats(data); // ← same as AdminDashboardPage

  const quickActions = [
    {
      label: 'Admin approvals',
      description: stats ? `${stats.adminApprovals?.pending ?? 0} pending` : '—',
      icon: UserCheck,
      to: ROUTES.SUPERADMIN_ADMIN_REQUESTS,
      urgent: (stats?.adminApprovals?.pending ?? 0) > 0,
    },
    {
      label: 'Review listings',
      description: stats ? `${stats.listings?.pending ?? 0} pending` : '—',
      icon: Building2,
      to: ROUTES.ADMIN_LISTINGS,
      urgent: (stats?.listings?.pending ?? 0) > 0,
    },
    {
      label: 'Review KYC',
      description: stats ? `${stats.agents?.pendingKYC ?? 0} pending` : '—',
      icon: ShieldCheck,
      to: ROUTES.ADMIN_KYC,
      urgent: (stats?.agents?.pendingKYC ?? 0) > 0,
    },
    {
      label: 'Fraud reports',
      description: stats ? `${stats.fraud?.open ?? 0} open` : '—',
      icon: AlertTriangle,
      to: ROUTES.ADMIN_FRAUD,
      urgent: (stats?.fraud?.open ?? 0) > 0,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Superadmin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Full platform overview — including admin account approvals.
        </p>
      </div>

      {isLoading && <LoadingSpinner label="Loading stats..." />}
      {isError && <ErrorMessage onRetry={refetch} />}

      {!isLoading && !isError && stats && (
        <>
          <AdminStats stats={stats} />

          <div>
            <h2 className="mb-4 text-lg font-semibold text-[#0F172A]">Quick actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map(({ label, description, icon: Icon, to, urgent }) => (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${urgent ? 'bg-amber-100' : 'bg-slate-100'}`}>
                    <Icon className={`h-5 w-5 ${urgent ? 'text-amber-600' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F172A] text-sm">{label}</p>
                    <p className={`text-sm ${urgent ? 'text-amber-600 font-medium' : 'text-slate-400'}`}>
                      {description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SuperadminDashboardPage;