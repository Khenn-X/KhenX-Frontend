import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';

export default function MarketInsights() {
  return (
    <section className="py-12 bg-slate-50">
      <PageWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 rounded-2xl bg-white p-6">
            <h4 className="text-lg font-semibold text-[#0F172A]">Lagos Market Insights</h4>
            <p className="text-sm text-slate-500 mt-2">Real-time data on property demand and infrastructure performance across Lagos.</p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-[#0A1628]/5 p-4">
                <div className="text-sm text-slate-500">Average price change (YoY)</div>
                <div className="text-xl font-bold text-[#0F172A] mt-2">+4.2%</div>
              </div>
              <div className="rounded-lg bg-[#0A1628]/5 p-4">
                <div className="text-sm text-slate-500">Listings verified</div>
                <div className="text-xl font-bold text-[#0F172A] mt-2">84%</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6">
            <h5 className="text-sm font-semibold text-slate-500">Infrastructure Reliability Index</h5>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>Power uptime: <strong className="text-[#00C9A7]">82%</strong></li>
              <li>Flood risk: <strong className="text-yellow-500">Medium</strong></li>
              <li>Petrol frequency: <strong className="text-red-500">Low</strong></li>
            </ul>
            <button className="mt-6 rounded-md bg-[#00C9A7] px-4 py-2 text-sm font-semibold text-[#0A1628]">View Neighbourhood Intelligence</button>
          </div>
        </div>
      </PageWrapper>
    </section>
  );
}
