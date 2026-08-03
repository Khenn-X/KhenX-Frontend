import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Building2 } from 'lucide-react';
import { useState } from 'react';
import { signupSchema, type SignupFormData } from '../../lib/validators';
import { useSignup } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { cn } from '../../lib/utils';

const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: signup, isPending, error } = useSignup();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: 'seeker' },
  });

  const selectedRole = watch('role');
  const onSubmit = (data: SignupFormData) => signup(data);

  return (
    <div className="flex min-h-screen w-full">
      {/* ── LEFT PANEL ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[50%] flex-col justify-center p-10 relative overflow-hidden">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#0A1628]/75" />

        {/* Hero text */}
        <div className="z-10 mb-8">
          <h2 className="text-[32px] font-semibold text-white leading-tight tracking-tight mb-3">
            Your next home<br />starts here
          </h2>
          <p className="text-[13px] text-white/60 leading-relaxed max-w-[260px]">
            Join thousands of Nigerians finding, renting and selling property the smarter way.
          </p>
        </div>

        {/* Feature list */}
        <div className="z-10 space-y-3 mb-8">
          {[
            { text: 'Free to sign up — no hidden charges' },
            { text: 'Search verified listings instantly' },
            { text: 'Connect directly with KYC-vetted agents' },
            { text: 'Get neighbourhood insights before you pay' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-[#00C9A7]/20 border border-[#00C9A7]/40 flex items-center justify-center text-[#00C9A7] text-[10px] font-bold flex-shrink-0">
                ✓
              </span>
              <p className="text-[13px] text-white/70">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Testimonial card */}
        <div className="z-10 bg-white/[0.08] border border-white/10 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-[13px] text-white/80 leading-relaxed mb-3">
            "As an agent, KhenX helped me close 4 deals in my first month. The KYC badge builds instant trust with clients."
          </p>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#00C9A7]/30 flex items-center justify-center text-[#00C9A7] text-[11px] font-semibold">
              EB
            </div>
            <div>
              <p className="text-[12px] font-medium text-white">Emeka Balogun</p>
              <p className="text-[11px] text-white/40">Verified agent · Abuja</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12 overflow-y-auto">
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
              Create your account
            </h1>
            <p className="text-[13px] text-slate-500">
              Join KhenX — before you pay, know the area.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-600">{error.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role toggle */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-[0.4px] mb-1.5">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'seeker', label: 'Seeker', icon: User },
                  { value: 'agent', label: 'Agent', icon: Building2 },
                ].map(({ value, label, icon: Icon }) => (
                  <label
                    key={value}
                    className={cn(
                      'flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border px-3 py-2.5 text-[12px] font-medium transition-colors',
                      selectedRole === value
                        ? 'border-[#00C9A7] bg-[#00C9A7]/8 text-[#00C9A7]'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                    )}
                  >
                    <input
                      {...register('role')}
                      type="radio"
                      value={value}
                      className="sr-only"
                    />
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Full name */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-[0.4px] mb-1.5">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  {...register('fullName')}
                  type="text"
                  autoComplete="name"
                  placeholder="Chidi Okafor"
                  className={cn(
                    'w-full rounded-lg bg-slate-50 border pl-10 pr-4 py-3 text-sm text-[#0A1628] placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors',
                    errors.fullName
                      ? 'border-red-300 focus:ring-red-100'
                      : 'border-slate-200 focus:border-[#00C9A7]/60 focus:ring-[#00C9A7]/15'
                  )}
                />
              </div>
              {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
            </div>

            {/* Email */}
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

            {/* Password */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-[0.4px] mb-1.5">
                Password
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

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-[#00C9A7] py-3 text-sm font-semibold text-[#0A1628] hover:bg-[#00b396] disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {isPending ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-slate-500">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="font-medium text-[#00C9A7] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;