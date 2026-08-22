import { useMemo, useState, useCallback } from 'react';
import { ArrowUpRight, CircleDollarSign, Filter, ShieldCheck, Wallet, ChevronUp, ChevronDown, RefreshCw, RotateCcw } from 'lucide-react';
import { useAdminPayments, useAdminStats } from '../../hooks/useAdmin';
import PaymentTransactionDetailModal from '../../components/admin/PaymentTransactionDetailModal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import Pagination from '../../components/shared/Pagination';
import type { PaymentTransaction } from '../../api/admin.api';

function extractStats(data: unknown): Record<string, any> | null {
  if (!data || typeof data !== 'object') return null;
  const outer = data as Record<string, any>;
  const candidate = outer.data ?? outer;
  return candidate && typeof candidate === 'object' && 'listings' in candidate ? candidate : null;
}

const currencyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 0,
});

const formatSubscriptionType = (type: string) => {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const PayerTypeIcon = ({ type }: { type: string }) => {
  const colors: Record<string, { bg: string; text: string; icon: string }> = {
    agent: { bg: 'bg-blue-50', text: 'text-blue-700', icon: '👤' },
    landlord: { bg: 'bg-purple-50', text: 'text-purple-700', icon: '🏠' },
    user: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: '👥' },
  };

  const color = colors[type] || colors.user;

  return (
    <div className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-semibold ${color.bg} ${color.text}`}>
      <span>{color.icon}</span>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </div>
  );
};

type SortField = 'createdAt' | 'updatedAt' | 'amount' | 'state';
type SortDirection = 'asc' | 'desc';

// State tab config: value, label, and the color classes used both for the
// active-tab pill and (for consistency) the badge shown in the table's State column.
const STATE_TABS: { value: string; label: string; activeClasses: string }[] = [
  { value: 'all', label: 'All', activeClasses: 'bg-slate-800 text-white' },
  { value: 'pending', label: 'Pending', activeClasses: 'bg-amber-500 text-white' },
  { value: 'successful', label: 'Successful', activeClasses: 'bg-emerald-500 text-white' },
  { value: 'failed', label: 'Failed', activeClasses: 'bg-rose-500 text-white' },
  { value: 'abandoned', label: 'Abandoned', activeClasses: 'bg-slate-500 text-white' },
  { value: 'reversed', label: 'Reversed', activeClasses: 'bg-orange-500 text-white' },
  { value: 'refunded', label: 'Refunded', activeClasses: 'bg-sky-500 text-white' },
];

const AdminPaymentsPage = () => {
  const {
    data: statsData,
    isLoading: isStatsLoading,
    isFetching: isStatsFetching,
    isError: isStatsError,
    refetch: refetchStats,
  } = useAdminStats();
  const {
    data: paymentsData,
    isLoading: isPaymentsLoading,
    isFetching: isPaymentsFetching,
    isError: isPaymentsError,
    refetch: refetchPayments,
  } = useAdminPayments();

  // Filter state
  const [filterState, setFilterState] = useState<string>('all');
  const [filterSubscriptionType, setFilterSubscriptionType] = useState<string>('all');
  const [filterPayerType, setFilterPayerType] = useState<string>('all');
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter panel UI state (secondary filters only — state now has its own tabs)
  const [showFilters, setShowFilters] = useState(false);

  // Detail modal state
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const stats = extractStats(statsData);
  const allTransactions = paymentsData?.data?.transactions ?? [];

  // Counts per state, computed from the FULL unfiltered list so tab counts
  // don't shift as other filters change.
  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allTransactions.length };
    for (const tab of STATE_TABS) {
      if (tab.value === 'all') continue;
      counts[tab.value] = allTransactions.filter((tx) => tx.state === tab.value).length;
    }
    return counts;
  }, [allTransactions]);

  // Apply all filters
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      // State filter (now driven by the quick-filter tabs)
      if (filterState !== 'all' && tx.state !== filterState) return false;

      // Subscription type filter
      if (filterSubscriptionType !== 'all' && tx.subscriptionType !== filterSubscriptionType) return false;

      // Payer type filter
      if (filterPayerType !== 'all' && tx.payerType !== filterPayerType) return false;

      // Search filter (email or reference)
      if (filterSearch.trim()) {
        const searchLower = filterSearch.toLowerCase();
        if (
          !tx.payerEmail.toLowerCase().includes(searchLower) &&
          !tx.paymentReference.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Date range filter
      const txDate = new Date(tx.updatedAt).getTime();
      if (filterDateFrom) {
        const fromDate = new Date(filterDateFrom).getTime();
        if (txDate < fromDate) return false;
      }
      if (filterDateTo) {
        const toDate = new Date(filterDateTo);
        toDate.setHours(23, 59, 59, 999);
        if (txDate > toDate.getTime()) return false;
      }

      return true;
    });
  }, [allTransactions, filterState, filterSubscriptionType, filterPayerType, filterSearch, filterDateFrom, filterDateTo]);

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    const sorted = [...filteredTransactions].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'amount') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      } else if (sortField === 'updatedAt' || sortField === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredTransactions, sortField, sortDirection]);

  // Paginate
  const totalPages = Math.ceil(sortedTransactions.length / pageSize);
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Calculate filtered summary stats
  const filteredSummary = useMemo(() => {
    const successful = filteredTransactions.filter((tx) => tx.state === 'successful').length;
    const pending = filteredTransactions.filter((tx) => tx.state === 'pending').length;
    const failed = filteredTransactions.filter((tx) => tx.state === 'failed').length;
    const totalVolume = filteredTransactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    return { successful, pending, failed, totalVolume };
  }, [filteredTransactions]);

  // Active filter count now excludes state, since state has its own always-visible tabs
  const activeFilterCount = [
    filterSubscriptionType !== 'all' ? 1 : 0,
    filterPayerType !== 'all' ? 1 : 0,
    filterSearch ? 1 : 0,
    filterDateFrom ? 1 : 0,
    filterDateTo ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const resetFilters = () => {
    setFilterState('all');
    setFilterSubscriptionType('all');
    setFilterPayerType('all');
    setFilterSearch('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setCurrentPage(1);
  };

  const handleStateTabClick = (value: string) => {
    setFilterState(value);
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => {
    const isActive = sortField === field;
    return (
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-1.5 font-medium text-slate-700 hover:text-[#0F172A] transition-colors group"
      >
        {label}
        <span className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
          {sortDirection === 'asc' ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </span>
      </button>
    );
  };

  const openDetail = useCallback((tx: PaymentTransaction) => {
    setSelectedTransaction(tx);
    setIsDetailOpen(true);
  }, []);

  if (isStatsLoading || isPaymentsLoading) {
    return <LoadingSpinner label="Loading payment activity..." />;
  }

  if (isStatsError || isPaymentsError) {
    return (
      <ErrorMessage
        message="Couldn’t load payment activity."
        onRetry={() => {
          refetchStats();
          refetchPayments();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00C9A7]">Payments</p>
          <h1 className="mt-2 text-2xl font-bold text-[#0F172A]">Transaction overview</h1>
          <p className="mt-1 text-sm text-slate-500">Read-only audit trail for listing and AI subscription charges from Paystack.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              void Promise.all([refetchStats(), refetchPayments()]);
            }}
            disabled={isStatsFetching || isPaymentsFetching}
            title="Refresh payment data"
            aria-label="Refresh payment data"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-[#00A88C] disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${isStatsFetching || isPaymentsFetching ? 'animate-spin' : ''}`}
            />
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Filter className="h-4 w-4 text-slate-400" />
            {filteredTransactions.length} transactions
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-[#00C9A7] px-2 py-0.5 text-[10px] font-bold text-[#0A1628]">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Quick-filter state tabs — always visible, no need to open the filter panel */}
      <div className="flex flex-wrap gap-2">
        {STATE_TABS.map((tab) => {
          const isActive = filterState === tab.value;
          const count = stateCounts[tab.value] ?? 0;
          return (
            <button
              key={tab.value}
              onClick={() => handleStateTabClick(tab.value)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? tab.activeClasses
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter panel — secondary filters only (state is handled by the tabs above) */}
      {showFilters && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Subscription type filter */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Subscription type</label>
              <select
                value={filterSubscriptionType}
                onChange={(e) => {
                  setFilterSubscriptionType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#00C9A7] focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20"
              >
                <option value="all">All types</option>
                <option value="agent_listing">Agent Listing</option>
                <option value="landlord_listing">Landlord Listing</option>
                <option value="agent_ai_usage">Agent AI Usage</option>
                <option value="user_ai_usage">User AI Usage</option>
              </select>
            </div>

            {/* Payer type filter */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Payer type</label>
              <select
                value={filterPayerType}
                onChange={(e) => {
                  setFilterPayerType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#00C9A7] focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20"
              >
                <option value="all">All payers</option>
                <option value="agent">Agent</option>
                <option value="landlord">Landlord</option>
                <option value="user">User</option>
              </select>
            </div>

            {/* Date from */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">From date</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => {
                  setFilterDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#00C9A7] focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20"
              />
            </div>

            {/* Date to */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">To date</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => {
                  setFilterDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#00C9A7] focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20"
              />
            </div>

            {/* Search */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Search</label>
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => {
                  setFilterSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Email or reference..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#00C9A7] focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20 placeholder:text-slate-400"
              />
            </div>
          </div>

          {(activeFilterCount > 0 || filterState !== 'all') && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Reset filters
            </button>
          )}
        </div>
      )}

      {/* Summary cards (showing filtered data) */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Volume</span>
            <span className="rounded-full bg-[#00C9A7]/10 p-2 text-[#00A88C]"><Wallet className="h-4 w-4" /></span>
          </div>
          <p className="mt-4 text-2xl font-bold text-[#0F172A]">{currencyFormatter.format((filteredSummary.totalVolume ?? 0) / 100)}</p>
          <p className="mt-1 text-xs text-slate-500">
            {activeFilterCount > 0 || filterState !== 'all' ? 'Filtered total' : 'Total volume of all transactions'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Successful</span>
            <span className="rounded-full bg-emerald-50 p-2 text-emerald-600"><ArrowUpRight className="h-4 w-4" /></span>
          </div>
          <p className="mt-4 text-2xl font-bold text-[#0F172A]">{filteredSummary.successful ?? 0}</p>
          <p className="mt-1 text-xs text-slate-500">Approved payments</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pending</span>
            <span className="rounded-full bg-amber-50 p-2 text-amber-600"><ShieldCheck className="h-4 w-4" /></span>
          </div>
          <p className="mt-4 text-2xl font-bold text-[#0F172A]">{filteredSummary.pending ?? 0}</p>
          <p className="mt-1 text-xs text-slate-500">Awaiting completion</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Failed</span>
            <span className="rounded-full bg-rose-50 p-2 text-rose-600"><CircleDollarSign className="h-4 w-4" /></span>
          </div>
          <p className="mt-4 text-2xl font-bold text-[#0F172A]">{filteredSummary.failed ?? 0}</p>
          <p className="mt-1 text-xs text-slate-500">Rejected or failed checks</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Recent transactions</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3"><SortHeader field="createdAt" label="Reference" /></th>
                <th className="px-5 py-3 font-medium">Payer</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3"><SortHeader field="amount" label="Amount" /></th>
                <th className="px-5 py-3 font-medium">State</th>
                <th className="px-5 py-3"><SortHeader field="updatedAt" label="Updated" /></th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    {filteredTransactions.length === 0 ? 'No transactions match your filters.' : 'No transactions found.'}
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => (
                  <tr
                    key={tx._id}
                    onClick={() => openDetail(tx)}
                    className="border-t border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-slate-700">{tx.paymentReference}</td>
                    <td className="px-5 py-3">
                      <div className="space-y-1">
                        <PayerTypeIcon type={tx.payerType} />
                        <p className="text-xs text-slate-500">{tx.payerEmail}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600 text-xs">{formatSubscriptionType(tx.subscriptionType)}</td>
                    <td className="px-5 py-3 text-slate-700 font-semibold">
                      {currencyFormatter.format(tx.amount / 100)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          tx.state === 'successful'
                            ? 'bg-emerald-50 text-emerald-700'
                            : tx.state === 'pending'
                              ? 'bg-amber-50 text-amber-700'
                              : tx.state === 'failed'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {tx.state}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{new Date(tx.updatedAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-slate-200 px-5 py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </section>

      {/* Detail modal */}
      <PaymentTransactionDetailModal
        transaction={selectedTransaction}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onRefresh={() => {
          refetchStats();
          refetchPayments();
          setIsDetailOpen(false);
        }}
      />
    </div>
  );
};

export default AdminPaymentsPage;