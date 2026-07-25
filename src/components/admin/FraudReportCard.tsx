import { useState } from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import type { IFraudReport, FraudReportStatus } from "../../api/fraud.api";
import { useUpdateFraudReport } from '../../hooks/useFraud';
import { ROUTES } from '../../constants/routes';
import { timeAgo, cn } from '../../lib/utils';

interface FraudReportCardProps {
  report: IFraudReport;
}

const statusConfig: Record<FraudReportStatus, { label: string; className: string }> = {
  open:          { label: 'Open',          className: 'bg-red-100 text-red-700' },
  investigating: { label: 'Investigating', className: 'bg-amber-100 text-amber-700' },
  resolved:      { label: 'Resolved',      className: 'bg-[#00C9A7]/10 text-[#00C9A7]' },
  dismissed:     { label: 'Dismissed',     className: 'bg-slate-100 text-slate-500' },
};

const FraudReportCard = ({ report }: FraudReportCardProps) => {
  const [notes, setNotes] = useState(report.adminNotes || '');
  const { mutate: updateReport, isPending } = useUpdateFraudReport();

  const update = (status: FraudReportStatus) => {
    updateReport({ id: report._id, payload: { status, adminNotes: notes || undefined } });
  };

  const sc = statusConfig[report.status];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Reported {timeAgo(report.createdAt)}</p>
            <p className="text-xs text-slate-400">
              By: {report.reportedBy ? 'Registered user' : 'Anonymous'}
            </p>
          </div>
        </div>
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0', sc.className)}>
          {sc.label}
        </span>
      </div>

      {/* Reason */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Reason</p>
        <p className="text-sm text-slate-700 leading-relaxed">{report.reason}</p>
      </div>

      {/* View listing link */}
      <a
        href={ROUTES.LISTING_DETAIL(report.listingId)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-[#00C9A7] hover:underline"
      >
        <ExternalLink className="h-3 w-3" />
        View reported listing
      </a>

      {/* Admin notes */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Admin notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Internal notes about this report..."
          rows={2}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#00C9A7] focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20 resize-none"
        />
      </div>

      {/* Status actions */}
      <div className="flex flex-wrap gap-2">
        {(['investigating', 'resolved', 'dismissed'] as FraudReportStatus[])
          .filter((s) => s !== report.status)
          .map((s) => (
            <button
              key={s}
              onClick={() => update(s)}
              disabled={isPending}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 capitalize',
                s === 'resolved'
                  ? 'border-[#00C9A7]/30 text-[#00C9A7] hover:bg-[#00C9A7]/10'
                  : s === 'investigating'
                  ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              )}
            >
              Mark {s}
            </button>
          ))}
      </div>
    </div>
  );
};

export default FraudReportCard;
