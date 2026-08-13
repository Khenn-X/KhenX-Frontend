import { ShieldCheck, Info } from 'lucide-react';
import KYCUploadForm from '../../components/agent/KYCUploadForm';
import { useKYCStatus } from '../../hooks/useKYC';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { cn } from '../../lib/utils';

const WHY_KYC = [
  'Build trust with seekers before they even contact you',
  'Get a "KhenX Verified" badge on your listings and profile',
  'Unlock listing submissions — required before your first property goes live',
  'Protect the platform from fraudulent agents',
];

const KYCPage = () => {
  const { data, isLoading } = useKYCStatus();
  const kycStatus = data?.data?.kycStatus;
  const rejectionReason = data?.data?.kycRejectionReason;

  return (
    <div className="max-w-3xl space-y-6 lg:max-w-6xl">
      {/* Header */}
      <div className="flex items-start gap-4 rounded-2xl bg-[#0A1628] p-6 text-white lg:p-8">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#00C9A7]/20">
          <ShieldCheck className="h-6 w-6 text-[#00C9A7]" />
        </div>
        <div>
          <h1 className="text-xl font-bold lg:text-2xl">Identity Verification (KYC)</h1>
          <p className="mt-1 text-sm text-slate-300 lg:text-base">
            Verify your identity to unlock listing submissions and earn the KhenX Verified badge.
          </p>
        </div>
      </div>

      {/* Why KYC */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 lg:p-6">
        <div className="mb-3 flex items-center gap-2">
          <Info className="h-4 w-4 text-[#00C9A7]" />
          <p className="text-sm font-semibold text-[#0F172A]">Why is verification required?</p>
        </div>
        <ul className="grid grid-cols-1 gap-x-6 gap-y-2 lg:grid-cols-2">
          {WHY_KYC.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00C9A7]" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Status or form */}
      {isLoading ? (
        <LoadingSpinner />
      ) : kycStatus === 'approved' ? (
        <div className="flex items-center gap-3 rounded-xl border border-[#00C9A7]/20 bg-[#00C9A7]/5 p-5">
          <ShieldCheck className="h-6 w-6 shrink-0 text-[#00C9A7]" />
          <div>
            <p className="font-semibold text-[#0F172A]">You're verified</p>
            <p className="mt-0.5 text-sm text-slate-500">
              Your identity has been confirmed. You can submit listings and your profile shows the verified badge.
            </p>
          </div>
        </div>
      ) : kycStatus === 'suspended' ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="font-semibold text-slate-700">Account suspended</p>
          <p className="mt-1 text-sm text-slate-500">
            Please contact KhenX support for assistance with your account.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:p-8">
          <div className="mb-5">
            <h2 className="font-semibold text-[#0F172A]">
              {kycStatus === 'rejected' ? 'Resubmit your documents' : 'Submit your documents'}
            </h2>
            {kycStatus === 'rejected' && rejectionReason && (
              <div className="mt-2 rounded-lg border border-[#DC2626]/20 bg-[#DC2626]/5 px-3 py-2">
                <p className="text-xs text-[#DC2626]">
                  <span className="font-semibold">Previous rejection reason: </span>
                  {rejectionReason}
                </p>
              </div>
            )}
            {kycStatus === 'pending' && (
              <p className="mt-1 text-sm text-slate-500">
                Under review. You'll receive an email once processed.
              </p>
            )}
          </div>
          {kycStatus !== 'pending' && <KYCUploadForm />}
        </div>
      )}
    </div>
  );
};

export default KYCPage;