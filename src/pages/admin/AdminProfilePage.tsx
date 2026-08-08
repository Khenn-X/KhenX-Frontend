import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/layout/PageWrapper';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../hooks/useAuth';
import { adminProfileSchema, type AdminProfileFormData } from '../../lib/validators';
import { authApi } from '../../api/auth.api';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../constants/queryKeys';

const AdminProfilePage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<AdminProfileFormData>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: { fullName: '', avatarUrl: '' },
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = form;

  useEffect(() => {
    if (user) {
      reset({ fullName: user.fullName || '', avatarUrl: user.avatarUrl || '' });
    }
  }, [reset, user]);

  const roleLabel = useMemo(() => {
    if (user?.role === 'superadmin') return 'Super admin';
    return 'Admin';
  }, [user?.role]);

  const onSubmit = async (values: AdminProfileFormData) => {
    try {
      const response = await authApi.updateProfile(values);
      if (response?.data?.user) {
        queryClient.setQueryData(queryKeys.auth.me, response.data.user);
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      }
      toast.success('Profile updated successfully.');
    } catch {
      toast.error('Unable to update your profile right now.');
    }
  };

  return (
    <PageWrapper className="py-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#00A88C]">Dashboard profile</p>
            <h1 className="mt-2 text-2xl font-semibold text-[#0F172A]">{roleLabel} profile</h1>
            <p className="mt-2 text-sm text-slate-600">Keep your account details current and visible to your team.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00A88C]/20 bg-[#00A88C]/10 px-3 py-2 text-sm font-medium text-[#00A88C]">
            <ShieldCheck className="h-4 w-4" />
            {roleLabel} account
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-[#00A88C]/10 p-2 text-[#00A88C]">
                <UserRound className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">Account visibility</p>
                <p className="mt-1 text-sm text-slate-600">Your name and avatar are shared across the dashboard experience and can be updated here.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                {...register('fullName')}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#00A88C] focus:ring-2 focus:ring-[#00A88C]/20"
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="avatarUrl">Avatar URL</label>
              <input
                id="avatarUrl"
                {...register('avatarUrl')}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#00A88C] focus:ring-2 focus:ring-[#00A88C]/20"
                placeholder="https://example.com/avatar.jpg"
              />
              {errors.avatarUrl && (
                <p className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.avatarUrl.message}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#00A88C]" />
              <span>Changes are saved immediately to your account profile.</span>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="min-w-[140px] bg-[#00A88C] text-white hover:bg-[#00A88C]/90">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                'Save profile'
              )}
            </Button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
};

export default AdminProfilePage;
