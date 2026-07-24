import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../../lib/validators';
import { useForgotPassword } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { cn } from '../../lib/utils';

const ForgotPasswordForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const { mutate: forgotPassword, isPending, error } = useForgotPassword();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPassword(data, { onSuccess: () => setSubmitted(true) });
  };

  // ── SUCCESS STATE ─────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex min-h-screen w-full">
        {/* Left panel */}
        <div className="hidden lg:flex lg:w-[50%] flex-col justify-center p-10 relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=900&auto=format&fit=crop"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0A1628]/78" />

          <div className="z-10 mb-8">
            <h2 className="text-[32px] font-semibold text-white leading-tight tracking-tight mb-3">
              Help is on<br />its way
            </h2>
            <p className="text-[13px] text-white/60 leading-relaxed max-w-[260px]">
              Check your inbox for the reset link. It expires in 1 hour for your security.
            </p>
          </div>

          <div className="z-10 space-y-3 mb-8">
            {[
              'Check your spam folder if not found',
              'The link expires after 1 hour',
              'Request a new link anytime',
              'Your account remains safe and intact',
            ].map((tip) => (
              <div key={tip} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[#00C9A7]/20 border border-[#00C9A7]/40 flex items-center justify-center text-[#00C9A7] text-[10px] font-bold flex-shrink-0">
                  ✓
                </span>
                <p className="text-[13px] text-white/70">{tip}</p>
              </div>
            ))}
          </div>

          <div className="z-10 bg-white/[0.08] border border-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#00C9A7]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail className="w-4 h-4 text-[#00C9A7]" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-white mb-1">Email sent successfully</p>
                <p className="text-[12px] text-white/50 leading-relaxed">
                  We sent a reset link to <span className="text-white/80">{getValues('email')}</span>. Follow the instructions inside to recover access.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — success */}
        <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
          <div className="w-full max-w-[400px] text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00C9A7]/10 border border-[#00C9A7]/30">
                <Mail className="h-8 w-8 text-[#00C9A7]" />
              </div>
            </div>
            <h1 className="text-[24px] font-semibold text-[#0A1628] tracking-tight mb-2">
              Check your inbox
            </h1>
            <p className="text-[13px] text-slate-500 leading-relaxed mb-1">
              We've sent a password reset link to{' '}
              <span className="font-medium text-[#0A1628]">{getValues('email')}</span>.
            </p>
            <p className="text-[13px] text-slate-400 mb-6">The link expires in 1 hour.</p>

            <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 mb-6 text-left">
              <p className="text-[12px] text-slate-500">
                Didn't receive it? Check your spam folder or{' '}
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-[#00C9A7] font-medium hover:underline"
                >
                  try again
                </button>
                .
              </p>
            </div>

            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center gap-2 text-[13px] text-slate-400 hover:text-[#0A1628] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── FORM STATE ────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen w-full">
      {/* ── LEFT PANEL ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[50%] flex-col justify-center p-10 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=900&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0A1628]/78" />

        {/* Hero text */}
        <div className="z-10 mb-8">
          <h2 className="text-[32px] font-semibold text-white leading-tight tracking-tight mb-3">
            No worries,<br />we've got you
          </h2>
          <p className="text-[13px] text-white/60 leading-relaxed max-w-[260px]">
            Happens to everyone. Enter your email and we'll send you a secure reset link in seconds.
          </p>
        </div>

        {/* Tips */}
        <div className="z-10 space-y-3 mb-8">
          {[
            'Reset link delivered instantly',
            'Link expires after 1 hour for safety',
            'Your listings and data stay untouched',
            'Contact support if you need more help',
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
              <Mail className="w-4 h-4 text-[#00C9A7]" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-white mb-1">Secure password reset</p>
              <p className="text-[12px] text-white/50 leading-relaxed">
                Reset links are single-use and expire after 1 hour. Only you can access your account.
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

          <Link
            to={ROUTES.LOGIN}
            className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-[#0A1628] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to log in
          </Link>

          <div className="mb-7">
            <h1 className="text-[24px] font-semibold text-[#0A1628] tracking-tight mb-1.5">
              Forgot your password?
            </h1>
            <p className="text-[13px] text-slate-500">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-600">{error.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-[0.4px] mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={cn(
                    'w-full rounded-lg bg-slate-50 border pl-10 pr-4 py-3 text-sm text-[#0A1628] placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors',
                    errors.email
                      ? 'border-red-300 focus:ring-red-100'
                      : 'border-slate-200 focus:border-[#00C9A7]/60 focus:ring-[#00C9A7]/15'
                  )}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-[#00C9A7] py-3 text-sm font-semibold text-[#0A1628] hover:bg-[#00b396] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? 'Sending...' : 'Send reset link'}
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

export default ForgotPasswordForm;