import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Building2, Crown, ShieldCheck, UserCheck } from 'lucide-react';
import { useAdminStats } from '../../hooks/useAdmin';
import AdminStats from '../../components/admin/AdminStats';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { ROUTES } from '../../constants/routes';
import { timeAgo } from '../../lib/utils';

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
  accent: string;
};

const ACCENTS: Record<string, { bar: string; chip: string; icon: string; dot: string }> = {
  indigo: {
    bar: 'from-indigo-400 to-indigo-500',
    chip: 'bg-indigo-50',
    icon: 'text-indigo-600',
    dot: '#6366F1',
  },
  teal: {
    bar: 'from-[#00C9A7] to-[#00E0BA]',
    chip: 'bg-[#00C9A7]/10',
    icon: 'text-[#00A88C]',
    dot: '#00C9A7',
  },
  amber: {
    bar: 'from-amber-400 to-amber-500',
    chip: 'bg-amber-50',
    icon: 'text-amber-600',
    dot: '#F59E0B',
  },
  rose: {
    bar: 'from-rose-400 to-rose-500',
    chip: 'bg-rose-50',
    icon: 'text-rose-600',
    dot: '#F43F5E',
  },
};

const SuperadminDashboardPage = () => {
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useAdminStats();
  const navigate = useNavigate();

  const stats = extractStats(data);

  const quickActions: QuickAction[] = [
    {
      label: 'Admin approvals',
      description: 'New admin requests',
      icon: UserCheck,
      to: ROUTES.SUPERADMIN_ADMIN_REQUESTS,
      count: stats?.adminApprovals?.pending ?? 0,
      accent: 'indigo',
    },
    {
      label: 'Review listings',
      description: 'Awaiting approval',
      icon: Building2,
      to: ROUTES.ADMIN_LISTINGS,
      count: stats?.listings?.pending ?? 0,
      accent: 'teal',
    },
    {
      label: 'Review KYC',
      description: 'Agent verifications',
      icon: ShieldCheck,
      to: ROUTES.ADMIN_KYC,
      count: stats?.agents?.pendingKYC ?? 0,
      accent: 'amber',
    },
    {
      label: 'Fraud reports',
      description: 'Open cases',
      icon: AlertTriangle,
      to: ROUTES.ADMIN_FRAUD,
      count: stats?.fraud?.open ?? 0,
      accent: 'rose',
    },
  ];

  const totalPending = quickActions.reduce((sum, action) => sum + action.count, 0);

  // Build a conic-gradient donut from the real pending counts.
  const donutGradient = (() => {
    if (totalPending === 0) return null;
    let cursor = 0;
    const segments = quickActions
      .filter((action) => action.count > 0)
      .map((action) => {
        const start = cursor;
        const pct = (action.count / totalPending) * 100;
        cursor += pct;
        return `${ACCENTS[action.accent].dot} ${start}% ${cursor}%`;
      });
    return `conic-gradient(${segments.join(', ')})`;
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-[#0A1628] to-[#0F172A] p-6 sm:p-8">
        {/* Decorative glow orbs — indigo-leaning to distinguish from the admin view */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-[#00C9A7]/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-300 ring-1 ring-inset ring-indigo-400/20">
              <Crown className="h-3 w-3" />
              Superadmin
            </span>
            <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Full platform overview — including admin account approvals.
            </p>
          </div>

          {!isLoading && !isError && stats && (
            <div className="flex flex-col items-start gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-sm sm:items-end">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                  totalPending > 0 ? 'text-amber-300' : 'text-white'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  {isFetching && (
                    <span
                      className={`absolute inline-flex h-full w-full animate-ping rounded-full ${
                        totalPending > 0 ? 'bg-amber-400' : 'bg-[#00C9A7]'
                      } opacity-75`}
                    />
                  )}
                  <span
                    className={`relative inline-flex h-2 w-2 rounded-full ${
                      totalPending > 0 ? 'bg-amber-400' : 'bg-[#00C9A7]'
                    }`}
                  />
                </span>
                {totalPending > 0 ? `${totalPending} items need attention` : 'All caught up'}
              </span>
              <span className="text-[11px] text-slate-400">
                {dataUpdatedAt ? `Updated ${timeAgo(new Date(dataUpdatedAt).toISOString())}` : 'Live'}
              </span>
            </div>
          )}
        </div>
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

          {/* Bento grid: quick actions + review breakdown */}
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Quick action cards — 4 items now, so 2x2 on desktop within the 2/3 column */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-2">
              {quickActions.map(({ label, description, icon: Icon, to, count, accent }) => {
                const a = ACCENTS[accent];
                const urgent = count > 0;
                return (
                  <button
                    key={to}
                    type="button"
                    onClick={() => navigate(to)}
                    className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm shadow-slate-200/60 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <span
                      className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${urgent ? a.bar : 'from-slate-200 to-slate-200'}`}
                    />
                    <div className="flex items-start justify-between">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${urgent ? a.chip : 'bg-slate-50'}`}>
                        <Icon className={`h-5 w-5 ${urgent ? a.icon : 'text-slate-400'}`} />
                      </div>
                      <span className={`text-3xl font-bold tracking-tight ${urgent ? 'text-[#0F172A]' : 'text-slate-300'}`}>
                        {count}
                      </span>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-[#0F172A]">{label}</p>
                    <p className="text-xs text-slate-400">{description}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-400 transition-colors group-hover:text-[#00A88C]">
                      Review now
                      <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Review breakdown donut */}
            <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm shadow-slate-200/60">
              <h3 className="mb-4 self-start text-sm font-semibold uppercase tracking-wide text-slate-400">
                Review breakdown
              </h3>

              <div
                className="relative flex h-36 w-36 items-center justify-center rounded-full"
                style={{ background: donutGradient ?? '#F1F5F9' }}
              >
                <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-2xl font-bold text-[#0F172A]">{totalPending}</span>
                  <span className="text-[11px] text-slate-400">pending</span>
                </div>
              </div>

              <div className="mt-5 w-full space-y-2">
                {quickActions.map(({ label, count, accent }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-500">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ACCENTS[accent].dot }} />
                      {label}
                    </span>
                    <span className="font-semibold text-[#0F172A]">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default SuperadminDashboardPage;