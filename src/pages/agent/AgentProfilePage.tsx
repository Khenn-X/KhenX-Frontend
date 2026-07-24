import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, User } from 'lucide-react';
import { agentProfileSchema } from '../../lib/validators';
import type { AgentProfileFormData } from '../../lib/validators';
import { useUpdateAgentProfile } from '../../hooks/useAgent';
import { useAuthStore } from '../../store/auth.store';
import { cn } from '../../lib/utils';

const AgentProfilePage = () => {
  const user = useAuthStore((s) => s.user);
  const { mutate: updateProfile, isPending, isSuccess, error } = useUpdateAgentProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<AgentProfileFormData>({
    resolver: zodResolver(agentProfileSchema),
  });

  const onSubmit = (data: AgentProfileFormData) => {
    updateProfile(data);
  };

  const inputClass = (hasError = false) => cn(
    'w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors',
    hasError
      ? 'border-red-300 focus:ring-red-200'
      : 'border-slate-200 focus:border-[#00C9A7] focus:ring-[#00C9A7]/20'
  );

  return (
    <div className="max-w-xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Edit Profile</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Update your public-facing agent profile
        </p>
      </div>

      {/* Account info (read-only) */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A1628]">
            <User className="h-5 w-5 text-[#00C9A7]" />
          </div>
          <div>
            <p className="font-semibold text-[#0F172A] text-sm">{user?.fullName}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Name and email are linked to your account and cannot be changed here. Contact support if you need to update them.
        </p>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        {isSuccess && (
          <div className="rounded-lg bg-[#00C9A7]/5 border border-[#00C9A7]/20 px-4 py-3">
            <p className="text-sm font-medium text-[#00C9A7]">Profile updated successfully.</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-600">{error.message}</p>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Business name</label>
          <input
            {...register('businessName')}
            placeholder="e.g. Okafor Properties Ltd"
            className={inputClass(!!errors.businessName)}
          />
          {errors.businessName && (
            <p className="mt-1 text-xs text-red-500">{errors.businessName.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone number</label>
          <input
            {...register('phone')}
            placeholder="e.g. 08012345678"
            className={inputClass(!!errors.phone)}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Bio <span className="text-slate-400 font-normal">(max 500 characters)</span>
          </label>
          <textarea
            {...register('bio')}
            rows={4}
            placeholder="Tell seekers about your experience, specialisations, and areas you cover..."
            className={cn(inputClass(!!errors.bio), 'resize-none')}
          />
          {errors.bio && (
            <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending || !isDirty}
          className="inline-flex items-center gap-2 rounded-lg bg-[#00C9A7] px-5 py-2.5 text-sm font-semibold text-[#0A1628] hover:bg-[#00b396] disabled:opacity-60 transition-colors"
        >
          <Save className="h-4 w-4" />
          {isPending ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
};

export default AgentProfilePage;
