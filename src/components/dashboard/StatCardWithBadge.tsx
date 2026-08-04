import { cn } from "../../lib/utils";

interface StatCardWithBadgeProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  change: number; // e.g. 23 or -2
  iconBg: string;
}

const StatCardWithBadge = ({ icon: Icon, label, value, change, iconBg }: StatCardWithBadgeProps) => {
  const isPositive = change >= 0;
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-[#002948] tabular-nums">{value}</p>
          <span
            className={cn(
              "mt-1 inline-block text-xs font-semibold",
              isPositive ? "text-[#059669]" : "text-[#DC2626]"
            )}
          >
            {isPositive ? "+" : ""}{change}%
          </span>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", iconBg)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCardWithBadge;