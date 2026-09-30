import { useState } from 'react';
import { BarChart3, CalendarDays, RefreshCw } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAdminPaymentAnalytics } from '../../hooks/useAdmin';
import type { PaymentAnalyticsPeriod } from '../../api/admin.api';

const money = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });
const periods: Array<{ value: PaymentAnalyticsPeriod; label: string }> = [
  { value: 'day', label: 'Daily' }, { value: 'week', label: 'Weekly' }, { value: 'month', label: 'Monthly' }, { value: 'year', label: 'Yearly' },
];

const RevenueInsights = ({ subscriptionType, payerType }: { subscriptionType: string; payerType: string }) => {
  const [period, setPeriod] = useState<PaymentAnalyticsPeriod>('month');
  const [preset, setPreset] = useState('default');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const params = { period, ...(from ? { from } : {}), ...(to ? { to: `${to}T23:59:59.999Z` } : {}), ...(subscriptionType !== 'all' ? { subscriptionType } : {}), ...(payerType !== 'all' ? { payerType } : {}) };
  const query = useAdminPaymentAnalytics(params);
  const analytics = query.data?.data;
  const applyPreset = (value: string) => {
    setPreset(value);
    if (value === 'default') { setFrom(''); setTo(''); return; }
    const end = new Date();
    const start = new Date(end);
    if (value === '7d') start.setDate(start.getDate() - 7);
    if (value === '30d') start.setDate(start.getDate() - 30);
    if (value === 'year') start.setFullYear(start.getFullYear() - 1);
    setFrom(start.toISOString().slice(0, 10));
    setTo(end.toISOString().slice(0, 10));
  };

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="revenue-insights-heading">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div><div className="flex items-center gap-2 text-[#00A88C]"><BarChart3 className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wide">Revenue insights</span></div><h2 id="revenue-insights-heading" className="mt-1 text-lg font-semibold text-[#0F172A]">Successful payments</h2><p className="text-xs text-slate-500">NGN revenue grouped by Paystack paid time in Africa/Lagos.</p></div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Revenue period">
          {periods.map((item) => <button key={item.value} type="button" onClick={() => setPeriod(item.value)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${period === item.value ? 'bg-[#006A61] text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{item.label}</button>)}
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-3 border-y border-slate-100 py-3">
        <label className="text-xs text-slate-500">Range<select value={preset} onChange={(event) => applyPreset(event.target.value)} className="ml-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700"><option value="default">Default for period</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="year">Last year</option></select></label>
        <label className="text-xs text-slate-500"><CalendarDays className="mr-1 inline h-3.5 w-3.5" />From<input aria-label="Revenue from date" type="date" value={from} onChange={(event) => { setPreset('custom'); setFrom(event.target.value); }} className="ml-2 rounded-lg border border-slate-200 px-2 py-1.5 text-xs" /></label>
        <label className="text-xs text-slate-500">To<input aria-label="Revenue to date" type="date" value={to} onChange={(event) => { setPreset('custom'); setTo(event.target.value); }} className="ml-2 rounded-lg border border-slate-200 px-2 py-1.5 text-xs" /></label>
        {query.isFetching && <RefreshCw className="h-4 w-4 animate-spin text-[#00A88C]" aria-label="Refreshing revenue insights" />}
      </div>
      {query.isLoading ? <div className="grid h-56 place-items-center rounded-xl bg-slate-50 text-sm text-slate-400">Loading revenue insights...</div> : query.isError ? <div className="rounded-xl border border-rose-100 bg-rose-50 p-5 text-sm text-rose-700">Could not load revenue insights. <button type="button" onClick={() => void query.refetch()} className="font-semibold underline">Retry</button></div> : analytics ? <>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Metric label="Successful revenue" value={money.format(analytics.selectedPeriod.successfulRevenue / 100)} /><Metric label="Successful payments" value={analytics.selectedPeriod.successfulCount.toLocaleString()} /><Metric label="Average payment" value={money.format(analytics.selectedPeriod.averageSuccessfulPayment / 100)} /><Metric label="Vs previous range" value={analytics.selectedPeriod.comparisonPercent === null ? 'No prior data' : `${analytics.selectedPeriod.comparisonPercent >= 0 ? '+' : ''}${analytics.selectedPeriod.comparisonPercent.toFixed(1)}%`} /></div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]"><div className="min-w-0"><div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Revenue by {period}</div><div className="h-64 min-w-0"><ResponsiveContainer width="100%" height="100%"><BarChart data={analytics.buckets} accessibilityLayer><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" hide={analytics.buckets.length > 18} /><YAxis tickFormatter={(value) => `₦${Math.round(value / 100).toLocaleString()}`} width={70} /><Tooltip formatter={(value: number) => money.format(value / 100)} /><Bar dataKey="successfulRevenue" fill="#006A61" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div><p className="sr-only">Revenue chart with {analytics.buckets.length} buckets. Total successful revenue is {money.format(analytics.selectedPeriod.successfulRevenue / 100)}.</p></div><div className="space-y-3"><Quick label="Today" data={analytics.quickTotals.today} /><Quick label="This week" data={analytics.quickTotals.week} /><Quick label="This month" data={analytics.quickTotals.month} /><Quick label="This year" data={analytics.quickTotals.year} /></div></div>
        <div className="grid gap-4 md:grid-cols-2"><Breakdown title="By transaction type" items={analytics.bySubscriptionType} /><Breakdown title="By payer role" items={analytics.byPayerType} /></div>
        {(analytics.selectedPeriod.refundedAmount > 0 || analytics.selectedPeriod.reversedAmount > 0) && <p className="text-xs text-slate-500">Informational adjustments: refunded {money.format(analytics.selectedPeriod.refundedAmount / 100)}, reversed {money.format(analytics.selectedPeriod.reversedAmount / 100)}. These are not deducted from successful revenue.</p>}
      </> : <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">No successful payments in this period.</div>}
    </section>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => <div className="rounded-xl bg-slate-50 p-3"><div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</div><div className="mt-2 text-lg font-bold text-[#0F172A]">{value}</div></div>;
const Quick = ({ label, data }: { label: string; data?: { successfulRevenue: number; successfulCount: number } }) => <div className="rounded-xl border border-slate-100 p-3"><div className="text-xs font-semibold text-slate-500">{label}</div><div className="mt-1 font-bold text-[#0F172A]">{money.format((data?.successfulRevenue ?? 0) / 100)}</div><div className="text-[11px] text-slate-400">{data?.successfulCount ?? 0} successful payments</div></div>;
const Breakdown = ({ title, items }: { title: string; items: Array<{ _id: string; revenue: number; count: number }> }) => <div className="rounded-xl border border-slate-100 p-4"><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h3><div className="mt-3 space-y-2">{items.length === 0 ? <p className="text-sm text-slate-400">No successful payments in this period.</p> : items.map((item) => <div key={item._id} className="flex items-center justify-between gap-3 text-sm"><span className="truncate capitalize text-slate-600">{item._id.replace(/_/g, ' ')}</span><span className="shrink-0 font-semibold text-slate-800">{money.format(item.revenue / 100)} <span className="font-normal text-slate-400">({item.count})</span></span></div>)}</div></div>;

export default RevenueInsights;