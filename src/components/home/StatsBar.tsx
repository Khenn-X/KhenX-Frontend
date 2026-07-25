import PageWrapper from '../../components/layout/PageWrapper';

const stats = [
  { label: 'Verified Listings', value: '100+' },
  { label: 'Verified Agents', value: '50+' },
  { label: 'Reviewed Areas', value: '32' },
  { label: 'Data Monitoring', value: '24/7' },
];

export default function StatsBar() {
  return (
    <section className="relative z-0 bg-[#0A1F33] py-6">
      <PageWrapper>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 divide-x-0 sm:divide-x divide-white/10 text-center">
          {stats.map((s) => (
            <div key={s.label} className="py-3">
              <div className="text-xl font-bold text-[#2DD4BF]">{s.value}</div>
              <div className="text-sm text-slate-300">{s.label}</div>
            </div>
          ))}
        </div>
      </PageWrapper>
    </section>
  );
}