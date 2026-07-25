import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAdminFraudReports } from '../../hooks/useFraud';
import type { FraudReportStatus } from '../../api/fraud.api';
import FraudReportCard from '../../components/admin/FraudReportCard';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import EmptyState from '../../components/shared/EmptyState';
import { cn } from '../../lib/utils';

const FILTERS: { label: string; value: FraudReportStatus | 'all' }[] = [
  { label: 'All',          value: 'all' },
  { label: 'Open',         value: 'open' },
  { label: 'Investigating',value: 'investigating' },
  { label: 'Resolved',     value: 'resolved' },
  { label: 'Dismissed',    value: 'dismissed' },
];

const AdminFraudPage = () => {
  const [activeFilter, setActiveFilter] = useState<FraudReportStatus | 'all'>('all');
  const { data, isLoading, isError, refetch } = useAdminFraudReports();
  const allReports = data?.data.reports ?? [];

  const filtered = activeFilter === 'all'
    ? allReports
    : allReports.filter((r) => r.status === activeFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Fraud Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review and action reports submitted by users about suspicious listings.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setActiveFilter(value)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
              activeFilter === value
                ? 'border-[#0A1628] bg-[#0A1628] text-white'
                : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
            )}
          >
            {label}
            {value !== 'all' && (
              <span className="ml-1.5 text-xs opacity-70">
                ({allReports.filter((r) => r.status === value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading && <LoadingSpinner label="Loading fraud reports..." />}
      {isError && <ErrorMessage onRetry={refetch} />}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          icon={AlertTriangle}
          title="No reports found"
          description={activeFilter === 'all' ? 'No fraud reports have been submitted yet.' : `No ${activeFilter} reports.`}
        />
      )}

      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((report) => (
            <FraudReportCard key={report._id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFraudPage;
