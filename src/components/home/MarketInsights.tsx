import { Zap, Droplets, ShieldCheck } from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";

const stats = [
  {
    label: "Avg. Price Growth (YoY)",
    value: "+14.2%",
    fill: 70,
    color: "text-[#00C9A7]",
  },
  { label: "Avg. Utility Uptime", value: "64%", fill: 64, color: "text-white" },
  {
    label: "Listings Verified",
    value: "84%",
    fill: 84,
    color: "text-[#00C9A7]",
  },
  {
    label: "High-Confidence Data Coverage",
    value: "58%",
    fill: 58,
    color: "text-white",
  },
];

const metrics = [
  { label: "Power Uptime", value: "92%", icon: Zap, color: "text-[#00C9A7]" },
  {
    label: "Flood Risk",
    value: "Medium",
    icon: Droplets,
    color: "text-amber-500",
  },
  {
    label: "Patrol Frequency",
    value: "High",
    icon: ShieldCheck,
    color: "text-[#00C9A7]",
  },
];

export default function MarketInsights() {
  return (
    <section className="py-16 bg-[#0A1628]">
      <PageWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {" "}
          {/* Left — heading + stat grid, sits directly on the dark background */}
          <div className="lg:col-span-3">
            <h4 className="text-2xl sm:text-3xl font-bold text-white">
              Lagos Market Insights
            </h4>
            <p className="text-sm text-slate-400 mt-3 max-w-md leading-relaxed">
              Real-time data on price appreciation and infrastructure
              performance across 15+ mainland and island districts.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl bg-white/5 border border-white/5 p-4"
                >
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {s.label}
                  </div>
                  <div className={`mt-2 text-2xl font-bold ${s.color}`}>
                    {s.value}
                  </div>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#00C9A7] to-[#00b396]"
                      style={{ width: `${s.fill}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Right — white card, the only light surface in the section */}
          <div className="lg:col-span-2 rounded-2xl bg-white p-14 shadow-xl mt-4 lg:mt-0">
            <div className="flex items-center justify-between mb-5">
              <h5 className="text-base font-bold text-[#0F172A]">
                Infrastructure Reliability Index
              </h5>
              <span className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Feed
              </span>
            </div>

            <div className="space-y-4">
              {metrics.map((m) => {
                const Icon = m.icon;
                return (
                  <div
                    key={m.label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00C9A7]/10">
                        <Icon className="h-4 w-4 text-[#00C9A7]" />
                      </div>
                      <span className="text-sm font-semibold text-[#0F172A]">
                        {m.label}
                      </span>
                    </div>
                    <span className={`text-sm font-bold ${m.color}`}>
                      {m.value}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 text-center">
              <a
                href="/neighbourhood"
                className="text-sm font-semibold text-[#00C9A7] hover:underline"
              >
                View Neighbourhood Intelligence
              </a>
            </div>
          </div>
        </div>
      </PageWrapper>
    </section>
  );
}
