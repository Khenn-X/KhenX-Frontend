import { useState } from 'react';
import { ShieldAlert, X, Send } from 'lucide-react';
import { useSubmitFraudReport } from '../../hooks/useFraud';
import { cn } from '../../lib/utils';

interface FraudReportButtonProps {
  listingId: string;
  className?: string;
}

const FraudReportButton = ({ listingId, className }: FraudReportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { mutate: submitReport, isPending } = useSubmitFraudReport();

  const handleSubmit = () => {
    if (!reason.trim() || reason.trim().length < 10) return;

    submitReport(
      { listingId, reason, reporterEmail: reporterEmail || undefined },
      {
        onSuccess: () => {
          setSubmitted(true);
          setTimeout(() => {
            setIsOpen(false);
            setSubmitted(false);
            setReason('');
            setReporterEmail('');
          }, 2500);
        },
      }
    );
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors',
          className
        )}
      >
        <ShieldAlert className="h-3.5 w-3.5" />
        Report listing
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00C9A7]/10">
                  <ShieldAlert className="h-6 w-6 text-[#00C9A7]" />
                </div>
                <div>
                  <p className="font-semibold text-[#0F172A]">Report submitted</p>
                  <p className="text-sm text-slate-500 mt-1">Our team will review this listing shortly.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <ShieldAlert className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0F172A]">Report this listing</h3>
                    <p className="text-xs text-slate-400">Help keep KhenX safe and fraud-free</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      What's wrong with this listing? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g. The agent asked for payment before viewing. Photos don't match the property..."
                      rows={3}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-[#00C9A7] focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20 resize-none"
                    />
                    {reason.trim().length > 0 && reason.trim().length < 10 && (
                      <p className="mt-1 text-xs text-red-500">Please provide at least 10 characters.</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      Your email (optional — for follow-up)
                    </label>
                    <input
                      type="email"
                      value={reporterEmail}
                      onChange={(e) => setReporterEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-[#00C9A7] focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isPending || reason.trim().length < 10}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {isPending ? 'Submitting...' : 'Submit report'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FraudReportButton;
