import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useVerifyEmail } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';

const LeftPanel = ({
  image,
  heading,
  sub,
  tips,
  cardText,
}: {
  image: string;
  heading: React.ReactNode;
  sub: string;
  tips: string[];
  cardText: string;
}) => (
  <div className="hidden lg:flex lg:w-[50%] flex-col justify-center p-10 relative overflow-hidden">
    <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
    <div className="absolute inset-0 bg-[#0A1628]/78" />

    <div className="z-10 mb-8">
      <h2 className="text-[32px] font-semibold text-white leading-tight tracking-tight mb-3">
        {heading}
      </h2>
      <p className="text-[13px] text-white/60 leading-relaxed max-w-[260px]">{sub}</p>
    </div>

    <div className="z-10 space-y-3 mb-8">
      {tips.map((tip) => (
        <div key={tip} className="flex items-center gap-3">
          <span className="w-5 h-5 rounded-full bg-[#00C9A7]/20 border border-[#00C9A7]/40 flex items-center justify-center text-[#00C9A7] text-[10px] font-bold flex-shrink-0">
            ✓
          </span>
          <p className="text-[13px] text-white/70">{tip}</p>
        </div>
      ))}
    </div>

    <div className="z-10 bg-white/[0.08] border border-white/10 rounded-xl p-4 backdrop-blur-sm">
      <p className="text-[13px] text-white/70 leading-relaxed">{cardText}</p>
    </div>
  </div>
);

const MobileBrand = () => (
  <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
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
);

const IMAGE = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&auto=format&fit=crop';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { isLoading, isSuccess, isError, error } = useVerifyEmail(token);

  // ── NO TOKEN ────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="flex min-h-screen w-full">
        <LeftPanel
          image={IMAGE}
          heading={<>Check your<br />email link</>}
          sub="The verification link in your email will bring you right back here to activate your account."
          tips={[
            'Open the email from KhenX',
            'Click the verification link inside',
            'Links expire after 24 hours',
            'Request a new one from the login page',
          ]}
          cardText="Make sure you're clicking the full link from your email. Some email clients may break long URLs — copy and paste it into your browser if needed."
        />
        <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
          <div className="w-full max-w-[400px] text-center">
            <MobileBrand />
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border border-red-200">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </div>
            <h1 className="text-[24px] font-semibold text-[#0A1628] tracking-tight mb-2">
              Invalid link
            </h1>
            <p className="text-[13px] text-slate-500 leading-relaxed mb-6">
              This verification link is missing a token. Please check the link in your email and try again.
            </p>
            <Link
              to={ROUTES.LOGIN}
              className="inline-block w-full rounded-lg bg-[#00C9A7] py-3 text-sm font-semibold text-[#0A1628] hover:bg-[#00b396] transition-colors"
            >
              Go to log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── LOADING ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full">
        <LeftPanel
          image={IMAGE}
          heading={<>Verifying your<br />account</>}
          sub="Hang tight — we're confirming your email address and activating your KhenX account."
          tips={[
            'This usually takes just a second',
            'Do not close or refresh the page',
            'You wiill be redirected automatically',
            'Contact support if this takes too long',
          ]}
          cardText="Email verification is a one-time step. Once done, you'll have full access to listings, agents, and neighbourhood insights."
        />
        <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
          <div className="w-full max-w-[400px] text-center">
            <MobileBrand />
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00C9A7]/10 border border-[#00C9A7]/20">
                <Loader2 className="h-8 w-8 text-[#00C9A7] animate-spin" />
              </div>
            </div>
            <h1 className="text-[24px] font-semibold text-[#0A1628] tracking-tight mb-2">
              Verifying your email...
            </h1>
            <p className="text-[13px] text-slate-500 leading-relaxed">
              This will only take a moment. Please don't close this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── SUCCESS ─────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="flex min-h-screen w-full">
        <LeftPanel
          image={IMAGE}
          heading={<>You're all set,<br />welcome aboard</>}
          sub="Your email is verified. Start exploring verified listings and connect with trusted agents across Nigeria."
          tips={[
            'Browse thousands of verified listings',
            'Connect with KYC-vetted agents',
            'Get neighbourhood insights before you pay',
            'Save listings and track your enquiries',
          ]}
          cardText="KhenX is Nigeria's most transparent real estate platform. Every listing is reviewed, every agent is KYC-verified."
        />
        <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
          <div className="w-full max-w-[400px] text-center">
            <MobileBrand />
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00C9A7]/10 border border-[#00C9A7]/30">
                <CheckCircle className="h-8 w-8 text-[#00C9A7]" />
              </div>
            </div>
            <h1 className="text-[24px] font-semibold text-[#0A1628] tracking-tight mb-2">
              Email verified!
            </h1>
            <p className="text-[13px] text-slate-500 leading-relaxed mb-6">
              Your email address has been verified. You can now log in to your KhenX account and start exploring.
            </p>
            <Link
              to={ROUTES.LOGIN}
              className="inline-block w-full rounded-lg bg-[#00C9A7] py-3 text-sm font-semibold text-[#0A1628] hover:bg-[#00b396] transition-colors"
            >
              Log in now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // flex w-full flex-1
  // ── ERROR ───────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex min-h-screen w-full">
        <LeftPanel
          image={IMAGE}
          heading={<>Let's get you<br />a new link</>}
          sub="Verification links expire after 24 hours. Request a fresh one and you'll be verified in seconds."
          tips={[
            'Links expire after 24 hours',
            'Each link can only be used once',
            'Request a new link from the login page',
            'Contact support if the problem persists',
          ]}
          cardText="If you keep seeing this error, try logging in and requesting a new verification email from your account settings."
        />
        <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
          <div className="w-full max-w-[400px] text-center">
            <MobileBrand />
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border border-red-200">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </div>
            <h1 className="text-[24px] font-semibold text-[#0A1628] tracking-tight mb-2">
              Verification failed
            </h1>
            <p className="text-[13px] text-slate-500 leading-relaxed mb-6">
              {(error as Error)?.message || 'This link may have expired. Please request a new verification email.'}
            </p>
            <Link
              to={ROUTES.LOGIN}
              className="inline-block w-full rounded-lg bg-[#00C9A7] py-3 text-sm font-semibold text-[#0A1628] hover:bg-[#00b396] transition-colors mb-3"
            >
              Back to log in
            </Link>
            <p className="text-[12px] text-slate-400">
              Need help?{' '}
              <a href="mailto:support@khenx.com" className="text-[#00C9A7] hover:underline font-medium">
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default VerifyEmailPage;