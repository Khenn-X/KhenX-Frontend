import { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { useSuspendAgent } from '../../hooks/useAdmin';

interface AgentSuspendModalProps {
  agentId: string;
  agentName: string;
  isOpen: boolean;
  onClose: () => void;
}

const AgentSuspendModal = ({ agentId, agentName, isOpen, onClose }: AgentSuspendModalProps) => {
  const [reason, setReason] = useState('');
  const { mutate: suspend, isPending } = useSuspendAgent();

  const handleSubmit = () => {
    if (reason.trim().length < 10) return;
    suspend(
      { id: agentId, reason },
      {
        onSuccess: () => {
          setReason('');
          onClose();
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
          <ShieldAlert className="h-6 w-6 text-red-600" />
        </div>

        <h3 className="text-lg font-semibold text-[#0F172A]">Suspend agent</h3>
        <p className="mt-1 text-sm text-slate-500">
          You are about to suspend <strong>{agentName}</strong>. Their listings will be paused and they will be notified by email.
        </p>

        <div className="mt-5">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Reason for suspension <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this agent is being suspended..."
            rows={4}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
          />
          {reason.length > 0 && reason.trim().length < 10 && (
            <p className="mt-1 text-xs text-red-500">Please provide at least 10 characters.</p>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={reason.trim().length < 10 || isPending}
            className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Suspending...' : 'Suspend agent'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentSuspendModal;
