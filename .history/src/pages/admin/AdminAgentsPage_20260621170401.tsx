import { useState } from 'react';
import { Users, ShieldAlert } from 'lucide-react';
import { useAdminAgents } from '../../hooks/useAdmin';
import type { AdminAgentEntry } from '../../api/admin.api';
import AgentSuspendModal from '../../components/admin/AgentSuspendModal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import EmptyState from '../../components/shared/EmptyState';
import { cn, getInitials, timeAgo } from '../../lib/utils';

const kycColors: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  approved:  'bg-[#00C9A7]/10 text-[#00C9A7]',
  rejected:  'bg-red-100 text-red-600',
  suspended: 'bg-slate-100 text-slate-500',
};

const AdminAgentsPage = () => {
  const { data, isLoading, isError, refetch } = useAdminAgents();
  const agents = data?.data.agents ?? [];

  const [suspendTarget, setSuspendTarget] = useState<AdminAgentEntry | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Agents</h1>
        <p className="mt-1 text-sm text-slate-500">
          All registered agents and their verification status.
        </p>
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

      {agents.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Agent</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">KYC Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Listings</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agents.map(({ agent, user, listingCount }) => (
                <tr key={agent._id} className="hover:bg-slate-50 transition-colors">
                  {/* Agent info */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {/* <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0A1628] text-xs font-bold text-[#00C9A7]">
                        {getInitials(user.fullName)}
                      </div> */}
                      <div className="min-w-0">
                        <p className="font-medium text-[#0F172A] truncate">{user.fullName}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        {agent.businessName && (
                          <p className="text-xs text-slate-400 truncate">{agent.businessName}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* KYC status */}
                  <td className="px-5 py-4">
                    <span className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                      kycColors[agent.kycStatus] ?? 'bg-slate-100 text-slate-500'
                    )}>
                      {agent.kycStatus}
                    </span>
                    {agent.kycRejectionReason && (
                      <p className="mt-1 text-xs text-red-400 max-w-[160px] truncate" title={agent.kycRejectionReason}>
                        {agent.kycRejectionReason}
                      </p>
                    )}
                  </td>

                  {/* Listing count */}
                  <td className="px-5 py-4 text-slate-600">{listingCount}</td>

                  {/* Joined */}
                  <td className="px-5 py-4 text-slate-400 text-xs">{timeAgo(user.createdAt)}</td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    {agent.kycStatus !== 'suspended' && (
                      <button
                        onClick={() => setSuspendTarget({ agent, user, listingCount })}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <ShieldAlert className="h-3 w-3" />
                        Suspend
                      </button>
                    )}
                    {agent.kycStatus === 'suspended' && (
                      <span className="text-xs text-slate-400">Suspended</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
