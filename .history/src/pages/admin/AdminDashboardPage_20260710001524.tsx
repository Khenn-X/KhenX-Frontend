import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Building2, ShieldCheck } from 'lucide-react';
import { useAdminStats } from '../../hooks/useAdmin';
import AdminStats from '../../components/admin/AdminStats';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { ROUTES } from '../../constants/routes';

/** Unwraps the axios → API-envelope response down to the stats payload. */
function extractStats(data: unknown): Record<string, any> | null {
  if (!data || typeof data !== 'object') return null;
  const outer = data as Record<string, any>;
  const candidate = outer.data ?? outer;
  return candidate && typeof candidate === 'object' && 'listings' in candidate ? candidate : null;
}

type QuickAction = {
  label: string;
  description: string;
  icon: typeof Building2;
  to: string;
  count: number;
};

const AdminDashboardPage = () => {
  const { data, isLoading, isError, refetch } = useAdminStats();
  const navigate = useNavigate();

  const stats = extractStats(data);

  const quickActions: QuickAction[] = [
    {
      label: 'Review listings',
      description: 'Awaiting approval',
      icon: Building2,
      to: ROUTES.ADMIN_LISTINGS,
      count: stats?.listings?.pending ?? 0,
    },
    {
      label: 'Review KYC',
      description: 'Agent verifications',
      icon: ShieldCheck,
      to: ROUTES.ADMIN_KYC,
      count: stats?.agents?.pendingKYC ?? 0,
    },
    {
      label: 'Fraud reports',
      description: 'Open cases',
      icon: AlertTriangle,
      to: ROUTES.ADMIN_FRAUD,
      count: stats?.fraud?.open ?? 0,
    },
  ];

  const totalPending = quickActions.reduce((sum, action) => sum + action.count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-[#0A1628] to-[#0F172A] p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00C9A7]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#00C9A7]">
            Admin
          </span>
          <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Platform overview and pending actions across listings, agents, and fraud reports.
          </p>
        </div>
        {!isLoading && !isError && stats && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ${
              totalPending > 0
                ? 'bg-amber-400/10 text-amber-300 ring-amber-400/20'
                : 'bg-white/5 text-white ring-white/15'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${totalPending > 0 ? 'bg-amber-400' : 'bg-[#00C9A7]'}`} />
            {totalPending > 0 ? `${totalPending} items need attention` : 'All caught up'}
          </span>
        )}
      </div>

      {isLoading && <LoadingSpinner label="Loading stats..." />}
      {isError && <ErrorMessage onRetry={refetch} />}

      {!isLoading && !isError && !stats && (
        <ErrorMessage message="Couldn't read stats from the server response." onRetry={refetch} />
      )}

      {!isLoading && !isError && stats && (
        <>
          {/* Platform stats */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Platform overview
            </h2>
            <AdminStats stats={stats} />
          </section>

          {/* Quick actions */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Quick actions
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {quickActions.map(({ label, description, icon: Icon, to, count }) => {
                const urgent = count > 0;
                return (
                  <button
                    key={to}
                    type="button"
                    onClick={() => navigate(to)}
                    className="group flex items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm shadow-slate-200/60 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors ${
                          urgent ? 'bg-amber-50' : 'bg-slate-50'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${urgent ? 'text-amber-600' : 'text-slate-500'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0F172A]">{label}</p>
                        <p className="text-xs text-slate-400">{description}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex min-w-[1.75rem] shrink-0 items-center justify-center rounded-full px-2 py-1 text-xs font-bold ${
                        urgent
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;