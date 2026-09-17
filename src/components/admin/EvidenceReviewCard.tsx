import { useMemo, useState } from 'react';
import { Check, ExternalLink, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { evidenceApi, type EvidenceSource, type PendingEvidence } from '../../api/evidence.api';
import { classifyEvidenceTier } from '../../lib/evidence-tier';
import { useApproveEvidence, useRejectEvidence } from '../../hooks/useEvidence';

interface EvidenceReviewCardProps {
  evidence: PendingEvidence;
  corroborationCount?: number;
  embedded?: boolean;
  detailMode?: boolean;
  onViewDetails?: () => void;
  onActionSuccess?: () => void;
  actionLabel?: string;
  actionsOnly?: boolean;
  hideActions?: boolean;
  hideDocument?: boolean;
}

const getSource = (sourceId: EvidenceSource | string): EvidenceSource | null =>
  typeof sourceId === 'string' ? null : sourceId;

const formatValue = (value: unknown) => {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const formatSourceBody = (body: string) => {
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
};

const LIST_CLAIM_TYPES = new Set(['school_nearest_list', 'bank_nearest_list', 'market_nearest_list']);

const getNearbyPlaces = (value: unknown): Array<{ name: string; distanceKm: number; brand?: string }> | null => {
  let parsed = value;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(parsed)) return null;
  return parsed.filter((place): place is { name: string; distanceKm: number; brand?: string } => (
    Boolean(place)
    && typeof place === 'object'
    && typeof (place as { name?: unknown }).name === 'string'
    && Number.isFinite(Number((place as { distanceKm?: unknown }).distanceKm))
  )).map((place) => ({
    name: place.name,
    distanceKm: Number(place.distanceKm),
    ...(typeof (place as { brand?: unknown }).brand === 'string' && (place as { brand: string }).brand.trim()
      ? { brand: (place as { brand: string }).brand.trim() }
      : {}),
  }));
};

export const EvidenceReviewHeader = ({ evidence }: { evidence: PendingEvidence }) => {
  const source = getSource(evidence.sourceId);

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Source</p>
        <p className="mt-1 truncate font-semibold text-[#0F172A]">{source?.name ?? 'Unknown source'}</p>
        <p className="truncate text-xs text-slate-400">{source?.organization || 'Organization not provided'}</p>
        <p className="mt-2 text-xs text-slate-500">Observed {new Date(evidence.observedAt).toLocaleDateString()}</p>
      </div>
      <span className="shrink-0 rounded-full bg-[#00C9A7]/10 px-2.5 py-1 text-xs font-semibold text-[#008f79]">
        Tier {source?.tier ?? '—'}
      </span>
    </div>
  );
};

const EvidenceReviewCard = ({ evidence, corroborationCount = 0, embedded = false, detailMode = false, onViewDetails, onActionSuccess, actionLabel, hideActions = false }: EvidenceReviewCardProps) => {
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState('');
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  const [sourcePreview, setSourcePreview] = useState<{ url: string; contentType: string; body: string } | null>(null);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [sourceKind, setSourceKind] = useState<'document' | 'source_reference'>(
    /^https?:\/\//i.test(evidence.sourceDocumentPublicId ?? '') ? 'source_reference' : 'document',
  );
  const source = getSource(evidence.sourceId);
  const tier = useMemo(
    () => classifyEvidenceTier({ claimType: evidence.claimType, value: evidence.value }, source, corroborationCount),
    [evidence.claimType, evidence.value, corroborationCount, source],
  );
  const tierStyles: Record<string, { badge: string; text: string }> = {
    verified: { badge: 'bg-emerald-100 text-emerald-700', text: 'Verified' },
    supported: { badge: 'bg-amber-100 text-amber-700', text: 'Supported' },
    reference: { badge: 'bg-slate-200 text-slate-600', text: 'Reference' },
  };
  const { mutate: approve, isPending: isApproving } = useApproveEvidence();
  const { mutate: reject, isPending: isRejecting } = useRejectEvidence();
  const handleApprove = () => {
    approve(evidence._id, {
      onSuccess: (response) => {
        toast.success(response.message || 'Evidence approved.');
        onActionSuccess?.();
      },
      onError: (error: any) => toast.error(error?.response?.data?.message || 'Unable to approve evidence.'),
    });
  };

  const handleReject = () => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) return;

    reject(
      { evidenceId: evidence._id, reason: trimmedReason },
      {
        onSuccess: (response) => {
          toast.success(response.message || 'Evidence rejected.');
          setRejectMode(false);
          setReason('');
          onActionSuccess?.();
        },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Unable to reject evidence.'),
      },
    );
  };

  const handleViewDocument = async () => {
    setIsLoadingDocument(true);
    try {
      if (sourceKind === 'source_reference') {
        const response = await evidenceApi.getEvidenceSourceReference(evidence._id);
        setSourcePreview({
          ...response.data,
          body: formatSourceBody(response.data.body),
        });
        return;
      }

      const documentWindow = window.open('', '_blank', 'noopener,noreferrer');
      const response = await evidenceApi.getEvidenceDocumentUrl(evidence._id);
      setSourceKind(response.data.kind ?? 'document');
      if (documentWindow) {
        documentWindow.location.href = response.data.url;
      } else {
        window.open(response.data.url, '_blank', 'noopener,noreferrer');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to load the source document.');
    } finally {
      setIsLoadingDocument(false);
    }
  };

  const cardClassName = embedded
    ? 'space-y-3 border-t border-slate-200 pt-4 first:border-t-0 first:pt-0'
    : 'space-y-4 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-colors hover:border-[#00C9A7]/50 hover:shadow-md';

  const collapsedSummary = LIST_CLAIM_TYPES.has(evidence.claimType)
    ? `${getNearbyPlaces(evidence.value)?.length ?? 0} named nearby`
    : typeof evidence.value === 'number'
      ? `${evidence.value} total nearby`
      : formatValue(evidence.value);

  return (
    <div
      className={cardClassName}
      role={!detailMode && onViewDetails ? 'button' : undefined}
      tabIndex={!detailMode && onViewDetails ? 0 : undefined}
      onClick={!detailMode ? onViewDetails : undefined}
      onKeyDown={!detailMode && onViewDetails ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onViewDetails();
        }
      } : undefined}
    >
      {detailMode && !embedded && <EvidenceReviewHeader evidence={evidence} />}

      {!detailMode && <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{evidence.claimType}</span>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tierStyles[tier].badge}`}>
              {tierStyles[tier].text}
            </span>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              {Math.round(evidence.confidence * 100)}%
            </span>
          </div>
        </div>
        <p className="text-sm font-medium text-slate-700">{collapsedSummary}</p>
        {evidence.aiSummary && <p className="line-clamp-2 text-sm leading-5 text-slate-600">{evidence.aiSummary}</p>}
        <span className="inline-flex text-xs font-semibold text-[#008f79]">View details <span aria-hidden="true" className="ml-1">→</span></span>
      </div>}

      {detailMode && !embedded && <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Neighbourhood</p>
          <p className="mt-1 font-medium text-slate-700">{evidence.neighbourhoodName || evidence.entityId}</p>
        </div>
      </div>}

      {detailMode && <div className="space-y-2 rounded-lg bg-slate-50 p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{evidence.claimType}</span>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tierStyles[tier].badge}`}>
              {tierStyles[tier].text}
            </span>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              {Math.round(evidence.confidence * 100)}% confidence
            </span>
          </div>
        </div>
        {LIST_CLAIM_TYPES.has(evidence.claimType) && getNearbyPlaces(evidence.value) ? (
          <>
            <ul className="space-y-2 text-sm text-slate-700">
              {getNearbyPlaces(evidence.value)!.slice(0, isListExpanded ? undefined : 5).map((place, index) => (
                <li key={`${place.name}-${index}`} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 wrap-break-word">
                    {place.name}
                    {place.brand && <span className="ml-2 text-xs font-medium text-[#008f79]">{place.brand}</span>}
                  </span>
                  <span className="shrink-0 text-xs font-medium text-slate-500">{place.distanceKm.toFixed(2)} km</span>
                </li>
              ))}
            </ul>
            {getNearbyPlaces(evidence.value)!.length > 5 && (
              <button
                type="button"
                onClick={() => setIsListExpanded((current) => !current)}
                className="text-xs font-semibold text-[#008f79] hover:text-[#006f60]"
              >
                {isListExpanded ? 'Show less' : `Show all ${getNearbyPlaces(evidence.value)!.length}`}
              </button>
            )}
          </>
        ) : (
          <p className="wrap-break-word text-sm text-slate-700">{formatValue(evidence.value)}</p>
        )}

        {evidence.aiSummary && (
          <div className="rounded-lg border border-[#00C9A7]/20 bg-[#00C9A7]/5 p-2.5">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#008f79]">AI summary</p>
            <p className="text-sm leading-6 text-slate-700">{evidence.aiSummary}</p>
          </div>
        )}
      </div>}

      {detailMode && evidence.sourceDocumentPublicId && (
        <button
          type="button"
          onClick={handleViewDocument}
          disabled={isLoadingDocument}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:border-[#00C9A7] hover:text-[#00C9A7] disabled:opacity-50"
        >
          {isLoadingDocument ? <FileText className="h-3 w-3" /> : <ExternalLink className="h-3 w-3" />}
          {isLoadingDocument ? 'Loading source...' : sourceKind === 'source_reference' ? 'View source query' : 'View source document'}
        </button>
      )}

      {sourcePreview && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-label="Source query response">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">Source query response</p>
                <p className="truncate text-xs text-slate-500">{sourcePreview.contentType}</p>
              </div>
              <button
                type="button"
                onClick={() => setSourcePreview(null)}
                aria-label="Close source query response"
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <pre className="min-h-0 flex-1 overflow-auto bg-slate-950 p-4 text-xs leading-5 text-slate-100">{sourcePreview.body}</pre>
            <div className="flex justify-end border-t border-slate-200 px-4 py-3">
              <a
                href={sourcePreview.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-[#008f79] hover:text-[#006f60]"
              >
                Open raw URL in new tab
              </a>
            </div>
          </div>
        </div>
      )}

      {detailMode && !hideActions && rejectMode && (
        <div className="space-y-2">
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Reason for rejection..."
            rows={3}
            className="w-full resize-none rounded-lg border border-red-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReject}
              disabled={!reason.trim() || isRejecting}
              className="flex-1 rounded-lg bg-red-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {isRejecting ? 'Rejecting...' : 'Confirm reject'}
            </button>
            <button
              type="button"
              onClick={() => { setRejectMode(false); setReason(''); }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {detailMode && !hideActions && !rejectMode && (
        <div className="space-y-2">
          {actionLabel && <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{actionLabel}</p>}
          <div className="flex gap-2">
          <button
            type="button"
            onClick={handleApprove}
            disabled={isApproving}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#00C9A7] py-2.5 text-xs font-semibold text-[#0A1628] transition-colors hover:bg-[#00b396] disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            {isApproving ? 'Approving...' : 'Approve evidence'}
          </button>
          <button
            type="button"
            onClick={() => setRejectMode(true)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 py-2.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            <X className="h-3.5 w-3.5" />
            Reject
          </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const EvidenceReviewActions = ({ evidence, label, onActionSuccess }: { evidence: PendingEvidence; label: string; onActionSuccess?: () => void }) => {
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState('');
  const { mutate: approve, isPending: isApproving } = useApproveEvidence();
  const { mutate: reject, isPending: isRejecting } = useRejectEvidence();

  const handleReject = () => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) return;
    reject({ evidenceId: evidence._id, reason: trimmedReason }, {
      onSuccess: (response) => {
        toast.success(response.message || 'Evidence rejected.');
        setRejectMode(false);
        setReason('');
        onActionSuccess?.();
      },
      onError: (error: any) => toast.error(error?.response?.data?.message || 'Unable to reject evidence.'),
    });
  };

  return (
    <div className="space-y-2 border-t border-slate-200 pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      {rejectMode ? (
        <div className="space-y-2">
          <textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason for rejection..." rows={2} className="w-full resize-none rounded-lg border border-red-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200" />
          <div className="flex gap-2">
            <button type="button" onClick={handleReject} disabled={!reason.trim() || isRejecting} className="flex-1 rounded-lg bg-red-600 py-2 text-xs font-semibold text-white disabled:opacity-50">{isRejecting ? 'Rejecting...' : 'Confirm reject'}</button>
            <button type="button" onClick={() => { setRejectMode(false); setReason(''); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button type="button" onClick={() => approve(evidence._id, { onSuccess: (response) => { toast.success(response.message || 'Evidence approved.'); onActionSuccess?.(); }, onError: (error: any) => toast.error(error?.response?.data?.message || 'Unable to approve evidence.') })} disabled={isApproving} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#00C9A7] py-2.5 text-xs font-semibold text-[#0A1628] disabled:opacity-50"><Check className="h-3.5 w-3.5" />{isApproving ? 'Approving...' : 'Approve evidence'}</button>
          <button type="button" onClick={() => setRejectMode(true)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 py-2.5 text-xs font-semibold text-red-600"><X className="h-3.5 w-3.5" />Reject</button>
        </div>
      )}
    </div>
  );
};

export default EvidenceReviewCard;
