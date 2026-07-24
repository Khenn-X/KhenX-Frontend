import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Send, Sparkles, Lock, MapPin, Home, ArrowUpRight,
  Zap, Shield, Car, Droplets, Crown, ChevronRight, X, Loader2,
} from 'lucide-react';
import { intelligenceApi, type IntelligenceMessage, t IntelligenceCard, IntelligenceUsage } from '../../api/intelligenceApi';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

// ─── Plan config ──────────────────────────────────────────────────────────────

const PLANS = [
  { id: 'explorer', label: 'Explorer',  price: '₦2,500/mo', messages: '50 messages',   desc: 'Casual house hunters',             highlight: false },
  { id: 'seeker',   label: 'Seeker',    price: '₦6,500/mo', messages: '200 messages',  desc: 'Actively comparing areas',         highlight: true  },
  { id: 'pro',      label: 'Pro',       price: '₦15,000/mo',messages: 'Unlimited',     desc: 'Agents, investors & serious buyers', highlight: false },
];

// ─── Suggestion prompts shown before first message ────────────────────────────

const getSuggestions = (areaName?: string) => [
  areaName ? `What's the power supply like in ${areaName}?` : 'Which Lagos areas have the best power supply?',
  areaName ? `Show me 2-bedroom apartments in ${areaName}` : 'Show me 3-bedroom apartments in Lekki',
  areaName ? `Is ${areaName} safe for families?` : 'Is Yaba good for young professionals?',
  'What documents do I need to buy land in Lagos?',
];

// ─── Inline card ──────────────────────────────────────────────────────────────

const InlineCard = ({ card }: { card: IntelligenceCard }) => {
  const isListing = card.type === 'listing';

  return (
    <Link
      to={card.linkPath}
      className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#00C9A7]/30 p-3 transition-all"
    >
      {/* Image or icon */}
      <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-white/10">
        {card.imageUrl ? (
          <img src={card.imageUrl} alt={card.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            {isListing
              ? <Home className="h-5 w-5 text-slate-400" />
              : <MapPin className="h-5 w-5 text-[#00C9A7]" />
            }
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{card.title}</p>
        {card.subtitle && (
          <p className="text-xs text-[#00C9A7] font-medium mt-0.5">{card.subtitle}</p>
        )}
        {/* Mini score pills for neighbourhood cards */}
        {card.type === 'neighbourhood' && card.meta && (
          <div className="flex gap-2 mt-1">
            {card.meta.powerScore    != null && <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><Zap className="h-2.5 w-2.5 text-[#00C9A7]" />{card.meta.powerScore.toFixed(1)}</span>}
            {card.meta.securityScore != null && <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><Shield className="h-2.5 w-2.5 text-[#00C9A7]" />{card.meta.securityScore.toFixed(1)}</span>}
            {card.meta.floodRisk               && <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><Droplets className="h-2.5 w-2.5 text-amber-400" />{card.meta.floodRisk}</span>}
          </div>
        )}
        {card.type === 'listing' && card.meta && (
          <div className="flex gap-2 mt-1">
            {card.meta.bedrooms    && <span className="text-[10px] text-slate-400">{card.meta.bedrooms} bed</span>}
            {card.meta.propertyType && <span className="text-[10px] text-slate-400">{card.meta.propertyType}</span>}
            {card.meta.areaName    && <span className="text-[10px] text-slate-400">{card.meta.areaName}</span>}
          </div>
        )}
      </div>

      <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-[#00C9A7] transition-colors shrink-0" />
    </Link>
  );
};

// ─── Message bubble ───────────────────────────────────────────────────────────

const MessageBubble = ({ message }: { message: IntelligenceMessage }) => {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-2.5', isUser ? 'justify-end' : 'justify-start')}>
      {/* Agent avatar */}
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00C9A7]/15 border border-[#00C9A7]/20 mt-0.5">
          <Sparkles className="h-3.5 w-3.5 text-[#00C9A7]" />
        </div>
      )}

      <div className={cn('max-w-[85%] space-y-2', isUser && 'items-end flex flex-col')}>
        {/* Bubble */}
        <div className={cn(
          'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-[#00C9A7] text-[#0A1628] font-medium rounded-tr-sm'
            : 'bg-white/8 border border-white/10 text-slate-200 rounded-tl-sm'
        )}>
          {/* Render newlines */}
          {message.content.split('\n').map((line, i) => (
            <span key={i}>
              {line.replace(/\*\*(.*?)\*\*/g, '$1')}
              {i < message.content.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>

        {/* Attached cards */}
        {message.cards && message.cards.length > 0 && (
          <div className="space-y-2 w-full">
            {message.cards.map((card) => (
              <InlineCard key={card.id} card={card} />
            ))}
          </div>
        )}

        {/* Source badge */}
        {!isUser && message.source && (
          <span className="text-[10px] text-slate-600 px-1">
            {message.source === 'database' ? '📊 from database' : message.source === 'llm' ? '🤖 AI response' : ''}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Typing indicator ─────────────────────────────────────────────────────────

const TypingIndicator = () => (
  <div className="flex gap-2.5 justify-start">
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00C9A7]/15 border border-[#00C9A7]/20">
      <Sparkles className="h-3.5 w-3.5 text-[#00C9A7]" />
    </div>
    <div className="bg-white/8 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  </div>
);

// ─── Paywall modal ────────────────────────────────────────────────────────────

const PaywallModal = ({
  usage,
  onClose,
  onUpgrade,
}: {
  usage:     IntelligenceUsage;
  onClose:   () => void;
  onUpgrade: (plan: string) => void;
}) => (
  <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0A1628]/90 backdrop-blur-sm rounded-2xl p-4">
    <div className="w-full max-w-sm">
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
        <X className="h-4 w-4" />
      </button>

      <div className="text-center mb-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00C9A7]/10 border border-[#00C9A7]/20 mx-auto mb-3">
          <Crown className="h-6 w-6 text-[#00C9A7]" />
        </div>
        <h3 className="text-lg font-bold text-white">
          {usage.plan === 'free' ? "You've used your 3 free messages" : 'Monthly limit reached'}
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Subscribe to keep chatting with the KhenX Intelligence Agent.
        </p>
      </div>

      <div className="space-y-2">
        {PLANS.map((plan) => (
          <button
            key={plan.id}
            onClick={() => onUpgrade(plan.id)}
            className={cn(
              'w-full flex items-center justify-between rounded-xl border px-4 py-3 transition-all text-left',
              plan.highlight
                ? 'border-[#00C9A7] bg-[#00C9A7]/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            )}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{plan.label}</span>
                {plan.highlight && (
                  <span className="rounded-full bg-[#00C9A7] px-1.5 py-0.5 text-[9px] font-bold text-[#0A1628] uppercase">Popular</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{plan.messages} · {plan.desc}</p>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className="text-sm font-bold text-[#00C9A7]">{plan.price}</p>
              <ChevronRight className="h-4 w-4 text-slate-500 ml-auto mt-0.5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  </div>
);

// ─── Auth gate ────────────────────────────────────────────────────────────────

const AuthGate = () => (
  <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0A1628]/90 backdrop-blur-sm rounded-2xl p-6">
    <div className="text-center max-w-xs">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 border border-white/10 mx-auto mb-4">
        <Lock className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-base font-bold text-white mb-1">Sign in to use the Agent</h3>
      <p className="text-sm text-slate-400 mb-5">
        Get 3 free messages to ask anything about Lagos neighbourhoods, properties, and more.
      </p>
      <div className="flex gap-2 justify-center">
        <Link
          to="/login"
          className="rounded-xl bg-[#00C9A7] px-4 py-2 text-sm font-semibold text-[#0A1628] hover:bg-[#00b396] transition-colors"
        >
          Sign in
        </Link>
        <Link
          to="/signup"
          className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
        >
          Create account
        </Link>
      </div>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

interface IntelligenceChatProps {
  areaName?: string; // neighbourhood context from detail page
}

export default function IntelligenceChat({ areaName }: IntelligenceChatProps) {
  const { user, isAuthenticated } = useAuth();
  const [messages,    setMessages]    = useState<IntelligenceMessage[]>([]);
  const [input,       setInput]       = useState('');
  const [isTyping,    setIsTyping]    = useState(false);
  const [sessionId,   setSessionId]   = useState<string | null>(null);
  const [usage,       setUsage]       = useState<IntelligenceUsage | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isLoading,   setIsLoading]   = useState(true);
  const [upgrading,   setUpgrading]   = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const suggestions = getSuggestions(areaName);

  // Load existing session + usage on mount
  useEffect(() => {
    if (!isAuthenticated) { setIsLoading(false); return; }

    intelligenceApi.getSession(areaName)
      .then((res) => {
        const { session, usage } = res.data;
        if (session?.messages) setMessages(session.messages);
        if (session?._id)      setSessionId(session._id);
        setUsage(usage);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, areaName]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    // Optimistic user message
    const userMsg: IntelligenceMessage = { role: 'user', content: trimmed, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await intelligenceApi.sendMessage({
        message:     trimmed,
        sessionId:   sessionId ?? undefined,
        areaContext: areaName,
      });

      const { sessionId: sid, message, cards, source, usage: newUsage } = res.data;
      if (sid) setSessionId(sid);
      setUsage(newUsage);

      const agentMsg: IntelligenceMessage = {
        role: 'agent', content: message, source: source as any, cards, createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, agentMsg]);

      // Check if next message will hit the limit
      if (newUsage.remaining === 0) setShowPaywall(true);

    } catch (err: any) {
      if (err?.response?.status === 402) {
        setShowPaywall(true);
        setMessages((prev) => prev.slice(0, -1)); // remove optimistic message
      } else {
        const errMsg: IntelligenceMessage = {
          role: 'agent', content: 'Something went wrong. Please try again.', createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  }, [isTyping, sessionId, areaName]);

  const handleUpgrade = async (plan: string) => {
    setUpgrading(true);
    try {
      await intelligenceApi.upgradePlan(plan);
      setShowPaywall(false);
      // Refresh usage
      const res = await intelligenceApi.getSession(areaName);
      setUsage(res.data.usage);
    } catch {
      // TODO: redirect to payment page
    } finally {
      setUpgrading(false);
    }
  };

  const isAtLimit  = usage && usage.remaining !== null && usage.remaining <= 0;
  const hasMessages = messages.length > 0;

  return (
    <div className="relative flex flex-col rounded-2xl bg-[#0A1628] border border-white/8 overflow-hidden h-[520px]">

      {/* ── Auth gate ──────────────────────────────────────────────────────── */}
      {!isAuthenticated && !isLoading && <AuthGate />}

      {/* ── Paywall ────────────────────────────────────────────────────────── */}
      {showPaywall && usage && (
        <PaywallModal usage={usage} onClose={() => setShowPaywall(false)} onUpgrade={handleUpgrade} />
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00C9A7]/15 border border-[#00C9A7]/20">
            <Sparkles className="h-4 w-4 text-[#00C9A7]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">KhenX Intelligence</p>
            {areaName && <p className="text-[10px] text-slate-500">Viewing {areaName}</p>}
          </div>
        </div>

        {/* Usage indicator */}
        {usage && usage.plan === 'free' && (
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 w-4 rounded-full',
                    i < usage.used ? 'bg-[#00C9A7]' : 'bg-white/10'
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] text-slate-500">{3 - usage.used} free left</span>
          </div>
        )}
        {usage && usage.plan !== 'free' && (
          <span className="text-[10px] text-[#00C9A7] font-semibold capitalize">{usage.plan} plan</span>
        )}
      </div>

      {/* ── Messages area ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">

        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-5 w-5 text-slate-500 animate-spin" />
          </div>
        ) : !hasMessages ? (
          /* Welcome / suggestions state */
          <div className="flex flex-col items-center justify-center h-full text-center px-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00C9A7]/10 border border-[#00C9A7]/20 mb-4">
              <Sparkles className="h-6 w-6 text-[#00C9A7]" />
            </div>
            <p className="text-sm font-semibold text-white mb-1">KhenX Intelligence Agent</p>
            <p className="text-xs text-slate-500 mb-5 max-w-xs leading-relaxed">
              Ask me anything about{areaName ? ` ${areaName} or` : ''} Lagos properties, neighbourhoods, legal questions, and more.
            </p>
            <div className="w-full space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="w-full text-left text-xs text-slate-400 rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 hover:border-[#00C9A7]/30 hover:text-white transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <>
            {messages.map((m, i) => <MessageBubble key={i} message={m} />)}
            {isTyping && <TypingIndicator />}
          </>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ──────────────────────────────────────────────────────────── */}
      <div className="border-t border-white/8 px-3 py-3 shrink-0">
        {isAtLimit ? (
          <button
            onClick={() => setShowPaywall(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#00C9A7]/10 border border-[#00C9A7]/20 py-2.5 text-sm font-semibold text-[#00C9A7] hover:bg-[#00C9A7]/20 transition-colors"
          >
            <Crown className="h-4 w-4" />
            Subscribe to keep chatting
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send(input)}
              placeholder={isAuthenticated ? `Ask about ${areaName ?? 'Lagos neighbourhoods'}…` : 'Sign in to chat…'}
              disabled={!isAuthenticated || isTyping}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-[#00C9A7]/50 focus:outline-none focus:ring-1 focus:ring-[#00C9A7]/20 disabled:opacity-40"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || !isAuthenticated || isTyping}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00C9A7] text-[#0A1628] hover:bg-[#00b396] disabled:opacity-40 transition-colors"
            >
              {isTyping
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Send className="h-4 w-4" />
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}