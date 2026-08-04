import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Send, Sparkles, Lock, MapPin, Home, ArrowUpRight,
  Zap, Shield, Droplets, Crown, ChevronRight, X, Loader2,
  FileCheck2, Building2, Rocket, Trash2, Bot,
} from 'lucide-react';
import { intelligenceApi, type IntelligenceMessage, type IntelligenceCard, type IntelligenceUsage, type NeighbourhoodIntelligenceSummary } from '../../api/intelligenceApi';
import type { IntelligenceBlock } from '../../types/intelligence.types';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import { IntelligenceBlockDisplay } from './IntelligenceBlockDisplay';
import type { IntelligenceCategory } from '../../types/intelligence.types';
import { INTELLIGENCE_CATEGORIES } from '../../types/intelligence.types';

// ─── Local keyframes ───────────────────────────────────────────────────────────

const LocalStyles = () => (
  <style>{`
    @keyframes kx-rise    { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes kx-pop     { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    @keyframes kx-glow    { 0%, 100% { opacity: .5; } 50% { opacity: 1; } }
    @keyframes kx-float   { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
    @keyframes kx-spin-slow { to { transform: rotate(360deg); } }
    @keyframes kx-dash    { 0% { stroke-dashoffset: 40; } 100% { stroke-dashoffset: 0; } }
    .kx-rise  { animation: kx-rise .4s cubic-bezier(.2,.7,.3,1) both; }
    .kx-pop   { animation: kx-pop .3s cubic-bezier(.2,.7,.3,1) both; }
    .kx-glow  { animation: kx-glow 2.6s ease-in-out infinite; }
    .kx-float { animation: kx-float 3s ease-in-out infinite; }
    .kx-spin-slow { animation: kx-spin-slow 6s linear infinite; }
  `}</style>
);

// ─── Plan config ──────────────────────────────────────────────────────────────

const PLANS = [
  { id: 'explorer', label: 'Explorer',  price: '₦2,500/mo', messages: '50 messages',  desc: 'Casual house hunters',               icon: Building2, highlight: false },
  { id: 'seeker',   label: 'Seeker',    price: '₦6,500/mo', messages: '200 messages', desc: 'Actively comparing areas',           icon: Rocket,    highlight: true  },
  { id: 'pro',      label: 'Pro',       price: '₦15,000/mo',messages: 'Unlimited',    desc: 'Agents, investors & serious buyers', icon: Crown,     highlight: false },
];

const getSuggestions = (areaName?: string) => [
  { icon: Zap,        text: areaName ? `What's the power supply like in ${areaName}?` : 'Which Lagos areas have the best power supply?' },
  { icon: Home,       text: areaName ? `Show me 2-bedroom apartments in ${areaName}` : 'Show me 3-bedroom apartments in Lekki' },
  { icon: Shield,     text: areaName ? `Is ${areaName} safe for families?` : 'Is Yaba good for young professionals?' },
  { icon: FileCheck2, text: 'What documents do I need to buy land in Lagos?' },
];

// ─── Inline card ──────────────────────────────────────────────────────────────

const InlineCard = ({ card }: { card: IntelligenceCard }) => {
  const isListing = card.type === 'listing';
  return (
    <Link
      to={card.linkPath}
      className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-[#00C9A7]/40 hover:-translate-y-0.5 p-3 transition-all duration-200 shadow-sm hover:shadow-[0_10px_28px_-14px_rgba(0,201,167,0.4)]"
    >
      <div className="h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-white/10 to-white/[0.03] ring-1 ring-white/10">
        {card.imageUrl ? (
          <img src={card.imageUrl} alt={card.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            {isListing ? <Home className="h-5 w-5 text-slate-400" /> : <MapPin className="h-5 w-5 text-[#00C9A7]" />}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{card.title}</p>
        {card.subtitle && <p className="text-xs text-[#00C9A7] font-medium mt-0.5">{card.subtitle}</p>}
        {card.type === 'neighbourhood' && card.meta && (
          <div className="flex gap-2.5 mt-1.5">
            {card.meta.powerScore    != null && <span className="text-[10px] text-slate-400 flex items-center gap-1"><Zap className="h-2.5 w-2.5 text-[#00C9A7]" />{card.meta.powerScore.toFixed(1)}</span>}
            {card.meta.securityScore != null && <span className="text-[10px] text-slate-400 flex items-center gap-1"><Shield className="h-2.5 w-2.5 text-[#00C9A7]" />{card.meta.securityScore.toFixed(1)}</span>}
            {card.meta.floodRisk               && <span className="text-[10px] text-slate-400 flex items-center gap-1"><Droplets className="h-2.5 w-2.5 text-amber-400" />{card.meta.floodRisk}</span>}
          </div>
        )}
        {card.type === 'listing' && card.meta && (
          <div className="flex gap-2 mt-1.5">
            {card.meta.bedrooms     && <span className="text-[10px] text-slate-400 rounded-full bg-white/5 px-1.5 py-0.5">{card.meta.bedrooms} bed</span>}
            {card.meta.propertyType && <span className="text-[10px] text-slate-400 rounded-full bg-white/5 px-1.5 py-0.5">{card.meta.propertyType}</span>}
            {card.meta.areaName     && <span className="text-[10px] text-slate-400 rounded-full bg-white/5 px-1.5 py-0.5">{card.meta.areaName}</span>}
          </div>
        )}
      </div>
      <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-[#00C9A7] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0" />
    </Link>
  );
};

interface IntelligenceChatMessage extends IntelligenceMessage {
  intelligence?: NeighbourhoodIntelligenceSummary | null;
}

const SOURCE_META: Record<string, { label: string; dot: string }> = {
  database: { label: 'From verified data', dot: 'bg-sky-400' },
  llm:      { label: 'AI-generated',       dot: 'bg-[#00C9A7]' },
  hybrid:   { label: 'Data + AI',          dot: 'bg-violet-400' },
};

// ─── Gradient-ring avatar ──────────────────────────────────────────────────────

const AgentAvatar = ({ size = 7 }: { size?: number }) => (
  <div className={`relative flex h-${size} w-${size} shrink-0 items-center justify-center rounded-full mt-0.5`}>
    <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[#00C9A7] to-teal-300 opacity-20 kx-glow" />
    <span className="absolute inset-0 rounded-full ring-1 ring-[#00C9A7]/30" />
    <Sparkles className="relative h-3.5 w-3.5 text-[#00C9A7]" />
  </div>
);

// ─── Message bubble ─────────────────────────────────────────────────────────────

const MessageBubble = ({ message }: { message: IntelligenceChatMessage }) => {
  const isUser = message.role === 'user';
  const sourceMeta = message.source ? SOURCE_META[message.source] : undefined;

  return (
    <div className={cn('flex gap-2.5 kx-rise', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && <AgentAvatar />}
      <div className={cn('space-y-2', isUser ? 'items-end flex flex-col max-w-[85%]' : 'flex-1 max-w-2xl')}>
        <div className={cn(
          'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-gradient-to-br from-[#00C9A7] to-[#00b396] text-[#0A1628] font-medium rounded-tr-md shadow-[0_6px_20px_-8px_rgba(0,201,167,0.55)]'
            : 'bg-white/[0.05] backdrop-blur-sm border border-white/10 text-slate-200 rounded-tl-md shadow-sm'
        )}>
          {message.content.split('\n').map((line, i) => (
            <span key={i}>
              {line.replace(/\*\*(.*?)\*\*/g, '$1')}
              {i < message.content.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>

        {!isUser && message.intelligence && (
          <div className="space-y-3 w-full">
            {INTELLIGENCE_CATEGORIES.map((category) => {
              const intelligenceRecord = message.intelligence as unknown as Record<IntelligenceCategory, IntelligenceBlock | null> | null;
              const block = intelligenceRecord?.[category];
              if (!block) return null;
              return <div key={category}><IntelligenceBlockDisplay category={category} block={block} compact /></div>;
            })}
          </div>
        )}

        {message.cards && message.cards.length > 0 && (
          <div className="space-y-2 w-full">
            {message.cards.map((card) => <InlineCard key={card.id} card={card} />)}
          </div>
        )}

        {!isUser && sourceMeta && (
          <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 px-1">
            <span className={cn('h-1.5 w-1.5 rounded-full', sourceMeta.dot)} />
            {sourceMeta.label}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Typing indicator ───────────────────────────────────────────────────────────

const TypingIndicator = () => (
  <div className="flex gap-2.5 justify-start kx-rise">
    <AgentAvatar />
    <div className="bg-white/[0.05] backdrop-blur-sm border border-white/10 rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-[#00C9A7] to-teal-300"
          style={{ animation: `kx-float 1s ease-in-out ${i * 0.15}s infinite` }}
        />
      ))}
    </div>
  </div>
);

// ─── Paywall modal ────────────────────────────────────────────────────────────

const PaywallModal = ({ usage, onClose, onUpgrade, isSubmitting }: {
  usage: IntelligenceUsage; onClose: () => void; onUpgrade: (plan: string) => void; isSubmitting: boolean;
}) => (
  <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#060D1A]/94 backdrop-blur-md rounded-[1.4rem] p-4 kx-pop">
    <div className="w-full max-w-sm relative">
      <button onClick={onClose} aria-label="Close" className="absolute -top-1 -right-1 h-7 w-7 flex items-center justify-center rounded-full text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
        <X className="h-4 w-4" />
      </button>
      <div className="text-center mb-5">
        <div className="relative flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00C9A7]/20 to-teal-300/10 border border-[#00C9A7]/25 mx-auto mb-3 kx-float">
          <Crown className="relative h-6 w-6 text-[#00C9A7]" />
        </div>
        <h3 className="text-lg font-bold text-white">
          {usage.plan === 'free' ? "You've used your 3 free messages" : 'Monthly limit reached'}
        </h3>
        <p className="text-sm text-slate-400 mt-1">Subscribe to keep chatting with the KhenX Intelligence Agent.</p>
      </div>
      <div className="space-y-2">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          return (
            <button
              key={plan.id}
              onClick={() => onUpgrade(plan.id)}
              disabled={isSubmitting}
              className={cn(
                'w-full flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all text-left',
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5',
                plan.highlight
                  ? 'border-[#00C9A7] bg-gradient-to-r from-[#00C9A7]/15 to-transparent shadow-[0_10px_28px_-14px_rgba(0,201,167,0.5)]'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20'
              )}
            >
              <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', plan.highlight ? 'bg-[#00C9A7]/20' : 'bg-white/5')}>
                <Icon className={cn('h-4 w-4', plan.highlight ? 'text-[#00C9A7]' : 'text-slate-400')} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{plan.label}</span>
                  {plan.highlight && <span className="rounded-full bg-[#00C9A7] px-1.5 py-0.5 text-[9px] font-bold text-[#0A1628] uppercase tracking-wide">Popular</span>}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{plan.messages} · {plan.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-[#00C9A7]">{plan.price}</p>
                <ChevronRight className="h-4 w-4 text-slate-500 ml-auto mt-0.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

// ─── Auth gate ────────────────────────────────────────────────────────────────

const AuthGate = () => (
  <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#060D1A]/94 backdrop-blur-md rounded-[1.4rem] p-6 kx-pop">
    <div className="text-center max-w-xs">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mx-auto mb-4 kx-float">
        <Lock className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-base font-bold text-white mb-1">Sign in to use the Agent</h3>
      <p className="text-sm text-slate-400 mb-5">Get 3 free messages to ask anything about Lagos neighbourhoods, properties, and more.</p>
      <div className="flex gap-2 justify-center">
        <Link to="/login" className="rounded-xl bg-gradient-to-br from-[#00C9A7] to-[#00b396] px-4 py-2 text-sm font-semibold text-[#0A1628] hover:brightness-110 hover:-translate-y-0.5 transition-all shadow-[0_8px_22px_-8px_rgba(0,201,167,0.6)]">
          Sign in
        </Link>
        <Link to="/signup" className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 hover:-translate-y-0.5 transition-all">
          Create account
        </Link>
      </div>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

interface IntelligenceChatProps {
  areaName?: string;
}

export default function IntelligenceChat({ areaName }: IntelligenceChatProps) {
  const { isAuthenticated } = useAuth();
  const [messages,    setMessages]    = useState<IntelligenceChatMessage[]>([]);
  const [input,       setInput]       = useState('');
  const [isTyping,    setIsTyping]    = useState(false);
  const [sessionId,   setSessionId]   = useState<string | null>(null);
  const [usage,       setUsage]       = useState<IntelligenceUsage | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isLoading,   setIsLoading]   = useState(false);
  const [upgrading,   setUpgrading]   = useState(false);
  const [focused,     setFocused]     = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing,    setClearing]    = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const suggestions = getSuggestions(areaName);

  useEffect(() => {
    if (!isAuthenticated) return;
    const loadSession = async () => {
      void Promise.resolve().then(() => { setIsLoading(true); setSessionId(null); setMessages([]); });
      try {
        const res = await intelligenceApi.getSession(areaName);
        const { session, usage } = res.data;
        setMessages(session?.messages ?? []);
        setSessionId(session?._id ?? null);
        setUsage(usage);
        if (usage?.remaining === 0) setShowPaywall(true);
      } catch {
        // ignore session load failures silently
      } finally {
        void Promise.resolve().then(() => setIsLoading(false));
      }
    };
    void loadSession();
  }, [isAuthenticated, areaName]);

  useEffect(() => {
    if (usage && usage.remaining !== null && usage.remaining <= 0) setShowPaywall(true);
  }, [usage]);

  useEffect(() => {
    if (!isAuthenticated) {
      void Promise.resolve().then(() => {
        setIsLoading(false); setMessages([]); setSessionId(null); setUsage(null); setShowPaywall(false);
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;
    if (usage && usage.remaining !== null && usage.remaining <= 0) { setShowPaywall(true); return; }

    const userMsg: IntelligenceMessage = { role: 'user', content: trimmed, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await intelligenceApi.sendMessage({ message: trimmed, sessionId: sessionId ?? undefined, areaContext: areaName });
      const { sessionId: sid, message, cards, source, intelligence, usage: newUsage } = res.data;
      if (sid) setSessionId(sid);
      setUsage(newUsage);
      const agentMsg: IntelligenceChatMessage = {
        role: 'agent', content: message, source: source as 'database' | 'llm' | 'hybrid',
        cards, intelligence: intelligence ?? null, createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, agentMsg]);
      if (newUsage.remaining === 0) setShowPaywall(true);
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number }; responseData?: { status?: string; message?: string }; message?: string };
      const isPlanLimitError =
        axiosError?.response?.status === 402 ||
        axiosError?.responseData?.status === 'plan_limit_reached' ||
        axiosError?.message?.includes('used your 3 free messages');
      if (isPlanLimitError) {
        setShowPaywall(true);
        setMessages((prev) => prev.slice(0, -1));
      } else {
        const errMsg: IntelligenceMessage = { role: 'agent', content: 'Something went wrong. Please try again.', createdAt: new Date().toISOString() };
        setMessages((prev) => [...prev, errMsg]);
      }
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  }, [isTyping, sessionId, areaName, usage]);

  const handleUpgrade = async (plan: string) => {
    setUpgrading(true);
    try {
      const currentPath = window.location.pathname + window.location.search;
      const data = await intelligenceApi.initializeSubscription(plan, currentPath);
      window.location.href = data.authorizationUrl;
    } catch (err) {
      console.error(err);
      setUpgrading(false);
    }
  };

  const handleClearChat = useCallback(async () => {
    setClearing(true);
    try {
      const api = intelligenceApi as unknown as { clearSession?: (sessionId?: string) => Promise<unknown> };
      if (api.clearSession) await api.clearSession(sessionId ?? undefined);
    } catch {
      // ignore
    } finally {
      setMessages([]); setSessionId(null); setInput(''); setShowPaywall(false); setShowClearConfirm(false); setClearing(false);
      inputRef.current?.focus();
    }
  }, [sessionId]);

  const isAtLimit   = usage && usage.remaining !== null && usage.remaining <= 0;
  const hasMessages = messages.length > 0;

  return (
    <div className="relative flex flex-col rounded-[1.4rem] bg-gradient-to-b from-[#0D1F38] to-[#060D1A] border border-white/10 overflow-hidden h-130 shadow-[0_24px_70px_-20px_rgba(0,0,0,0.7)]">
      <LocalStyles />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-48 w-80 rounded-full bg-[#00C9A7]/12 blur-[80px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-indigo-500/8 blur-[70px]" />

      {!isAuthenticated && !isLoading && <AuthGate />}
      {showPaywall && usage && (
        <PaywallModal usage={usage} onClose={() => setShowPaywall(false)} onUpgrade={handleUpgrade} isSubmitting={upgrading} />
      )}

      {/* ── Header ── */}
      <div className="relative flex items-center justify-between px-4 py-3.5 border-b border-white/8 shrink-0 bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#00C9A7]/25 to-teal-300/10 border border-[#00C9A7]/25">
            <span className="absolute inset-0 rounded-xl bg-[#00C9A7]/15 kx-glow" />
            <Bot className="relative h-4.5 w-4.5 text-[#00C9A7]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight tracking-tight">KhenX Intelligence</p>
            {areaName ? (
              <p className="text-[10px] text-[#00C9A7]/80 flex items-center gap-1 font-medium">
                <MapPin className="h-2.5 w-2.5" /> Viewing {areaName}
              </p>
            ) : (
              <p className="text-[10px] text-slate-500">Online now</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {usage && usage.plan === 'free' && (
            <div className="flex items-center gap-1.5">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={cn('h-1.5 w-4 rounded-full transition-colors duration-300', i < usage.used ? 'bg-[#00C9A7] shadow-[0_0_8px_rgba(0,201,167,0.6)]' : 'bg-white/10')} />
                ))}
              </div>
              <span className="text-[10px] text-slate-500">{3 - usage.used} free left</span>
            </div>
          )}
          {usage && usage.plan !== 'free' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#00C9A7]/10 border border-[#00C9A7]/20 px-2 py-0.5 text-[10px] text-[#00C9A7] font-semibold capitalize">
              <Crown className="h-2.5 w-2.5" /> {usage.plan} plan
            </span>
          )}
          {isAuthenticated && hasMessages && !isLoading && (
            <div className="relative">
              <button onClick={() => setShowClearConfirm((v) => !v)} title="Clear chat" aria-label="Clear chat" className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              {showClearConfirm && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowClearConfirm(false)} />
                  <div className="absolute right-0 top-9 z-40 w-52 rounded-2xl border border-white/10 bg-[#0F2038] p-3 shadow-[0_20px_48px_-14px_rgba(0,0,0,0.7)] kx-pop">
                    <p className="text-xs text-slate-300 mb-2.5 leading-relaxed">Clear this conversation? This can't be undone.</p>
                    <div className="flex gap-2">
                      <button onClick={() => setShowClearConfirm(false)} className="flex-1 rounded-lg border border-white/10 py-1.5 text-[11px] font-medium text-slate-300 hover:bg-white/5 transition-colors">Cancel</button>
                      <button onClick={handleClearChat} disabled={clearing} className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-red-500/15 border border-red-500/30 py-1.5 text-[11px] font-semibold text-red-300 hover:bg-red-500/25 disabled:opacity-50 transition-colors">
                        {clearing ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Clear'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-5 w-5 text-[#00C9A7] animate-spin" />
          </div>
        ) : !hasMessages ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-2">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00C9A7]/20 to-teal-300/5 border border-[#00C9A7]/20 mb-4 kx-float kx-rise">
              <Bot className="relative h-7 w-7 text-[#00C9A7]" />
            </div>
            <p className="text-sm font-semibold text-white mb-1 kx-rise" style={{ animationDelay: '80ms' }}>
              KhenX Intelligence Agent
            </p>
            <p className="text-xs text-slate-500 mb-6 max-w-xs leading-relaxed kx-rise" style={{ animationDelay: '140ms' }}>
              Ask me anything about{areaName ? ` ${areaName} or` : ''} Lagos properties, neighbourhoods, legal questions, and more.
            </p>
            <div className="w-full space-y-2">
              {suggestions.map(({ icon: Icon, text }, idx) => (
                <button
                  key={text}
                  onClick={() => send(text)}
                  className="w-full flex items-center gap-2.5 text-left text-xs text-slate-300 rounded-2xl border border-white/8 bg-white/[0.03] px-3.5 py-3 hover:border-[#00C9A7]/40 hover:bg-white/[0.07] hover:text-white hover:-translate-y-0.5 transition-all duration-200 kx-rise"
                  style={{ animationDelay: `${200 + idx * 60}ms` }}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#00C9A7]/15 to-transparent border border-[#00C9A7]/10">
                    <Icon className="h-3.5 w-3.5 text-[#00C9A7]" />
                  </span>
                  {text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => <MessageBubble key={i} message={m} />)}
            {isTyping && <TypingIndicator />}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className="border-t border-white/8 px-3 py-3 shrink-0 bg-white/[0.015]">
        {isAtLimit ? (
          <button
            onClick={() => setShowPaywall(true)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00C9A7]/15 to-transparent border border-[#00C9A7]/25 py-3 text-sm font-semibold text-[#00C9A7] hover:from-[#00C9A7]/25 transition-all"
          >
            <Crown className="h-4 w-4" />
            Subscribe to keep chatting
          </button>
        ) : (
          <div className={cn(
            'flex items-center gap-2 rounded-2xl border bg-white/[0.03] px-1 transition-all duration-200',
            focused ? 'border-[#00C9A7]/50 ring-2 ring-[#00C9A7]/15 shadow-[0_0_0_1px_rgba(0,201,167,0.1)]' : 'border-white/10'
          )}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send(input)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={isAuthenticated ? `Ask about ${areaName ?? 'Lagos neighbourhoods'}…` : 'Sign in to chat…'}
              disabled={!isAuthenticated || isTyping}
              className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none disabled:opacity-40"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || !isAuthenticated || isTyping}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#00C9A7] to-teal-400 text-[#0A1628] hover:brightness-110 hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:brightness-100 transition-all duration-200 m-1"
            >
              {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}