import { Bell, ShoppingCart, CreditCard, KeyRound, DollarSign } from "lucide-react";
import { cn } from "../../lib/utils";

const events = [
  { icon: Bell, label: "New enquiry received", time: "22 DEC 7:20 PM", color: "bg-[#059669]" },
  { icon: ShoppingCart, label: "New listing #1832412", time: "21 DEC 11:00 PM", color: "bg-[#DC2626]" },
  { icon: CreditCard, label: "Subscription renewed", time: "21 DEC 9:34 AM", color: "bg-[#002948]" },
  { icon: KeyRound, label: "KYC document verified", time: "20 DEC 2:20 AM", color: "bg-[#D97706]" },
  { icon: DollarSign, label: "Payout processed", time: "18 DEC 4:54 PM", color: "bg-[#006A61]" },
];

const ActivityTimelineCard = () => (
  <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
    <p className="text-sm font-semibold text-[#002948] mb-4">Recent Activity</p>
    <div className="space-y-5">
      {events.map((e, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg text-white", e.color)}>
              <e.icon className="h-3.5 w-3.5" />
            </div>
            {i < events.length - 1 && <div className="w-px flex-1 bg-slate-100 mt-1" />}
          </div>
          <div className="pb-1">
            <p className="text-sm font-medium text-[#002948]">{e.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{e.time}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ActivityTimelineCard;