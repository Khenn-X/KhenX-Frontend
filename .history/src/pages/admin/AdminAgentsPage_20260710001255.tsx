import { useMemo, useState } from 'react';
import { Search, ShieldAlert, Users } from 'lucide-react';
import { useAdminAgents } from '../../hooks/useAdmin';
import type { AdminAgentEntry } from '../../api/admin.api';
import AgentSuspendModal from '../../components/admin/AgentSuspendModal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import EmptyState from '../../components/shared/EmptyState';
import { cn, getInitials, timeAgo } from '../../lib/utils';

type KycFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'suspended';

const kycBadgeClasses: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  approved: 'bg-[#00C9A7]/10 text-[#00A88C] ring-1 ring-inset ring-[#00C9A7]/20',
  rejected: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
  suspended: 'bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200',
};

const KYC_FILTERS: { value: KycFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
];

const AdminAgentsPage = () => {
  const { data, isLoading, isError, refetch } = useAdminAgents();
  const agents = data?.data.agents ?? [];

  const [suspendTarget, setSuspendTarget] = useState<AdminAgentEntry | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<KycFilter>('all');

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: agents.length };
    for (const { agent } of agents) {
      counts[agent.kycStatus] = (counts[agent.kycStatus] ?? 0) + 1;
    }
    return counts;
  }, [agents]);

  const visibleAgents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return agents.filter(({ agent, user }) => {
      const matchesStatus = statusFilter === 'all' || agent.kycStatus === statusFilter;
      if (!matchesStatus) return false;
      if (!term) return true;

      const haystack = [user.fullName, user.email, agent.businessName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [agents, search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-[#0A1628] to-[#0F172A] p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00C9A7]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#00C9A7]">
            Admin
          </span>
          <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Agents</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            All registered agents and their verification status.
          </p>
        </div>
        {agents.length > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/15">
            {agents.length} total
          </span>
        )}
      </div>

      {isLoading && <LoadingSpinner label="Loading agents..." />}
      {isError && <ErrorMessage onRetry={refetch} />}

      {!isLoading && !isError && agents.length === 0 && (
        <EmptyState
          icon={Users}
          title="No agents yet"
          description="Agents will appear here once they register."
        />
      )}

      {!isLoading && !isError && agents.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
          {/* Toolbar */}
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing <span className="font-semibold text-[#0F172A]">{visibleAgents.length}</span> of{' '}
                <span className="font-semibold text-[#0F172A]">{agents.length}</span> agents
              </p>
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, or business"
                  className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none transition-colors focus:border-[#00C9A7] focus:bg-white focus:ring-2 focus:ring-[#00C9A7]/20"
                />
              </div>
            </div>

            {/* Status filter tabs */}
            <div className="flex flex-wrap gap-2">
              {KYC_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
                    statusFilter === filter.value
                      ? 'bg-[#0A1628] text-white'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100',
                  )}
                >
                  {filter.label}
                  {statusCounts[filter.value] != null && (
                    <span
                      className={cn(
                        'rounded-full px-1.5 text-[10px] font-bold',
                        statusFilter === filter.value ? 'bg-white/15 text-white' : 'bg-slate-200 text-slate-500',
                      )}
                    >
                      {statusCounts[filter.value]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-6 py-3">Agent</th>
                  <th className="px-6 py-3">KYC Status</th>
                  <th className="px-6 py-3">Listings</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleAgents.map(({ agent, user, listingCount }) => (
                  <tr key={agent._id} className="group transition-colors hover:bg-slate-50/80">
                    {/* Agent info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0A1628] text-xs font-bold text-[#00C9A7]">
                          {getInitials(user.fullName)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-[#0F172A]">{user.fullName}</p>
                          <p className="truncate text-xs text-slate-400">{user.email}</p>
                          {agent.businessName && (
                            <p className="truncate text-xs text-slate-400">{agent.businessName}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* KYC status */}
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize',
                          kycBadgeClasses[agent.kycStatus] ?? 'bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200',
                        )}
                      >
                        {agent.kycStatus}
                      </span>
                      {agent.kycRejectionReason && (
                        <p
                          className="mt-1 max-w-[180px] truncate text-xs text-rose-400"
                          title={agent.kycRejectionReason}
                        >
                          {agent.kycRejectionReason}
                        </p>
                      )}
                    </td>

                    {/* Listing count */}
                    <td className="px-6 py-4 text-slate-600">{listingCount}</td>

                    {/* Joined */}
                    <td className="px-6 py-4 text-xs text-slate-400">{timeAgo(user.createdAt)}</td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      {agent.kycStatus !== 'suspended' ? (
                        <button
                          type="button"
                          onClick={() => setSuspendTarget({ agent, user, listingCount })}
                          className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:border-rose-300 hover:bg-rose-100"
                        >
                          <ShieldAlert className="h-3 w-3" />
                          Suspend
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Suspended</span>
                      )}
                    </td>
                  </tr>
                ))}
                {visibleAgents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Search className="h-9 w-9" strokeWidth={1.5} />
                        <p className="text-sm">No agents match your search or filter.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Suspend modal */}
      {suspendTarget && (
        <AgentSuspendModal
          agentId={suspendTarget.agent._id}
          agentName={suspendTarget.user.fullName}
          isOpen={!!suspendTarget}
          onClose={() => setSuspendTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminAgentsPage;