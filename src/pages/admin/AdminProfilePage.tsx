import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  Calendar,
  Check,
  Loader2,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  UserCog,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/layout/PageWrapper';
import { Button } from '../../components/ui/button';
import { useAuthStore } from '../../store/auth.store';
import { adminProfileSchema } from '../../lib/validators';
// -----------------------------------------------------------------------------
// ASSUMPTIONS TO VERIFY — I don't have the real current AdminProfilePage.tsx,
// admin.api.ts, or auth.api.ts contents, only descriptions from the audits.
// The pieces below are named to match confirmed conventions from the rest of
// the app, but check these three specifically:
//   1. `authApi.getMe()` / `authApi.updateMe()` — I'm assuming these exist on
//      auth.api.ts and hit GET/PATCH `/api/auth/me`. Swap for the real names
//      if different.
//   2. `adminApi.getActions({ adminId, page })` — assuming admin.api.ts has
//      something like this hitting `GET /api/admin/actions`. Swap if needed.
//   3. The relative import paths below (`../../api/axios` etc.) assume this
//      file lives at `src/pages/admin/AdminProfilePage.tsx` — adjust if not.
// -----------------------------------------------------------------------------
import api from '../../api/axios';

type Role = 'admin' | 'superadmin';

interface MeResponse {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: Role;
  adminApprovalStatus?: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface AdminActionRecord {
  _id: string;
  adminId: { _id: string; fullName: string; email: string } | string;
  actionType: string;
  targetId?: string;
  reason?: string;
  createdAt: string;
}

// Derived from the real route-guard groups in `admin.routes.ts`
// (`requireRole('admin','superadmin')` vs `requireRole('superadmin')`) —
// this is NOT a stored per-admin permissions object, just an honest
// reflection of what each role's routes actually allow. If a real
// permissions model gets built later, replace this with fetched data.
const ROLE_CAPABILITIES: Record<Role, { label: string; included: boolean }[]> = {
  admin: [
    { label: 'View platform stats', included: true },
    { label: 'Manage listings', included: true },
    { label: 'Manage agents (incl. KYC verification)', included: true },
    { label: 'Review fraud reports', included: true },
    { label: 'View admin activity log', included: true },
    { label: 'Manage administrators', included: false },
  ],
  superadmin: [
    { label: 'View platform stats', included: true },
    { label: 'Manage listings', included: true },
    { label: 'Manage agents (incl. KYC verification)', included: true },
    { label: 'Review fraud reports', included: true },
    { label: 'View admin activity log', included: true },
    { label: 'Manage administrators', included: true },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  admin: 'Administrator',
  superadmin: 'Super Administrator',
};

const ACCESS_LEVEL_LABEL: Record<Role, string> = {
  admin: 'Platform management',
  superadmin: 'Full platform access',
};

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

type FormValues = { fullName?: string; avatarUrl?: string; phone?: string };

export default function AdminProfilePage() {
  const setUser = useAuthStore((s) => s.setUser);
  const [editingPersonal, setEditingPersonal] = useState(false);

  const { data: me, isLoading, isError, refetch } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get<{ data: { user: MeResponse } }>('/auth/me');
      return data.data.user;
    },
  });

  const role: Role = me?.role === 'superadmin' ? 'superadmin' : 'admin';

  const form = useForm<FormValues>({
    resolver: zodResolver(adminProfileSchema as any),
    defaultValues: {},
  });
  const { register, reset, watch, formState: { errors, isSubmitting } } = form;
  const values = watch();

  useEffect(() => {
    if (me) {
      reset({ fullName: me.fullName ?? '', avatarUrl: me.avatarUrl ?? '', phone: me.phone ?? '' });
    }
  }, [me, reset]);

  const memberSince = me?.createdAt
    ? new Date(me.createdAt).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })
    : null;

  const busy = isSubmitting;

  const savePersonal = async () => {
    const v = form.getValues();
    // Only send fields that actually have a value — same lesson learned from
    // the agent profile bug: don't send empty strings for untouched fields.
    const payload: Record<string, string> = {};
    if (v.fullName) payload.fullName = v.fullName;
    if (v.avatarUrl) payload.avatarUrl = v.avatarUrl;
    if (v.phone) payload.phone = v.phone;

    try {
      const { data } = await api.patch<{ data: { user: MeResponse } }>('/auth/me', payload);
      const updated = data.data.user;
      setUser({
        _id: updated._id,
        fullName: updated.fullName,
        email: updated.email,
        role: updated.role,
        avatarUrl: updated.avatarUrl,
        isEmailVerified: true,
        createdAt: updated.createdAt,
        updatedAt: new Date().toISOString(),
      } as any);
      toast.success('Profile updated successfully.');
      setEditingPersonal(false);
      refetch();
    } catch {
      toast.error('Unable to update your profile right now.');
    }
  };

  const { data: actionsData, isLoading: actionsLoading } = useQuery({
    queryKey: ['admin', 'actions', 'mine', me?._id],
    queryFn: async () => {
      const { data } = await api.get<{ data: { actions: AdminActionRecord[] } }>('/admin/actions', {
        params: { adminId: me?._id, page: 1 },
      });
      return data.data.actions;
    },
    enabled: !!me?._id,
  });
  const recentActions = useMemo(() => (actionsData ?? []).slice(0, 5), [actionsData]);

  if (isLoading) {
    return (
      <PageWrapper className="py-8">
        <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-[#00A88C]" />
        </div>
      </PageWrapper>
    );
  }

  if (isError || !me) {
    return (
      <PageWrapper className="py-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-semibold">We could not load your profile.</p>
          <button className="mt-3 font-medium text-red-700 underline" onClick={() => void refetch()}>
            Try again
          </button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {values.avatarUrl ? (
              <img src={values.avatarUrl} alt={values.fullName} className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-md" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-[#0F172A] to-[#334155] text-xl font-bold text-white shadow-md">
                {(values.fullName || 'A').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-[#0F172A]">{values.fullName || me.fullName}</h1>
              <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#0F172A]/5 px-2.5 py-1 text-xs font-semibold text-[#0F172A]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#00A88C]" />
                {ROLE_LABEL[role]}
              </span>
              {memberSince && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                  <Calendar className="h-3.5 w-3.5" />
                  {role === 'superadmin' ? 'Super admin' : 'Admin'} since {memberSince}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Personal info */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
              <Mail className="h-4 w-4" />
              Personal info
            </h2>
            {!editingPersonal && (
              <button type="button" onClick={() => setEditingPersonal(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00A88C] hover:text-[#00A88C]/80">
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
          </div>

          {editingPersonal ? (
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
                  <input {...register('fullName')} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#00A88C] focus:ring-2 focus:ring-[#00A88C]/20" />
                  {errors.fullName && <p className="mt-2 flex items-center gap-2 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{errors.fullName.message as string}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                  <input disabled value={me.email} className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500" />
                  <p className="mt-1.5 text-xs text-slate-400">Contact support to change your email.</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
                  <input {...register('phone')} placeholder="08012345678" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#00A88C] focus:ring-2 focus:ring-[#00A88C]/20" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Avatar image link</label>
                  <input {...register('avatarUrl')} placeholder="https://example.com/photo.jpg" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#00A88C] focus:ring-2 focus:ring-[#00A88C]/20" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" disabled={busy} onClick={savePersonal} className="bg-[#00A88C] text-white hover:bg-[#00A88C]/90">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save changes
                </Button>
                <Button type="button" variant="ghost" onClick={() => setEditingPersonal(false)}>
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <dl className="grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Full name</dt>
                <dd className="mt-1 text-sm font-medium text-[#0F172A]">{me.fullName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Email</dt>
                <dd className="mt-1 text-sm font-medium text-[#0F172A]">{me.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Phone</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[#0F172A]">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {me.phone || '—'}
                </dd>
              </div>
            </dl>
          )}
        </div>

        {/* Role & permissions */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-[#0F172A]">
            <UserCog className="h-4 w-4" />
            Role &amp; permissions
          </h2>
          <p className="mb-5 text-xs text-slate-400">Based on what your role's system access allows.</p>
          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Role</p>
              <p className="mt-1 text-sm font-semibold text-[#0F172A]">{ROLE_LABEL[role]}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Access level</p>
              <p className="mt-1 text-sm font-semibold text-[#0F172A]">{ACCESS_LEVEL_LABEL[role]}</p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {ROLE_CAPABILITIES[role].map((cap) => (
              <div key={cap.label} className="flex items-center gap-2 text-sm">
                {cap.included ? (
                  <Check className="h-3.5 w-3.5 shrink-0 text-[#00A88C]" />
                ) : (
                  <X className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                )}
                <span className={cap.included ? 'text-[#0F172A]' : 'text-slate-400'}>{cap.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-5 text-base font-semibold text-[#0F172A]">Recent activity</h2>
          {actionsLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-[#00A88C]" />
            </div>
          ) : recentActions.length > 0 ? (
            <ul className="space-y-3">
              {recentActions.map((a) => (
                <li key={a._id} className="flex items-center justify-between gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-[#0F172A]">{humanizeActionType(a.actionType)}</p>
                    {a.reason && <p className="text-xs text-slate-400">{a.reason}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{timeAgo(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No recent activity yet.</p>
          )}
          {/* NOTE: link path guessed — point this at your real admin actions
              log page/route once confirmed. */}
          <a href="/admin/actions" className="mt-4 inline-block text-sm font-semibold text-[#00A88C] hover:text-[#00A88C]/80">
            View full activity log →
          </a>
        </div>

        {/* Account status */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-5 text-base font-semibold text-[#0F172A]">Account status</h2>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Approval status</dt>
              <dd className="mt-1 text-sm font-semibold capitalize text-[#0F172A]">{me.adminApprovalStatus ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Role</dt>
              <dd className="mt-1 text-sm font-semibold text-[#0F172A]">{ROLE_LABEL[role]}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Account created</dt>
              <dd className="mt-1 text-sm font-semibold text-[#0F172A]">{memberSince ?? '—'}</dd>
            </div>
          </dl>
          {/* Deliberately no "Security" section here — login tracking, 2FA,
              and session data don't exist in the backend yet (confirmed).
              Adding this back requires real auth/session work first. */}
        </div>
      </div>
    </PageWrapper>
  );
}