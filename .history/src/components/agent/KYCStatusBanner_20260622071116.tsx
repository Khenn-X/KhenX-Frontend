import { CheckCircle, Clock, XCircle, AlertOctagon, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { KYCStatus } from '../../types/agent.types';
import { ROUTES } from '../../constants/routes';
import { cn } from '../../lib/utils';

interface KYCStatusBannerProps {
  status: KYCStatus;
  rejectionReason?: string;
  className?: string;
}

const config: Record<
  KYCStatus,
  {
    icon: React.ElementType;
    title: string;
    description: string;
    className: string;
    iconClass: string;
    cta?: { label: string; href: string };
  }
> = {
  pending: {
    icon: Clock,
    title: 'KYC verification pending',
    description:
      'Your documents have been submitted and are under review. This usually takes 1–2 business days.',
    className: 'bg-[#F59E0B]/5 border-[#F59E0B]/20',
    iconClass: 'bg-[#F59E0B]/10 text-[#F59E0B]',
  },
  approved: {
    icon: CheckCircle,
    title: 'KYC verified',
    description: 'Your identity is verified. You can now submit property listings.',
    className: 'bg-[#00C9A7]/5 border-[#00C9A7]/20',
    iconClass: 'bg-[#00C9A7]/10 text-[#00C9A7]',
  },
  rejected: {
    icon: XCircle,
    title: 'KYC verification failed',
    description: '',
    className: 'bg-[#DC2626]/5 border-[#DC2626]/20',
    iconClass: 'bg-[#DC2626]/10 text-[#DC2626]',
    cta: { label: 'Resubmit documents', href: ROUTES.AGENT.KYC },
  },
  suspended: {
    icon: AlertOctagon,
    title: 'Account suspended',
    description:
      'Your account has been suspended. All your listings have been paused. Please contact support.',
    className: 'bg-slate-100 border-slate-200',
    iconClass: 'bg-slate-200 text-slate-500',
  },
};

const KYCStatusBanner = ({ status, rejectionReason, className }: KYCStatusBannerProps) => {
  const { icon: Icon, title, description, className: bannerClass, iconClass, cta } = config[status];

  // Don't show banner if approved — it's the happy path, no need to interrupt
  if (status === 'approved') return null;

  return (
    <div className={cn('rounded-xl border p-4', bannerClass, className)}>
      <div className="flex items-start gap-3">
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', iconClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#0F172A] text-sm">{title}</p>
          <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
            {status === 'rejected' && rejectionReason
              ? `Reason: ${rejectionReason}`
              : description}
          </p>
          {cta && (
            <Link
              to={cta.href}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#DC2626] hover:underline"
            >
              {cta.label}
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default KYCStatusBanner;
