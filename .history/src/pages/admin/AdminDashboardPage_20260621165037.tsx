import { useNavigate } from 'react-router-dom';
import { Building2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAdminStats } from '../../hooks/useAdmin';
import AdminStats from '../../components/admin/AdminStats';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { ROUTES } from '../../constants/routes';

/** Safely extract the nested stats object regardless of how many .data wrappers exist */
function extractStats(data: unknown): Record<string, any> | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, any>;

  // Try every possible nesting depth
  const candidates = [
    d?.data?.data,   // axios res → backend envelope → stats
    d?.data,         // already unwrapped one level
    d,               // raw
  ];

  for (const candidate of candidates) {
    // The real stats object always has a `listings` key
    if (candidate && typeof candidate === 'object' && 'listings' in candidate) {
      return candidate;
    }
  }
  return null;
}

const AdminDashboardPage = () => {
  const { data, isLoading, isError, refetch } = useAdminStats();
  const navigate = useNavigate();

  const stats = extractStats(data);

  // DEV: remove after confirming stats render
  if (import.meta.env.DEV) {
    console.log('[AdminDashboard] raw data:', data);
    console.log('[AdminDashboard] resolved stats:', stats);
  }

  const quickActions = [
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
        <h1 className="text-2xl font-bold text-[#0F172A]">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Platform overview and pending actions.</p>
      </div>

      {isLoading && <LoadingSpinner label="Loading stats..." />}
      {isError && <ErrorMessage onRetry={refetch} />}

      {!isLoading && !isError && stats && (
        <>
          <AdminStats stats={stats} />

          <div>
            <h2 className="mb-4 text-lg font-semibold text-[#0F172A]">Quick actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* DEV: show raw data if stats still null after load */}
      {import.meta.env.DEV && !isLoading && !stats && (
        <pre className="rounded-lg bg-red-50 p-4 text-xs text-red-800 overflow-auto">
          Stats resolved to null. Raw data:{'\n'}{JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default AdminDashboardPage;