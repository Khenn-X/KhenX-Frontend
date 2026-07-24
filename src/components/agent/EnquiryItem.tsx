import { MessageSquare, Phone, Mail, Clock, CheckCheck, Circle } from 'lucide-react';
import { type IEnquiry, type EnquiryStatus } from '../../types/enquiry.types';
import { useUpdateEnquiryStatus } from '../../hooks/useEnquiries';
import { formatDate, cn } from '../../lib/utils';

interface EnquiryItemProps {
  enquiry: IEnquiry;
}

const statusConfig: Record<EnquiryStatus, { label: string; icon: React.ElementType; className: string }> = {
  new:       { label: 'New',       icon: Circle,     className: 'bg-[#00C9A7]/10 text-[#00C9A7]' },
  read:      { label: 'Read',      icon: Clock,      className: 'bg-[#F59E0B]/10 text-[#F59E0B]' },
  responded: { label: 'Responded', icon: CheckCheck, className: 'bg-slate-100 text-slate-500' },
};

const EnquiryItem = ({ enquiry }: EnquiryItemProps) => {
  const { mutate: updateStatus, isPending } = useUpdateEnquiryStatus();
  const status = statusConfig[enquiry.status];
  const StatusIcon = status.icon;

  const listing = enquiry.listingId as { title: string; areaName: string } | null;

  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-5 transition-shadow hover:shadow-sm',
        enquiry.status === 'new' ? 'border-[#00C9A7]/30' : 'border-slate-200'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0A1628]">
            <MessageSquare className="h-4 w-4 text-[#00C9A7]" />
          </div>
          <div>
            <p className="font-semibold text-[#0F172A] text-sm">{enquiry.seekerName}</p>
            {listing && (
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">
                Re: {listing.title}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold', status.className)}>
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </span>
        </div>
      </div>

      {/* Message */}
      <p className="text-sm text-slate-600 leading-relaxed mb-4 pl-12">{enquiry.message}</p>

      {/* Contact + meta */}
      <div className="flex flex-wrap items-center gap-4 pl-12 text-xs text-slate-400">
        <a
          href={`mailto:${enquiry.seekerEmail}`}
          className="flex items-center gap-1.5 hover:text-[#00C9A7] transition-colors"
        >
          <Mail className="h-3.5 w-3.5" />
          {enquiry.seekerEmail}
        </a>
        {enquiry.seekerPhone && (
          <a
            href={`tel:${enquiry.seekerPhone}`}
            className="flex items-center gap-1.5 hover:text-[#00C9A7] transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            {enquiry.seekerPhone}
          </a>
        )}
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {formatDate(enquiry.createdAt)}
        </span>
      </div>

      {/* Actions */}
      {enquiry.status !== 'responded' && (
        <div className="mt-4 flex gap-2 pl-12">
          {enquiry.status === 'new' && (
            <button
              onClick={() => updateStatus({ id: enquiry._id, status: 'read' })}
              disabled={isPending}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Mark as read
            </button>
          )}
          <button
            onClick={() => updateStatus({ id: enquiry._id, status: 'responded' })}
            disabled={isPending}
            className="rounded-lg bg-[#0A1628] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0A1628]/90 disabled:opacity-50 transition-colors"
          >
            Mark as responded
          </button>
        </div>
      )}
    </div>
  );
};

export default EnquiryItem;
