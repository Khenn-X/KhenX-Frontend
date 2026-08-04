import { Users, MousePointerClick, ShoppingBag, Package } from "lucide-react";

const items = [
  { icon: Users, label: "Users", value: "36K", pct: 60, color: "bg-[#002948]" },
  { icon: MousePointerClick, label: "Clicks", value: "2M", pct: 45, color: "bg-[#006A61]" },
  { icon: ShoppingBag, label: "Sales", value: "$435", pct: 30, color: "bg-[#D97706]" },
  { icon: Package, label: "Items", value: "43", pct: 55, color: "bg-[#DC2626]" },
];

const ActiveUsersStrip = () => (
  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 mt-4">
    <p className="text-sm font-semibold text-[#002948]">Active Users</p>
    <p className="text-xs text-[#059669] font-medium mt-0.5">(+23%) than last week</p>
    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
      {items.map(({ icon: Icon, label, value, pct, color }) => (
        <div key={label}>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Icon className="h-3.5 w-3.5" /> {label}
          </div>
          <p className="mt-1 text-lg font-bold text-[#002948]">{value}</p>
          <div className="mt-1.5 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ActiveUsersStrip;