import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Bell, Check, Eye, EyeOff, KeyRound, Loader2, LogOut, Sliders, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
// -----------------------------------------------------------------------------
// ASSUMPTIONS TO VERIFY — `authApi.changePassword` was confirmed added in an
// earlier step (generic to all roles, hits PATCH /api/auth/change-password).
// Import path below follows the same convention used in the agent settings
// page; adjust if this file's real location differs.
// -----------------------------------------------------------------------------
import { authApi } from '../../api/auth.api';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export function SectionCard({
  title,
  icon,
  description,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F172A]/5 text-[#0F172A]">
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

/** A settings row for a feature with no real backend support yet — shown
 *  disabled rather than as a working-looking control with nothing behind it. */
export function ComingSoonRow({ label, hint }: { label: string; hint?: string }) {
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

function ChangePasswordForm() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (values: ChangePasswordValues) => {
    try {
      await authApi.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      toast.success('Password updated successfully.');
      reset();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Unable to update your password right now.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
  );
}

/** Shared across Admin and Superadmin — identity, security, notifications,
 *  preferences, and session controls are the same shape for both roles.
 *  Role-specific sections (Administration, Platform, Audit Logs) are added
 *  by each page separately. */
export default function SharedAccountSettings() {
  return (
    <>
      <SectionCard title="Security" icon={<KeyRound className="h-4 w-4" />} description="Password and sign-in protection for your own account.">
        <div className="space-y-6">
          <ChangePasswordForm />
          <div className="border-t border-slate-100 pt-5">
            <ComingSoonRow label="Two-factor authentication" hint="Adds an extra verification step when signing in." />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Notifications"
        icon={<Bell className="h-4 w-4" />}
        description="Platform alert preferences aren't wired up yet — there's no notification-delivery system in place, so these would have nothing to control."
      >
        <div className="divide-y divide-slate-100">
          <ComingSoonRow label="New agent registration" />
          <ComingSoonRow label="New KYC submission" />
          <ComingSoonRow label="Fraud report" />
          <ComingSoonRow label="Listing reported" />
          <ComingSoonRow label="New enquiry" />
          <ComingSoonRow label="Email notifications" />
          <ComingSoonRow label="Push notifications" />
        </div>
      </SectionCard>

      <SectionCard title="Preferences" icon={<Sliders className="h-4 w-4" />}>
        <div className="divide-y divide-slate-100">
          <ComingSoonRow label="Appearance" hint="Light / dark / system." />
          <ComingSoonRow label="Language" />
          <ComingSoonRow label="Timezone" />
        </div>
      </SectionCard>

      <SectionCard title="Sessions" icon={<LogOut className="h-4 w-4" />}>
        <div className="divide-y divide-slate-100">
          <ComingSoonRow label="Active sessions" hint="Needs session/device tracking, not yet built." />
          <ComingSoonRow label="Log out of all devices" />
          <div className="flex items-center justify-between gap-3 py-3">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <UserX className="h-4 w-4" />
              Deactivate account
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-400">Coming soon</span>
          </div>
        </div>
      </SectionCard>
    </>
  );
}