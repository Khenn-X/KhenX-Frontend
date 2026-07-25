import { Link } from 'react-router-dom';
import { Newspaper, ArrowUpRight, ArrowRight } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';

const posts = [
  {
    id: '1',
    title: 'Lagos State Housing: New trends',
    excerpt: 'Market update and what it means for renters navigating a shifting price landscape across the mainland.',
    tag: 'Market',
  },
  {
    id: '2',
    title: '5 Red Flags to Check When Buying',
    excerpt: 'Avoid common pitfalls when buying property, from unclear titles to inflated agent valuations.',
    tag: 'Buying guide',
  },
  {
    id: '3',
    title: 'Understanding security ratings in Lagos',
    excerpt: 'How ratings are calculated and verified, and what patrol frequency actually tells you about an area.',
    tag: 'Security',
  },
];

export default function NewsGrid() {
  const [featured, ...rest] = posts;

  return (
    <section className="py-16 bg-white">
      <PageWrapper>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-[#0F172A]">News & market updates</h3>
            <p className="text-sm text-slate-500 mt-1">Latest articles and verified insights</p>
          </div>
          <Link
            to="/news"
            className="group flex items-center gap-1 text-sm text-[#00B396] font-semibold shrink-0 hover:text-[#00997f] transition-colors"
          >
            Read all
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Featured post */}
          <Link
            to={`/news/${featured.id}`}
            className="group rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all"
          >
            <div className="h-48 bg-gradient-to-br from-[#0A1628] to-[#0F2942] flex items-center justify-center relative">
              <Newspaper className="h-9 w-9 text-white/20" />
              <span className="absolute top-4 left-4 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white">
                {featured.tag}
              </span>
            </div>
            <div className="p-6">
              <h4 className="text-lg font-bold text-[#0F172A] group-hover:text-[#00997f] transition-colors">
                {featured.title}
              </h4>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">{featured.excerpt}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#00B396]">
                Read more
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>

          {/* Secondary posts */}
          <div className="grid grid-cols-1 gap-6">
            {rest.map((p) => (
              <Link
                key={p.id}
                to={`/news/${p.id}`}
                className="group flex gap-4 rounded-2xl border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div className="h-20 w-20 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Newspaper className="h-5 w-5 text-slate-300" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-[#00B396] uppercase tracking-wide">
                    {p.tag}
                  </span>
                  <h4 className="font-semibold text-[#0F172A] mt-1 group-hover:text-[#00997f] transition-colors">
                    {p.title}
                  </h4>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {p.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </PageWrapper>
    </section>
  );
}