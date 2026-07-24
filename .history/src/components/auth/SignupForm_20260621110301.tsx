import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Building2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { signupSchema, SignupFormData } from '../../lib/validators';
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
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="mt-2 text-sm text-slate-400">
          Join KhenX — before you pay, know the area.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3">
          <p className="text-sm text-red-400">{error.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role toggle */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">I am a</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'seeker', label: 'Property Seeker', icon: User },
              { value: 'agent', label: 'Agent / Landlord', icon: Building2 },
              { value: 'admin', label: 'Admin', icon: ShieldCheck },
            ].map(({ value, label, icon: Icon }) => (
              <label
                key={value}
                className={cn(
                  'flex cursor-pointer items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium transition-colors',
                  selectedRole === value
                    ? 'border-[#00C9A7] bg-[#00C9A7]/10 text-[#00C9A7]'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-300'
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
        {selectedRole === 'admin' && (
          <div className="rounded-lg border border-[#00C9A7]/20 bg-[#0A1628]/5 px-4 py-3 text-sm text-slate-200">
            Admin accounts are reviewed by a superadmin. Your account will remain pending until approved.
          </div>
        )}

        {/* Full name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Full name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              {...register('fullName')}
              type="text"
              autoComplete="name"
              placeholder="Chidi Okafor"
              className={cn(
                'w-full rounded-lg bg-white/5 border pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-colors',
                errors.fullName
                  ? 'border-red-500/50 focus:ring-red-500/20'
                  : 'border-white/10 focus:border-[#00C9A7]/50 focus:ring-[#00C9A7]/20'
              )}
            />
          </div>
          {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={cn(
                'w-full rounded-lg bg-white/5 border pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-colors',
                errors.email
                  ? 'border-red-500/50 focus:ring-red-500/20'
                  : 'border-white/10 focus:border-[#00C9A7]/50 focus:ring-[#00C9A7]/20'
              )}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
              className={cn(
                'w-full rounded-lg bg-white/5 border pl-10 pr-10 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-colors',
                errors.password
                  ? 'border-red-500/50 focus:ring-red-500/20'
                  : 'border-white/10 focus:border-[#00C9A7]/50 focus:ring-[#00C9A7]/20'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 w-full rounded-lg bg-[#00C9A7] py-3 text-sm font-semibold text-[#0A1628] hover:bg-[#00b396] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="font-medium text-[#00C9A7] hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default SignupForm;
