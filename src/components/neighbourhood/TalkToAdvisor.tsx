import { useState } from 'react';
import { Sparkles, Send, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TalkToAdvisorProps {
  areaName: string;
  suggestedQuestions?: string[];
}

const DEFAULT_QUESTIONS = [
  'Is this area good for a software developer?',
  'Is it safe for a young family?',
  'Stressful commute to VI?',
  'Flood risk concerns?',
];

export default function TalkToAdvisor({ areaName, suggestedQuestions }: TalkToAdvisorProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    {
      role: 'ai',
      text: `${areaName}'s nightlife is vibrant but more "industrial-chic" than the island's luxury lounges. You'll find local bars, street food spots, and a growing tech crowd.`,
    },
  ]);
  const [thinking, setThinking] = useState(false);

  const questions = suggestedQuestions ?? DEFAULT_QUESTIONS;

  const handleAsk = (q?: string) => {
    const text = (q ?? input).trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setThinking(true);
    // Placeholder — wire to real AI endpoint when available
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `Based on verified resident reports for ${areaName}, here's what we know about that.`,
        },
      ]);
      setThinking(false);
    }, 900);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-[#0A1628] px-5 py-4 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00C9A7]/15">
          <Sparkles className="h-4 w-4 text-[#00C9A7]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">KhenX AI Specialist</p>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00C9A7] animate-pulse" />
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Live Intelligence</span>
          </div>
        </div>
      </div>

      {/* Chat body */}
      <div className="flex-1 p-5 space-y-3 overflow-y-auto max-h-64 bg-slate-50">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                m.role === 'user'
                  ? 'bg-[#0A1628] text-white rounded-br-sm'
                  : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm'
              )}
            >
              {m.text}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-2.5 flex gap-1">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce"
                  style={{ animationDelay: `${d * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Suggested questions */}
      <div className="px-5 pt-3 flex flex-wrap gap-2 bg-white border-t border-slate-100">
        {questions.map((q) => (
          <button
            key={q}
            onClick={() => handleAsk(q)}
            className="text-xs rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600 hover:border-[#00C9A7] hover:text-[#00C9A7] transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-slate-300 shrink-0" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder={`Ask your own question about ${areaName}…`}
          className="flex-1 text-sm focus:outline-none placeholder:text-slate-400"
        />
        <button
          onClick={() => handleAsk()}
          disabled={!input.trim()}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00C9A7] text-[#0A1628] disabled:opacity-40 transition-opacity"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}