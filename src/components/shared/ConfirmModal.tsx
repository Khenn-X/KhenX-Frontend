import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ConfirmModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  isPending?: boolean;
}

const variantStyles = {
  danger: {
    icon: 'bg-red-100 text-red-600',
    button: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    icon: 'bg-amber-100 text-amber-600',
    button: 'bg-amber-500 hover:bg-amber-600 text-white',
  },
  default: {
    icon: 'bg-[#00C9A7]/10 text-[#00C9A7]',
    button: 'bg-[#0A1628] hover:bg-[#0A1628]/80 text-white',
  },
};

const ConfirmModal = ({
  isOpen,
  open,
  onClose,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isPending = false,
}: ConfirmModalProps) => {
  const isModalOpen = isOpen ?? open ?? false;
  const handleClose = onClose ?? onCancel;

  if (!isModalOpen) return null;

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-full', styles.icon)}>
          <AlertTriangle className="h-6 w-6" />
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-[#0F172A]">{title}</h3>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">{description}</p>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleClose}
            disabled={isPending}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={cn(
              'flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50',
              styles.button
            )}
          >
            {isPending ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
