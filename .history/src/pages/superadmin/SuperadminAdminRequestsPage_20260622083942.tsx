import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Users, RefreshCw } from 'lucide-react';
import { usePendingAdmins, useApproveAdmin, useRejectAdmin } from '../../hooks/';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className={cn(
          'mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full',
          isApprove ? 'bg-emerald-100' : 'bg-red-100'
        )}>
          {isApprove
            ? <CheckCircle className="h-6 w-6 text-emerald-600" />
            : <XCircle className="h-6 w-6 text-red-600" />}
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
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Duplicate account, invalid details..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason || undefined)}
            disabled={isPending || !canSubmit}
            className={cn(
              'flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50',
              isApprove ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
            )}
          >
            {isPending
              ? isApprove ? 'Approving…' : 'Rejecting…'
              : isApprove ? 'Yes, approve' : 'Yes, reject'}
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
  <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F59E0B] text-sm font-bold text-[#0A1628]">
      {getInitials(admin.fullName)}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-[#0F172A] truncate">{admin.fullName}</p>
      <p className="text-sm text-slate-500 truncate">{admin.email}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
          <Clock className="h-3 w-3" /> Pending
        </span>
        <span className="text-xs text-slate-400">
          Requested {new Date(admin.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        {!admin.isEmailVerified && (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">Email unverified</span>
        )}
      </div>
    </div>
    <div className="flex gap-2 shrink-0">
      <button
        onClick={() => onReject(admin)}
        className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
      >
        <XCircle className="h-4 w-4" /> Reject
      </button>
      <button
        onClick={() => onApprove(admin)}
        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
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
  const isPending = isApproving || isRejecting;

  const handleConfirm = (reason?: string) => {
    if (!modal) return;
    if (modal.action === 'approve') {
      approveAdmin(modal.admin._id, { onSuccess: () => setModal(null) });
    } else {
      rejectAdmin(
        { id: modal.admin._id, reason: reason! },
        { onSuccess: () => setModal(null) }
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Admin Requests</h1>
          <p className="mt-1 text-sm text-slate-500">Approve or reject new admin account requests.</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {!isLoading && !isError && (
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-500">
            {!pendingAdmins?.length
              ? 'No pending requests'
              : `${pendingAdmins.length} pending request${pendingAdmins.length > 1 ? 's' : ''}`}
          </span>
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />)}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-700">Failed to load admin requests.</p>
          <button onClick={() => refetch()} className="mt-3 text-sm text-red-600 underline">Try again</button>
        </div>
      )}

      {!isLoading && !isError && !pendingAdmins?.length && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <CheckCircle className="mx-auto h-10 w-10 text-emerald-400" />
          <p className="mt-3 font-medium text-[#0F172A]">All caught up!</p>
          <p className="mt-1 text-sm text-slate-500">No admin accounts are waiting for approval.</p>
        </div>
      )}

      {!isLoading && !isError && !!pendingAdmins?.length && (
        <div className="space-y-3">
          {pendingAdmins.map((admin) => (
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
          isPending={isPending}
        />
      )}
    </div>
  );
};

export default SuperadminAdminRequestsPage;