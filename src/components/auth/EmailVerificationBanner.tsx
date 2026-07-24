import { MailWarning } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

/**
 * Shows a banner when the logged-in user has not verified their email.
 * Place this inside PublicLayout above page content where relevant.
 */
const EmailVerificationBanner = () => {
  const user = useAuthStore((s) => s.user);

  if (!user || user.isEmailVerified) return null;

  return (
    <div className="bg-[#F59E0B]/10 border-b border-[#F59E0B]/30 px-4 py-3">
      <div className="mx-auto max-w-7xl flex items-center gap-3">
        <MailWarning className="h-4 w-4 text-[#F59E0B] shrink-0" />
        <p className="text-sm text-[#F59E0B]">
          Your email address is not verified. Please check your inbox and click the verification link.
        </p>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
