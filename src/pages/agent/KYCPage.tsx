import { ShieldCheck, Info } from 'lucide-react';
import KYCUploadForm from '../../components/agent/KYCUploadForm';
import { useKYCStatus } from '../../hooks/useKYC';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

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
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4 rounded-2xl bg-[#0A1628] p-6 text-white">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#00C9A7]/20">
          <ShieldCheck className="h-6 w-6 text-[#00C9A7]" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Identity Verification (KYC)</h1>
          <p className="mt-1 text-sm text-slate-300">
            Verify your identity to unlock listing submissions and earn the KhenX Verified badge.
          </p>
        </div>
      </div>

      {/* Why KYC */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-[#00C9A7]" />
          <p className="text-sm font-semibold text-[#0F172A]">Why is verification required?</p>
        </div>
        <ul className="space-y-2">
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
        <div className="flex items-center gap-3 rounded-xl bg-[#00C9A7]/5 border border-[#00C9A7]/20 p-5">
          <ShieldCheck className="h-6 w-6 text-[#00C9A7] shrink-0" />
          <div>
            <p className="font-semibold text-[#0F172A]">You're verified</p>
            <p className="text-sm text-slate-500 mt-0.5">
              Your identity has been confirmed. You can submit listings and your profile shows the verified badge.
            </p>
          </div>
        </div>
      ) : kycStatus === 'suspended' ? (
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
          <p className="font-semibold text-slate-700">Account suspended</p>
          <p className="text-sm text-slate-500 mt-1">
            Please contact KhenX support for assistance with your account.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-5">
            <h2 className="font-semibold text-[#0F172A]">
              {kycStatus === 'rejected' ? 'Resubmit your documents' : 'Submit your documents'}
            </h2>
            {kycStatus === 'rejected' && rejectionReason && (
              <div className="mt-2 rounded-lg bg-[#DC2626]/5 border border-[#DC2626]/20 px-3 py-2">
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
