import { useState } from 'react';
import { CheckCircle, Clock, Crown, RefreshCw, Users, XCircle } from 'lucide-react';
import { usePendingAdmins, useApproveAdmin, useRejectAdmin } from '../../hooks/useSuperAdmin';
import { cn, getInitials } from '../../lib/utils';
import type { AdminRequest } from '../../api/super.admin.api';

// ─── Confirm modal ────────────────────────────────────────────────────────────

interface ConfirmModalProps {
  action: 'approve' | 'reject';
  admin: AdminRequest;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
  isPending: boolean;
}

const ConfirmModal = ({ action, admin, onConfirm, onCancel, isPending }: ConfirmModalProps) => {
  const [reason, setReason] = useState('');
  const isApprove = action === 'approve';
  const canSubmit = isApprove || reason.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <div
          className={cn(
            'mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full',
            isApprove ? 'bg-emerald-50 ring-1 ring-inset ring-emerald-200' : 'bg-rose-50 ring-1 ring-inset ring-rose-200',
          )}
        >
          {isApprove ? (
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          ) : (
            <XCircle className="h-6 w-6 text-rose-600" />
          )}
        </div>

        <h3 className="text-center text-lg font-semibold text-[#0F172A]">
          {isApprove ? 'Approve admin account?' : 'Reject admin account?'}
        </h3>
        <p className="mt-1 text-center text-sm text-slate-500">
          {isApprove
            ? `${admin.fullName} will gain full admin access to KhenX.`
            : `${admin.fullName}'s request will be denied.`}
        </p>

        {/* Rejection reason — required by backend */}
        {!isApprove && (
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Duplicate account, invalid details..."
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-colors focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
            />
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason || undefined)}
            disabled={isPending || !canSubmit}
            className={cn(
              'flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50',
              isApprove ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700',
            )}
          >
            {isPending ? (isApprove ? 'Approving…' : 'Rejecting…') : isApprove ? 'Yes, approve' : 'Yes, reject'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────────

const AdminRequestCard = ({
  admin,
  onApprove,
  onReject,
}: {
  admin: AdminRequest;
  onApprove: (a: AdminRequest) => void;
  onReject: (a: AdminRequest) => void;
}) => (
  <div className="group flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 transition-colors hover:bg-slate-50/60 sm:flex-row sm:items-center">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-sm font-bold text-[#0A1628]">
      {getInitials(admin.fullName)}
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate font-semibold text-[#0F172A]">{admin.fullName}</p>
      <p className="truncate text-sm text-slate-500">{admin.email}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
          <Clock className="h-3 w-3" /> Pending
        </span>
        <span className="text-xs text-slate-400">
          Requested{' '}
          {new Date(admin.createdAt).toLocaleDateString('en-NG', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
        {!admin.isEmailVerified && (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-inset ring-slate-200">
            Email unverified
          </span>
        )}
      </div>
    </div>
    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        onClick={() => onReject(admin)}
        className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-2 text-sm font-semibold text-rose-700 transition-colors hover:border-rose-300 hover:bg-rose-100"
      >
        <XCircle className="h-4 w-4" /> Reject
      </button>
      <button
        type="button"
        onClick={() => onApprove(admin)}
        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
      >
        <CheckCircle className="h-4 w-4" /> Approve
      </button>
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const SuperadminAdminRequestsPage = () => {
  const { data: pendingAdmins, isLoading, isError, refetch, isFetching } = usePendingAdmins();
  const { mutate: approveAdmin, isPending: isApproving } = useApproveAdmin();
  const { mutate: rejectAdmin, isPending: isRejecting } = useRejectAdmin();

  const [modal, setModal] = useState<{ action: 'approve' | 'reject'; admin: AdminRequest } | null>(null);
  const isMutating = isApproving || isRejecting;
  const pendingCount = pendingAdmins?.length ?? 0;

  const handleConfirm = (reason?: string) => {
    if (!modal) return;
    if (modal.action === 'approve') {
      approveAdmin(modal.admin._id, { onSuccess: () => setModal(null) });
    } else {
      rejectAdmin({ id: modal.admin._id, reason: reason! }, { onSuccess: () => setModal(null) });
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-[#0A1628] to-[#0F172A] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-300 ring-1 ring-inset ring-indigo-400/20">
              <Crown className="h-3 w-3" />
              Superadmin
            </span>
            <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Admin Requests</h1>
            <p className="mt-2 max-w-md text-sm text-slate-300">
              Approve or reject new admin account requests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isLoading && !isError && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/15">
                <Users className="h-3.5 w-3.5 text-slate-300" />
                {pendingCount} pending
              </span>
            )}
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-3xl bg-slate-100" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-3xl border border-rose-100 bg-rose-50 p-6 text-center">
          <p className="text-sm font-medium text-rose-700">Failed to load admin requests.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 text-sm font-semibold text-rose-600 underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && pendingCount === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm shadow-slate-200/60">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-inset ring-emerald-200">
            <CheckCircle className="h-7 w-7 text-emerald-500" />
          </div>
          <p className="mt-4 font-semibold text-[#0F172A]">All caught up!</p>
          <p className="mt-1 text-sm text-slate-500">No admin accounts are waiting for approval.</p>
        </div>
      )}

      {!isLoading && !isError && pendingCount > 0 && (
        <div className="space-y-3">
          {pendingAdmins!.map((admin) => (
            <AdminRequestCard
              key={admin._id}
              admin={admin}
              onApprove={(a) => setModal({ action: 'approve', admin: a })}
              onReject={(a) => setModal({ action: 'reject', admin: a })}
            />
          ))}
        </div>
      )}

      {modal && (
        <ConfirmModal
          action={modal.action}
          admin={modal.admin}
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
          isPending={isMutating}
        />
      )}
    </div>
  );
};

export default SuperadminAdminRequestsPage;