import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  FileClock,
  KeyRound,
  Loader2,
  Mail,
  ShieldQuestion,
  UserCog,
  X,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/layout/PageWrapper';
import { ROUTES } from '../../constants/routes';
import { Button } from '../../components/ui/button';
import SharedAccountSettings, { SectionCard, ComingSoonRow } from '../../components/settings/SharedAccountSettings';
// -----------------------------------------------------------------------------
// ASSUMPTIONS TO VERIFY — I don't have the current adminApi.ts contents, only
// the confirmed route list from the audit:
//   GET   /api/admin/admin-requests
//   PATCH /api/admin/admin-requests/:id/approve
//   PATCH /api/admin/admin-requests/:id/reject
//   GET   /api/admin/actions  (supports ?adminId= filter; page/actionType
//         filter support beyond that isn't confirmed, so only pagination by
//         page number is used below)
// Calling these directly via the shared axios instance rather than guessing
// at wrapper function names/signatures in adminApi.ts. Swap for the real
// wrapper once you've checked it.
// -----------------------------------------------------------------------------
import api from '../../api/axios';

interface AdminRequest {
  _id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

interface AdminActionRecord {
  _id: string;
  adminId: { _id: string; fullName: string; email: string } | string;
  actionType: string;
  reason?: string;
  createdAt: string;
}

// Derived from the real route-guard groups (admin.routes.ts) — same pattern
// used on the Admin/Superadmin profile pages. Not a stored permissions
// object; there is no central permissions model in the backend yet.
const CAPABILITIES = {
  admin: [
    'View platform stats',
    'Manage listings',
    'Manage agents (incl. KYC verification)',
    'Review fraud reports',
    'View admin activity log',
  ],
  superadminOnly: ['Approve/reject new administrator requests', 'Create administrator accounts'],
};

function actorName(a: AdminActionRecord['adminId']): string {
  return typeof a === 'string' ? a : a?.fullName ?? 'Unknown';
}

function humanizeActionType(actionType: string): string {
  return actionType
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

function AdminRequestsSection() {
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin', 'admin-requests'],
    queryFn: async () => {
      const { data } = await api.get<{ data: { requests: AdminRequest[] } }>('/admin/admin-requests');
      return data.data.requests;
    },
  });

  const respond = async (id: string, action: 'approve' | 'reject') => {
    setBusyId(id);
    try {
      await api.patch(`/admin/admin-requests/${id}/${action}`);
      toast.success(action === 'approve' ? 'Admin request approved.' : 'Admin request rejected.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'admin-requests'] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Unable to process this request right now.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <SectionCard
      title="Admin management"
      icon={<UserCog className="h-4 w-4" />}
      description="Pending administrator requests. Listing all active admins and suspending an account aren't available yet — that needs a small backend addition (an active/suspended status field) beyond what exists today."
    >
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-[#00A88C]" />
        </div>
      ) : requests && requests.length > 0 ? (
        <ul className="space-y-3">
          {requests.map((r) => (
            <li key={r._id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">{r.fullName}</p>
                <p className="text-xs text-slate-500">{r.email}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  Requested {timeAgo(r.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={busyId === r._id}
                  onClick={() => respond(r._id, 'approve')}
                  className="bg-[#00A88C] text-white hover:bg-[#00A88C]/90"
                >
                  {busyId === r._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  Approve
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={busyId === r._id} onClick={() => respond(r._id, 'reject')}>
                  <X className="h-3.5 w-3.5" />
                  Reject
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-400">No pending admin requests.</p>
      )}
    </SectionCard>
  );
}

function AuditLogSection() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'actions', 'all', page],
    queryFn: async () => {
      const { data } = await api.get<{ data: { actions: AdminActionRecord[]; total?: number } }>('/admin/actions', {
        params: { page },
      });
      return data.data;
    },
  });

  return (
    <SectionCard title="Audit log" icon={<FileClock className="h-4 w-4" />} description="Every logged administrative action, most recent first.">
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-[#00A88C]" />
        </div>
      ) : data?.actions && data.actions.length > 0 ? (
        <>
          <ul className="space-y-3">
            {data.actions.map((a) => (
              <li key={a._id} className="flex items-center justify-between gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">
                    {actorName(a.adminId)} — {humanizeActionType(a.actionType)}
                  </p>
                  {a.reason && <p className="text-xs text-slate-400">{a.reason}</p>}
                </div>
                <span className="shrink-0 text-xs text-slate-400">{timeAgo(a.createdAt)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-center gap-2">
            <Button type="button" variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-400">No actions logged yet.</p>
      )}
    </SectionCard>
  );
}

export default function SuperadminSettingsPage() {
  return (
    <PageWrapper className="py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your account, platform administration, and configuration.</p>
        </div>

        <SectionCard title="Account" icon={<KeyRound className="h-4 w-4" />}>
          <p className="flex items-center gap-2 text-sm font-medium text-[#0F172A]">
            <Mail className="h-3.5 w-3.5 text-slate-400" />
            Name, email, and phone are managed from your Profile page.
          </p>
          <Link to={ROUTES.SUPERADMIN_PROFILE} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#00A88C] hover:text-[#00A88C]/80">
            View in Profile <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </SectionCard>

        <SharedAccountSettings />

        <SectionCard title="Administration" icon={<UserCog className="h-4 w-4" />}>
          <p className="text-sm text-slate-500">Super admin-only controls over platform administrators.</p>
        </SectionCard>

        <AdminRequestsSection />

        <SectionCard
          title="Roles & permissions"
          icon={<ShieldQuestion className="h-4 w-4" />}
          description="Reflects what each role's routes currently allow — there's no editable permissions system yet, so this is informational rather than a control panel."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Administrator</p>
              <ul className="space-y-1.5">
                {CAPABILITIES.admin.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-sm text-[#0F172A]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#00A88C]" />
                    {c}
                  </li>
                ))}
                {CAPABILITIES.superadminOnly.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-sm text-slate-400">
                    <XCircle className="h-3.5 w-3.5 text-slate-300" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Super administrator</p>
              <ul className="space-y-1.5">
                {[...CAPABILITIES.admin, ...CAPABILITIES.superadminOnly].map((c) => (
                  <li key={c} className="flex items-center gap-2 text-sm text-[#0F172A]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#00A88C]" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Platform" icon={<CreditCard className="h-4 w-4" />}>
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-semibold text-[#0F172A]">Payments</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Provider</p>
                  <p className="mt-1 text-sm font-semibold text-[#0F172A]">Paystack</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Currency</p>
                  <p className="mt-1 text-sm font-semibold text-[#0F172A]">NGN</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-400">Already wired up for listing-plan and intelligence subscription payments.</p>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <p className="mb-1 text-sm font-semibold text-[#0F172A]">Platform rules</p>
              <p className="mb-3 text-xs text-slate-400">
                These are currently fixed in the app's code, not admin-configurable — changing them today means a code change, not a settings toggle.
              </p>
              <div className="divide-y divide-slate-100">
                <ComingSoonRow label="Require listing approval" hint="Currently always on, hardcoded in the listing workflow." />
                <ComingSoonRow label="Require KYC before publishing" hint="Currently always on, hardcoded in KYC middleware." />
                <ComingSoonRow label="Max images per listing" />
                <ComingSoonRow label="Default currency" hint="Currently fixed to NGN." />
                <ComingSoonRow label="Support email" />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <p className="mb-1 text-sm font-semibold text-[#0F172A]">Email &amp; communication</p>
              <p className="mb-3 text-xs text-slate-400">Sender identity is set via server environment config, not editable here. Transactional emails always send — there are no per-event on/off switches yet.</p>
              <div className="divide-y divide-slate-100">
                <ComingSoonRow label="Verification email toggle" />
                <ComingSoonRow label="Agent approval email toggle" />
                <ComingSoonRow label="Listing approval email toggle" />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <p className="mb-3 text-sm font-semibold text-[#0F172A]">Neighbourhood intelligence</p>
              <ComingSoonRow label="Intelligence settings" hint="No dedicated settings model yet — scoring/sources aren't configurable from here." />
            </div>
          </div>
        </SectionCard>

        <AuditLogSection />

        <SectionCard title="Danger zone" icon={<ShieldQuestion className="h-4 w-4" />}>
          <div className="divide-y divide-slate-100">
            <ComingSoonRow label="Clear platform cache" />
            <ComingSoonRow label="Disable new registrations" />
            <ComingSoonRow label="Maintenance mode" />
          </div>
        </SectionCard>
      </div>
    </PageWrapper>
  );
}