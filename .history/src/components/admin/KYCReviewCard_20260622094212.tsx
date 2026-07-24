import { useState } from 'react';
import { ShieldCheck, ShieldX, ExternalLink, User } from 'lucide-react';
import { useApproveKYC, useRejectKYC } from '../../hooks/useKYC';
import type { KYCSubmission } from '../../api/kyc.api';
import { timeAgo, getInitials } from '../../lib/utils';

interface KYCReviewCardProps {
  submission: KYCSubmission;
}

const KYCReviewCard = ({ submission }: KYCReviewCardProps) => {
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState('');

  const { mutate: approve, isPending: isApproving } = useApproveKYC();
  const { mutate: reject, isPending: isRejecting } = useRejectKYC();

  // New nested shape: { agent: {...}, user: {...}, listingCount }
  const { agent, user } = submission;

  const handleReject = () => {
    if (reason.trim().length < 10) return;
    reject({ agentId: agent._id, reason });
    setRejectMode(false);
    setReason('');
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      {/* Agent info */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A1628] text-[#00C9A7] text-sm font-bold shrink-0">
          {user?.fullName ? getInitials(user.fullName) : <User className="h-5 w-5" />}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-[#0F172A] truncate">{user?.fullName ?? 'Unknown Agent'}</p>
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          <p className="text-xs text-slate-400">Submitted {timeAgo(agent.createdAt)}</p>
        </div>
      </div>

      {/* Documents */}
      {agent.kycDocuments.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Documents</p>
          <div className="flex flex-wrap gap-2">
            {agent.kycDocuments.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-[#00C9A7] hover:text-[#00C9A7] transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Document {i + 1}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Status */}
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 capitalize">
          {agent.kycStatus}
        </span>
        {submission.listingCount > 0 && (
          <span className="text-xs text-slate-400">{submission.listingCount} listing{submission.listingCount !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Reject reason input */}
      {rejectMode && (
        <div className="space-y-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection (min. 10 chars)..."
            rows={3}
            className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={reason.trim().length < 10 || isRejecting}
              className="flex-1 rounded-lg bg-red-600 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isRejecting ? 'Rejecting...' : 'Confirm reject'}
            </button>
            <button
              onClick={() => { setRejectMode(false); setReason(''); }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      {!rejectMode && (
        <div className="flex gap-2">
          <button
            onClick={() => approve(agent._id)}
            disabled={isApproving}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#00C9A7] py-2.5 text-xs font-semibold text-[#0A1628] hover:bg-[#00b396] disabled:opacity-50 transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {isApproving ? 'Approving...' : 'Approve KYC'}
          </button>
          <button
            onClick={() => setRejectMode(true)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <ShieldX className="h-3.5 w-3.5" />
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default KYCReviewCard;