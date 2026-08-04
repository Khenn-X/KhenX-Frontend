import { useEffect, useState } from 'react';
import { Bot } from 'lucide-react';

interface IntelligenceChatTeaserProps {
  onTryNow: () => void;
}

const examples = [
  {
    question: 'Is Lekki Phase 1 safe for families?',
    answer:
      'Lekki Phase 1 has a security score of 8.4/10, low flood risk, and a 24-minute average commute to Victoria Island.',
  },
  {
    question: 'Show me 2-bedroom flats in Yaba',
    answer: 'Here is a sample listing with price, size, and amenities all organized for quick review.',
    card: {
      title: '2-bedroom flat near Yaba junction',
      subtitle: '₦1.8M · 2 bed · 850 sqft',
    },
  },
  {
    question: "What's the flood risk in Ajah?",
    answer:
      'Flood risk in Ajah is moderate — about 2 recorded events, roughly 1 day average recovery time.',
  },
];

export default function IntelligenceChatTeaser({ onTryNow }: IntelligenceChatTeaserProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % examples.length);
    }, 3500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-col rounded-[1.4rem] bg-linear-to-b from-[#0D1F38] to-[#060D1A] border border-white/10 overflow-hidden h-130 shadow-[0_24px_70px_-20px_rgba(0,0,0,0.7)]">
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-48 w-80 rounded-full bg-[#00C9A7]/12 blur-[80px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-indigo-500/8 blur-[70px]" />

      <div className="relative flex items-center justify-between px-4 py-3.5 border-b border-white/8 bg-white/2">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-[#00C9A7]/25 to-teal-300/10 border border-[#00C9A7]/25">
            <span className="absolute inset-0 rounded-xl bg-[#00C9A7]/15" />
            <Bot className="relative h-4.5 w-4.5 text-[#00C9A7]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight tracking-tight">KhenX Intelligence</p>
            <p className="text-[10px] text-slate-500">Experience the AI assistant before signing in.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-4 py-5">
        <div className="relative h-full">
          {examples.map((slide, idx) => (
            <div
              key={slide.question}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${idx === activeIndex ? 'opacity-100' : 'opacity-0'} space-y-5 h-full`}
            >
              <div className="rounded-3xl bg-white/4 border border-white/10 p-4">
                <div className="text-xs uppercase tracking-[0.25em] text-[#00C9A7]/70 mb-3">Example question</div>
                <div className="rounded-2xl bg-linear-to-br from-[#00C9A7] to-[#00b396] text-[#0A1628] px-4 py-3 text-sm font-semibold shadow-[0_14px_40px_-20px_rgba(0,201,167,0.65)]">
                  {slide.question}
                </div>
              </div>

              <div className="rounded-3xl bg-white/5 border border-white/10 p-4 space-y-4 text-slate-200">
                <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Agent preview</div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-sm leading-relaxed">
                  {slide.answer}
                </div>
                {slide.card && (
                  <div className="rounded-2xl border border-white/10 bg-white/4 p-3 transition-colors duration-200 hover:border-[#00C9A7]/40 hover:bg-white/8">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white truncate">{slide.card.title}</p>
                        <p className="text-xs text-[#00C9A7] mt-1">{slide.card.subtitle}</p>
                      </div>
                      <div className="rounded-2xl bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">Listing</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-6 pt-2">
        <div className="flex justify-center gap-2 mb-4">
          {examples.map((_, idx) => (
            <span
              key={idx}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${idx === activeIndex ? 'bg-[#00C9A7]' : 'bg-white/20'}`}
            />
          ))}
        </div>
        <button
          onClick={onTryNow}
          className="w-full rounded-2xl bg-linear-to-br from-[#00C9A7] to-[#00b396] px-4 py-3 text-sm font-semibold text-[#0A1628] shadow-[0_16px_40px_-18px_rgba(0,201,167,0.8)] hover:-translate-y-0.5 hover:brightness-110 transition-all"
        >
          Try it now — it’s free
        </button>
      </div>
    </div>
  );
}
