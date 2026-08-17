import { useState } from 'react';
import { X, Clock, RotateCcw, RotateCw } from 'lucide-react';
import type { PaymentTransaction } from '../../api/admin.api';

interface PaymentTransactionDetailModalProps {
  transaction: PaymentTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const PaymentTransactionDetailModal = ({
  transaction,
  isOpen,
  onClose,
  onRefresh,
}: PaymentTransactionDetailModalProps) => {
  const [showReasonInput, setShowReasonInput] = useState<'reverse' | 'refund' | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !transaction) return null;

  const handleActionSubmit = async (action: 'reverse' | 'refund') => {
    setIsSubmitting(true);
    try {
      const endpoint =
        action === 'reverse'
          ? `/api/admin/payments/transactions/${transaction._id}/reverse`
          : `/api/admin/payments/transactions/${transaction._id}/refund`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() || undefined }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} transaction`);
      }

      setReason('');
      setShowReasonInput(null);
      onRefresh();
    } catch (error) {
      console.error(`${action} error:`, error);
      alert(`Failed to ${action} transaction. Check console for details.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canReverse = transaction.state === 'successful';
  const canRefund = transaction.state === 'successful' || transaction.state === 'reversed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white shadow-2xl overflow-y-auto">
        <button
          onClick={onClose}
          className="sticky top-4 right-4 float-right rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-[#0F172A]">Transaction details</h2>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  transaction.state === 'successful'
                    ? 'bg-emerald-50 text-emerald-700'
                    : transaction.state === 'pending'
                      ? 'bg-amber-50 text-amber-700'
                      : transaction.state === 'failed'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-slate-100 text-slate-700'
                }`}
              >
                {transaction.state}
              </span>
            </div>
            <p className="text-sm text-slate-500">{transaction.paymentReference}</p>
          </div>

          {/* Core transaction details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Amount</p>
              <p className="mt-1 text-lg font-bold text-[#0F172A]">
                ₦{(transaction.amount / 100).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Currency</p>
              <p className="mt-1 text-lg font-bold text-[#0F172A]">{transaction.currency}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Plan</p>
              <p className="mt-1 text-lg font-bold text-[#0F172A]">{transaction.plan}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Subscription type</p>
              <p className="mt-1 text-lg font-bold text-[#0F172A]">
                {transaction.subscriptionType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Payer type</p>
              <p className="mt-1 text-lg font-bold text-[#0F172A] capitalize">{transaction.payerType}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Payer email</p>
              <p className="mt-1 text-sm text-[#0F172A] break-words">{transaction.payerEmail}</p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Created</p>
              <p className="mt-1 text-sm text-slate-600">{new Date(transaction.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Updated</p>
              <p className="mt-1 text-sm text-slate-600">{new Date(transaction.updatedAt).toLocaleString()}</p>
            </div>
          </div>

          {/* State history timeline */}
          {transaction.stateHistory && transaction.stateHistory.length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-[#0F172A] mb-4">State history</h3>
              <div className="space-y-3">
                {transaction.stateHistory.map((entry, idx) => (
                  <div key={idx} className="flex gap-3 pl-4 relative">
                    <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-[#00C9A7] border-2 border-white" />
                    {idx < transaction.stateHistory.length - 1 && (
                      <div className="absolute left-[5px] top-5 w-0.5 h-6 bg-slate-200" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700 capitalize">{entry.state}</span>
                        <span className="text-xs text-slate-400">
                          {new Date(entry.changedAt).toLocaleString()}
                        </span>
                      </div>
                      {entry.reason && (
                        <p className="mt-1 text-xs text-slate-500">{entry.reason}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Metadata</h3>
              <div className="rounded-lg bg-slate-50 p-3 text-xs font-mono text-slate-600 whitespace-pre-wrap break-words">
                {JSON.stringify(transaction.metadata, null, 2)}
              </div>
            </div>
          )}

          {/* Admin actions */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h3 className="text-sm font-semibold text-[#0F172A]">Admin actions</h3>

            {showReasonInput ? (
              <div className="space-y-3 bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600">
                  {showReasonInput === 'reverse'
                    ? 'Enter an optional reason for reversing this transaction.'
                    : 'Enter an optional reason for refunding this transaction.'}
                </p>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason (optional)..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#00C9A7] focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleActionSubmit(showReasonInput)}
                    disabled={isSubmitting}
                    className={`flex-1 rounded-lg py-2 text-sm font-semibold text-white transition-colors ${
                      showReasonInput === 'reverse'
                        ? 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
                        : 'bg-purple-600 hover:bg-purple-700 disabled:opacity-50'
                    }`}
                  >
                    {isSubmitting
                      ? 'Processing...'
                      : showReasonInput === 'reverse'
                        ? 'Confirm reverse'
                        : 'Confirm refund'}
                  </button>
                  <button
                    onClick={() => {
                      setShowReasonInput(null);
                      setReason('');
                    }}
                    disabled={isSubmitting}
                    className="flex-1 rounded-lg border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReasonInput('reverse')}
                  disabled={!canReverse}
                  title={!canReverse ? `Can only reverse 'successful' transactions` : ''}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reverse
                </button>
                <button
                  onClick={() => setShowReasonInput('refund')}
                  disabled={!canRefund}
                  title={!canRefund ? `Can only refund 'successful' or 'reversed' transactions` : ''}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-purple-200 bg-purple-50 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <RotateCw className="h-4 w-4" />
                  Refund
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTransactionDetailModal;
