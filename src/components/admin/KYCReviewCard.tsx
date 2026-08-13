import { useState } from 'react';
import { useEffect } from 'react';
import { ShieldCheck, ShieldX, ExternalLink, User } from 'lucide-react';
import { useApproveKYC, useRejectKYC } from '../../hooks/useKYC';
import type { KYCSubmission } from '../../api/kyc.api';
import { kycApi } from '../../api/kyc.api';
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

  const [docUrls, setDocUrls] = useState<{ documentUrl?: string; selfieNeutralUrl?: string; selfieSmilingUrl?: string } | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingDocs(true);
      try {
        const res = await kycApi.getKYCDocumentUrls(agent._id);
        if (mounted) {
          setDocUrls(res.data ?? null);
        }
      } catch (err) {
        // ignore — admin will see placeholders
      } finally {
        if (mounted) setLoadingDocs(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [agent._id]);

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

      {/* Documents + Selfies (using signed URLs fetched from server) */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Submitted documents</p>
        <div className="flex flex-wrap gap-2 items-center">
          {docUrls?.documentUrl ? (
            <a href={docUrls.documentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-[#00C9A7] hover:text-[#00C9A7] transition-colors">
              <ExternalLink className="h-3 w-3" />
              Document
            </a>
          ) : agent.kycDocuments?.[0] ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600">Document</div>
          ) : null}

          {docUrls?.selfieNeutralUrl ? (
            <a href={docUrls.selfieNeutralUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg overflow-hidden border">
              <img src={docUrls.selfieNeutralUrl} alt="Neutral selfie" className="w-24 h-24 object-cover" />
            </a>
          ) : agent.kycSelfieNeutralUrl ? (
            <div className="rounded-lg overflow-hidden border w-24 h-24 bg-slate-50" />
          ) : null}

          {docUrls?.selfieSmilingUrl ? (
            <a href={docUrls.selfieSmilingUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg overflow-hidden border">
              <img src={docUrls.selfieSmilingUrl} alt="Smiling selfie" className="w-24 h-24 object-cover" />
            </a>
          ) : agent.kycSelfieSmilingUrl ? (
            <div className="rounded-lg overflow-hidden border w-24 h-24 bg-slate-50" />
          ) : null}
        </div>
        {loadingDocs && <p className="text-xs text-slate-400">Loading images…</p>}
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 capitalize">
          {agent.kycStatus}
        </span>
        {submission.listingCount > 0 && (
          <span className="text-xs text-slate-400">{submission.listingCount} listing{submission.listingCount !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* ID + QoreID summary */}
      <div className="grid grid-cols-1 gap-2 text-sm">
        <div className="text-slate-600">{agent.kycIdType && (<span className="font-medium">ID type:</span>)} {agent.kycIdType} {agent.kycIdNumber && (<span className="ml-2">{agent.kycIdNumber}</span>)}</div>
        <div className="text-slate-600">{agent.firstName || agent.lastName ? <><span className="font-medium">Name:</span> {agent.firstName} {agent.lastName}</> : null}</div>
        <div className="text-slate-600">
          <span className="font-medium">Automated lookup:</span>{' '}
          {agent.kycProviderMatched === null ? (
            <span className="text-amber-700">Automated ID lookup unavailable — manual review only</span>
          ) : agent.kycProviderMatched ? (
            <span className="text-green-600">Matched ({agent.kycProviderMatchedName ?? '—'})</span>
          ) : (
            <span className="text-red-600">No match</span>
          )}
        </div>
        {agent.kycProviderDob && (
          <div className="text-slate-600"><span className="font-medium">DOB:</span> {agent.kycProviderDob}</div>
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