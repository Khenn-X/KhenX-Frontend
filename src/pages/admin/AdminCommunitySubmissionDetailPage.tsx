import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, Check, FileCheck2, Mail, MapPin, UserRound, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { neighbourhoodApi } from '../../api/neighbourhood.api';
import EvidenceReviewCard from '../../components/admin/EvidenceReviewCard';
import EmptyState from '../../components/shared/EmptyState';
import ErrorMessage from '../../components/shared/ErrorMessage';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const formatDate = (value?: string) => {
  if (!value) return 'Date not captured';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'verified':
      return 'bg-emerald-100 text-emerald-700';
    case 'rejected':
      return 'bg-red-100 text-red-700';
    case 'mixed':
      return 'bg-amber-100 text-amber-700';
    case 'pending_review':
      return 'bg-sky-100 text-sky-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

const AdminCommunitySubmissionDetailPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: report, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'resident-report', id],
    queryFn: () => neighbourhoodApi.getResidentReport(id ?? ''),
    enabled: Boolean(id),
    select: (response) => response.data ?? null,
  });

  const refreshReport = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'resident-report', id] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'resident-reports'] });
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading resident submission..." />;
  }

  if (isError || !report) {
    return (
      <div className="space-y-4">
        <Link to="/admin/community-submissions" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#0F172A]">
          <ArrowLeft className="h-4 w-4" />
          Back to submissions
        </Link>
        <ErrorMessage onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Link to="/admin/community-submissions" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#0F172A]">
          <ArrowLeft className="h-4 w-4" />
          Back to submissions
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#00C9A7]" />
                <h1 className="text-2xl font-bold text-[#0F172A]">{report.areaName}</h1>
              </div>
              <p className="mt-1 text-sm text-slate-500">{report.streetEstate || 'Street or estate not provided'}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(report.status)}`}>
                {report.status.replace(/_/g, ' ')}
              </span>
              <span className="rounded-full bg-[#00C9A7]/10 px-2.5 py-1 text-xs font-semibold text-[#008f79]">
                {report.evidenceCount} evidence claims
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
            <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3">
              <Mail className="mt-0.5 h-4 w-4 text-slate-500" />
              <div>
                <p className="font-medium text-[#0F172A]">Reporter email</p>
                <p>{report.reporterEmail || 'Not captured'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3">
              <UserRound className="mt-0.5 h-4 w-4 text-slate-500" />
              <div>
                <p className="font-medium text-[#0F172A]">Reporter name</p>
                <p>{report.reporterName || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3">
              <CalendarDays className="mt-0.5 h-4 w-4 text-slate-500" />
              <div>
                <p className="font-medium text-[#0F172A]">Report date</p>
                <p>{formatDate(report.reportDate)}</p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Claim types</p>
            <div className="flex flex-wrap gap-2">
              {report.claimTypes.length > 0 ? report.claimTypes.map((claimType) => (
                <span key={`${report._id}-${claimType}`} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {claimType.replace(/_/g, ' ')}
                </span>
              )) : (
                <span className="text-sm text-slate-500">No claim types yet</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-[#00C9A7]" />
            <h2 className="text-xl font-bold text-[#0F172A]">Evidence claims</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-emerald-700"><Check className="h-3.5 w-3.5" /> Verified</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-red-700"><X className="h-3.5 w-3.5" /> Rejected</span>
          </div>
        </div>

        {report.evidence.length === 0 ? (
          <EmptyState
            icon={FileCheck2}
            title="No evidence generated yet"
            description="This resident report has not produced nested evidence claims for review."
          />
        ) : (
          <div className="space-y-4">
            {report.evidence.map((item) => (
              <EvidenceReviewCard
                key={item._id}
                evidence={{
                  ...item,
                  sourceId: item.sourceId ?? '',
                  status: item.status,
                  observedAt: item.observedAt,
                  createdAt: report.createdAt,
                  updatedAt: report.createdAt,
                  confidence: item.confidence ?? 0,
                }}
                detailMode
                onActionSuccess={refreshReport}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCommunitySubmissionDetailPage;
