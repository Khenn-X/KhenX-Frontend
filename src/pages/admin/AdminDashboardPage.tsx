import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Building2, ShieldCheck, Sparkles, DollarSign, ArrowUpRight } from 'lucide-react';
import { useAdminPayments, useAdminStats } from '../../hooks/useAdmin';
import AdminStats from '../../components/admin/AdminStats';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { ROUTES } from '../../constants/routes';
import { timeAgo } from '../../lib/utils';
import HeroPromoCard from '../../components/dashboard/HeroPromoCard';
import BarChartCard from '../../components/dashboard/BarChartCard';
import AreaChartCard from '../../components/dashboard/AreaChartCard';
import ActiveUsersStrip from '../../components/dashboard/ActiveUsersStrip';
import ActivityTimelineCard from '../../components/dashboard/ActivityTimelineCard';

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
  accent: string; // tailwind color token, e.g. 'amber' | 'teal' | 'rose'
};

const ACCENTS: Record<string, { bar: string; chip: string; icon: string; dot: string; ring: string }> = {
  teal: {
    bar: 'from-[#00C9A7] to-[#00E0BA]',
    chip: 'bg-[#00C9A7]/10',
    icon: 'text-[#00A88C]',
    dot: '#00C9A7',
    ring: 'ring-[#00C9A7]/20',
  },
  amber: {
    bar: 'from-amber-400 to-amber-500',
    chip: 'bg-amber-50',
    icon: 'text-amber-600',
    dot: '#F59E0B',
    ring: 'ring-amber-200',
  },
  rose: {
    bar: 'from-rose-400 to-rose-500',
    chip: 'bg-rose-50',
    icon: 'text-rose-600',
    dot: '#F43F5E',
    ring: 'ring-rose-200',
  },
};


const STATE_STYLES: Record<string, string> = {
  successful: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  failed: 'bg-rose-50 text-rose-700',
};

const STATE_DOTS: Record<string, string> = {
  successful: 'bg-emerald-500',
  pending: 'bg-amber-500',
  failed: 'bg-rose-500',
};

function StatusPill({ state }: { state: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATE_STYLES[state] ?? 'bg-slate-100 text-slate-700'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${STATE_DOTS[state] ?? 'bg-slate-400'}`} />
      {state}
    </span>
  );
}
 

const AdminDashboardPage = () => {
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useAdminStats();
  const { data: paymentData } = useAdminPayments();
  const navigate = useNavigate();

  const stats = extractStats(data);
  const paymentTransactions = paymentData?.data?.transactions ?? [];
  const paymentSummary = stats?.payments ?? { total: 0, successful: 0, pending: 0, failed: 0, totalVolume: 0 };

  const quickActions: QuickAction[] = [
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

  // Build a conic-gradient donut from the real pending counts — no invented data.
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A1628] to-[#0F172A] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#00C9A7]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00C9A7]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#00C9A7] ring-1 ring-inset ring-[#00C9A7]/20">
              <Sparkles className="h-3 w-3" />
              Admin
            </span>
            <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Platform overview and pending actions across listings, agents, and fraud reports.
            </p>
          </div>

          {!isLoading && !isError && stats && (
            <div className="flex flex-col items-start gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-sm sm:items-end">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${totalPending > 0 ? 'text-amber-300' : 'text-white'
                  }`}
              >
                <span className="relative flex h-2 w-2">
                  {isFetching && (
                    <span
                      className={`absolute inline-flex h-full w-full animate-ping rounded-full ${totalPending > 0 ? 'bg-amber-400' : 'bg-[#00C9A7]'
                        } opacity-75`}
                    />
                  )}
                  <span
                    className={`relative inline-flex h-2 w-2 rounded-full ${totalPending > 0 ? 'bg-amber-400' : 'bg-[#00C9A7]'
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
          {/* ── Platform overview + quick actions/donut (existing, kept first) ── */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Platform overview
            </h2>
            <AdminStats
              stats={stats}
              onPaymentClick={() => navigate(ROUTES.ADMIN_PAYMENTS)}
            />
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Payment volume</span>
                <span className="rounded-full bg-[#00C9A7]/10 p-2 text-[#00A88C]"><DollarSign className="h-4 w-4" /></span>
              </div>
              <p className="mt-4 text-2xl font-bold text-[#0F172A]">₦{((paymentSummary.totalVolume ?? 0) / 100).toLocaleString()}</p>
              <p className="mt-1 text-xs text-slate-500">Successful collection total</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Successful</span>
                <span className="rounded-full bg-emerald-50 p-2 text-emerald-600"><ArrowUpRight className="h-4 w-4" /></span>
              </div>
              <p className="mt-4 text-2xl font-bold text-[#0F172A]">{paymentSummary.successful ?? 0}</p>
              <p className="mt-1 text-xs text-slate-500">Approved payments</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pending</span>
                <span className="rounded-full bg-amber-50 p-2 text-amber-600"><ShieldCheck className="h-4 w-4" /></span>
              </div>
              <p className="mt-4 text-2xl font-bold text-[#0F172A]">{paymentSummary.pending ?? 0}</p>
              <p className="mt-1 text-xs text-slate-500">Awaiting webhook or completion</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Failed</span>
                <span className="rounded-full bg-rose-50 p-2 text-rose-600"><AlertTriangle className="h-4 w-4" /></span>
              </div>
              <p className="mt-4 text-2xl font-bold text-[#0F172A]">{paymentSummary.failed ?? 0}</p>
              <p className="mt-1 text-xs text-slate-500">Rejected or failed checks</p>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-2">
              {quickActions.map(({ label, description, icon: Icon, to, count, accent }) => {
                const a = ACCENTS[accent];
                const urgent = count > 0;
                return (
                  <button
                    key={to}
                    type="button"
                    onClick={() => navigate(to)}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm shadow-slate-200/60 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <span
                      className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${urgent ? a.bar : 'from-slate-200 to-slate-200'}`}
                    />
                    <div className="flex items-start justify-between">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${urgent ? a.chip : 'bg-slate-50'}`}>
                        <Icon className={`h-4 w-4 ${urgent ? a.icon : 'text-slate-400'}`} />
                      </div>
                      <span className={`text-2xl font-bold tracking-tight ${urgent ? 'text-[#0F172A]' : 'text-slate-300'}`}>
                        {count}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-[#0F172A]">{label}</p>
                    <p className="text-xs text-slate-400">{description}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-400 transition-colors group-hover:text-[#00A88C]">
                      Review now
                      <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm shadow-slate-200/60">
              <h3 className="mb-3 self-start text-sm font-semibold uppercase tracking-wide text-slate-400">
                Review breakdown
              </h3>

              <div
                className="relative flex h-28 w-28 items-center justify-center rounded-full"
                style={{ background: donutGradient ?? '#F1F5F9' }}
              >
                <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-xl font-bold text-[#0F172A]">{totalPending}</span>
                  <span className="text-[10px] text-slate-400">pending</span>
                </div>
              </div>

              <div className="mt-4 w-full space-y-1.5">
                {quickActions.map(({ label, count, accent }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-500">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: ACCENTS[accent].dot }}
                      />
                      {label}
                    </span>
                    <span className="font-semibold text-[#0F172A]">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── NEW: hero promo cards ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <HeroPromoCard
              eyebrow="Platform health"
              title="KhenX Admin Console"
              description="Full visibility across listings, agents, and fraud reports in one place."
              variant="light"
            />
            <HeroPromoCard
              eyebrow="Admin"
              title="Review Queue"
              description="Stay on top of listings, KYC, and fraud reports as they come in."
              variant="dark"
            />
          </div>

          {/* ── NEW: charts ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <BarChartCard />
            <AreaChartCard />
          </div>

          {/* ── NEW: active users strip ── */}
          <ActiveUsersStrip />

          {/* ── Recent payments + activity ── */}
          {/* ── Recent payments + activity ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00C9A7]/10 text-[#00A88C]">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-[#0F172A]">Recent payments</h3>
                    <p className="text-xs text-slate-400">Paystack webhook audit log · read-only</p>
                  </div>
                </div>
                {paymentTransactions.length > 0 && (
                  <span className="hidden sm:inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                    {paymentTransactions.length} recent
                  </span>
                )}
              </div>

              {paymentTransactions.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <DollarSign className="mx-auto h-8 w-8 text-slate-200" />
                  <p className="mt-3 text-sm text-slate-500">No payment transactions yet.</p>
                </div>
              ) : (
                <>
                  {/* Desktop / tablet: table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50/80">
                        <tr>
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Reference</th>
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Payer</th>
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Plan</th>
                          <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">Amount</th>
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">State</th>
                          <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">Updated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paymentTransactions.map((tx) => (
                          <tr key={tx._id} className="transition-colors hover:bg-slate-50/60">
                            <td className="px-5 py-3.5">
                              <span className="font-mono text-xs text-slate-600">{tx.paymentReference}</span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-600">{tx.payerEmail}</td>
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                {tx.subscriptionType}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right font-semibold text-[#0F172A]">
                              ₦{(tx.amount / 100).toLocaleString()}
                            </td>
                            <td className="px-5 py-3.5">
                              <StatusPill state={tx.state} />
                            </td>
                            <td className="px-5 py-3.5 text-right text-xs text-slate-400">
                              {new Date(tx.updatedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile: stacked cards */}
                  <div className="sm:hidden divide-y divide-slate-100">
                    {paymentTransactions.map((tx) => (
                      <div key={tx._id} className="px-5 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-700">{tx.payerEmail}</p>
                            <p className="mt-0.5 font-mono text-xs text-slate-400">{tx.paymentReference}</p>
                          </div>
                          <span className="shrink-0 font-semibold text-[#0F172A]">
                            ₦{(tx.amount / 100).toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            {tx.subscriptionType}
                          </span>
                          <StatusPill state={tx.state} />
                        </div>
                        <p className="mt-2 text-[11px] text-slate-400">
                          {new Date(tx.updatedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <ActivityTimelineCard />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;