// import { Link } from "react-router-dom";
import { useEffect, useState } from "react"; 
// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  navy: "#0A1628",
  navyMid: "#0F2240",
  navyLight: "#1A3355",
  teal: "#00C9A7",
  tealLight: "#E0FAF5",
  tealDim: "rgba(0,201,167,0.15)",
  white: "#FFFFFF",
  offWhite: "#F8FAFC",
  border: "#E2E8F0",
  slate: "#64748B",
  slateLight: "#94A3B8",
  text: "#0F172A",
  textMid: "#334155",
};

// ─── Inline styles ─────────────────────────────────────────────────────────────
const s = {
  section: (bg = C.white): React.CSSProperties => ({
    background: bg,
    padding: "80px 0",
  }),
  container: (): React.CSSProperties => ({
    maxWidth: 1160,
    margin: "0 auto",
    padding: "0 24px",
  }),
  eyebrow: (light = false): React.CSSProperties => ({
    display: "inline-block",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "1.4px",
    textTransform: "uppercase" as const,
    color: light ? C.teal : C.teal,
    background: light ? C.tealDim : C.tealDim,
    borderRadius: 20,
    padding: "4px 12px",
    marginBottom: 18,
  }),
  h1: (): React.CSSProperties => ({
    fontSize: "clamp(36px, 5vw, 58px)",
    fontWeight: 900,
    color: C.white,
    lineHeight: 1.12,
    letterSpacing: "-1.5px",
    margin: 0,
  }),
  h2Dark: (): React.CSSProperties => ({
    fontSize: "clamp(28px, 3.5vw, 42px)",
    fontWeight: 900,
    color: C.white,
    lineHeight: 1.2,
    letterSpacing: "-0.8px",
    margin: 0,
  }),
  h2Light: (): React.CSSProperties => ({
    fontSize: "clamp(28px, 3.5vw, 42px)",
    fontWeight: 900,
    color: C.text,
    lineHeight: 1.2,
    letterSpacing: "-0.8px",
    margin: 0,
  }),
  body: (light = false): React.CSSProperties => ({
    fontSize: 15,
    color: light ? "rgba(255,255,255,0.65)" : C.textMid,
    lineHeight: 1.75,
    margin: 0,
  }),
  pill: (active = false): React.CSSProperties => ({
    padding: "8px 18px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: active ? C.navy : "transparent",
    color: active ? C.white : C.slate,
    whiteSpace: "nowrap" as const,
  }),
  tealAccent: (): React.CSSProperties => ({
    color: C.teal,
  }),
};

// ─── Stat pill ────────────────────────────────────────────────────────────────
// Splits "1,200+" → base "1,200" + suffix "+" colored teal
// Splits "24/7" → base "24" + suffix "/7" colored teal
const StatPill = ({ num, label }: { num: string; label: string }) => {
  // Find teal suffix: +, /7, etc.
  const suffixMatch = num.match(/^([\d,₦.]+)(\+|\/\d+)?$/);
  const base = suffixMatch ? suffixMatch[1] : num;
  const suffix = suffixMatch ? (suffixMatch[2] ?? "") : "";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span
        style={{
          fontSize: 36,
          fontWeight: 900,
          color: C.white,
          letterSpacing: "-1.5px",
          lineHeight: 1,
        }}
      >
        {base}
        <span style={{ color: C.teal }}>{suffix}</span>
      </span>
      <span
        style={{
          fontSize: 11.5,
          color: "rgba(255,255,255,0.45)",
          fontWeight: 400,
          letterSpacing: "0.1px",
        }}
      >
        {label}
      </span>
    </div>
  );
};

// ─── 1. HERO ─────────────────────────────────────────────────────────────────
const Hero = () => (
  <section style={{ position: "relative", overflow: "hidden", minHeight: 580 }}>
    {/* ── Layer 0: Real building photo (faint base) ── */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        backgroundImage: `url('https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80&auto=format&fit=crop')`,
        backgroundSize: "cover",
        backgroundPosition: "center 30%",
        backgroundRepeat: "no-repeat",
        // Desaturate so the building reads as texture, not photo
        filter: "grayscale(40%) brightness(0.35)",
      }}
    />

    {/* ── Layer 1: Dark gradient overlay — keeps your brand colors dominant ── */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        background:
          "linear-gradient(110deg, rgba(7,20,40,0.92) 0%, rgba(10,32,53,0.88) 35%, rgba(13,45,58,0.82) 60%, rgba(10,37,53,0.90) 100%)",
      }}
    />

    {/* ── Layer 2: Subtle grid texture ── */}
    {/* <div style={{
      position: 'absolute', inset: 0, zIndex: 2,
      backgroundImage: `
        linear-gradient(rgba(0,201,167,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,201,167,0.02) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px',
    }} /> */}

    {/* ── Layer 3: Teal glow (right side) ── */}
    <div
      style={{
        position: "absolute",
        top: -80,
        right: -80,
        width: 600,
        height: 600,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(0,180,140,0.18) 0%, transparent 70%)",
        zIndex: 3,
      }}
    />

    {/* ── Content ── */}
    <div
      style={{
        position: "relative",
        zIndex: 4,
        maxWidth: 1160,
        margin: "0 auto",
        padding: "72px 24px 80px",
        display: "grid",
        gridTemplateColumns: "1fr 460px",
        gap: 52,
        alignItems: "center",
      }}
    >
      {/* ── LEFT ── */}
      <div>
        {/* Eyebrow pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: "rgba(0,201,167,0.12)",
            border: "1px solid rgba(0,201,167,0.25)",
            borderRadius: 20,
            padding: "5px 13px",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: C.teal,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.teal,
              letterSpacing: "1px",
              textTransform: "uppercase" as const,
            }}
          >
            About KhenX
          </span>
        </div>

        {/* H1 */}
        <h1
          style={{
            fontSize: "clamp(38px, 5vw, 60px)",
            fontWeight: 900,
            color: C.white,
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
            margin: "0 0 22px",
          }}
        >
          Lagos deserves
          <br />
          better than <span style={{ color: C.teal }}>guesswork.</span>
        </h1>

        {/* Body */}
        <p
          style={{
            fontSize: 15.5,
            color: "rgba(255,255,255,0.6)",
            lineHeight: 1.75,
            maxWidth: 430,
            margin: "0 0 36px",
          }}
        >
          KhenX is Lagos's first data-intelligence real estate platform — built
          so renters and buyers can make the most important financial decision
          of their lives with full information, not just photos and prayers.
        </p>

        {/* CTA buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 56,
          }}
        >
          <button
            style={{
              background: C.teal,
              color: C.navy,
              border: "none",
              borderRadius: 10,
              padding: "13px 26px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Explore Listings
            <span style={{ fontSize: 16, lineHeight: 1 }}>→</span>
          </button>
          <button
            style={{
              background: "transparent",
              color: C.white,
              border: "1.5px solid rgba(255,255,255,0.2)",
              borderRadius: 10,
              padding: "12px 22px",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 9,
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                border: "1.5px solid rgba(255,255,255,0.4)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                paddingLeft: 2,
                flexShrink: 0,
              }}
            >
              ▶
            </span>
            Watch our story
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 44 }}>
          <StatPill num="1,200+" label="Verified Listings" />
          <StatPill num="450+" label="Verified Agents" />
          <StatPill num="32" label="Neighbourhoods Mapped" />
          <StatPill num="24/7" label="Intelligence Updates" />
        </div>
      </div>

      {/* ── RIGHT — stacked property card + score panel + agent chip ── */}
      <div style={{ position: "relative", height: 420 }}>
        {/* "Live Intelligence Active" top badge */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            zIndex: 10,
            background: "rgba(10,22,40,0.9)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 20,
            padding: "6px 14px",
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: C.teal,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 11.5, fontWeight: 600, color: C.white }}>
            Live Intelligence Active
          </span>
        </div>

        {/* Main property card */}
        <div
          style={{
            position: "absolute",
            top: 28,
            right: 0,
            width: 290,
            zIndex: 5,
            background: C.white,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              height: 170,
              position: "relative",
              background:
                "linear-gradient(160deg, #1a4a3a 0%, #0f3a5a 50%, #1a3a2a 100%)",
              display: "flex",
              alignItems: "flex-end",
              padding: "12px",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 40px)",
              }}
            />
            <div
              style={{
                position: "relative",
                zIndex: 2,
                background: C.teal,
                color: C.navy,
                borderRadius: 6,
                padding: "4px 10px",
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.8px",
              }}
            >
              VERIFIED
            </div>
          </div>
          <div style={{ padding: "14px 16px 16px" }}>
            <div
              style={{
                fontSize: 10.5,
                color: C.slateLight,
                marginBottom: 4,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ color: C.teal, fontSize: 9 }}>●</span>
              Lekki Phase 1, Lagos
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: C.text,
                lineHeight: 1.3,
                marginBottom: 12,
              }}
            >
              Executive 3-Bed Apartment,
              <br />
              Ocean View Estate
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <span
                style={{
                  background: "#EFF6FF",
                  color: "#1D4ED8",
                  borderRadius: 5,
                  padding: "3px 8px",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                ⚡ 8.7
              </span>
              <span
                style={{
                  background: "#FFFBEB",
                  color: "#B45309",
                  borderRadius: 5,
                  padding: "3px 8px",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                ◈ Flood: Low
              </span>
            </div>
          </div>
        </div>

        {/* Neighbourhood score panel */}
        <div
          style={{
            position: "absolute",
            bottom: 52,
            left: -10,
            zIndex: 8,
            background: C.white,
            borderRadius: 14,
            padding: "14px 16px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
            minWidth: 200,
            border: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: C.slate,
              letterSpacing: "0.8px",
              textTransform: "uppercase" as const,
              marginBottom: 10,
            }}
          >
            Neighbourhood Score
          </div>
          {[
            { label: "Power Supply", value: "9.1", color: C.teal },
            { label: "Security", value: "8.7", color: C.teal },
            { label: "Flood Risk", value: "Low", color: C.teal },
            { label: "Commute", value: "7.4", color: C.text },
          ].map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "5px 0",
                borderBottom: "1px solid #F8FAFC",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: C.teal,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 11.5, color: C.textMid }}>
                  {row.label}
                </span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: row.color }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Agent chip */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: -10,
            zIndex: 9,
            background: C.white,
            borderRadius: 24,
            padding: "7px 14px 7px 7px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: 9,
            border: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "#0F6E56",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.white,
              fontSize: 10,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            TK
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
            Tosin Kalu
          </span>
        </div>
      </div>
    </div>
  </section>
);

// ─── 2. MISSION — "The most important financial decision" ─────────────────────
const MissionSection = () => (
  <section style={s.section(C.offWhite)}>
    <div style={{ ...s.container(), display: 'grid', gridTemplateColumns: '420px 1fr', gap: 60, alignItems: 'center' }}>
      {/* Left — product screenshot stack */}
      <div style={{ position: 'relative' }}>
        {/* Main dark card */}
        <div style={{ background: C.navy, borderRadius: 18, padding: '22px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
          <div style={{ fontSize: 10, color: C.teal, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 14 }}>
            NEIGHBOURHOOD INTELLIGENCE
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.white, marginBottom: 20 }}>Lekki, Lagos</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Power Score', value: '7.2', sub: 'Based on 3-month data', color: C.teal },
              { label: 'Flood Risk', value: 'Low', sub: 'Elevation confirmed', color: C.teal },
              { label: 'Security', value: '8.0', sub: 'Gated communities', color: C.teal },
              { label: 'Commute', value: '8.5', sub: 'BRT + 3rd Mainland', color: C.teal },
            ].map(sc => (
              <div key={sc.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize: 10, color: C.slateLight, marginBottom: 6, fontWeight: 500 }}>{sc.label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: sc.color, letterSpacing: '-0.5px' }}>{sc.value}</div>
                <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{sc.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: '10px 14px', background: C.tealDim, borderRadius: 10, border: `1px solid ${C.teal}30` }}>
            <div style={{ fontSize: 10, color: C.teal, fontWeight: 700 }}>AI Insight</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 3, lineHeight: 1.5 }}>
              Lekki Phase 1 has seen 18% rent increases in Q1 2025. Best value in eastern corridors.
            </div>
          </div>
        </div>
        {/* Floating small card */}
        <div style={{
          position: 'absolute', bottom: -20, right: -24,
          background: C.white, borderRadius: 14, padding: '14px 16px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)', border: `1px solid ${C.border}`,
          minWidth: 160,
        }}>
          <div style={{ fontSize: 10, color: C.slate, marginBottom: 6 }}>Avg. rent / yr</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: C.text, letterSpacing: '-0.5px' }}>₦3.2M</div>
          <div style={{ fontSize: 10, color: '#10b981', marginTop: 3, fontWeight: 600 }}>↑ 12% from last year</div>
        </div>
      </div>

      {/* Right — copy */}
      <div>
        <span style={s.eyebrow()}>Why KhenX Exists</span>
        <h2 style={{ ...s.h2Light(), marginBottom: 20 }}>
          The most important<br />
          financial decision should<br />
          never be a <span style={{ color: C.teal }}>gamble.</span>
        </h2>
        <p style={{ ...s.body(), marginBottom: 20 }}>
          Renting, buying, investing. A decision so fundamental it disappears behind vague listings, unreliable agents, and zero data.
        </p>
        <p style={{ ...s.body(), marginBottom: 28 }}>
          KhenX was built to fix that. We surface the right information — power scores, flood risk, security data, and local price intelligence — so you can make this decision with confidence.
        </p>
        <blockquote style={{
          background: C.navy, borderRadius: 14, padding: '20px 22px',
          borderLeft: `4px solid ${C.teal}`,
          margin: 0,
        }}>
          <p style={{ fontSize: 14, color: C.white, lineHeight: 1.7, margin: '0 0 10px', fontStyle: 'italic' }}>
            "Know the score before you sign. It's a standard we hold every listing, every agent, and every data point on this platform to."
          </p>
          <div style={{ fontSize: 11, color: C.teal, fontWeight: 700 }}>— The KhenX Standard</div>
        </blockquote>
      </div>
    </div>
  </section>
);


// ─── 2. PROBLEM — "Renting in Lagos is broken" ───────────────────────────────
const ProblemSection = () => {
  const problems = [
    {
      icon: "⚠",
      iconBg: "#3D1A1A",
      iconColor: "#F87171",
      title: "Fraudulent & Ghost Listings",
      desc: "Properties that don't exist, agents who vanish after collecting agency fees. No verification, no accountability.",
    },
    {
      icon: "⚡",
      iconBg: "#2D1F00",
      iconColor: "#FBBF24",
      title: "Hidden Power Problems",
      desc: 'Promised "24-hour light" turns into NEPA rationing. No one tells you the area runs on 6 hours of power a day.',
    },
    {
      icon: "⊖",
      iconBg: "#0E2233",
      iconColor: "#60A5FA",
      title: "Undisclosed Flood Risk",
      desc: "Your beautiful new estate becomes a lake in June. Flood zones aren't on the listing — they should be.",
    },
    {
      icon: "◎",
      iconBg: "#1A1230",
      iconColor: "#A78BFA",
      title: "Commute Shock",
      desc: '"Close to the mainland" means 2.5 hours on Third Mainland Bridge. Listings don\'t come with a traffic report.',
    },
    {
      icon: "⊙",
      iconBg: "#0D2020",
      iconColor: "#2DD4BF",
      title: "Zero Agent Accountability",
      desc: "Anyone can call themselves a property agent in Lagos. No license, no vetting, no recourse when things go wrong.",
    },
  ];

  const stats = [
    {
      num: "67%",
      desc: "of renters experienced undisclosed issues in their first 3 months",
    },
    {
      num: "1 in 4",
      desc: "listings on unverified platforms contain false or outdated information",
    },
    { num: "₦2.3B", desc: "lost annually to real estate fraud in Lagos alone" },
    {
      num: "0",
      desc: "verified neighbourhood intelligence platforms before KhenX",
    },
  ];

  return (
    <section
      style={{
        background: "#071428",
        padding: "80px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "580px 1fr",
          gap: 64,
          alignItems: "flex-start",
        }}
      >
        {/* ── LEFT ── */}
        <div>
          {/* Eyebrow pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              border: "1px solid rgba(0,201,167,0.35)",
              borderRadius: 20,
              padding: "5px 14px",
              marginBottom: 22,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#00C9A7",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
              }}
            >
              The Problem We're Fixing
            </span>
          </div>

          {/* Headline */}
          <h2
            style={{
              fontSize: "clamp(30px, 4vw, 44px)",
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: "-1px",
              margin: "0 0 18px",
            }}
          >
            <span style={{ color: "#FFFFFF" }}>
              Renting in Lagos is broken.
            </span>
            <br />
            <span style={{ color: "#00C9A7" }}>We're here to fix it.</span>
          </h2>

          {/* Body */}
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.8,
              margin: "0 0 36px",
              maxWidth: 380,
            }}
          >
            Millions of Lagosians relocate every year. Most rely on WhatsApp
            forwards, word of mouth, and listings with three-year-old photos.
            The system fails renters, and it fails honest agents too.
          </p>

          {/* Industry Reality box */}
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 14,
              padding: "22px 24px",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                marginBottom: 20,
              }}
            >
              Industry Reality
            </div>

            {/* 2×2 stats grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px 32px",
              }}
            >
              {stats.map((s) => (
                <div key={s.num}>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      color: "#FFFFFF",
                      letterSpacing: "-0.5px",
                      lineHeight: 1,
                      marginBottom: 6,
                    }}
                  >
                    {s.num}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.4)",
                      lineHeight: 1.6,
                    }}
                  >
                    {s.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT — problem cards ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {problems.map((p) => (
            <div
              key={p.title}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14,
                padding: "18px 20px",
                transition: "background 0.2s",
              }}
            >
              {/* Icon square */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: p.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  color: p.iconColor,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {p.icon}
              </div>

              {/* Text */}
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#FFFFFF",
                    marginBottom: 5,
                    lineHeight: 1.3,
                  }}
                >
                  {p.title}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "rgba(255,255,255,0.45)",
                    lineHeight: 1.65,
                  }}
                >
                  {p.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


// ─── 4. INTELLIGENCE SECTION ──────────────────────────────────────────────────
const IntelligenceSection = () => (
  <section style={s.section(C.offWhite)}>
    <div
      style={{
        ...s.container(),
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 72,
        alignItems: "center",
      }}
    >
      {/* Left — UI mockup */}
      <div style={{ position: "relative" }}>
        <div
          style={{
            background: C.white,
            borderRadius: 20,
            border: `1px solid ${C.border}`,
            boxShadow: "0 16px 48px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          {/* Mockup header */}
          <div
            style={{
              background: "#F1F5F9",
              padding: "10px 16px",
              display: "flex",
              gap: 6,
            }}
          >
            {["#FF5F57", "#FFBD2E", "#28C840"].map((c) => (
              <div
                key={c}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: c,
                }}
              />
            ))}
          </div>
          <div style={{ padding: "20px" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.teal,
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Neighbourhood Intelligence
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: C.text,
                marginBottom: 18,
              }}
            >
              Yaba, Lagos District
            </div>
            {/* Score bars */}
            {[
              { label: "Power Supply Score", val: 7.5, color: C.teal, pct: 75 },
              { label: "Security Rating", val: 8.0, color: C.teal, pct: 80 },
              { label: "Flood Risk", val: "Low", color: C.teal, pct: 85 },
              {
                label: "Commute Intelligence",
                val: 6.8,
                color: "#F59E0B",
                pct: 68,
              },
            ].map((item) => (
              <div key={item.label} style={{ marginBottom: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 5,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11.5,
                      color: C.textMid,
                      fontWeight: 500,
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{ fontSize: 12, fontWeight: 800, color: item.color }}
                  >
                    {item.val}
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: "#F1F5F9",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${item.pct}%`,
                      height: "100%",
                      background: item.color,
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            ))}
            <div
              style={{
                marginTop: 18,
                padding: "12px 14px",
                background: "#F8FAFC",
                borderRadius: 10,
                border: `1px solid ${C.border}`,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.teal,
                  marginBottom: 4,
                }}
              >
                ✦ AI Summary
              </div>
              <div style={{ fontSize: 11.5, color: C.slate, lineHeight: 1.6 }}>
                Yaba is undervalued relative to its commute connectivity.
                Best-value area for young professionals.
              </div>
            </div>
          </div>
        </div>
        {/* Tag */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: -16,
            background: C.navy,
            borderRadius: 12,
            padding: "8px 14px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ fontSize: 10, color: C.slateLight }}>Sign + View</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.white }}>
            with full intelligence
          </div>
        </div>
      </div>

      {/* Right — copy */}
      <div>
        <span style={s.eyebrow()}>Neighbourhood Intelligence</span>
        <h2 style={{ ...s.h2Light(), marginBottom: 22 }}>
          Every listing. Every score.
          <br />
          <span style={{ color: C.teal }}>Every neighbourhood.</span>
        </h2>
        <p style={{ ...s.body(), marginBottom: 32 }}>
          Our intelligence layer goes deeper than any other platform in Lagos.
          Every listing is enriched with neighbourhood data that most agents
          don't even know.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {[
            {
              icon: "⚡",
              title: "Power Supply Score",
              desc: "Sourced from community reports and utility monitoring. Know exactly how many hours of light to expect.",
            },
            {
              icon: "🌊",
              title: "Flood Risk Classification",
              desc: "Topographic analysis and historical flood data mapped to street level, not just LGA-level estimates.",
            },
            {
              icon: "🛡️",
              title: "Security Rating",
              desc: "Aggregated from estate security records, resident reports, and police proximity mapping.",
            },
            {
              icon: "🚌",
              title: "Commute Intelligence",
              desc: "Real commute times from each listing to major business districts — Lagos Island, VI, Lekki, Ikeja.",
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: C.tealDim,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 17,
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: C.text,
                    marginBottom: 4,
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{ fontSize: 12.5, color: C.slate, lineHeight: 1.65 }}
                >
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ─── 5. HOW IT WORKS ─────────────────────────────────────────────────────────
const HowItWorks = () => {
  useEffect(() => {
    const cards = document.querySelectorAll('.hiw-card');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('hiw-visible');
        });
      },
      { threshold: 0.15 }
    );
    cards.forEach((c) => obs.observe(c));

    const t1 = setTimeout(() => {
      document.querySelectorAll<HTMLElement>('.hiw-bar').forEach((b) => {
        b.style.width = b.dataset.width ?? '0%';
      });
      let count = 0;
      const el = document.getElementById('hiw-count');
      const ticker = setInterval(() => {
        count = Math.min(count + 3, 48);
        if (el) el.textContent = String(count);
        if (count >= 48) clearInterval(ticker);
      }, 40);
    }, 700);

    const t2 = setTimeout(() => {
      ['hiw-line1', 'hiw-line2'].forEach((id, i) => {
        setTimeout(() => {
          document.getElementById(id)?.classList.add('hiw-dash-animate');
          setTimeout(() => {
            const arrow = document.getElementById('hiw-arrow' + (i + 1));
            if (arrow) (arrow as HTMLElement).style.opacity = '1';
          }, 650);
        }, i * 300);
      });
    }, 500);

    const t3 = setTimeout(() => {
      ['hiw-step2', 'hiw-step3'].forEach((id, i) => {
        setTimeout(() => {
          const el = document.getElementById(id) as HTMLElement | null;
          if (el) {
            el.style.background = '#0A1628';
            el.style.color = '#fff';
          }
        }, i * 400);
      });
    }, 900);

    return () => {
      obs.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <section style={{ background: '#EEF2F7', padding: '80px 24px' }}>
      <style>{`
        @keyframes hiw-fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hiw-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes hiw-ripple {
          0%   { box-shadow: 0 0 0 0 rgba(0,180,140,0.35); }
          70%  { box-shadow: 0 0 0 14px rgba(0,180,140,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,180,140,0); }
        }
        @keyframes hiw-dash {
          from { stroke-dashoffset: 80; }
          to   { stroke-dashoffset: 0; }
        }
        .hiw-card {
          background: #fff;
          border-radius: 18px;
          padding: 28px 22px 26px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          opacity: 0;
          box-shadow: 0 2px 16px rgba(0,0,0,0.06);
          transition: transform 0.25s, box-shadow 0.25s;
          cursor: default;
        }
        .hiw-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 36px rgba(0,0,0,0.1);
        }
        .hiw-card:hover .hiw-icon {
          animation: hiw-float 2s ease-in-out infinite;
        }
        .hiw-visible {
          animation: hiw-fadeUp 0.55s cubic-bezier(.22,1,.36,1) forwards;
        }
        .hiw-step-num {
          width: 30px; height: 30px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700;
          transition: background 0.4s, color 0.4s;
        }
        .hiw-step-num.pulse { animation: hiw-ripple 2s ease-out infinite; }
        .hiw-icon {
          width: 48px; height: 48px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
        }
        .hiw-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 600;
        }
        .hiw-inner {
          background: #F8FAFC; border-radius: 12px; padding: 12px 14px;
        }
        .hiw-inner-label {
          font-size: 10px; font-weight: 700; color: #94A3B8;
          letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 10px;
        }
        .hiw-score-row {
          display: flex; align-items: center;
          font-size: 12px; gap: 8px; padding: 4px 0; color: #64748B;
        }
        .hiw-bar-track {
          flex: 1; height: 4px; border-radius: 2px;
          background: #E2E8F0; overflow: hidden;
        }
        .hiw-bar {
          height: 100%; border-radius: 2px; width: 0%;
          transition: width 1.2s cubic-bezier(.22,1,.36,1);
        }
        .hiw-score-val {
          font-weight: 700; font-size: 12px;
          min-width: 28px; text-align: right;
        }
        .hiw-kyc-row {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: #64748B; padding: 5px 0;
          border-bottom: 1px solid #F1F5F9;
        }
        .hiw-kyc-row:last-child { border-bottom: none; }
        line.hiw-dash-animate {
          animation: hiw-dash 0.7s ease forwards;
        }
      `}</style>

      <div style={{ maxWidth: 1160, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            border: '1px solid #00C9A7', borderRadius: 20,
            padding: '5px 16px', marginBottom: 18,
          }}>
            <span style={{
              fontSize: 10, fontWeight: 800, color: '#00C9A7',
              letterSpacing: '1.4px', textTransform: 'uppercase' as const,
            }}>
              How KhenX Works
            </span>
          </div>

          <h2 style={{
            fontSize: 'clamp(26px, 4vw, 44px)',
            fontWeight: 900, color: '#0A1628',
            lineHeight: 1.15, letterSpacing: '-1px',
            margin: '0 0 14px',
          }}>
            From search to{' '}
            <span style={{ color: '#00C9A7' }}>signed</span>
            {' '}— with full intelligence
          </h2>

          <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, margin: 0 }}>
            Three steps between you and your perfect Lagos property, fully informed.
          </p>
        </div>

        {/* ── 3 cards + connectors ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 40px 1fr 40px 1fr',
          gap: 0,
          alignItems: 'start',
        }}>

          {/* ── CARD 1: Search ── */}
          <div className="hiw-card" style={{ animationDelay: '0.1s' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                id="hiw-step1"
                className="hiw-step-num pulse"
                style={{ background: '#0A1628', color: '#fff' }}
              >
                1
              </div>
              <span className="hiw-badge" style={{ background: '#ECFDF5', color: '#065F46' }}>
                ✓ Smart search
              </span>
            </div>

            <div className="hiw-icon" style={{ background: '#E1F5EE', color: '#0F6E56' }}>
              🔍
            </div>

            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#0A1628', margin: '0 0 6px' }}>
                Search with Intelligence
              </p>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.7 }}>
                Filter by area, budget, bedrooms — and by power score, flood risk, and commute
                time. Our AI engine understands Lagos.
              </p>
            </div>

            <div className="hiw-inner">
              <p className="hiw-inner-label">Live filters</p>
              {[
                { icon: '📍', label: 'Lekki Phase 1' },
                { icon: '💰', label: 'Under ₦3.5M/yr' },
                { icon: '⚡', label: 'Power score 8+' },
              ].map((f) => (
                <div key={f.label} className="hiw-score-row">
                  <span>{f.icon}</span>
                  <span style={{ flex: 1 }}>{f.label}</span>
                  <span style={{ color: '#00C9A7', fontWeight: 700 }}>✓</span>
                </div>
              ))}
              <div style={{
                marginTop: 10, paddingTop: 10,
                borderTop: '1px solid #E2E8F0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 12, color: '#64748B' }}>Properties found</span>
                <span id="hiw-count" style={{ fontSize: 20, fontWeight: 900, color: '#00C9A7' }}>0</span>
              </div>
            </div>
          </div>

          {/* ── Connector 1 ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 54 }}>
            <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
              <line
                id="hiw-line1"
                x1="0" y1="10" x2="40" y2="10"
                stroke="#00C9A7" strokeWidth="1.5"
                strokeDasharray="80" strokeDashoffset="80"
              />
              <polygon
                id="hiw-arrow1"
                points="30,5 40,10 30,15"
                fill="#00C9A7"
                style={{ opacity: 0, transition: 'opacity 0.3s' }}
              />
            </svg>
          </div>

          {/* ── CARD 2: Verify ── */}
          <div className="hiw-card" style={{ animationDelay: '0.28s' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                id="hiw-step2"
                className="hiw-step-num"
                style={{ background: '#E2E8F0', color: '#64748B' }}
              >
                2
              </div>
              <span className="hiw-badge" style={{ background: '#FFFBEB', color: '#92400E' }}>
                ⚡ Verified data
              </span>
            </div>

            <div className="hiw-icon" style={{ background: '#FFFBEB', color: '#B45309' }}>
              🕐
            </div>

            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#0A1628', margin: '0 0 6px' }}>
                Verify the Neighbourhood
              </p>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.7 }}>
                Every listing includes a real-time Intelligence Panel — power supply, flood risk,
                security rating, commute score. Data you can rely on before you visit.
              </p>
            </div>

            <div className="hiw-inner">
              <p className="hiw-inner-label">Intelligence panel</p>
              {[
                { label: 'Power supply', width: '91%', val: '9.1', color: '#00C9A7' },
                { label: 'Security',     width: '87%', val: '8.7', color: '#00C9A7' },
                { label: 'Flood risk',   width: '15%', val: 'Low', color: '#00C9A7' },
                { label: 'Commute',      width: '74%', val: '7.4', color: '#B45309' },
              ].map((row) => (
                <div key={row.label} className="hiw-score-row">
                  <span style={{ flex: '0 0 80px' }}>{row.label}</span>
                  <div className="hiw-bar-track">
                    <div
                      className="hiw-bar"
                      data-width={row.width}
                      style={{ background: row.color }}
                    />
                  </div>
                  <span className="hiw-score-val" style={{ color: row.color }}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Connector 2 ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 54 }}>
            <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
              <line
                id="hiw-line2"
                x1="0" y1="10" x2="40" y2="10"
                stroke="#00C9A7" strokeWidth="1.5"
                strokeDasharray="80" strokeDashoffset="80"
              />
              <polygon
                id="hiw-arrow2"
                points="30,5 40,10 30,15"
                fill="#00C9A7"
                style={{ opacity: 0, transition: 'opacity 0.3s' }}
              />
            </svg>
          </div>

          {/* ── CARD 3: Connect ── */}
          <div className="hiw-card" style={{ animationDelay: '0.46s' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                id="hiw-step3"
                className="hiw-step-num"
                style={{ background: '#E2E8F0', color: '#64748B' }}
              >
                3
              </div>
              <span className="hiw-badge" style={{ background: '#E1F5EE', color: '#065F46' }}>
                ✓ KYC verified
              </span>
            </div>

            <div className="hiw-icon" style={{ background: '#E1F5EE', color: '#0F6E56' }}>
              ✅
            </div>

            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#0A1628', margin: '0 0 6px' }}>
                Connect with Verified Agents
              </p>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.7 }}>
                Every agent on KhenX is KYC-verified — government ID confirmed, business name
                checked. Send an enquiry and expect a response. No ghosts.
              </p>
            </div>

            <div className="hiw-inner">
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 12, paddingBottom: 12,
                borderBottom: '1px solid #E2E8F0',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: '#0F6E56', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, flexShrink: 0,
                }}>
                  TK
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0A1628' }}>
                    Tosin Kalu
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: '#64748B' }}>
                    Lagos Verified Agent
                  </p>
                </div>
                <span style={{ color: '#00C9A7', fontSize: 18 }}>✓</span>
              </div>

              {[
                { icon: '🪪', label: 'Government ID confirmed' },
                { icon: '🏢', label: 'Business name registered' },
                { icon: '⭐', label: '4.9 rating · 87 deals closed' },
              ].map((row) => (
                <div key={row.label} className="hiw-kyc-row">
                  <span>{row.icon}</span>
                  <span>{row.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

// ─── 6. STATS BANNER ─────────────────────────────────────────────────────────
const StatsBanner = () => {
  const stats = [
    {
      num: '1,200',
      suffix: '+',
      label: 'Verified Listings',
      sub: 'Active across 32 areas',
    },
    {
      num: '450',
      suffix: '+',
      label: 'KYC-Verified Agents',
      sub: 'Government ID confirmed',
    },
    {
      num: '32',
      suffix: '',
      label: 'Neighbourhoods Mapped',
      sub: 'Intelligence scores live',
    },
    {
      num: '₦2.3',
      suffix: 'B',
      label: 'In Transactions Guided',
      sub: 'Since launch 2025',
    },
  ];

  return (
    <section style={{
      background: '#071428',
      padding: '40px 24px',
    }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        {/* Inner card */}
        <div style={{
          background: '#0D1E35',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16,
          padding: '36px 48px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          position: 'relative',
        }}>
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              style={{
                position: 'relative',
                paddingLeft: i === 0 ? 0 : 40,
              }}
            >
              {/* Vertical divider */}
              {i > 0 && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '10%',
                  height: '80%',
                  width: 1,
                  background: 'rgba(255,255,255,0.08)',
                }} />
              )}

              {/* Number row */}
              <div style={{
                fontSize: 42,
                fontWeight: 900,
                letterSpacing: '-1.5px',
                lineHeight: 1,
                marginBottom: 10,
                display: 'flex',
                alignItems: 'baseline',
                gap: 2,
              }}>
                <span style={{ color: '#FFFFFF' }}>{stat.num}</span>
                {stat.suffix && (
                  <span style={{ color: '#00C9A7' }}>{stat.suffix}</span>
                )}
              </div>

              {/* Label */}
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.85)',
                marginBottom: 4,
                letterSpacing: '-0.1px',
              }}>
                {stat.label}
              </div>

              {/* Sub-label */}
              <div style={{
                fontSize: 11.5,
                color: 'rgba(255,255,255,0.28)',
                fontWeight: 400,
              }}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
// ─── 7. VALUES ───────────────────────────────────────────────────────────────
const ValueCard = ({ val }: { val: { icon: string; title: string; body: string } }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      key={val.title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.white,
        borderRadius: 16,
        padding: "24px 22px",
        border: `1px solid ${hovered ? C.teal : C.border}`,
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 20px 40px rgba(0,201,167,0.12), 0 8px 16px rgba(0,0,0,0.08)"
          : "0 1px 3px rgba(0,0,0,0.04)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: hovered ? C.teal + "22" : C.tealDim,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          marginBottom: 16,
          transition: "background 0.25s ease",
        }}
      >
        {val.icon}
      </div>
      <h3
        style={{
          fontSize: 14.5,
          fontWeight: 800,
          color: hovered ? C.teal : C.text,
          marginBottom: 8,
          letterSpacing: "-0.2px",
          transition: "color 0.25s ease",
        }}
      >
        {val.title}
      </h3>
      <p style={{ fontSize: 13, color: C.slate, lineHeight: 1.7, margin: 0 }}>
        {val.body}
      </p>
    </div>
  );
};

// ─── 7. VALUES ───────────────────────────────────────────────────────────────
const Values = () => (
  <section style={s.section(C.offWhite)}>
    <div style={s.container()}>
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <span style={s.eyebrow()}>Our Values</span>
        <h2 style={{ ...s.h2Light(), textAlign: "center", marginBottom: 12 }}>
          What we stand for
        </h2>
        <p style={{ ...s.body(), textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
          It's a principle that sits behind every decision we make at KhenX.
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
        }}
      >
        {[
          {
            icon: "🔍",
            title: "Radical Transparency",
            body: "Every score, every data point, every source — shown openly. We don't hide methodology or make decisions opaque.",
          },
          {
            icon: "🏠",
            title: "Renter-First Design",
            body: "Built for the person signing the lease, not the agent collecting the commission. Every feature ships from that point of view.",
          },
          {
            icon: "🛡️",
            title: "Zero Tolerance for Fraud",
            body: "Lagos rental fraud is endemic. We've built verification infrastructure to prevent ghost listings from ever appearing here.",
          },
          {
            icon: "🔒",
            title: "Data Independence",
            body: "Our intelligence comes from independent sources — not from agents, landlords, or developers with a stake in the outcome.",
          },
          {
            icon: "📱",
            title: "Mobile First for Lagos",
            body: "Most Lagos residents access the internet exclusively via mobile. Everything we build works perfectly on your phone first.",
          },
          {
            icon: "🏙️",
            title: "Community Above All",
            body: "Lagos renters share intelligence on our platform. That collective knowledge makes every search smarter for everyone.",
          },
        ].map((val) => (
          <ValueCard key={val.title} val={val} />
        ))}
      </div>
    </div>
  </section>
);
// ─── 8. TEAM ─────────────────────────────────────────────────────────────────
const Team = () => {
  useEffect(() => {
    const cards = document.querySelectorAll('.team-card');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('team-on'); }),
      { threshold: 0.1 }
    );
    cards.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, []);

  const members = [
    {
      initials: 'AK',
      name: 'Adewale Kehinde',
      role: 'Co-Founder · CEO',
      roleColor: '#00C9A7',
      avatarBg: '#E1F5EE',
      avatarColor: '#085041',
      orbitColor: '#00C9A7',
      orbitDuration: '8s',
      orbitReverse: false,
      tagBg: '#E1F5EE',
      tagColor: '#085041',
      tagIcon: 'briefcase',
      tagLabel: 'Fintech',
      bio: 'Ex-Flutterwave. Lost ₦800k to a Lagos rental scam in 2019 — and decided to fix the system instead of accepting it.',
      stats: [
        { val: '8yr', label: 'Fintech' },
        { val: '3x', label: 'Founder' },
        { val: 'Lagos', label: 'Based' },
      ],
      animDelay: '0.05s',
    },
    {
      initials: 'NO',
      name: 'Ngozi Okonkwo',
      role: 'Co-Founder · CTO',
      roleColor: '#534AB7',
      avatarBg: '#EEEDFE',
      avatarColor: '#26215C',
      orbitColor: '#534AB7',
      orbitDuration: '6s',
      orbitReverse: true,
      tagBg: '#EEEDFE',
      tagColor: '#26215C',
      tagIcon: 'code',
      tagLabel: 'Infra',
      bio: 'Built data infrastructure at Paystack. Lagos-born, Yaba-raised — and frustrated by every property search she\'s ever done.',
      stats: [
        { val: '6yr', label: 'Data eng' },
        { val: 'Paystack', label: 'Alumni' },
        { val: 'Yaba', label: 'Based' },
      ],
      animDelay: '0.18s',
    },
    {
      initials: 'TA',
      name: 'Tunde Adeyemi',
      role: 'Head of Intelligence',
      roleColor: '#B45309',
      avatarBg: '#FFFBEB',
      avatarColor: '#412402',
      orbitColor: '#BA7517',
      orbitDuration: '10s',
      orbitReverse: false,
      tagBg: '#FAEEDA',
      tagColor: '#412402',
      tagIcon: 'map-2',
      tagLabel: 'Data',
      bio: 'Urban planning PhD from UCL. Mapped Lagos flood risk data for the UN — now putting that intelligence into every listing.',
      stats: [
        { val: 'PhD', label: 'UCL' },
        { val: 'UN', label: 'Consultant' },
        { val: '32', label: 'Areas mapped' },
      ],
      animDelay: '0.32s',
    },
  ];

  return (
    <section style={{ background: "#EEF2F7", padding: '80px 24px' }}>
      <style>{`
        @keyframes team-fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes team-pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.06); }
        }
        @keyframes team-orbit {
          from { transform: rotate(0deg) translateX(22px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(22px) rotate(-360deg); }
        }
        @keyframes team-orbit-rev {
          from { transform: rotate(0deg) translateX(22px) rotate(0deg); }
          to   { transform: rotate(-360deg) translateX(22px) rotate(360deg); }
        }
        @keyframes team-dot-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        .team-card {
          opacity: 0;
          border-radius: 20px;
          border: 1px solid ${C.border};
          background: ${C.white};
          overflow: hidden;
          transition: transform 0.25s, box-shadow 0.25s;
          cursor: default;
        }
        .team-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.08);
        }
        .team-card:hover .team-avatar {
          animation: team-pulse 1.8s ease-in-out infinite;
        }
        .team-on {
          animation: team-fadeUp 0.55s cubic-bezier(.22,1,.36,1) forwards;
        }
        .team-avatar {
          width: 72px; height: 72px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-weight: 900;
          position: relative; z-index: 2;
          transition: transform 0.3s;
        }
        .team-orbit-ring {
          position: absolute;
          width: 120px; height: 120px; border-radius: 50%;
          border: 1px dashed rgba(0,0,0,0.08);
        }
        .team-orbit-dot {
          position: absolute;
          width: 120px; height: 120px;
          top: calc(50% - 60px); left: calc(50% - 60px);
        }
        .team-skill-dot {
          position: absolute;
          width: 8px; height: 8px; border-radius: 50%;
          top: 0; left: 50%;
        }
        .team-tag {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 700;
        }
        .team-stat {
          display: flex; flex-direction: column; align-items: center; gap: 2px;
        }
        .team-live-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: ${C.teal};
          animation: team-dot-pulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }
      `}</style>

      <div style={{ maxWidth: 1160, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            border: `1px solid ${C.border}`, borderRadius: 20,
            padding: '5px 14px', marginBottom: 18,
          }}>
            <div className="team-live-dot" />
            <span style={{
              fontSize: 10, fontWeight: 700, color: C.slate,
              letterSpacing: '1px', textTransform: 'uppercase' as const,
            }}>
              The Team
            </span>
          </div>

          <h2 style={{
            fontSize: 'clamp(26px, 4vw, 42px)',
            fontWeight: 900, color: C.text,
            lineHeight: 1.15, letterSpacing: '-1px',
            margin: '0 0 14px',
          }}>
            Built by people who{' '}
            <span style={{ color: C.teal }}>live this problem</span>
          </h2>

          <p style={{ fontSize: 14, color: C.slate, lineHeight: 1.7, margin: '0 auto', maxWidth: 400 }}>
            Every one of us has made a Lagos real estate decision without enough information.
            That's why this platform exists.
          </p>
        </div>

        {/* ── Cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
          marginBottom: 16,
        }}>
          {members.map((m) => (
            <div
              key={m.initials}
              className="team-card"
              style={{ animationDelay: m.animDelay }}
            >
              {/* Card header with orbit animation */}
              <div style={{
                position: 'relative', height: 100,
                background: C.offWhite,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                <div className="team-orbit-ring" />
                <div
                  className="team-orbit-dot"
                  style={{ animation: `${m.orbitReverse ? 'team-orbit-rev' : 'team-orbit'} ${m.orbitDuration} linear infinite` }}
                >
                  <div className="team-skill-dot" style={{ background: m.orbitColor }} />
                </div>
                <div className="team-avatar" style={{ background: m.avatarBg, color: m.avatarColor }}>
                  {m.initials}
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '18px 18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                  <div>
                    <p style={{ margin: '0 0 3px', fontSize: 15, fontWeight: 800, color: C.text }}>
                      {m.name}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: m.roleColor, fontWeight: 700 }}>
                      {m.role}
                    </p>
                  </div>
                  <span className="team-tag" style={{ background: m.tagBg, color: m.tagColor, flexShrink: 0 }}>
                    {m.tagLabel}
                  </span>
                </div>

                <p style={{ fontSize: 13, color: C.slate, lineHeight: 1.7, margin: '0 0 14px' }}>
                  {m.bio}
                </p>

                {/* Stats row */}
                <div style={{
                  display: 'flex', gap: 16, paddingTop: 12,
                  borderTop: `1px solid ${C.border}`,
                }}>
                  {m.stats.map((st) => (
                    <div key={st.label} className="team-stat">
                      <span style={{ fontSize: 15, fontWeight: 900, color: C.text }}>{st.val}</span>
                      <span style={{ fontSize: 10.5, color: C.slateLight }}>{st.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Hiring bar ── */}
        <div style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: '16px 22px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="team-live-dot" />
            <span style={{ fontSize: 13, color: C.slate }}>
              We're a small team building something big. If you care about Lagos, come build with us.
            </span>
          </div>
          <a
            href="/careers"
            style={{
              background: C.navy, color: C.white,
              borderRadius: 10, padding: '9px 18px',
              fontSize: 13, fontWeight: 700,
              textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            Join us →
          </a>
        </div>

      </div>
    </section>
  );
};
// ─── 9. TESTIMONIALS ─────────────────────────────────────────────────────────
const Stars = () => (
  <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
    {[...Array(5)].map((_, i) => (
      <span key={i} style={{ color: "#F59E0B", fontSize: 13 }}>
        ★
      </span>
    ))}
  </div>
);

const Testimonials = () => (
  <section style={s.section(C.offWhite)}>
    <div style={s.container()}>
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <span style={s.eyebrow()}>Real Stories</span>
        <h2 style={{ ...s.h2Light(), textAlign: "center" }}>
          Real stories from{" "}
          <span style={{ color: C.teal }}>real Lagos renters</span>
        </h2>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
        }}
      >
        {[
          {
            quote:
              "I spent 6 months looking for a flat in Lekki. Within 2 days on KhenX, I found a verified listing with full neighbourhood scores. I knew more about the area than the agent.",
            name: "Ifeoma Agbo",
            meta: "Renter, Lekki Phase 1",
          },
          {
            quote:
              "The flood risk score saved me. I almost signed for a place that was flooded twice last year. KhenX showed a \"High Risk\" rating and I walked away. Can't imagine what would've happened.",
            name: "Yusuf Balogun",
            meta: "Renter, Ajah",
          },
          {
            quote:
              "Finally a platform that treats Lagos renters like intelligent adults. The neighbourhood intel is genuinely useful — not just star ratings or vibes from strangers.",
            name: "Nkechi Obi",
            meta: "Renter, Yaba",
          },
        ].map((t) => (
          <div
            key={t.name}
            style={{
              background: C.white,
              borderRadius: 18,
              padding: "26px 24px",
              border: `1px solid ${C.border}`,
            }}
          >
            <Stars />
            <p
              style={{
                fontSize: 13.5,
                color: C.textMid,
                lineHeight: 1.75,
                marginBottom: 20,
                fontStyle: "italic",
              }}
            >
              "{t.quote}"
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: C.navy,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: C.teal,
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                {t.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                  {t.name}
                </div>
                <div style={{ fontSize: 11, color: C.slateLight }}>
                  {t.meta}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── 10. CTA BOTTOM ──────────────────────────────────────────────────────────
// ─── 10. CTA BOTTOM ──────────────────────────────────────────────────────────
const BottomCta = () => (
<section style={{ background: "#e8eaed", padding: "120px 0" }}>
    <div style={s.container()}>
      <div
        style={{
          background: `linear-gradient(135deg, #0A1628 0%, #0d2137 50%, #0a2a2a 100%)`,
          borderRadius: 24,
          padding: "48px 52px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 48,
          alignItems: "center",
        }}
      >
        {/* Left */}
        <div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(0,201,167,0.12)",
              border: "1px solid rgba(0,201,167,0.25)",
              borderRadius: 999,
              padding: "4px 12px",
              fontSize: 11,
              fontWeight: 700,
              color: C.teal,
              letterSpacing: "0.6px",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: 10 }}>✦</span> We're Hiring
          </span>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: C.white,
              lineHeight: 1.25,
              marginBottom: 14,
              letterSpacing: "-0.5px",
            }}
          >
            Help us build the future
            <br />
            of <span style={{ color: C.teal }}>Lagos real estate.</span>
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.75,
              maxWidth: 380,
              margin: 0,
            }}
          >
            We're a small team solving a massive problem with data, technology,
            and an obsession with user trust. If that sounds like your kind of
            challenge, we'd love to talk.
          </p>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
          <button
            style={{
              background: C.teal,
              color: C.navy,
              border: "none",
              borderRadius: 10,
              padding: "14px 28px",
              fontSize: 13.5,
              fontWeight: 800,
              cursor: "pointer",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            View Open Roles →
          </button>
          <button
            style={{
              background: "transparent",
              color: "rgba(255,255,255,0.75)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 10,
              padding: "13px 28px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Contact the Team
          </button>
          <p style={{ fontSize: 11.5, color: C.teal, textAlign: "center", margin: 0 }}>
            Currently <span style={{ fontWeight: 700 }}>4 open roles</span>
          </p>
        </div>
      </div>
    </div>
  </section>
);      

// ─── PAGE ────────────────────────────────────────────────────────────────────
const AboutPage = () => (
  <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
    {/* <Navbar /> */}
    <Hero />
    <MissionSection />
    <ProblemSection />
    {/* <BrokenSection /> */}
    <IntelligenceSection />
    <HowItWorks />
    <StatsBanner />
    <Values />
    <Team />
    <Testimonials />
    <BottomCta />
  </div>
);

export default AboutPage;
