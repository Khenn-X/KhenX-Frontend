import { useState } from 'react';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  navy: '#071428',
  navyMid: '#0a1e36',
  navyCard: '#0f2240',
  teal: '#00C9A7',
  tealDim: 'rgba(0,201,167,0.12)',
  tealBorder: 'rgba(0,201,167,0.25)',
  white: '#FFFFFF',
  offWhite: '#F8FAFC',
  border: '#E2E8F0',
  borderDark: 'rgba(255,255,255,0.08)',
  slate: '#64748B',
  slateLight: '#94A3B8',
  text: '#0F172A',
  textMid: '#334155',
  amber: '#F59E0B',
  red: '#EF4444',
  green: '#10B981',
  blue: '#3B82F6',
};

const font = "'Inter', 'Segoe UI', sans-serif";

// ─── Shared ───────────────────────────────────────────────────────────────────
const Eyebrow = ({ label, light = false }: { label: string; light?: boolean }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 7,
    background: light ? 'rgba(0,201,167,0.12)' : 'rgba(0,201,167,0.1)',
    border: `1px solid ${C.tealBorder}`,
    borderRadius: 20, padding: '4px 12px', marginBottom: 16,
  }}>
    <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.teal }} />
    <span style={{ fontSize: 10, fontWeight: 700, color: C.teal, letterSpacing: '1px', textTransform: 'uppercase' as const }}>
      {label}
    </span>
  </div>
);

const ScoreDot = ({ color }: { color: string }) => (
  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, marginRight: 7, marginTop: 2 }} />
);

// ─── SECTION 1: Hero ─────────────────────────────────────────────────────────
const HeroSection = () => (
  <section style={{
    background: `linear-gradient(115deg, ${C.navy} 0%, #0a2035 40%, #0d2d3a 70%, #0a2535 100%)`,
    padding: '72px 0 80px',
    position: 'relative', overflow: 'hidden',
  }}>
    {/* grid texture */}
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: 'linear-gradient(rgba(0,201,167,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,201,167,0.02) 1px,transparent 1px)',
      backgroundSize: '56px 56px',
    }} />
    <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,180,140,0.14) 0%,transparent 70%)' }} />

    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: '1fr 480px', gap: 60, alignItems: 'center' }}>

      {/* Left */}
      <div>
        <Eyebrow label="How KhenX Works" light />
        <h1 style={{ fontSize: 54, fontWeight: 900, color: C.white, lineHeight: 1.1, letterSpacing: '-2px', margin: '0 0 20px' }}>
          Know before<br />
          you pay.{' '}
          <span style={{ color: C.teal }}>Every time.</span>
        </h1>
        <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,0.58)', lineHeight: 1.75, maxWidth: 400, margin: '0 0 36px' }}>
          KhenX combines verified property listings with independent neighbourhood intelligence — so you can make the most important financial decision of your life with real data, not guesswork.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={{ background: C.teal, color: C.navy, border: 'none', borderRadius: 10, padding: '13px 26px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Browse Listings →
          </button>
          <button style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(255,255,255,0.18)', borderRadius: 10, padding: '12px 22px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            See Neighbourhood Scores
          </button>
        </div>
      </div>

      {/* Right — Neighbourhood Intelligence mockup card */}
      <div style={{ position: 'relative' }}>
        {/* Verified Agent badge */}
        <div style={{
          position: 'absolute', bottom: 16, right: 0, zIndex: 10,
          background: 'rgba(10,22,40,0.92)', border: `1px solid ${C.tealBorder}`,
          borderRadius: 20, padding: '7px 14px',
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.teal }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: C.white }}>Verified Agent</span>
        </div>

        {/* Main intelligence card */}
        <div style={{ background: C.navyCard, borderRadius: 18, padding: '22px 24px', border: `1px solid ${C.borderDark}`, boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize: 10, color: C.teal, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: 4 }}>
            Neighbourhood Intelligence
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.white, marginBottom: 20 }}>Lekki Phase 1, Lagos</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Power Supply', val: '7.2', sub: 'Based on 30-day avg.', color: C.teal, unit: '/10' },
              { label: 'Flood Risk', val: 'Low', sub: 'Elevation confirmed', color: C.teal, unit: '' },
              { label: 'Security Score', val: '8.0', sub: 'Gated + CCTV coverage', color: C.teal, unit: '/10' },
              { label: 'Commute Index', val: '8.5', sub: 'BRT + 3rd Mainland', color: '#60d4bd', unit: '/10' },
            ].map(sc => (
              <div key={sc.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '12px 14px', border: `1px solid ${C.borderDark}` }}>
                <div style={{ fontSize: 10, color: C.slateLight, marginBottom: 6, fontWeight: 500 }}>{sc.label}</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: sc.color, letterSpacing: '-0.8px', lineHeight: 1 }}>
                  {sc.val}<span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>{sc.unit}</span>
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 5 }}>{sc.sub}</div>
              </div>
            ))}
          </div>

          {/* AI insight strip */}
          <div style={{ background: C.tealDim, borderRadius: 10, padding: '10px 14px', border: `1px solid ${C.tealBorder}`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              <span style={{ fontSize: 10, color: C.navy, fontWeight: 900 }}>✦</span>
            </div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
              Lekki Phase 1 avg. rent up 18% in Q1 2025. Best value currently in eastern corridor areas.
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ─── SECTION 2: Three Steps ───────────────────────────────────────────────────
const [STEP_SEARCH, STEP_INTEL, STEP_SIGN] = [0, 1, 2];

const ThreeStepsSection = () => {
  const [activeStep, setActiveStep] = useState(STEP_SEARCH);

  const steps = [
    { num: '01', icon: '🔍', label: 'Search Smart', color: C.teal },
    { num: '02', icon: '📊', label: 'Check Intelligence', color: C.teal },
    { num: '03', icon: '✅', label: 'Connect & Close', color: C.teal },
  ];

  return (
    <section style={{ background: C.white, padding: '80px 0' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48 }}>
          <div style={{ maxWidth: 440 }}>
            <Eyebrow label="The Process" />
            <h2 style={{ fontSize: 38, fontWeight: 900, color: C.text, letterSpacing: '-1px', lineHeight: 1.15, margin: '0 0 14px' }}>
              Three steps to your<br />
              <span style={{ color: C.teal }}>perfect Lagos property</span>
            </h2>
            <p style={{ fontSize: 14, color: C.slate, lineHeight: 1.75, margin: 0 }}>
              From the first search to the final handshake — KhenX keeps you informed at every stage.
            </p>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.slate, cursor: 'pointer', flexShrink: 0 }}>
            →
          </div>
        </div>

        {/* Step tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 48, borderBottom: `1px solid ${C.border}`, paddingBottom: 0 }}>
          {steps.map((st, i) => (
            <button key={i} onClick={() => setActiveStep(i)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px',
              border: 'none', borderBottom: activeStep === i ? `2px solid ${C.teal}` : '2px solid transparent',
              background: 'transparent',
              fontSize: 13, fontWeight: activeStep === i ? 700 : 500,
              color: activeStep === i ? C.teal : C.slate,
              cursor: 'pointer', transition: 'all 0.2s',
              marginBottom: -1,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: activeStep === i ? C.teal : C.slateLight }}>{st.num}</span>
              {st.label}
            </button>
          ))}
        </div>

        {/* Step content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'flex-start' }}>
          {/* Left copy */}
          <div>
            <div style={{ fontSize: 11, color: C.teal, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' as const, marginBottom: 8 }}>
              STEP {steps[activeStep].num}
            </div>
            {activeStep === STEP_SEARCH && (
              <>
                <h3 style={{ fontSize: 34, fontWeight: 900, color: C.text, letterSpacing: '-0.8px', lineHeight: 1.15, margin: '0 0 20px' }}>
                  Search with<br />
                  <span style={{ color: C.teal }}>real intelligence</span>
                </h3>
                <p style={{ fontSize: 14, color: C.slate, lineHeight: 1.75, marginBottom: 28 }}>
                  Tell KhenX what you need in plain english — or use our filters to narrow down by area, budget, bedrooms, flood risk, and power score. Our AI engine is built specifically for Lagos.
                </p>
                {[
                  { title: 'Natural Language Search', desc: 'Type things like "3-bed flat under ₦3M with good power" and you\'ll get results.' },
                  { title: 'Intelligence Filters', desc: 'Filter simultaneously by flood zone, security rating, and commute score — not just bedrooms and price.' },
                  { title: '32 Lagos Neighbourhoods', desc: 'Every search runs across our verified Lagos neighbourhood database with full intelligence scores.' },
                ].map(item => (
                  <div key={item.title} style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.teal, flexShrink: 0, marginTop: 6 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3 }}>{item.title}</div>
                      <div style={{ fontSize: 12.5, color: C.slate, lineHeight: 1.65 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
            {activeStep === STEP_INTEL && (
              <>
                <h3 style={{ fontSize: 34, fontWeight: 900, color: C.text, letterSpacing: '-0.8px', lineHeight: 1.15, margin: '0 0 20px' }}>
                  Check every<br />
                  <span style={{ color: C.teal }}>neighbourhood score</span>
                </h3>
                <p style={{ fontSize: 14, color: C.slate, lineHeight: 1.75, marginBottom: 28 }}>
                  Before you visit any property, review the full neighbourhood intelligence report. Every area has independently sourced data across four critical dimensions.
                </p>
                {[
                  { title: 'Power Supply Score', desc: 'Know exactly how many hours of electricity to expect per day, based on 30-day community tracking.' },
                  { title: 'Flood Risk Classification', desc: 'Topographic mapping plus historical flood data to street level — not LGA-level guesses.' },
                  { title: 'Security & Commute Ratings', desc: 'Real traffic commute times plus estate security reports from residents, not agents.' },
                ].map(item => (
                  <div key={item.title} style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.teal, flexShrink: 0, marginTop: 6 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3 }}>{item.title}</div>
                      <div style={{ fontSize: 12.5, color: C.slate, lineHeight: 1.65 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
            {activeStep === STEP_SIGN && (
              <>
                <h3 style={{ fontSize: 34, fontWeight: 900, color: C.text, letterSpacing: '-0.8px', lineHeight: 1.15, margin: '0 0 20px' }}>
                  Connect &<br />
                  <span style={{ color: C.teal }}>close with confidence</span>
                </h3>
                <p style={{ fontSize: 14, color: C.slate, lineHeight: 1.75, marginBottom: 28 }}>
                  Every agent on KhenX has been vetted and rated. See their deal history, response rate, and client reviews before you make contact.
                </p>
                {[
                  { title: 'Verified Agent Profiles', desc: 'Identity checked, business registered, and listing history confirmed before any agent goes live.' },
                  { title: 'Schedule Inspections In-App', desc: 'Book property viewings directly — no third-party WhatsApp chains or ghost agents.' },
                  { title: 'Transaction Records', desc: 'Your activity and inspection history is documented throughout the process for your protection.' },
                ].map(item => (
                  <div key={item.title} style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.teal, flexShrink: 0, marginTop: 6 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3 }}>{item.title}</div>
                      <div style={{ fontSize: 12.5, color: C.slate, lineHeight: 1.65 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Right — search mockup */}
          <div style={{ background: C.navyCard, borderRadius: 18, overflow: 'hidden', border: `1px solid ${C.borderDark}`, boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }}>
            {/* Browser chrome */}
            <div style={{ background: '#0a1628', padding: '10px 16px', display: 'flex', gap: 6, alignItems: 'center', borderBottom: `1px solid ${C.borderDark}` }}>
              {['#FF5F57', '#FFBD2E', '#28C840'].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '4px 12px', marginLeft: 8 }}>
                <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)' }}>khenx.ng/search</span>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              {/* Search bar */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 14px', border: `1px solid ${C.borderDark}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>🔍</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>3-bed flat under ₦3M with good power</span>
                </div>
                <div style={{ background: C.teal, borderRadius: 10, padding: '10px 16px', fontSize: 12, fontWeight: 700, color: C.navy, cursor: 'pointer' }}>Search</div>
              </div>
              {/* Filter chips */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginBottom: 16 }}>
                {['Rent', 'Power 7+', 'Flood: Low', '3 Beds', 'Lekki'].map(chip => (
                  <span key={chip} style={{ background: 'rgba(0,201,167,0.12)', border: `1px solid ${C.tealBorder}`, borderRadius: 20, padding: '4px 11px', fontSize: 10.5, color: C.teal, fontWeight: 600 }}>{chip}</span>
                ))}
              </div>
              {/* Listing rows */}
              {[
                { name: '2-Bed Flat, Ikate Elegushi', area: 'Lekki · Power 8.5 · Flood: Low', price: '₦1.9M', score: 8.5 },
                { name: '3-Bed Apartment, Herbert Macauley', area: 'Yaba · Power 7.2 · Flood: Low', price: '₦1.5M', score: 7.2 },
                { name: '3-Bed, Ibeju-Lekki', area: 'Ajah · Power 6.1 · Flood: Medium', price: '₦890k', score: 6.1 },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: C.white, marginBottom: 3 }}>{row.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{row.area}</div>
                  </div>
                  <div style={{ textAlign: 'right' as const }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.white }}>{row.price}</div>
                    <div style={{ fontSize: 10, color: C.teal, fontWeight: 700, marginTop: 2 }}>Score {row.score}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── SECTION 3: Four Scores ───────────────────────────────────────────────────
const FourScoresSection = () => (
  <section style={{ background: C.offWhite, padding: '80px 0' }}>
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <Eyebrow label="Neighbourhood Intelligence" />
        <h2 style={{ fontSize: 42, fontWeight: 900, color: C.text, letterSpacing: '-1px', margin: '0 0 10px' }}>
          Four scores. <span style={{ color: C.teal }}>Complete picture.</span>
        </h2>
        <p style={{ fontSize: 14.5, color: C.slate, maxWidth: 440, margin: '0 auto', lineHeight: 1.7 }}>
          Lagos neighbourhood intelligence — updated daily from verified, independent sources.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {[
          {
            icon: '⚡',
            title: 'Power Supply Score',
            color: '#F59E0B',
            bgColor: '#FFFBEB',
            borderColor: '#FDE68A',
            desc: 'Power reliability is the single most impactful issue in Lagos living — and the most consistently misrepresented on unfair listings.',
            bullets: [
              'Community-verified NEPA/EKEDC ratings for all listings',
              'Generator fuel cost estimates + estimated hours per day avg.',
              'Monthly trend data — know if power score is improving or declining',
            ],
            scoreLabel: 'AVG POWER SCORE / LEKKI',
            scoreVal: '6.2 / 10',
          },
          {
            icon: '🌊',
            title: 'Flood Risk Classification',
            color: '#3B82F6',
            bgColor: '#EFF6FF',
            borderColor: '#BFDBFE',
            desc: 'Like intelligence — high-resolution per neighbourhood, coastal proximity, drainage infrastructure, and historical flood events all factor in.',
            bullets: [
              'NiMet and resident-validated elevation data + street-level flood mapping',
              'Rainy 2024 updates show 60+ areas now "low" due to new drainage',
              'We show 3 tiers clearly: Low, Medium, High — with explanations',
            ],
            scoreLabel: 'FLOOD PRONE AREAS / LAGOS',
            scoreVal: '38%',
          },
          {
            icon: '🛡️',
            title: 'Security Rating',
            color: '#10B981',
            bgColor: '#F0FDF4',
            borderColor: '#BBF7D0',
            desc: 'A composite score built from incident data, police presence, estate security arrangements, and resident reports across all neighbourhoods.',
            bullets: [
              'Verified crime rate + incident data by quarter from area sources',
              'Estate gate security, CCTV coverage, and guard presence all scored',
              'Resident satisfaction score weighted at 40% of total security rating',
            ],
            scoreLabel: 'AVG SECURITY SCORE / LEKKI',
            scoreVal: '7/10',
          },
          {
            icon: '🚌',
            title: 'Commute Intelligence',
            color: '#8B5CF6',
            bgColor: '#F5F3FF',
            borderColor: '#DDD6FE',
            desc: 'Real journey times between listings and Lagos business districts — accounting for peak-hour traffic bottlenecks and the Bridge situation.',
            bullets: [
              'Peak-hour drive time measured to VI, the Island, and Ikeja CBD',
              'BRT stop proximity measured (<500m = premium commute score)',
              'We factor in the Lekki-Ikoyi Bridge, and the Bridge tolls vehicle weighting',
            ],
            scoreLabel: 'PEAK COMMUTE TO ISLAND',
            scoreVal: '45 min',
          },
        ].map(card => (
          <div key={card.title} style={{
            background: card.bgColor,
            borderRadius: 18, padding: '28px 26px',
            border: `1px solid ${card.borderColor}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, border: `1px solid ${card.borderColor}` }}>
                {card.icon}
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: '0 0 6px' }}>{card.title}</h3>
                <p style={{ fontSize: 12.5, color: C.slate, margin: 0, lineHeight: 1.65 }}>{card.desc}</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8, marginBottom: 20 }}>
              {card.bullets.map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <span style={{ fontSize: 9, color: '#fff', fontWeight: 900 }}>✓</span>
                  </div>
                  <span style={{ fontSize: 12, color: C.textMid, lineHeight: 1.6 }}>{b}</span>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${card.borderColor}` }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.slate, letterSpacing: '0.5px' }}>{card.scoreLabel}</span>
              <span style={{ fontSize: 16, fontWeight: 900, color: card.color }}>{card.scoreVal}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── SECTION 4: What the Numbers Mean ────────────────────────────────────────
const NumbersMeanSection = () => (
  <section style={{ background: C.white, padding: '80px 0' }}>
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 440px', gap: 64, alignItems: 'flex-start' }}>
      {/* Left */}
      <div>
        <Eyebrow label="Reading the Scores" />
        <h2 style={{ fontSize: 38, fontWeight: 900, color: C.text, letterSpacing: '-1px', lineHeight: 1.15, margin: '0 0 22px' }}>
          What the numbers<br />
          <span style={{ color: C.teal }}>actually mean</span>
        </h2>
        <p style={{ fontSize: 14, color: C.slate, lineHeight: 1.75, marginBottom: 28 }}>
          Every score is on a 0–10 scale. Here's how to read them at a glance — and what to look out for when shortlisting properties.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 20 }}>
          {[
            {
              title: 'Scores are independent of agents',
              body: 'Agents pay no way to improve their neighbourhood score. The data is what it is — no exceptions.',
            },
            {
              title: 'Scores are updated daily',
              body: 'Our data pipeline refreshes within 24 hours. If data is older than 72 hours, the data age is displayed clearly on the listing.',
            },
            {
              title: 'Contextual level is always shown',
              body: 'Every intelligence gives power score a contextualising — use Medium or High — based on the firmly-verified reliable data point.',
            },
          ].map(item => (
            <div key={item.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.teal, flexShrink: 0, marginTop: 6 }} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: C.slate, lineHeight: 1.65 }}>{item.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Score interpretation guide card */}
      <div style={{ background: C.navyCard, borderRadius: 18, padding: '24px', border: `1px solid ${C.borderDark}`, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, letterSpacing: '0.8px', textTransform: 'uppercase' as const, marginBottom: 18 }}>
          Score Interpretation Guide
        </div>
        {[
          { range: '9–10', label: 'Excellent', color: '#00C9A7', pct: 100, bg: 'rgba(0,201,167,0.15)' },
          { range: '7–8', label: 'Good', color: '#60D4BD', pct: 80, bg: 'rgba(96,212,189,0.12)' },
          { range: '5–6', label: 'Average', color: '#F59E0B', pct: 60, bg: 'rgba(245,158,11,0.15)' },
          { range: '3–4', label: 'Below Average', color: '#F97316', pct: 40, bg: 'rgba(249,115,22,0.15)' },
          { range: '0–2', label: 'Poor', color: '#EF4444', pct: 20, bg: 'rgba(239,68,68,0.15)' },
        ].map(tier => (
          <div key={tier.range} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: tier.color, minWidth: 36 }}>{tier.range}</span>
                <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)' }}>{tier.label}</span>
              </div>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ width: `${tier.pct}%`, height: '100%', background: tier.color, borderRadius: 6 }} />
            </div>
          </div>
        ))}
        <div style={{ marginTop: 20, padding: '14px', background: C.tealDim, borderRadius: 12, border: `1px solid ${C.tealBorder}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, marginBottom: 6 }}>Pro tip</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
            Look for listings where the neighbourhood scores are consistently above 7.0 across all four dimensions — these are the strongest all-round properties in Lagos.
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ─── SECTION 5: Agent Verification ───────────────────────────────────────────
const AgentVerificationSection = () => (
  <section style={{ background: C.offWhite, padding: '80px 0' }}>
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <Eyebrow label="Agent Verification" />
        <h2 style={{ fontSize: 42, fontWeight: 900, color: C.text, letterSpacing: '-1px', margin: '0 0 14px' }}>
          How we vet every<br />
          <span style={{ color: C.teal }}>agent on KhenX</span>
        </h2>
        <p style={{ fontSize: 14.5, color: C.slate, maxWidth: 420, margin: '0 auto', lineHeight: 1.7 }}>
          Anyone can call themselves a property agent in Lagos. On KhenX, they pass our 4-step verification process.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
        {[
          {
            step: '1',
            icon: '🪪',
            title: 'Identity Check',
            body: 'Government-issued ID verified against NIN database. Driver\'s licence or voter\'s card accepted.',
          },
          {
            step: '2',
            icon: '🏢',
            title: 'Business Check',
            body: 'Business or CAC registration number confirmed with a live business verification against the CAC list.',
          },
          {
            step: '3',
            icon: '📋',
            title: 'Listing Review',
            body: 'Every listing submitted by a new agent goes through a review by our Lagos team before going live. Prior violations are tracked.',
          },
          {
            step: '4',
            icon: '✅',
            title: 'Verified Badge',
            body: 'All agents pass KhenX review receive a verified badge. The badge is visible on every listing and on their agent profile.',
          },
        ].map(card => (
          <div key={card.step} style={{ background: C.white, borderRadius: 18, padding: '26px 22px', border: `1px solid ${C.border}`, textAlign: 'center' as const }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: C.navy,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, margin: '0 auto 18px', border: `2px solid ${C.teal}22`,
            }}>
              {card.icon}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, letterSpacing: '0.8px', marginBottom: 8 }}>STEP {card.step}</div>
            <h3 style={{ fontSize: 14.5, fontWeight: 800, color: C.text, marginBottom: 10 }}>{card.title}</h3>
            <p style={{ fontSize: 12.5, color: C.slate, lineHeight: 1.7, margin: 0 }}>{card.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── SECTION 6: FAQ + Numbers ─────────────────────────────────────────────────
const FaqSection = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    { q: 'How do you verify property listings?', a: 'Every listing submitted is cross-checked against ownership documents, agent credentials, and our proprietary database of known fraudulent listings in Lagos. Listings with unverified titles are marked clearly and cannot receive booking requests.' },
    { q: 'Can agents pay to improve their intelligence scores?', a: 'No. Neighbourhood intelligence scores are calculated independently from our data pipeline — agents have no ability to influence or improve them. This is a core principle of the KhenX platform.' },
    { q: 'How often are neighbourhood scores updated?', a: 'Scores are refreshed from our data sources every 24 hours. The "last updated" timestamp is visible on every neighbourhood intelligence report so you always know the data age.' },
    { q: 'Is KhenX only for renters, or can I buy property too?', a: 'KhenX currently hosts rental listings as our primary focus, but we are actively building out a property purchase section with ownership verification. Purchase listings will be available from Q3 2025.' },
  ];

  return (
    <section style={{ background: C.white, padding: '80px 0' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 420px', gap: 64, alignItems: 'flex-start' }}>
        {/* Left — FAQ */}
        <div>
          <Eyebrow label="Common Questions" />
          <h2 style={{ fontSize: 38, fontWeight: 900, color: C.text, letterSpacing: '-1px', lineHeight: 1.15, margin: '0 0 32px' }}>
            Questions people<br />
            <span style={{ color: C.teal }}>ask us most</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column' as const }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', background: 'none', border: 'none',
                    padding: '18px 0', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', cursor: 'pointer', gap: 16,
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.text, textAlign: 'left' as const }}>{faq.q}</span>
                  <span style={{ fontSize: 20, color: C.slate, flexShrink: 0, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', lineHeight: 1 }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ fontSize: 13.5, color: C.slate, lineHeight: 1.75, paddingBottom: 18 }}>{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right — by the numbers card */}
        <div>
          <div style={{ background: C.navyCard, borderRadius: 18, padding: '28px 26px', border: `1px solid ${C.borderDark}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, letterSpacing: '0.8px', textTransform: 'uppercase' as const, marginBottom: 6 }}>KhenX by the numbers</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 22 }}>Real platform data as of 2025</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 22 }}>
              {[
                { val: '1,200+', label: 'Verified Listings', color: C.teal },
                { val: '450+', label: 'Verified Agents', color: C.teal },
                { val: '32', label: 'Neighbourhoods', color: C.white },
                { val: '₦2.3B', label: 'In Listings Tracked', color: C.white },
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{ fontSize: 30, fontWeight: 900, color: stat.color, letterSpacing: '-1px', lineHeight: 1 }}>{stat.val}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 5 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: `1px solid ${C.borderDark}`, paddingTop: 18 }}>
              {[
                'All agents ID + verified before listing',
                'Flood reports refreshed within 24 hours',
                'Scores update from independent data pipeline',
                'KhenX-compliant — zero data sold to developers',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginBottom: 9 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: C.tealDim, border: `1px solid ${C.tealBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <span style={{ fontSize: 8, color: C.teal, fontWeight: 900 }}>✓</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── SECTION 7: Bottom CTA ────────────────────────────────────────────────────
const BottomCtaSection = () => (
  <section style={{
    background: `linear-gradient(115deg, ${C.navy} 0%, #0a2035 50%, #0d2d3a 100%)`,
    padding: '80px 0',
    position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,201,167,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,201,167,0.02) 1px,transparent 1px)', backgroundSize: '56px 56px' }} />
    <div style={{ position: 'absolute', bottom: -120, left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,180,140,0.1) 0%,transparent 70%)' }} />

    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 2, textAlign: 'center' as const }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, letterSpacing: '1.4px', textTransform: 'uppercase' as const, marginBottom: 18 }}>
        START NOW · IT'S FREE
      </div>
      <h2 style={{ fontSize: 52, fontWeight: 900, color: C.white, letterSpacing: '-2px', lineHeight: 1.1, margin: '0 0 18px' }}>
        Ready to find your<br />
        Lagos home{' '}
        <span style={{ color: C.teal }}>the right way?</span>
      </h2>
      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', maxWidth: 440, margin: '0 auto 36px', lineHeight: 1.75 }}>
        Join thousands of Nigerians who make smarter property decisions with verified intelligence — not guesswork.
      </p>
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center' as const }}>
        <button style={{ background: C.teal, color: C.navy, border: 'none', borderRadius: 12, padding: '14px 32px', fontSize: 15, fontWeight: 800, cursor: 'pointer', letterSpacing: '0.1px' }}>
          Browse Listings →
        </button>
        <button style={{ background: 'transparent', color: 'rgba(255,255,255,0.65)', border: '1.5px solid rgba(255,255,255,0.18)', borderRadius: 12, padding: '13px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Are You an Agent?
        </button>
      </div>
    </div>
  </section>
);

// ─── PAGE ─────────────────────────────────────────────────────────────────────
const HowItWorksPage = () => (
  <div style={{ fontFamily: font }}>
    <HeroSection />
    <ThreeStepsSection />
    <FourScoresSection />
    <NumbersMeanSection />
    <AgentVerificationSection />
    <FaqSection />
    <BottomCtaSection />
  </div>
);

export default HowItWorksPage;