import { useMemo, useState, type ReactElement } from 'react';
import { ChevronDown, ChevronRight, FileCheck2 } from 'lucide-react';
import type { PendingEvidence } from '../../api/evidence.api';
import { classifyEvidenceTier, getEvidenceCorroborationCount, valuesAgree } from '../../lib/evidence-tier';
import { usePendingEvidenceSummary, useNeighbourhoodEvidence } from '../../hooks/useEvidence';
import EvidenceReviewCard from '../../components/admin/EvidenceReviewCard';
import EvidenceDetailModal from '../../components/admin/EvidenceDetailModal';
import EvidenceSubmissionForm from '../../components/evidence/EvidenceSubmissionForm';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import EmptyState from '../../components/shared/EmptyState';

const PAGE_LIMIT = 10;

const EVIDENCE_CATEGORY_ORDER = ['Infrastructure', 'Amenities', 'Hospital', 'Flooding', 'Transport', 'Other'] as const;
type EvidenceCategory = typeof EVIDENCE_CATEGORY_ORDER[number];

const EVIDENCE_CATEGORY_BY_CLAIM: Record<string, EvidenceCategory> = {
  bank_count: 'Amenities',
  market_count: 'Amenities',
  school_count_total: 'Amenities',
  school_nearest_list: 'Amenities',
  bank_nearest_list: 'Amenities',
  market_nearest_list: 'Amenities',
  nearest_hospital: 'Hospital',
  canal_proximity: 'Flooding',
  flood_risk: 'Flooding',
  travel_time_victoria_island: 'Transport',
  travel_time_ikeja: 'Transport',
  travel_time_lekki: 'Transport',
  travel_time_maryland: 'Transport',
  power_supply_hours: 'Infrastructure',
};

const groupEvidenceByCategory = (items: PendingEvidence[]) => {
  const grouped = Object.fromEntries(
    EVIDENCE_CATEGORY_ORDER.map((category) => [category, [] as PendingEvidence[]]),
  ) as Record<EvidenceCategory, PendingEvidence[]>;

  items.forEach((item) => {
    const category = EVIDENCE_CATEGORY_BY_CLAIM[item.claimType] ?? 'Other';
    grouped[category].push(item);
  });

  return grouped;
};

const EVIDENCE_PAIRS = [
  { countClaim: 'school_count_total', listClaim: 'school_nearest_list', label: 'Schools' },
  { countClaim: 'bank_count', listClaim: 'bank_nearest_list', label: 'Banks' },
  { countClaim: 'market_count', listClaim: 'market_nearest_list', label: 'Markets' },
] as const;

interface CompositeEvidenceCardProps {
  label: string;
  neighbourhoodName: string;
  countEvidence: PendingEvidence;
  listEvidence: PendingEvidence;
}

interface CompositeEvidenceCardPropsWithOpen extends CompositeEvidenceCardProps {
  onViewDetails: () => void;
}

const CompositeEvidenceCard = ({ label, neighbourhoodName, countEvidence, listEvidence, onViewDetails }: CompositeEvidenceCardPropsWithOpen) => (
  <div
    className="cursor-pointer space-y-3 rounded-xl border border-slate-300 bg-white p-5 text-left shadow-sm transition-colors hover:border-[#00C9A7]/50 hover:shadow-md"
    role="button"
    tabIndex={0}
    onClick={onViewDetails}
    onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onViewDetails();
      }
    }}
  >
    <div>
      <h4 className="text-base font-semibold text-[#0F172A]">{label} near {neighbourhoodName}</h4>
      <p className="mt-1 text-sm text-slate-600">
        {typeof countEvidence.value === 'number' ? countEvidence.value : String(countEvidence.value)} total nearby
      </p>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        {[countEvidence, listEvidence].map((item) => {
          const source = typeof item.sourceId === 'string' ? null : item.sourceId;
          const tier = classifyEvidenceTier({ claimType: item.claimType, value: item.value }, source, 0);
          return (
            <span key={item._id} className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-600">
              {tier} · {Math.round(item.confidence * 100)}%
            </span>
          );
        })}
        <span className="max-w-full">{countEvidence.aiSummary || listEvidence.aiSummary || 'Source-backed evidence pair'}</span>
      </div>
      <span className="shrink-0 text-xs font-semibold text-[#008f79]">View details <span aria-hidden="true">→</span></span>
    </div>
  </div>
);

interface NeighbourhoodSectionProps {
  neighbourhoodId: string;
  neighbourhoodName: string;
  count: number;
}

const NeighbourhoodSection = ({ neighbourhoodId, neighbourhoodName, count }: NeighbourhoodSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedEvidence, setSelectedEvidence] = useState<PendingEvidence | null>(null);
  const [pairedEvidence, setPairedEvidence] = useState<PendingEvidence | null>(null);
  const { data: sectionData, isLoading, isError, refetch } = useNeighbourhoodEvidence(neighbourhoodId, page, PAGE_LIMIT, isExpanded);
  const groupedEvidence = useMemo(
    () => groupEvidenceByCategory(sectionData?.items ?? []),
    [sectionData?.items],
  );

  const totalPages = sectionData?.pagination?.totalPages ?? 1;

  const renderGroupedEvidence = (items: PendingEvidence[]) => {
    const pendingItems = items.filter((item) => item.entityId === neighbourhoodId && item.status === 'pending_review');
    const consumed = new Set<string>();
    const rendered: ReactElement[] = [];

    EVIDENCE_PAIRS.forEach(({ countClaim, listClaim, label }) => {
      const countEvidence = pendingItems.find((item) => item.claimType === countClaim && !consumed.has(item._id));
      const listEvidence = pendingItems.find((item) => item.claimType === listClaim && !consumed.has(item._id));
      if (!countEvidence || !listEvidence) return;

      consumed.add(countEvidence._id);
      consumed.add(listEvidence._id);
      rendered.push(
        <CompositeEvidenceCard
          key={`${countEvidence._id}-${listEvidence._id}`}
          label={label}
          neighbourhoodName={neighbourhoodName}
          countEvidence={countEvidence}
          listEvidence={listEvidence}
          onViewDetails={() => {
            setSelectedEvidence(countEvidence);
            setPairedEvidence(listEvidence);
          }}
        />,
      );
    });

    pendingItems.forEach((item) => {
      if (consumed.has(item._id)) return;
      rendered.push(
        <EvidenceReviewCard
          key={item._id}
          evidence={item}
          corroborationCount={getEvidenceCorroborationCount(pendingItems, item)}
          onViewDetails={() => {
            setSelectedEvidence(item);
            setPairedEvidence(null);
          }}
        />,
      );
    });

    return rendered;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsExpanded((current) => !current)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <div>
          <p className="text-lg font-semibold text-[#0F172A]">{neighbourhoodName}</p>
          <p className="text-sm text-slate-500">{count} pending</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
            {count}
          </span>
          {isExpanded ? <ChevronDown className="h-5 w-5 text-slate-500" /> : <ChevronRight className="h-5 w-5 text-slate-500" />}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-slate-200 p-4">
          {isLoading && <LoadingSpinner label={`Loading ${neighbourhoodName} evidence...`} />}
          {isError && <ErrorMessage onRetry={refetch} />}

          {!isLoading && !isError && sectionData && sectionData.items.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              No pending evidence in this neighbourhood.
            </div>
          )}

          {!isLoading && !isError && sectionData && sectionData.items.length > 0 && (
            <>
              <div className="space-y-6">
                {EVIDENCE_CATEGORY_ORDER.map((category) => {
                  const items = groupedEvidence[category];
                  if (items.length === 0) return null;

                  return (
                    <section key={category} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">{category}</h3>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                          {items.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-5">
                        {renderGroupedEvidence(items)}
                      </div>
                    </section>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-slate-500">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={page >= totalPages}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <EvidenceDetailModal
        evidence={selectedEvidence}
        pairedEvidence={pairedEvidence}
        label={pairedEvidence ? `${pairedEvidence.claimType.replace(/_/g, ' ')} + ${selectedEvidence?.claimType.replace(/_/g, ' ')}` : selectedEvidence?.claimType.replace(/_/g, ' ')}
        onClose={() => {
          setSelectedEvidence(null);
          setPairedEvidence(null);
        }}
      />
    </div>
  );
};

const AdminEvidencePage = () => {
  const { data: summary = [], isLoading, isError, refetch } = usePendingEvidenceSummary();
  const totalPending = useMemo(() => summary.reduce((sum, item) => sum + item.count, 0), [summary]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Evidence Review</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review source-backed neighbourhood claims and approve or reject evidence submissions.
          </p>
        </div>
        {totalPending > 0 && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
            {totalPending} pending
          </span>
        )}
      </div>

      <EvidenceSubmissionForm />

      {isLoading && <LoadingSpinner label="Loading evidence summary..." />}
      {isError && <ErrorMessage onRetry={refetch} />}

      {!isLoading && !isError && summary.length === 0 && (
        <EmptyState
          icon={FileCheck2}
          title="No pending evidence"
          description="All submitted evidence has been reviewed."
        />
      )}

      {!isLoading && !isError && summary.length > 0 && (
        <div className="space-y-4">
          {summary.map((item) => (
            <NeighbourhoodSection
              key={item.neighbourhoodId}
              neighbourhoodId={item.neighbourhoodId}
              neighbourhoodName={item.neighbourhoodName}
              count={item.count}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEvidencePage;
