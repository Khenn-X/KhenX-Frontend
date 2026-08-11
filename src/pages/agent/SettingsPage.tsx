import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  Bell,
  Check,
  ChevronRight,
  CreditCard,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  Link2,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Palette,
  ShieldAlert,
  ShieldCheck,
  Share2,
  Sliders,
  Trash2,
  UserX,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/layout/PageWrapper';
import { Button } from '../../components/ui/button';
import { ROUTES } from '../../constants/routes';
// -----------------------------------------------------------------------------
// ASSUMPTIONS TO VERIFY — I don't have the current auth.api.ts/agents.api.ts
// content in front of me for this turn, only the Copilot summary confirming
// `authApi.changePassword(payload)` exists. Import paths below follow the
// same conventions used throughout this project; adjust if they differ.
// -----------------------------------------------------------------------------
import { authApi } from '../../api/auth.api';
import api from '../../api/axios';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    // NOTE: assumed min length 8 to match "signup's password policy" per
    // Copilot's summary — tighten this if the real validator requires more
    // (e.g. uppercase/number/symbol requirements).
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

interface AgentBillingInfo {
  tier?: string;
  listingPlan?: string;
  listingPlanStatus?: string;
  listingPlanExpiresAt?: string;
  listingQuotaLimit?: number;
  preferredContactMethod?: string;
}

const CONTACT_METHOD_LABEL: Record<string, string> = {
  email: 'Email',
  phone: 'Phone call',
  whatsapp: 'WhatsApp',
  any: 'Any',
};

function SectionCard({
  id,
  title,
  icon,
  description,
  children,
}: {
  id: string;
  title: string;
  icon: React.ReactNode;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00A88C]/10 text-[#00A88C]">
          {icon}
        </span>
        <div>
          <h2 className="text-base font-semibold text-[#0F172A]">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

/** A settings row for a feature that isn't backed by real data/infrastructure yet.
 *  Shown disabled with a clear "Coming soon" label rather than a working-looking
 *  toggle that doesn't persist anywhere — same honesty rule we've used throughout. */
function ComingSoonRow({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
      </div>
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-400">
        Coming soon
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onChangePassword = async (values: ChangePasswordValues) => {
    try {
      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success('Password updated successfully.');
      reset();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Unable to update your password right now.');
    }
  };

  // Reuses the existing own-profile endpoint rather than adding a new one —
  // we only need a handful of already-real fields for the Billing/Preferences
  // sections below.
  const { data: billing, isLoading: billingLoading } = useQuery({
    queryKey: ['agents', 'me', 'billing-summary'],
    queryFn: async () => {
      const { data } = await api.get<{ data: { agent: AgentBillingInfo } }>('/agents/profile');
      return data.data.agent;
    },
  });

  return (
    <PageWrapper className="py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your account, security, and preferences.</p>
        </div>

        {/* Account */}
        <SectionCard id="account" title="Account" icon={<KeyRound className="h-4 w-4" />}>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Email</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[#0F172A]">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                Managed from your Profile page
              </p>
              <Link to={ROUTES.AGENT_PROFILE} className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-[#00A88C] hover:text-[#00A88C]/80">
                View in Profile <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <p className="mb-4 text-sm font-semibold text-[#0F172A]">Change password</p>
              <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Current password</label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      {...register('currentPassword')}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none focus:border-[#00A88C] focus:ring-2 focus:ring-[#00A88C]/20"
                    />
                    <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Toggle visibility">
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600"><AlertCircle className="h-3.5 w-3.5" />{errors.currentPassword.message}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">New password</label>
                    <div className="relative">
                      <input
                        type={showNew ? 'text' : 'password'}
                        {...register('newPassword')}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none focus:border-[#00A88C] focus:ring-2 focus:ring-[#00A88C]/20"
                      />
                      <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Toggle visibility">
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.newPassword && <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600"><AlertCircle className="h-3.5 w-3.5" />{errors.newPassword.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm new password</label>
                    <input
                      type="password"
                      {...register('confirmPassword')}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#00A88C] focus:ring-2 focus:ring-[#00A88C]/20"
                    />
                    {errors.confirmPassword && <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600"><AlertCircle className="h-3.5 w-3.5" />{errors.confirmPassword.message}</p>}
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="bg-[#00A88C] text-white hover:bg-[#00A88C]/90">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Update password
                </Button>
              </form>
            </div>
          </div>
        </SectionCard>

        {/* Security */}
        <SectionCard id="security" title="Security" icon={<Lock className="h-4 w-4" />}>
          <ComingSoonRow label="Two-factor authentication" hint="Adds an extra verification step when signing in." />
        </SectionCard>

        {/* Notifications */}
        <SectionCard
          id="notifications"
          title="Notifications"
          icon={<Bell className="h-4 w-4" />}
          description="Notification preferences aren't wired up yet — the app doesn't currently send SMS or WhatsApp messages, so these controls would have nothing to control."
        >
          <div className="divide-y divide-slate-100">
            <ComingSoonRow label="Email notifications" />
            <ComingSoonRow label="SMS notifications" />
            <ComingSoonRow label="WhatsApp notifications" />
            <ComingSoonRow label="Marketing emails" />
          </div>
        </SectionCard>

        {/* Privacy */}
        <SectionCard id="privacy" title="Privacy" icon={<ShieldAlert className="h-4 w-4" />}>
          <div className="divide-y divide-slate-100">
            <ComingSoonRow label="Show phone number publicly" />
            <ComingSoonRow label="Show email publicly" />
            <ComingSoonRow label="Public profile visibility" />
          </div>
        </SectionCard>

        {/* Preferences */}
        <SectionCard id="preferences" title="Preferences" icon={<Sliders className="h-4 w-4" />}>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-medium text-[#0F172A]">Default contact method</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {billingLoading
                    ? 'Loading…'
                    : billing?.preferredContactMethod
                      ? CONTACT_METHOD_LABEL[billing.preferredContactMethod] ?? billing.preferredContactMethod
                      : 'Not set yet'}
                </p>
              </div>
              <Link to={ROUTES.AGENT_PROFILE} className="inline-flex items-center gap-1 text-sm font-semibold text-[#00A88C] hover:text-[#00A88C]/80">
                Edit in Profile <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="border-t border-slate-100">
              <ComingSoonRow label="Language" hint="App interface language." />
              <ComingSoonRow label="Theme" hint="Light / dark mode." />
            </div>
          </div>
        </SectionCard>

        {/* Connected accounts */}
        <SectionCard id="connected" title="Connected accounts" icon={<Link2 className="h-4 w-4" />}>
          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between gap-3 py-3">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Globe2 className="h-4 w-4" />
                Google
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-400">Coming soon</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-3">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Share2 className="h-4 w-4" />
                Facebook
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-400">Coming soon</span>
            </div>
          </div>
        </SectionCard>

        {/* Billing */}
        <SectionCard id="billing" title="Billing" icon={<CreditCard className="h-4 w-4" />}>
          {billingLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-[#00A88C]" />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Plan</p>
                  <p className="mt-1 text-sm font-semibold capitalize text-[#0F172A]">{billing?.listingPlan || billing?.tier || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Status</p>
                  <p className="mt-1 text-sm font-semibold capitalize text-[#0F172A]">{billing?.listingPlanStatus || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Renews / expires</p>
                  <p className="mt-1 text-sm font-semibold text-[#0F172A]">
                    {billing?.listingPlanExpiresAt
                      ? new Date(billing.listingPlanExpiresAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </p>
                </div>
              </div>
              {typeof billing?.listingQuotaLimit === 'number' && (
                <p className="text-sm text-slate-500">Listing quota: up to {billing.listingQuotaLimit} active listings on this plan.</p>
              )}
              {/* NOTE: link target guessed — point this at whatever page already
                  initiates `POST /api/listings/subscribe` in this app (likely a
                  pricing/upgrade page reached from listing creation). Swap once
                  confirmed rather than duplicating the subscribe flow here. */}
              <Link to="/pricing" className="inline-flex items-center gap-2 rounded-full bg-[#00A88C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00A88C]/90">
                Manage plan
              </Link>
            </div>
          )}
        </SectionCard>

        {/* Danger zone */}
        <SectionCard id="danger" title="Danger zone" icon={<ShieldAlert className="h-4 w-4" />}>
          <div className="divide-y divide-slate-100">
            <ComingSoonRow label="Log out of all devices" hint="Needs session tracking, not yet built." />
            <div className="flex items-center justify-between gap-3 py-3">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <UserX className="h-4 w-4" />
                Deactivate account
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-400">Coming soon</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-4">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-[#0F172A]">
                  <Trash2 className="h-4 w-4 text-red-500" />
                  Delete account
                </p>
                {/* Deliberately not a self-serve button yet — deleting an
                    agent account has real implications (their listings, KYC
                    documents, active enquiries) that need a real decision
                    before this ships as one click. Support handles it for
                    now, honestly, rather than a stubbed "coming soon" button
                    implying it's simpler than it is. */}
                <p className="mt-0.5 text-xs text-slate-400">
                  Contact{' '}
                  <a href="mailto:support@khenx.com" className="font-medium text-[#00A88C] hover:underline">
                    support@khenx.com
                  </a>{' '}
                  to permanently delete your account.
                </p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </PageWrapper>
  );
}