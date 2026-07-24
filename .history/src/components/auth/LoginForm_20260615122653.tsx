import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { loginSchema } from '../../lib/validators';
import type { LoginFormData } from '../../lib/validators';
import { useLogin } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { cn } from '../../lib/utils';

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending, error } = useLogin();
  const location = useLocation();
  const successMessage = location.state?.message as string | undefined;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => login(data);

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-400">Log in to your KhenX account</p>
      </div>

      {successMessage && (
        <div className="mb-5 rounded-lg bg-[#00C9A7]/10 border border-[#00C9A7]/30 px-4 py-3">
          <p className="text-sm text-[#00C9A7]">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3">
          <p className="text-sm text-red-400">{error.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs text-[#00C9A7] hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
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
          {isPending ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Don't have an account?{' '}
        <Link to={ROUTES.SIGNUP} className="font-medium text-[#00C9A7] hover:underline">
          Sign up free
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
