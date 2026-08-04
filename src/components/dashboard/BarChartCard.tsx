import { BarChart, Bar, ResponsiveContainer, YAxis } from "recharts";

const dummyData = [
  { m: "Jan", v: 120 }, { m: "Feb", v: 90 }, { m: "Mar", v: 40 },
  { m: "Apr", v: 180 }, { m: "May", v: 60 }, { m: "Jun", v: 150 },
  { m: "Jul", v: 70 }, { m: "Aug", v: 200 }, { m: "Sep", v: 100 },
  { m: "Oct", v: 130 }, { m: "Nov", v: 80 }, { m: "Dec", v: 160 },
];

const BarChartCard = () => (
  <div className="rounded-2xl bg-[#002948] p-6 h-[280px]">
    <p className="text-sm text-white/60 mb-4">Overview</p>
    <ResponsiveContainer width="100%" height="85%">
      <BarChart data={dummyData}>
        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
        <Bar dataKey="v" fill="#006A61" radius={[6, 6, 0, 0]} barSize={14} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default BarChartCard;