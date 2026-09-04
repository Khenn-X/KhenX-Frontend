import { useState } from 'react';
import { ChevronDown, ChevronUp, CreditCard, Receipt } from 'lucide-react';
import { usePaymentHistory } from '../../hooks/usePayments';
import type { PaymentState, PaymentHistoryTransaction } from '../../api/payments.api';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import EmptyState from '../shared/EmptyState';
import Pagination from '../shared/Pagination';
import { cn } from '../../lib/utils';

const STATES: Array<{ label: string; value?: PaymentState }> = [
  { label: 'All' },
  { label: 'Successful', value: 'successful' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
  { label: 'Abandoned', value: 'abandoned' },
  { label: 'Reversed', value: 'reversed' },
  { label: 'Refunded', value: 'refunded' },
];

const stateClasses: Record<string, string> = {
  successful: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
  pending: 'bg-amber-100 text-amber-700',
  abandoned: 'bg-slate-100 text-slate-600',
  reversed: 'bg-orange-100 text-orange-700',
  refunded: 'bg-blue-100 text-blue-700',
};

const formatLabel = (value: string) => value.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
const formatAmount = (transaction: PaymentHistoryTransaction) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: transaction.currency, minimumFractionDigits: 0 })
    .format(transaction.amount / 100);

const failureReason = (transaction: PaymentHistoryTransaction) =>
  [...(transaction.stateHistory ?? [])].reverse().find((change) => change.state === 'failed')?.reason;

const PaymentHistoryList = () => {
  const [activeState, setActiveState] = useState<PaymentState | undefined>();
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data, isLoading, isError, error, refetch } = usePaymentHistory({
    page,
    limit: 10,
    state: activeState,
  });

  const transactions = data?.data?.transactions ?? [];
  const totalPages = data?.data?.pages ?? 0;

  const changeState = (state: PaymentState | undefined) => {
    setActiveState(state);
    setPage(1);
    setExpandedId(null);
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 w-fit">
        {STATES.map((tab) => (
          <button
            key={tab.label}
            onClick={() => changeState(tab.value)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              activeState === tab.value ? 'bg-white text-[#0F172A] shadow-sm' : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? <LoadingSpinner label="Loading payment history..." /> : isError ? (
        <ErrorMessage message={error?.message} onRetry={refetch} />
      ) : transactions.length === 0 ? (
        <EmptyState icon={Receipt} title="No payment history yet" description="Payments made through KhenX will appear here." />
      ) : (
        <>
          <div className="space-y-3">
            {transactions.map((transaction) => {
              const expanded = expandedId === transaction._id;
              const reason = failureReason(transaction);
              return (
                <div key={transaction._id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <button
                    className="flex w-full items-center gap-3 px-4 py-4 text-left sm:px-5"
                    onClick={() => setExpandedId(expanded ? null : transaction._id)}
                    aria-expanded={expanded}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#0F172A]">{formatLabel(transaction.subscriptionType)}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{new Date(transaction.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#0F172A]">{formatAmount(transaction)}</p>
                      <span className={cn('mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium', stateClasses[transaction.state] ?? stateClasses.pending)}>
                        {formatLabel(transaction.state)}
                      </span>
                    </div>
                    {expanded ? <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" /> : <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />}
                  </button>
                  {expanded && (
                    <div className="border-t border-slate-100 bg-slate-50 px-4 py-4 sm:px-5">
                      <div className="grid gap-3 text-sm sm:grid-cols-2">
                        <p><span className="text-slate-400">Reference:</span> <span className="break-all font-mono text-xs text-slate-700">{transaction.paymentReference}</span></p>
                        <p><span className="text-slate-400">Channel:</span> <span className="text-slate-700">{transaction.channel ? formatLabel(transaction.channel) : '—'}</span></p>
                        <p><span className="text-slate-400">Plan:</span> <span className="text-slate-700">{transaction.plan}</span></p>
                        <p><span className="text-slate-400">Amount:</span> <span className="text-slate-700">{formatAmount(transaction)} ({transaction.currency})</span></p>
                        {reason && <p className="sm:col-span-2"><span className="text-slate-400">Failure reason:</span> <span className="text-red-700">{reason}</span></p>}
                      </div>
                      <div className="mt-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">State history</p>
                        <div className="space-y-2 border-l-2 border-slate-200 pl-3">
                          {(transaction.stateHistory ?? []).map((change, index) => (
                            <div key={`${change.changedAt}-${index}`} className="text-xs">
                              <p className="font-medium text-slate-700">{formatLabel(change.state)}</p>
                              <p className="text-slate-400">{new Date(change.changedAt).toLocaleString()}{change.reason ? ` · ${change.reason}` : ''}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(nextPage) => { setPage(nextPage); setExpandedId(null); }} className="mt-6" />
        </>
      )}
    </div>
  );
};

export default PaymentHistoryList;