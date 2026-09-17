import { useState } from 'react';
import { X } from 'lucide-react';
import type { PendingEvidence } from '../../api/evidence.api';
import { getEvidenceCorroborationCount } from '../../lib/evidence-tier';
import { useEvidenceCorroboration } from '../../hooks/useEvidence';
import EvidenceReviewCard, { EvidenceReviewActions } from './EvidenceReviewCard';

interface EvidenceDetailModalProps {
  evidence: PendingEvidence | null;
  pairedEvidence?: PendingEvidence | null;
  label?: string;
  onClose: () => void;
}

const EvidenceDetailModal = ({ evidence, pairedEvidence = null, label, onClose }: EvidenceDetailModalProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const primaryCorroboration = useEvidenceCorroboration(evidence?._id ?? null, Boolean(evidence));
  const pairedCorroboration = useEvidenceCorroboration(pairedEvidence?._id ?? null, Boolean(pairedEvidence));
  if (!evidence) return null;

  const items = pairedEvidence ? [evidence, pairedEvidence] : [evidence];
  const corroborationById = new Map([
    [evidence._id, primaryCorroboration.data],
    ...(pairedEvidence ? [[pairedEvidence._id, pairedCorroboration.data] as const] : []),
  ]);
  const handleActionSuccess = () => {
    setIsClosing(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`${label ?? evidence.claimType} evidence details`}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          disabled={isClosing}
          aria-label="Close evidence details"
          className="absolute right-4 top-4 z-10 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-6 p-6">
          <div className="border-b border-slate-200 pb-4 pr-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Evidence details</p>
            <h2 className="mt-1 text-xl font-bold text-[#0F172A]">{label ?? evidence.claimType}</h2>
            <p className="mt-1 text-sm text-slate-500">Review the complete source-backed claim before taking action.</p>
          </div>

          {items.map((item) => (
            <section key={item._id} className="space-y-3 border-b border-slate-200 pb-6 last:border-b-0 last:pb-0">
              {(() => {
                const source = typeof item.sourceId === 'string' ? null : item.sourceId;
                const submitter = typeof item.submittedBy === 'string' ? item.submittedBy : item.submittedBy?.fullName || item.submittedBy?.email;
                const corroboration = corroborationById.get(item._id);
                const qualityNote = corroboration
                  ? corroboration.otherSourceCount > 0
                    ? `${corroboration.otherSourceCount} other source${corroboration.otherSourceCount === 1 ? '' : 's'} report this claim`
                    : 'No corroborating sources yet'
                  : 'Checking for corroborating sources...';
                return (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="min-w-0 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">Submitted by:</span> {submitter || 'Unknown submitter'}
                        <span className="mx-2 text-slate-300">•</span>
                        <span>Created {new Date(item.createdAt ?? item.observedAt).toLocaleString()}</span>
                        <span className="mx-2 text-slate-300">•</span>
                        <span>Retrieved {new Date(item.retrievedAt ?? item.observedAt).toLocaleString()}</span>
                      </div>
                      {source?.tier != null && <span className="shrink-0 rounded-full bg-[#00C9A7]/10 px-2.5 py-1 text-xs font-semibold text-[#008f79]">Source tier {source.tier}</span>}
                    </div>
                    <div className="rounded-xl border border-[#00C9A7]/20 bg-[#00C9A7]/5 px-4 py-3 text-sm text-slate-700">
                      <span className="font-semibold text-[#008f79]">Data quality:</span> {qualityNote}
                      {corroboration?.sourceNames.length ? <span className="text-slate-500"> ({corroboration.sourceNames.join(', ')})</span> : null}
                    </div>
                    {item.reviewNote && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        {item.reviewNote}
                      </div>
                    )}
                  </>
                );
              })()}
              <EvidenceReviewCard
                evidence={item}
                detailMode
                hideActions
                corroborationCount={getEvidenceCorroborationCount(items, item)}
              />
              <EvidenceReviewActions evidence={item} label={item.claimType} onActionSuccess={handleActionSuccess} />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EvidenceDetailModal;