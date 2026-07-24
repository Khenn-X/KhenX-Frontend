import { useState } from 'react';
import { TrendingUp, BarChart3, ArrowRight, Download } from 'lucide-react';

// ─── Static data — to be replaced by API when available ──────────────────────

const APPRECIATION_DATA = [
  { year: '2020', value: 28  },
  { year: '2021', value: 40  },
  { year: '2022', value: 56  },
  { year: '2023', value: 72  },
  { year: '2024', value: 94  },
];

const TOP_AREAS = [
  { name: 'Ibeju-Lekki', growth: '+24%', positive: true  },
  { name: 'Eliada',       growth: '+14%', positive: true  },
  { name: 'Gbagada',      growth: '-3%',  positive: false },
];

const COMPARE_AREAS = [
  'Lekki Phase 1', 'Victoria Island', 'Yaba', 'Ikeja',
  'Surulere', 'Ibeju-Lekki', 'Ajah', 'Gbagada', 'Maryland',
];

// ─── Mini bar chart ───────────────────────────────────────────────────────────

const MiniBarChart = () => {
  const max = Math.max(...APPRECIATION_DATA.map((d) => d.value));

  return (
    <div className="flex items-end gap-2 h-24">
      {APPRECIATION_DATA.map((d, i) => {
        const isLast = i === APPRECIATION_DATA.length - 1;
        const pct = (d.value / max) * 100;
        return (
          <div key={d.year} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full relative" style={{ height: 80 }}>
              <div
                className={`absolute bottom-0 w-full rounded-t-md transition-all ${
                  isLast ? 'bg-[#00C9A7]' : 'bg-slate-200'
                }`}
                style={{ height: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400">{d.year}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Compare widget ──────────────────────────────────────────────────────────

const CompareWidget = () => {
  const [areaA, setAreaA] = useState('Yaba');
  const [areaB, setAreaB] = useState('Badagry');

  const selectClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#00C9A7] focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20';

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00C9A7]/10">
          <BarChart3 className="h-4 w-4 text-[#00C9A7]" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#0F172A]">Compare Neighbourhoods</p>
          <p className="text-xs text-slate-400">Side-by-side intelligence scores</p>
        </div>
      </div>

      <div className="space-y-3 flex-1">
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Area A</label>
          <select
            value={areaA}
            onChange={(e) => setAreaA(e.target.value)}
            className={selectClass}
          >
            {COMPARE_AREAS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-center">
          <span className="text-xs font-bold text-slate-400 bg-slate-100 rounded-full px-3 py-1">VS</span>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Area B</label>
          <select
            value={areaB}
            onChange={(e) => setAreaB(e.target.value)}
            className={selectClass}
          >
            {COMPARE_AREAS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      <a
        href={`/neighbourhoods/compare?a=${encodeURIComponent(areaA)}&b=${encodeURIComponent(areaB)}`}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A1628] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0A1628]/90 transition-colors"
      >
        Launch Comparison
        <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  );
};

// ─── Section ──────────────────────────────────────────────────────────────────

export default function LagoMarketInsights() {
  return (
    <section>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#00C9A7] mb-1">
          Data Intelligence
        </p>
        <h3 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">Lagos Market Insights</h3>
        <p className="text-sm text-slate-500 mt-1">
          Residential rent across Lagos grew by an average of 34.2% YoY in 2024.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

        {/* Appreciation trend chart */}
        <div className="sm:col-span-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-sm font-bold text-[#0F172A]">Rent Appreciation Trend</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Based on verified rent & liquidity data
              </p>
            </div>
            <div className="flex items-center gap-1 text-[#00C9A7]">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-bold">+34.2% YoY</span>
            </div>
          </div>

          <MiniBarChart />

          <div className="mt-5 border-t border-slate-100 pt-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
              Top Performance Areas
            </p>
            <p className="text-xs text-slate-400 mb-3">Based on rent and liquidity data</p>
            <div className="space-y-2">
              {TOP_AREAS.map((a) => (
                <div key={a.name} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{a.name}</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      a.positive
                        ? 'bg-[#00C9A7]/10 text-[#00C9A7]'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {a.growth}
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#0A1628] hover:text-[#00C9A7] transition-colors">
              <Download className="h-3.5 w-3.5" />
              Download Full Report
            </button>
          </div>
        </div>

        {/* Compare widget */}
        <CompareWidget />

      </div>
    </section>
  );
}