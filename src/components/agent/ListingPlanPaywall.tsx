import { Crown, ChevronRight, X } from 'lucide-react';

interface ListingPlanPaywallProps {
  onClose: () => void;
  onUpgrade: (plan: string) => void;
  isSubmitting: boolean;
}

const PLANS = [
  { id: 'starter', label: 'Starter', price: '₦5,000/mo', desc: 'Unlock 5 more listings', icon: Crown, highlight: false },
  { id: 'growth', label: 'Growth', price: '₦15,000/mo', desc: 'Unlock 20 more listings', icon: Crown, highlight: true },
  { id: 'pro', label: 'Pro', price: '₦35,000/mo', desc: 'Unlimited listings', icon: Crown, highlight: false },
];

export default function ListingPlanPaywall({ onClose, onUpgrade, isSubmitting }: ListingPlanPaywallProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0A1628] p-6 shadow-[0_24px_80px_-36px_rgba(0,0,0,0.9)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#00C9A7]/25 bg-[#00C9A7]/10">
            <Crown className="h-6 w-6 text-[#00C9A7]" />
          </div>
          <h3 className="text-xl font-semibold text-white">You’ve reached your free listing limit</h3>
          <p className="mt-2 text-sm text-slate-400">
            Upgrade to a paid listing plan and keep creating listings for your portfolio.
          </p>
        </div>

        <div className="mt-6 space-y-2">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => onUpgrade(plan.id)}
              disabled={isSubmitting}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                plan.highlight
                  ? 'border-[#00C9A7] bg-[#00C9A7]/10 shadow-[0_8px_24px_-12px_rgba(0,201,167,0.45)]'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              } ${isSubmitting ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              <div>
                <p className="font-semibold text-white">{plan.label}</p>
                <p className="text-sm text-slate-400">{plan.desc}</p>
              </div>
              <div className="flex items-center gap-2 text-[#00C9A7]">
                <span className="font-semibold">{plan.price}</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
