import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const dummyData = [
  { m: "Apr", a: 100, b: 40 }, { m: "May", a: 180, b: 150 }, { m: "Jun", a: 220, b: 300 },
  { m: "Jul", a: 260, b: 200 }, { m: "Aug", a: 300, b: 280 }, { m: "Sep", a: 260, b: 300 },
  { m: "Oct", a: 340, b: 260 }, { m: "Nov", a: 280, b: 340 }, { m: "Dec", a: 400, b: 380 },
];

const AreaChartCard = () => (
  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 h-[280px]">
    <p className="text-sm font-semibold text-[#002948]">Sales Overview</p>
    <p className="text-xs text-[#059669] font-medium mt-0.5">↑ 4% more this year</p>
    <ResponsiveContainer width="100%" height="80%">
      <AreaChart data={dummyData}>
        <defs>
          <linearGradient id="teal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#006A61" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#006A61" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="navy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#002948" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#002948" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis dataKey="m" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
        <Area type="monotone" dataKey="a" stroke="#006A61" fill="url(#teal)" strokeWidth={2} />
        <Area type="monotone" dataKey="b" stroke="#002948" fill="url(#navy)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default AreaChartCard;