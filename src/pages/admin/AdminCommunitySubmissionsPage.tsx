import { useQuery } from '@tanstack/react-query';
import { CalendarDays, FileCheck2, Mail, MapPin, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { neighbourhoodApi } from '../../api/neighbourhood.api';
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

const AdminCommunitySubmissionsPage = () => {
  const { data: submissions = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'resident-reports'],
    queryFn: () => neighbourhoodApi.listResidentReports(),
    select: (response) => response.data ?? [],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Community Submissions</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review each resident report as the original submission, with the evidence claims grouped beneath it.
        </p>
      </div>

      {isLoading && <LoadingSpinner label="Loading resident submissions..." />}
      {isError && <ErrorMessage onRetry={refetch} />}

      {!isLoading && !isError && submissions.length === 0 && (
        <EmptyState
          icon={FileCheck2}
          title="No resident submissions yet"
          description="Community reports will appear here once residents begin submitting local updates."
        />
      )}

      {!isLoading && !isError && submissions.length > 0 && (
        <div className="space-y-4">
          {submissions.map((report) => (
            <article key={report._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#00C9A7]" />
                    <p className="text-lg font-semibold text-[#0F172A]">{report.areaName}</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{report.streetEstate || 'Street or estate not provided'}</p>
                </div>

                <div className="text-left md:text-right">
                  <div className="flex items-center justify-start gap-2 md:justify-end">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(report.status)}`}>
                      {report.status.replace(/_/g, ' ')}
                    </span>
                    <span className="rounded-full bg-[#00C9A7]/10 px-2.5 py-1 text-xs font-semibold text-[#008f79]">
                      {report.evidenceCount} evidence claims
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{formatDate(report.createdAt)}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
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

              <div className="mt-4">
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

              {report.summary && (
                <div className="mt-4 rounded-xl bg-[#00C9A7]/5 p-3 text-sm text-slate-700">
                  <p className="font-medium text-[#0F172A]">Submission summary</p>
                  <p className="mt-1">{report.summary}</p>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <Link
                  to={`/admin/community-submissions/${report._id}`}
                  className="rounded-lg border border-[#00C9A7] bg-[#00C9A7]/5 px-3 py-2 text-sm font-semibold text-[#008f79] transition-colors hover:bg-[#00C9A7]/10"
                >
                  View details
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCommunitySubmissionsPage;
