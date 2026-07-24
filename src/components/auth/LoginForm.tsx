import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { loginSchema } from "../../lib/validators";
import type { LoginFormData } from "../../lib/validators";
import { useLogin } from "../../hooks/useAuth";
import { ROUTES } from "../../constants/routes";
import { cn } from "../../lib/utils";

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
    <div className="flex min-h-screen w-full">
      {/* ── LEFT PANEL ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[50%] flex-col justify-center p-10 relative overflow-hidden min-h-screen">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#0A1628]/75" />

        {/* Hero text */}
        <div className="z-10 mb-8">
          <h2 className="text-[32px] font-semibold text-white leading-tight tracking-tight mb-3">
            Find your place
            <br />
            in Nigeria's market
          </h2>
          <p className="text-[13px] text-white/60 leading-relaxed max-w-[260px]">
            Verified listings, trusted agents, and transparent deals — all in
            one platform.
          </p>
        </div>

        {/* Feature list */}
        <div className="z-10 space-y-3 mb-8">
          {[
            { icon: "✓", text: "KYC-verified agents you can trust" },
            { icon: "✓", text: "Listings across Lagos, Abuja & more" },
            { icon: "✓", text: "Buy, rent or sell — all in one place" },
            { icon: "✓", text: "Real-time enquiries and updates" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-[#00C9A7]/20 border border-[#00C9A7]/40 flex items-center justify-center text-[#00C9A7] text-[10px] font-bold flex-shrink-0">
                {item.icon}
              </span>
              <p className="text-[13px] text-white/70">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Testimonial card */}
        <div className="z-10 bg-white/[0.08] border border-white/10 rounded-xl p-4 mb-8 backdrop-blur-sm">
          <p className="text-[13px] text-white/80 leading-relaxed mb-3">
            "Found my Lekki apartment in 3 days. The agent was verified and the
            process was seamless."
          </p>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#00C9A7]/30 flex items-center justify-center text-[#00C9A7] text-[11px] font-semibold">
              AO
            </div>
            <div>
              <p className="text-[12px] font-medium text-white">
                Adaeze Okonkwo
              </p>
              <p className="text-[11px] text-white/40">
                Property seeker · Lagos
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
                <path
                  d="M3 14L8 8L3 2"
                  stroke="#0A1628"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 14L15 8L10 2"
                  stroke="#0A1628"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-[#0A1628] text-lg font-semibold tracking-tight">
              Khen<span className="text-[#00C9A7]">X</span>
            </span>
          </div>

          <div className="mb-7">
            <h1 className="text-[24px] font-semibold text-[#0A1628] tracking-tight mb-1.5">
              Welcome back
            </h1>
            <p className="text-[13px] text-slate-500">
              Log in to your KhenX account to continue
            </p>
          </div>

          {/* Alerts */}
          {successMessage && (
            <div className="mb-5 rounded-lg bg-[#00C9A7]/10 border border-[#00C9A7]/30 px-4 py-3">
              <p className="text-sm text-[#00C9A7]">{successMessage}</p>
            </div>
          )}
          {error && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-600">{error.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-[0.4px] mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={cn(
                    "w-full rounded-lg bg-slate-50 border pl-10 pr-4 py-3 text-sm text-[#0A1628] placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors",
                    errors.email
                      ? "border-red-300 focus:ring-red-100"
                      : "border-slate-200 focus:border-[#00C9A7]/60 focus:ring-[#00C9A7]/15",
                  )}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.4px]">
                  Password
                </label>
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="text-xs text-[#00C9A7] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={cn(
                    "w-full rounded-lg bg-slate-50 border pl-10 pr-10 py-3 text-sm text-[#0A1628] placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors",
                    errors.password
                      ? "border-red-300 focus:ring-red-100"
                      : "border-slate-200 focus:border-[#00C9A7]/60 focus:ring-[#00C9A7]/15",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-[#00C9A7] py-3 text-sm font-semibold text-[#0A1628] hover:bg-[#00b396] disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {isPending ? "Logging in..." : "Log in"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] text-slate-400">or continue with</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* OAuth */}
          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908C16.658 14.013 17.64 11.705 17.64 9.2z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                  fill="#34A853"
                />
                <path
                  d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#00C9A7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.47 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" />
              </svg>
              Phone
            </button>
          </div>

          <p className="mt-6 text-center text-[13px] text-slate-500">
            Don't have an account?{" "}
            <Link
              to={ROUTES.SIGNUP}
              className="font-medium text-[#00C9A7] hover:underline"
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
