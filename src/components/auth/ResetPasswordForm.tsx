import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useState } from 'react';
import { resetPasswordSchema, type ResetPasswordFormData } from '../../lib/validators';
import { useResetPassword } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { cn } from '../../lib/utils';

const ResetPasswordForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { token = '' } = useParams<{ token: string }>();
  const { mutate: resetPassword, isPending, error } = useResetPassword(token);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPassword({ password: data.password });
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* ── LEFT PANEL ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[50%] flex-col justify-center p-10 relative overflow-hidden">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#0A1628]/78" />

        {/* Hero text */}
        <div className="z-10 mb-8">
          <h2 className="text-[32px] font-semibold text-white leading-tight tracking-tight mb-3">
            Keep your account<br />safe and secure
          </h2>
          <p className="text-[13px] text-white/60 leading-relaxed max-w-[260px]">
            A strong password is your first line of defence. Make it unique and hard to guess.
          </p>
        </div>

        {/* Tips list */}
        <div className="z-10 space-y-3 mb-8">
          {[
            'Use at least 8 characters',
            'Mix uppercase, lowercase and numbers',
            'Avoid using your name or email',
            'Never reuse passwords across sites',
          ].map((tip) => (
            <div key={tip} className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-[#00C9A7]/20 border border-[#00C9A7]/40 flex items-center justify-center text-[#00C9A7] text-[10px] font-bold flex-shrink-0">
                ✓
              </span>
              <p className="text-[13px] text-white/70">{tip}</p>
            </div>
          ))}
        </div>

        {/* Info card */}
        <div className="z-10 bg-white/[0.08] border border-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00C9A7]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lock className="w-4 h-4 text-[#00C9A7]" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-white mb-1">Your data is protected</p>
              <p className="text-[12px] text-white/50 leading-relaxed">
                KhenX never stores your password in plain text. All passwords are encrypted before being saved.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 bg-[#00C9A7] rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path d="M3 14L8 8L3 2" stroke="#0A1628" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 14L15 8L10 2" stroke="#0A1628" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[#0A1628] text-lg font-semibold tracking-tight">
              Khen<span className="text-[#00C9A7]">X</span>
            </span>
          </div>

          <div className="mb-7">
            <h1 className="text-[24px] font-semibold text-[#0A1628] tracking-tight mb-1.5">
              Set a new password
            </h1>
            <p className="text-[13px] text-slate-500">
              Choose a strong password for your KhenX account.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-600">{error.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New password */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-[0.4px] mb-1.5">
                New password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  className={cn(
                    'w-full rounded-lg bg-slate-50 border pl-10 pr-10 py-3 text-sm text-[#0A1628] placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors',
                    errors.password
                      ? 'border-red-300 focus:ring-red-100'
                      : 'border-slate-200 focus:border-[#00C9A7]/60 focus:ring-[#00C9A7]/15'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-[0.4px] mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  {...register('confirmPassword')}
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter your new password"
                  className={cn(
                    'w-full rounded-lg bg-slate-50 border pl-10 pr-10 py-3 text-sm text-[#0A1628] placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors',
                    errors.confirmPassword
                      ? 'border-red-300 focus:ring-red-100'
                      : 'border-slate-200 focus:border-[#00C9A7]/60 focus:ring-[#00C9A7]/15'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-[#00C9A7] py-3 text-sm font-semibold text-[#0A1628] hover:bg-[#00b396] disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {isPending ? 'Saving...' : 'Save new password'}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-slate-500">
            Remembered it?{' '}
            <Link to={ROUTES.LOGIN} className="font-medium text-[#00C9A7] hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;