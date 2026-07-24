import FAQAccordion from "@/components/home/FAQAccordion";
import { useState, useEffect, useRef } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  navy: '#071428',
  navyMid: '#0a1e36',
  navyCard: '#0f2240',
  teal: '#00C9A7',
  tealDim: 'rgba(0,201,167,0.12)',
  tealBorder: 'rgba(0,201,167,0.25)',
  white: '#FFFFFF',
  offWhite: '#F4FAFB',
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
  tealDk: "#007A63",
  tealLt: "rgba(0,201,167,0.12)",
  amberLt: "rgba(245,158,11,0.10)",
  blueLt: "rgba(59,130,246,0.10)",
  purple: "#8B5CF6",
  purpleLt: "rgba(139,92,246,0.10)",
  redLt: "rgba(220,38,38,0.08)",
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

// ─── SVG icons ───────────────────────────────────────────────────────────────
const SearchIcon = ({ size = 15, color = "currentColor" }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
  </svg>
);
const FilterIcon = ({ size = 15, color = "currentColor" }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const PinIcon = ({ size = 15, color = "currentColor" }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const BoltIcon = ({ size = 15, color = "currentColor" }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const GlobeIcon = ({ size = 15, color = "currentColor" }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 2C6 2 2 7 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10C22 7 18 2 12 2z" /><path d="M2 12h20" />
  </svg>
);
const ShieldIcon = ({ size = 15, color = "currentColor" }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const AlertIcon = ({ size = 15, color = "currentColor" }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const PhoneIcon = ({ size = 15, color = "currentColor" }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.47 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z" />
  </svg>
);
const InfoIcon = ({ size = 13, color = "currentColor" }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const CheckIcon = ({ size = 9, color = "currentColor" }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const ClockIcon = ({ size = 13, color = "currentColor" }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const SendIcon = ({ size = 13, color = "currentColor" }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const HouseIcon = ({ size = 18, color = "rgba(255,255,255,0.4)" }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

// ─── Shared sub-components ────────────────────────────────────────────────────
const SectionTag = ({ label }: { label: string }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    background: C.tealLt, color: C.tealDk,
    border: `1px solid ${C.tealBorder}`,
    borderRadius: 20, padding: "5px 14px",
    fontSize: 11, fontWeight: 700, letterSpacing: "0.6px",
    textTransform: "uppercase" as const, marginBottom: 18,
  }}>
    {label}
  </span>
);

const StepBadge = ({ label, bg, color, icon }: { label: string; bg: string; color: string; icon: React.ReactNode }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    background: bg, color,
    border: `1px solid ${color}30`,
    borderRadius: 20, padding: "5px 14px",
    fontSize: 11, fontWeight: 700, letterSpacing: "0.6px",
    textTransform: "uppercase" as const, marginBottom: 10,
  }}>
    {icon}{label}
  </span>
);

const StepFeature = ({ iconBg, iconEl, title, desc }: { iconBg: string; iconEl: React.ReactNode; title: string; desc: string }) => (
  <div style={{
    display: "flex", gap: 14, padding: "14px 16px",
    background: "#f8fafc", border: `1px solid ${C.border}`,
    borderRadius: 12, marginBottom: 10,
  }}>
    <div style={{
      width: 34, height: 34, borderRadius: 9, background: iconBg,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      {iconEl}
    </div>
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: C.slate, lineHeight: 1.65 }}>{desc}</div>
    </div>
  </div>
);

// ─── SECTION 1: Hero ─────────────────────────────────────────────────────────
const HeroSection = () => (
  <section style={{ position: 'relative', overflow: 'hidden', minHeight: 580 }}>
    <style>{`
      @keyframes hero-float-main { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      @keyframes hero-float-score { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
      @keyframes hero-float-agent { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
      @keyframes hero-float-badge { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      @keyframes hero-pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
      @keyframes hero-bar-grow { from{width:0%} }
      .hero-main-card{position:absolute;top:28px;right:0;width:290px;z-index:5;animation:hero-float-main 4s ease-in-out infinite}
      .hero-score-card{position:absolute;bottom:52px;left:-10px;z-index:8;animation:hero-float-score 4s ease-in-out infinite;animation-delay:0.8s}
      .hero-agent-chip{position:absolute;bottom:40px;right:-10px;z-index:9;animation:hero-float-agent 4s ease-in-out infinite;animation-delay:1.4s}
      .hero-live-badge{position:absolute;top:0;right:0;z-index:10;animation:hero-float-badge 4s ease-in-out infinite;animation-delay:0.3s}
      .hero-live-dot{width:7px;height:7px;border-radius:50%;background:#00C9A7;flex-shrink:0;animation:hero-pulse-dot 2s ease-in-out infinite}
      .hero-bar-fill{height:100%;border-radius:10px;background:#00C9A7;animation:hero-bar-grow 1.2s cubic-bezier(.22,1,.36,1) forwards}
    `}</style>

    <div style={{ position:'absolute',inset:0,zIndex:0, backgroundImage:`url('https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80&auto=format&fit=crop')`, backgroundSize:'cover', backgroundPosition:'center 30%', filter:'grayscale(40%) brightness(0.35)' }} />
    <div style={{ position:'absolute',inset:0,zIndex:1, background:'linear-gradient(110deg,rgba(7,20,40,0.92) 0%,rgba(10,32,53,0.88) 35%,rgba(13,45,58,0.82) 60%,rgba(10,37,53,0.90) 100%)' }} />
    <div style={{ position:'absolute',top:-80,right:-80,width:600,height:600,borderRadius:'50%',zIndex:2, background:'radial-gradient(circle,rgba(0,180,140,0.18) 0%,transparent 70%)' }} />

    <div style={{ position:'relative',zIndex:4, maxWidth:1160,margin:'0 auto',padding:'72px 24px 80px', display:'grid',gridTemplateColumns:'1fr 460px',gap:52,alignItems:'center' }}>

      {/* Left */}
      <div>
        <Eyebrow label="How KhenX Works" light />
        <h1 style={{ fontSize:'clamp(38px,5vw,60px)',fontWeight:900,color:C.white, lineHeight:1.1,letterSpacing:'-1.5px',margin:'0 0 22px' }}>
          Know before<br />you pay.{' '}<span style={{ color:C.teal }}>Every time.</span>
        </h1>
        <p style={{ fontSize:15.5,color:'rgba(255,255,255,0.6)',lineHeight:1.75,maxWidth:430,margin:'0 0 36px' }}>
          KhenX combines verified property listings with independent neighbourhood intelligence — so you can make the most important financial decision of your life with real data, not guesswork.
        </p>
        <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:56 }}>
          <button style={{ background:C.teal,color:C.navy,border:'none',borderRadius:10,padding:'13px 26px',fontSize:14,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:8 }}>
            Browse Listings <span style={{ fontSize:16,lineHeight:1 }}>→</span>
          </button>
          <button style={{ background:'transparent',color:C.white,border:'1.5px solid rgba(255,255,255,0.2)',borderRadius:10,padding:'12px 22px',fontSize:14,fontWeight:500,cursor:'pointer' }}>
            See Neighbourhood Scores
          </button>
        </div>
        <div style={{ display:'flex',gap:44 }}>
          {[
            { num:'4',  suf:'+',  label:'Data Points per Listing' },
            { num:'32', suf:'',   label:'Neighbourhoods Scored' },
            { num:'98', suf:'%',  label:'Verified Agent Rate' },
            { num:'24', suf:'/7', label:'Intelligence Updates' },
          ].map(s => (
            <div key={s.label} style={{ display:'flex',flexDirection:'column',gap:5 }}>
              <span style={{ fontSize:36,fontWeight:900,color:C.white,letterSpacing:'-1.5px',lineHeight:1 }}>
                {s.num}<span style={{ color:C.teal }}>{s.suf}</span>
              </span>
              <span style={{ fontSize:11.5,color:'rgba(255,255,255,0.45)',fontWeight:400 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div style={{ position:'relative',height:420 }}>
        <div className="hero-live-badge">
          <div style={{ background:'rgba(10,22,40,0.9)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:20,padding:'6px 14px',display:'flex',alignItems:'center',gap:7 }}>
            <div className="hero-live-dot" />
            <span style={{ fontSize:11.5,fontWeight:600,color:C.white }}>Live Intelligence Active</span>
          </div>
        </div>

        <div className="hero-main-card">
          <div style={{ background:C.navyCard,borderRadius:18,padding:'20px 22px',border:`1px solid ${C.borderDark}`,boxShadow:'0 24px 64px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize:10,color:C.teal,fontWeight:700,letterSpacing:'1px',textTransform:'uppercase' as const,marginBottom:4 }}>Neighbourhood Intelligence</div>
            <div style={{ fontSize:15,fontWeight:800,color:C.white,marginBottom:18 }}>Lekki Phase 1, Lagos</div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14 }}>
              {[
                { label:'Power Supply',val:'7.2',unit:'/10',sub:'30-day avg.' },
                { label:'Flood Risk',val:'Low',unit:'',sub:'Elevation confirmed' },
                { label:'Security',val:'8.0',unit:'/10',sub:'Gated + CCTV' },
                { label:'Commute',val:'8.5',unit:'/10',sub:'BRT access' },
              ].map(sc => (
                <div key={sc.label} style={{ background:'rgba(255,255,255,0.04)',borderRadius:11,padding:'11px 13px',border:`1px solid ${C.borderDark}` }}>
                  <div style={{ fontSize:9.5,color:C.slateLight,marginBottom:5,fontWeight:500 }}>{sc.label}</div>
                  <div style={{ fontSize:22,fontWeight:900,color:C.teal,letterSpacing:'-0.8px',lineHeight:1 }}>
                    {sc.val}<span style={{ fontSize:11,color:'rgba(255,255,255,0.3)',fontWeight:400 }}>{sc.unit}</span>
                  </div>
                  <div style={{ fontSize:9,color:'rgba(255,255,255,0.28)',marginTop:4 }}>{sc.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ background:C.tealDim,borderRadius:10,padding:'10px 13px',border:`1px solid ${C.tealBorder}`,display:'flex',gap:9,alignItems:'flex-start' }}>
              <div style={{ width:19,height:19,borderRadius:6,background:C.teal,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1 }}>
                <span style={{ fontSize:9,color:C.navy,fontWeight:900 }}>✦</span>
              </div>
              <div style={{ fontSize:11,color:'rgba(255,255,255,0.58)',lineHeight:1.6 }}>
                Lekki Phase 1 avg. rent up 18% in Q1 2025. Best value in eastern corridor.
              </div>
            </div>
          </div>
        </div>

        <div className="hero-score-card">
          <div style={{ background:C.white,borderRadius:14,padding:'14px 16px',boxShadow:'0 12px 40px rgba(0,0,0,0.3)',minWidth:200,border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:9,fontWeight:700,color:C.slate,letterSpacing:'0.8px',textTransform:'uppercase' as const,marginBottom:10 }}>Overall Area Score</div>
            {[
              { label:'Infrastructure',pct:82 },
              { label:'Safety',pct:87 },
              { label:'Livability',pct:78 },
            ].map(r => (
              <div key={r.label} style={{ marginBottom:8 }}>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}>
                  <span style={{ fontSize:11.5,color:C.textMid }}>{r.label}</span>
                  <span style={{ fontSize:11.5,fontWeight:700,color:C.teal }}>{r.pct}%</span>
                </div>
                <div style={{ height:4,background:C.border,borderRadius:10,overflow:'hidden' }}>
                  <div className="hero-bar-fill" style={{ width:`${r.pct}%`,animationDelay:`${0.2*r.pct/10}s` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-agent-chip">
          <div style={{ background:C.white,borderRadius:24,padding:'7px 14px 7px 7px',boxShadow:'0 8px 24px rgba(0,0,0,0.2)',display:'flex',alignItems:'center',gap:9,border:`1px solid ${C.border}` }}>
            <div style={{ width:30,height:30,borderRadius:'50%',background:'#0F6E56',display:'flex',alignItems:'center',justifyContent:'center',color:C.white,fontSize:10,fontWeight:800,flexShrink:0 }}>TK</div>
            <div style={{ display:'flex',flexDirection:'column',gap:1 }}>
              <span style={{ fontSize:12,fontWeight:600,color:C.text }}>Tosin Kalu</span>
              <span style={{ fontSize:9.5,color:C.teal,fontWeight:600 }}>✓ Verified Agent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ─── MOCKUP: Step 1 – Search ─────────────────────────────────────────────────
const SearchMockup = () => (
  <div style={{ background:C.white,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:'0 20px 60px rgba(0,0,0,0.10)',overflow:'hidden' }}>
    <div style={{ background:C.navy,padding:'10px 16px',display:'flex',gap:6,alignItems:'center' }}>
      {['#FF5F57','#FEBC2E','#28C840'].map(c => <div key={c} style={{ width:9,height:9,borderRadius:'50%',background:c }} />)}
      <div style={{ flex:1,background:'rgba(255,255,255,0.07)',borderRadius:6,padding:'4px 12px',marginLeft:8 }}>
        <span style={{ fontSize:10.5,color:'rgba(255,255,255,0.35)',fontFamily:'monospace' }}>khen-x.com/listings</span>
      </div>
    </div>
    <div style={{ padding:'18px 18px 14px' }}>
      <div style={{ display:'flex',gap:0,marginBottom:12,border:`1.5px solid ${C.teal}`,borderRadius:10,overflow:'hidden' }}>
        <div style={{ display:'flex',alignItems:'center',padding:'0 12px' }}><SearchIcon size={14} color={C.teal} /></div>
        <input readOnly value="2-bed flat Yaba under ₦800k good power" style={{ flex:1,border:'none',outline:'none',fontSize:12,color:C.text,padding:'10px 0',background:'transparent' }} />
        <button style={{ background:C.teal,color:C.navy,border:'none',padding:'0 18px',fontWeight:700,fontSize:12,cursor:'pointer' }}>Search</button>
      </div>
      <div style={{ display:'flex',gap:6,flexWrap:'wrap' as const,marginBottom:14 }}>
        {[{label:'Rent',active:true},{label:'Buy',active:false},{label:'Power 7+',active:true},{label:'Flood: Low',active:true},{label:'2 Beds',active:false},{label:'Yaba',active:false}].map(chip => (
          <span key={chip.label} style={{ background:chip.active?C.navy:'#f1f5f9',color:chip.active?C.white:C.slate,borderRadius:20,padding:'4px 12px',fontSize:11,fontWeight:600,border:chip.active?'none':`1px solid ${C.border}` }}>{chip.label}</span>
        ))}
      </div>
      {[
        { title:'2-Bed Flat, Abara Estate',loc:'Yaba, Lagos Mainland',price:'₦750k',tags:[{label:'Power 8.1',bg:C.amberLt,color:C.amber},{label:'Security 7.9',bg:C.tealLt,color:C.tealDk},{label:'Flood Low',bg:C.blueLt,color:C.blue}],thumb:'linear-gradient(135deg,#004F4A,#007A63)',opacity:1 },
        { title:'2-Bed Apartment, Herbert Macaulay',loc:'Yaba, Lagos Mainland',price:'₦780k',tags:[{label:'Power 7.4',bg:C.amberLt,color:C.amber},{label:'Security 8.2',bg:C.tealLt,color:C.tealDk},{label:'Flood Low',bg:C.blueLt,color:C.blue}],thumb:'linear-gradient(135deg,#003D38,#004F4A)',opacity:1 },
        { title:'Mini Flat, Fadeyi Road',loc:'Yaba, Lagos Mainland',price:'₦600k',tags:[{label:'Power 7.1',bg:C.amberLt,color:C.amber},{label:'Security 7.5',bg:C.tealLt,color:C.tealDk}],thumb:'linear-gradient(135deg,#2A1060,#3D1A8A)',opacity:0.5 },
      ].map((r,i) => (
        <div key={i} style={{ display:'flex',alignItems:'center',gap:12,padding:'11px 0',borderTop:`1px solid ${C.border}`,opacity:r.opacity }}>
          <div style={{ width:40,height:40,borderRadius:9,background:r.thumb,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><HouseIcon /></div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontSize:12.5,fontWeight:700,color:C.text,marginBottom:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{r.title}</div>
            <div style={{ fontSize:10.5,color:C.slate,marginBottom:4 }}>{r.loc}</div>
            <div style={{ display:'flex',gap:4,flexWrap:'wrap' as const }}>
              {r.tags.map(t => <span key={t.label} style={{ background:t.bg,color:t.color,borderRadius:6,padding:'2px 7px',fontSize:10,fontWeight:700 }}>{t.label}</span>)}
            </div>
          </div>
          <div style={{ fontSize:13,fontWeight:800,color:C.text,flexShrink:0 }}>{r.price}</div>
        </div>
      ))}
    </div>
  </div>
);

// ─── MOCKUP: Step 2 – Intelligence Panel ─────────────────────────────────────
const IntelMockup = () => (
  <div style={{ borderRadius:16,border:`1px solid ${C.border}`,boxShadow:'0 20px 60px rgba(0,0,0,0.10)',overflow:'hidden' }}>
    <div style={{ background:C.navy,padding:'18px 20px',display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
      <div>
        <div style={{ fontSize:14,fontWeight:700,color:C.white,marginBottom:4 }}>Neighbourhood Intelligence</div>
        <div style={{ fontSize:11.5,color:C.teal }}>Lekki Phase 1, Lagos Island</div>
      </div>
      <div style={{ display:'flex',alignItems:'center',gap:6,background:'rgba(0,201,167,0.15)',border:`1px solid ${C.tealBorder}`,borderRadius:20,padding:'4px 10px' }}>
        <span style={{ width:6,height:6,borderRadius:'50%',background:C.teal,display:'inline-block' }} />
        <span style={{ fontSize:11,fontWeight:700,color:C.teal }}>Live</span>
      </div>
    </div>
    <div style={{ background:C.white,padding:'16px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
      <div style={{ background:'#FFFBEB',border:'1px solid rgba(245,158,11,0.18)',borderRadius:12,padding:'14px' }}>
        <div style={{ display:'flex',justifyContent:'space-between',marginBottom:8 }}>
          <span style={{ fontSize:10,fontWeight:700,color:C.amber,textTransform:'uppercase' as const,letterSpacing:'0.5px' }}>Power Supply</span>
          <BoltIcon size={13} color={C.amber} />
        </div>
        <div style={{ fontSize:26,fontWeight:900,color:C.amber,lineHeight:1,marginBottom:8 }}>9.1</div>
        <div style={{ height:4,background:'rgba(245,158,11,0.15)',borderRadius:4,marginBottom:6 }}>
          <div style={{ width:'91%',height:'100%',background:C.amber,borderRadius:4 }} />
        </div>
        <div style={{ fontSize:10.5,color:C.slate }}>Excellent · ~22 hrs/day</div>
      </div>
      <div style={{ background:'#EFF6FF',border:'1px solid rgba(59,130,246,0.18)',borderRadius:12,padding:'14px' }}>
        <div style={{ display:'flex',justifyContent:'space-between',marginBottom:8 }}>
          <span style={{ fontSize:10,fontWeight:700,color:C.blue,textTransform:'uppercase' as const,letterSpacing:'0.5px' }}>Flood Risk</span>
          <GlobeIcon size={13} color={C.blue} />
        </div>
        <div style={{ fontSize:20,fontWeight:900,color:C.blue,lineHeight:1,marginBottom:8 }}>MEDIUM</div>
        <div style={{ fontSize:10.5,color:C.slate }}>Coastal proximity · Seasonal risk</div>
      </div>
      <div style={{ background:'#F0FDF9',border:'1px solid rgba(0,201,167,0.18)',borderRadius:12,padding:'14px' }}>
        <div style={{ display:'flex',justifyContent:'space-between',marginBottom:8 }}>
          <span style={{ fontSize:10,fontWeight:700,color:C.tealDk,textTransform:'uppercase' as const,letterSpacing:'0.5px' }}>Security</span>
          <ShieldIcon size={13} color={C.teal} />
        </div>
        <div style={{ fontSize:26,fontWeight:900,color:C.teal,lineHeight:1,marginBottom:8 }}>8.7</div>
        <div style={{ height:4,background:'rgba(0,201,167,0.15)',borderRadius:4,marginBottom:6 }}>
          <div style={{ width:'87%',height:'100%',background:C.teal,borderRadius:4 }} />
        </div>
        <div style={{ fontSize:10.5,color:C.slate }}>Estate gated · Armed guards</div>
      </div>
      <div style={{ background:'#F5F3FF',border:'1px solid rgba(139,92,246,0.18)',borderRadius:12,padding:'14px' }}>
        <div style={{ display:'flex',justifyContent:'space-between',marginBottom:8 }}>
          <span style={{ fontSize:10,fontWeight:700,color:C.purple,textTransform:'uppercase' as const,letterSpacing:'0.5px' }}>Commute</span>
          <ClockIcon size={13} color={C.purple} />
        </div>
        <div style={{ fontSize:26,fontWeight:900,color:C.purple,lineHeight:1,marginBottom:8 }}>5.8</div>
        <div style={{ height:4,background:'rgba(139,92,246,0.15)',borderRadius:4,marginBottom:6 }}>
          <div style={{ width:'58%',height:'100%',background:C.purple,borderRadius:4 }} />
        </div>
        <div style={{ fontSize:10.5,color:C.slate }}>~55 min to VI peak</div>
      </div>
    </div>
    <div style={{ background:C.white,borderTop:`1px solid ${C.border}`,padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
      <span style={{ fontSize:11.5,color:C.slate }}>Data Confidence</span>
      <span style={{ display:'flex',alignItems:'center',gap:5,background:C.tealLt,border:`1px solid ${C.tealBorder}`,borderRadius:20,padding:'4px 12px',fontSize:11,fontWeight:700,color:C.tealDk }}>
        <CheckIcon color={C.teal} />High — 91% verified
      </span>
    </div>
  </div>
);

// ─── MOCKUP: Step 3 – Agent Enquiry ──────────────────────────────────────────
const AgentMockup = () => (
  <div style={{ borderRadius:16,border:`1px solid ${C.border}`,boxShadow:'0 20px 60px rgba(0,0,0,0.10)',overflow:'hidden' }}>
    <div style={{ background:C.navy,padding:'24px 24px 32px',position:'relative' }}>
      <div style={{ fontSize:11.5,color:'rgba(255,255,255,0.45)',marginBottom:6 }}>You are enquiring about</div>
      <div style={{ fontSize:17,fontWeight:800,color:C.white,lineHeight:1.3,marginBottom:8 }}>3-Bed Executive Apartment,<br />Ocean View Estate, Lekki</div>
      <div style={{ fontSize:16,fontWeight:800,color:C.teal }}>₦4,500,000 / yr</div>
      <div style={{ position:'absolute',bottom:-20,left:24,width:44,height:44,borderRadius:'50%',background:C.teal,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:C.navy,border:'3px solid white',boxShadow:'0 4px 12px rgba(0,0,0,0.15)' }}>TK</div>
    </div>
    <div style={{ background:C.white,padding:'30px 24px 20px' }}>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:15,fontWeight:800,color:C.text,marginBottom:2 }}>Tosin Kalu</div>
        <div style={{ fontSize:12,color:C.slate,marginBottom:8 }}>Premier Property Agents Ltd.</div>
        <span style={{ display:'inline-flex',alignItems:'center',gap:5,background:C.tealLt,border:`1px solid ${C.tealBorder}`,borderRadius:20,padding:'4px 10px',fontSize:10.5,fontWeight:700,color:C.tealDk }}>
          <CheckIcon color={C.teal} />KYC Verified Agent
        </span>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden',marginBottom:18 }}>
        {[{val:'47',label:'Listings',color:C.text},{val:'4.9',label:'Rating',color:C.text},{val:'<4hrs',label:'Response',color:C.green}].map((s,i) => (
          <div key={i} style={{ padding:'12px 0',textAlign:'center' as const,borderRight:i<2?`1px solid ${C.border}`:'none' }}>
            <div style={{ fontSize:i===2?12:18,fontWeight:800,color:s.color,marginBottom:2 }}>{s.val}</div>
            <div style={{ fontSize:10.5,color:C.slate }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:10,fontWeight:700,letterSpacing:'0.6px',textTransform:'uppercase' as const,color:C.slate,marginBottom:10 }}>Send Enquiry</div>
      {['Adaeze Nwosu','adaeze@email.com','I am interested in this property...'].map(val => (
        <input key={val} readOnly value={val} style={{ display:'block',width:'100%',border:`1px solid ${C.border}`,borderRadius:8,padding:'10px 12px',fontSize:12,color:C.text,marginBottom:8,background:'#f8fafc',outline:'none',boxSizing:'border-box' as const }} />
      ))}
      <button style={{ width:'100%',background:C.teal,color:C.navy,border:'none',borderRadius:10,padding:'13px 0',fontSize:13,fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
        <SendIcon color={C.navy} />Send Enquiry
      </button>
    </div>
  </div>
);

// ─── SECTION 2: Three Steps ───────────────────────────────────────────────────
const ThreeStepsSection = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [panelKey, setPanelKey] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleStepChange = (i: number) => { setActiveStep(i); setPanelKey(k => k + 1); };

  const stepData = [
    {
      badge: { label:'Step One', bg:C.tealLt, color:C.tealDk, icon:<SearchIcon size={13} color={C.tealDk} /> },
      numColor: C.tealLt, num:'01',
      title: <><span>Search with</span><br /><span style={{ color:C.teal }}>real intelligence</span></>,
      desc: 'Tell KhenX what you need in plain English — or use our filters to narrow down by area, budget, bedrooms, flood risk, and power score. Our AI engine is built specifically for Lagos.',
      features: [
        { iconBg:C.tealLt, iconEl:<SearchIcon size={15} color={C.teal} />, title:'Natural Language Search', desc:'Type "2-bedroom flat in Yaba under ₦800k with good power supply" and get exactly that.' },
        { iconBg:C.amberLt, iconEl:<FilterIcon size={15} color={C.amber} />, title:'Intelligence Filters', desc:'Filter by minimum power score, maximum flood risk, security rating, and commute time to your workplace.' },
        { iconBg:C.blueLt, iconEl:<PinIcon size={15} color={C.blue} />, title:'32 Lagos Neighbourhoods', desc:'From Lekki to Yaba, Ikeja to Surulere — every major area is covered with live intelligence scores.' },
      ],
      mockup: <SearchMockup />,
    },
    {
      badge: { label:'Step Two', bg:C.amberLt, color:C.amber, icon:<InfoIcon size={13} color={C.amber} /> },
      numColor: C.amberLt, num:'02',
      title: <><span>Verify the</span><br /><span style={{ color:C.teal }}>neighbourhood first</span></>,
      desc: 'Every listing on KhenX includes a live Neighbourhood Intelligence Panel — four verified scores that tell you what no agent brochure ever will. Check before you visit.',
      features: [
        { iconBg:C.amberLt, iconEl:<BoltIcon size={15} color={C.amber} />, title:'Power Supply Score', desc:'0–10 score with average daily hours. Sourced from DisCo data and community verification.' },
        { iconBg:C.blueLt, iconEl:<GlobeIcon size={15} color={C.blue} />, title:'Flood Risk Rating', desc:'Low / Medium / High classification cross-referenced against NIMET records and NASA elevation data.' },
        { iconBg:C.tealLt, iconEl:<ShieldIcon size={15} color={C.teal} />, title:'Security + Commute Scores', desc:'Security rating from incident data and estate checks. Commute times to major Lagos hubs, peak hours included.' },
      ],
      mockup: <IntelMockup />,
    },
    {
      badge: { label:'Step Three', bg:C.tealLt, color:C.tealDk, icon:<CheckIcon size={13} color={C.tealDk} /> },
      numColor: C.tealLt, num:'03',
      title: <><span>Connect with</span><br /><span style={{ color:C.teal }}>verified agents only</span></>,
      desc: 'Every agent on KhenX has been KYC-verified — government ID confirmed, business name checked. When you send an enquiry, you know exactly who you are dealing with.',
      features: [
        { iconBg:C.tealLt, iconEl:<ShieldIcon size={15} color={C.teal} />, title:'KYC-Verified Agents Only', desc:'Government ID, BVN, and business registration checked before any agent can list on KhenX.' },
        { iconBg:C.redLt, iconEl:<AlertIcon size={15} color={C.red} />, title:'Zero Ghost Listings', desc:'Every listing is reviewed by KhenX before going live. Properties are confirmed to exist before they appear.' },
        { iconBg:C.amberLt, iconEl:<PhoneIcon size={15} color={C.amber} />, title:'Response Guaranteed', desc:'Agents must respond to enquiries within 24 hours or their listing is flagged. No more being ghosted.' },
      ],
      mockup: <AgentMockup />,
    },
  ];

  const current = stepData[activeStep];

  return (
    <section ref={sectionRef} style={{ background:C.white, padding:'90px 0 100px', fontFamily: font }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeLeft{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fadeRight{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.4)}}
        .step-tab-btn:hover{color:#00C9A7 !important;background:rgba(0,201,167,0.05) !important}
      `}</style>

      <div style={{ maxWidth:1160, margin:'0 auto', padding:'0 28px' }}>
        <div style={{ marginBottom:48, opacity:visible?1:0, animation:visible?'fadeUp 0.6s ease both':'none' }}>
          <SectionTag label="The Process" />
          <h2 style={{ fontSize:'clamp(30px,4vw,42px)',fontWeight:900,color:C.text,letterSpacing:'-1px',lineHeight:1.15,margin:'0 0 14px' }}>
            Three steps to your<br /><span style={{ color:C.teal }}>perfect Lagos property</span>
          </h2>
          <p style={{ fontSize:15,color:C.slate,lineHeight:1.75,margin:0,maxWidth:460 }}>
            From the first search to the final handshake — KhenX keeps you informed at every stage.
          </p>
        </div>

        <div style={{ display:'flex',gap:6,marginBottom:44,background:'#F1F5F9',borderRadius:14,padding:5,width:'fit-content', opacity:visible?1:0,animation:visible?'fadeUp 0.6s 0.15s ease both':'none' }}>
          {[{label:'Search Smart'},{label:'Check Intelligence'},{label:'Connect & Close'}].map((st,i) => (
            <button key={i} className="step-tab-btn" onClick={() => handleStepChange(i)} style={{ display:'flex',alignItems:'center',gap:8,padding:'10px 20px',border:'none',borderRadius:10,background:activeStep===i?C.navy:'transparent',fontSize:13,fontWeight:activeStep===i?700:500,color:activeStep===i?C.white:C.slate,cursor:'pointer',transition:'all 0.22s ease' }}>
              <span style={{ width:20,height:20,borderRadius:'50%',background:activeStep===i?C.teal:'rgba(0,0,0,0.12)',color:activeStep===i?C.navy:C.slate,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,flexShrink:0,transition:'all 0.22s ease' }}>{i+1}</span>
              {st.label}
            </button>
          ))}
        </div>

        <div key={panelKey} style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'flex-start' }}>
          <div style={{ opacity:visible?1:0,animation:visible?'fadeLeft 0.55s 0.05s ease both':'none' }}>
            <StepBadge label={current.badge.label} bg={current.badge.bg} color={current.badge.color} icon={current.badge.icon} />
            <div style={{ fontSize:'clamp(56px,6vw,80px)',fontWeight:900,color:current.numColor,lineHeight:1,marginBottom:4,letterSpacing:'-2px',userSelect:'none' as const }}>{current.num}</div>
            <h3 style={{ fontSize:'clamp(24px,3vw,32px)',fontWeight:900,color:C.text,letterSpacing:'-0.8px',lineHeight:1.15,margin:'0 0 16px' }}>{current.title}</h3>
            <p style={{ fontSize:14,color:C.slate,lineHeight:1.75,marginBottom:24 }}>{current.desc}</p>
            <div>{current.features.map(f => <StepFeature key={f.title} iconBg={f.iconBg} iconEl={f.iconEl} title={f.title} desc={f.desc} />)}</div>
          </div>
          <div style={{ opacity:visible?1:0,animation:visible?'fadeRight 0.55s 0.12s ease both':'none' }}>{current.mockup}</div>
        </div>
      </div>
    </section>
  );
};

// ─── SECTION 3: Four Scores ───────────────────────────────────────────────────
const FourScoresSection = () => (
  <section style={{ background:C.offWhite, padding:'80px 0' }}>
    <div style={{ maxWidth:1160,margin:'0 auto',padding:'0 24px' }}>
      <div style={{ textAlign:'center',marginBottom:52 }}>
        <Eyebrow label="Neighbourhood Intelligence" />
        <h2 style={{ fontSize:42,fontWeight:900,color:C.text,letterSpacing:'-1px',margin:'0 0 10px' }}>
          Four scores. <span style={{ color:C.teal }}>Complete picture.</span>
        </h2>
        <p style={{ fontSize:14.5,color:C.slate,maxWidth:440,margin:'0 auto',lineHeight:1.7 }}>
          Lagos neighbourhood intelligence — updated daily from verified, independent sources.
        </p>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:18 }}>
        {[
          { icon:'⚡',title:'Power Supply Score',color:'#F59E0B',bgColor:'#FFFBEB',borderColor:'#FDE68A',desc:'Power reliability is the single most impactful issue in Lagos living — and the most consistently misrepresented on unfair listings.',bullets:['Community-verified NEPA/EKEDC ratings for all listings','Generator fuel cost estimates + estimated hours per day avg.','Monthly trend data — know if power score is improving or declining'],scoreLabel:'AVG POWER SCORE / LEKKI',scoreVal:'6.2 / 10' },
          { icon:'🌊',title:'Flood Risk Classification',color:'#3B82F6',bgColor:'#EFF6FF',borderColor:'#BFDBFE',desc:'High-resolution per neighbourhood — coastal proximity, drainage infrastructure, and historical flood events all factor in.',bullets:['NiMet and resident-validated elevation data + street-level flood mapping','Rainy 2024 updates show 60+ areas now "low" due to new drainage','We show 3 tiers clearly: Low, Medium, High — with explanations'],scoreLabel:'FLOOD PRONE AREAS / LAGOS',scoreVal:'38%' },
          { icon:'🛡️',title:'Security Rating',color:'#10B981',bgColor:'#F0FDF4',borderColor:'#BBF7D0',desc:'A composite score built from incident data, police presence, estate security arrangements, and resident reports across all neighbourhoods.',bullets:['Verified crime rate + incident data by quarter from area sources','Estate gate security, CCTV coverage, and guard presence all scored','Resident satisfaction score weighted at 40% of total security rating'],scoreLabel:'AVG SECURITY SCORE / LEKKI',scoreVal:'7/10' },
          { icon:'🚌',title:'Commute Intelligence',color:'#8B5CF6',bgColor:'#F5F3FF',borderColor:'#DDD6FE',desc:'Real journey times between listings and Lagos business districts — accounting for peak-hour traffic bottlenecks and the Bridge situation.',bullets:['Peak-hour drive time measured to VI, the Island, and Ikeja CBD','BRT stop proximity measured (<500m = premium commute score)','We factor in the Lekki-Ikoyi Bridge, and the Bridge tolls vehicle weighting'],scoreLabel:'PEAK COMMUTE TO ISLAND',scoreVal:'45 min' },
        ].map(card => (
          <div key={card.title} style={{ background:card.bgColor,borderRadius:18,padding:'28px 26px',border:`1px solid ${card.borderColor}` }}>
            <div style={{ display:'flex',alignItems:'flex-start',gap:14,marginBottom:18 }}>
              <div style={{ width:44,height:44,borderRadius:12,background:'rgba(255,255,255,0.7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0,border:`1px solid ${card.borderColor}` }}>{card.icon}</div>
              <div>
                <h3 style={{ fontSize:16,fontWeight:800,color:C.text,margin:'0 0 6px' }}>{card.title}</h3>
                <p style={{ fontSize:12.5,color:C.slate,margin:0,lineHeight:1.65 }}>{card.desc}</p>
              </div>
            </div>
            <div style={{ display:'flex',flexDirection:'column' as const,gap:8,marginBottom:20 }}>
              {card.bullets.map((b,i) => (
                <div key={i} style={{ display:'flex',gap:9,alignItems:'flex-start' }}>
                  <div style={{ width:16,height:16,borderRadius:4,background:card.color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1 }}>
                    <span style={{ fontSize:9,color:'#fff',fontWeight:900 }}>✓</span>
                  </div>
                  <span style={{ fontSize:12,color:C.textMid,lineHeight:1.6 }}>{b}</span>
                </div>
              ))}
            </div>
            <div style={{ background:'rgba(255,255,255,0.6)',borderRadius:10,padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',border:`1px solid ${card.borderColor}` }}>
              <span style={{ fontSize:10,fontWeight:700,color:C.slate,letterSpacing:'0.5px' }}>{card.scoreLabel}</span>
              <span style={{ fontSize:16,fontWeight:900,color:card.color }}>{card.scoreVal}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── SECTION 4: What the Numbers Mean ────────────────────────────────────────
const NumbersMeanSection = () => (
  <section style={{ background:C.white, padding:'80px 0' }}>
    <div style={{ maxWidth:1160,margin:'0 auto',padding:'0 24px',display:'grid',gridTemplateColumns:'1fr 440px',gap:64,alignItems:'flex-start' }}>
      <div>
        <Eyebrow label="Reading the Scores" />
        <h2 style={{ fontSize:38,fontWeight:900,color:C.text,letterSpacing:'-1px',lineHeight:1.15,margin:'0 0 22px' }}>
          What the numbers<br /><span style={{ color:C.teal }}>actually mean</span>
        </h2>
        <p style={{ fontSize:14,color:C.slate,lineHeight:1.75,marginBottom:28 }}>
          Every score is on a 0–10 scale. Here's how to read them at a glance — and what to look out for when shortlisting properties.
        </p>
        <div style={{ display:'flex',flexDirection:'column' as const,gap:20 }}>
          {[
            { title:'Scores are independent of agents', body:'Agents have no way to improve their neighbourhood score. The data is what it is — no exceptions.' },
            { title:'Scores are updated daily', body:'Our data pipeline refreshes within 24 hours. If data is older than 72 hours, the data age is displayed clearly on the listing.' },
            { title:'Contextual level is always shown', body:'Every intelligence score comes with a context label — Low, Medium, or High — based on firmly-verified, reliable data points.' },
          ].map(item => (
            <div key={item.title} style={{ display:'flex',gap:14,alignItems:'flex-start' }}>
              <div style={{ width:8,height:8,borderRadius:'50%',background:C.teal,flexShrink:0,marginTop:6 }} />
              <div>
                <div style={{ fontSize:13.5,fontWeight:700,color:C.text,marginBottom:4 }}>{item.title}</div>
                <div style={{ fontSize:13,color:C.slate,lineHeight:1.65 }}>{item.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background:C.navyCard,borderRadius:18,padding:'24px',border:`1px solid ${C.borderDark}`,boxShadow:'0 12px 40px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize:11,fontWeight:700,color:C.teal,letterSpacing:'0.8px',textTransform:'uppercase' as const,marginBottom:18 }}>Score Interpretation Guide</div>
        {[
          { range:'9–10',label:'Excellent',color:'#00C9A7',pct:100 },
          { range:'7–8',label:'Good',color:'#60D4BD',pct:80 },
          { range:'5–6',label:'Average',color:'#F59E0B',pct:60 },
          { range:'3–4',label:'Below Average',color:'#F97316',pct:40 },
          { range:'0–2',label:'Poor',color:'#EF4444',pct:20 },
        ].map(tier => (
          <div key={tier.range} style={{ marginBottom:14 }}>
            <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:6 }}>
              <span style={{ fontSize:13,fontWeight:800,color:tier.color,minWidth:36 }}>{tier.range}</span>
              <span style={{ fontSize:12.5,color:'rgba(255,255,255,0.6)' }}>{tier.label}</span>
            </div>
            <div style={{ height:8,background:'rgba(255,255,255,0.06)',borderRadius:6,overflow:'hidden' }}>
              <div style={{ width:`${tier.pct}%`,height:'100%',background:tier.color,borderRadius:6 }} />
            </div>
          </div>
        ))}
        <div style={{ marginTop:20,padding:'14px',background:C.tealDim,borderRadius:12,border:`1px solid ${C.tealBorder}` }}>
          <div style={{ fontSize:11,fontWeight:700,color:C.teal,marginBottom:6 }}>Pro tip</div>
          <div style={{ fontSize:12,color:'rgba(255,255,255,0.55)',lineHeight:1.6 }}>Look for listings where scores are consistently above 7.0 across all four dimensions — these are the strongest all-round properties in Lagos.</div>
        </div>
      </div>
    </div>
  </section>
);

// ─── SECTION 5: Agent Verification ───────────────────────────────────────────
const VERIFICATION_STEPS = [
  { step: '1', icon: '🪪', title: 'Identity Check', body: "Government-issued ID verified against NIN database. Driver's licence or voter's card accepted." },
  { step: '2', icon: '🏢', title: 'Business Check', body: 'Business or CAC registration number confirmed with a live business verification against the CAC list.' },
  { step: '3', icon: '📋', title: 'Listing Review', body: 'Every listing submitted by a new agent goes through a review by our Lagos team before going live. Prior violations are tracked.' },
  { step: '4', icon: '✅', title: 'Verified Badge', body: 'All agents who pass KhenX review receive a verified badge, visible on every listing and on their agent profile.' },
];

const AgentVerificationSection = () => (
  <section style={{ background: C.offWhite, padding: '80px 0' }}>
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <Eyebrow label="Agent Verification" />
        <h2 style={{ fontSize: 42, fontWeight: 900, color: C.text, letterSpacing: '-1px', margin: '0 0 14px' }}>
          How we vet every<br /><span style={{ color: C.teal }}>agent on KhenX</span>
        </h2>
        <p style={{ fontSize: 14.5, color: C.slate, maxWidth: 420, margin: '0 auto', lineHeight: 1.7 }}>
          Anyone can call themselves a property agent in Lagos. On KhenX, they pass our 4-step verification process.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
        {VERIFICATION_STEPS.map((card, i) => (
          <div
            key={card.step}
            className="kx-verify-card"
            style={{
              background: C.white,
              borderRadius: 18,
              padding: '28px 22px 26px',
              border: `1px solid ${C.border}`,
              textAlign: 'center' as const,
              position: 'relative',
              overflow: 'hidden',
              cursor: 'default',
              animationDelay: `${i * 90}ms`,
            }}
          >
            <span className="kx-verify-bar" />

            <div className="kx-verify-icon" style={{
              width: 52, height: 52, borderRadius: '50%',
              background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, margin: '0 auto 18px',
              border: `2px solid ${C.teal}22`,
            }}>
              {card.icon}
            </div>

            <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, letterSpacing: '0.8px', marginBottom: 8 }}>
              STEP {card.step}
            </div>
            <h3 style={{ fontSize: 14.5, fontWeight: 800, color: C.text, marginBottom: 10 }}>
              {card.title}
            </h3>
            <p style={{ fontSize: 12.5, color: C.slate, lineHeight: 1.7, margin: 0 }}>
              {card.body}
            </p>
          </div>
        ))}
      </div>
    </div>

    <style>{`
      @keyframes kxFadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .kx-verify-card {
        animation: kxFadeUp 600ms ease both;
        transition: transform 260ms ease, box-shadow 260ms ease, border-color 260ms ease;
      }
      .kx-verify-card:hover {
        transform: translateY(-6px);
        border-color: ${C.teal}55;
        box-shadow: 0 16px 32px -16px rgba(15, 41, 41, 0.18);
      }
      .kx-verify-bar {
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 3px;
        background: ${C.teal};
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 320ms ease;
      }
      .kx-verify-card:hover .kx-verify-bar {
        transform: scaleX(1);
      }
      .kx-verify-icon {
        transition: transform 320ms ease, border-color 320ms ease;
      }
      .kx-verify-card:hover .kx-verify-icon {
        transform: scale(1.08) rotate(-4deg);
        border-color: ${C.teal}88;
      }
      @media (prefers-reduced-motion: reduce) {
        .kx-verify-card { animation: none; }
        .kx-verify-card:hover { transform: none; }
        .kx-verify-icon { transition: none; }
        .kx-verify-card:hover .kx-verify-icon { transform: none; }
      }
      @media (max-width: 860px) {
        .kx-verify-card { animation-delay: 0ms !important; }
      }
    `}</style>
  </section>
);
// ─── SECTION 6: FAQ + Numbers ─────────────────────────────────────────────────


// ─── SECTION 7: Bottom CTA ────────────────────────────────────────────────────
const BottomCtaSection = () => (
  <section style={{ background:`linear-gradient(115deg,${C.navy} 0%,#0a2035 50%,#0d2d3a 100%)`, padding:'80px 0', position:'relative', overflow:'hidden' }}>
    <div style={{ position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(0,201,167,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,201,167,0.02) 1px,transparent 1px)',backgroundSize:'56px 56px' }} />
    <div style={{ position:'absolute',bottom:-120,left:'50%',transform:'translateX(-50%)',width:600,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,180,140,0.1) 0%,transparent 70%)' }} />
    <div style={{ maxWidth:1160,margin:'0 auto',padding:'0 24px',position:'relative',zIndex:2,textAlign:'center' as const }}>
      <div style={{ fontSize:11,fontWeight:700,color:C.teal,letterSpacing:'1.4px',textTransform:'uppercase' as const,marginBottom:18 }}>START NOW · IT'S FREE</div>
      <h2 style={{ fontSize:52,fontWeight:900,color:C.white,letterSpacing:'-2px',lineHeight:1.1,margin:'0 0 18px' }}>
        Ready to find your<br />Lagos home{' '}<span style={{ color:C.teal }}>the right way?</span>
      </h2>
      <p style={{ fontSize:15,color:'rgba(255,255,255,0.5)',maxWidth:440,margin:'0 auto 36px',lineHeight:1.75 }}>
        Join thousands of Nigerians who make smarter property decisions with verified intelligence — not guesswork.
      </p>
      <div style={{ display:'flex',gap:14,justifyContent:'center' as const }}>
        <button style={{ background:C.teal,color:C.navy,border:'none',borderRadius:12,padding:'14px 32px',fontSize:15,fontWeight:800,cursor:'pointer' }}>Browse Listings →</button>
        <button style={{ background:'transparent',color:'rgba(255,255,255,0.65)',border:'1.5px solid rgba(255,255,255,0.18)',borderRadius:12,padding:'13px 28px',fontSize:14,fontWeight:600,cursor:'pointer' }}>Are You an Agent?</button>
      </div>
    </div>
  </section>
);

// ─── PAGE — single export default ────────────────────────────────────────────
const HowItWorksPage = () => (
  <div style={{ fontFamily: font }}>
    <HeroSection />
    <ThreeStepsSection />
    <FourScoresSection />
    <NumbersMeanSection />
    <AgentVerificationSection />
        <FAQAccordion />
    
    <BottomCtaSection />
  </div>
);

export default HowItWorksPage;