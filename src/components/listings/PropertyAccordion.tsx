import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface SectionDefinition {
  id: string;
  title: string;
  iconKey: string;
  count?: number;
  render: () => ReactNode;
}

interface PropertyAccordionProps {
  title: string;
  hint: string;
  sections: SectionDefinition[];
}

const SectionIcon = ({ d }: { d: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C9A7" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS: Record<string, string> = {
  profile: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5",
  characteristics: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  boundaries: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  title: "M9 12h6m-6 4h6M9 8h6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z",
  utilities: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  development: "M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6",
  accessibility: "M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v1M13 17h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z",
  estate: "M3 21h18M9 8h1m-1 4h1m4-4h1m-1 4h1M6 21V5a1 1 0 011-1h10a1 1 0 011 1v16",
  nearby: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z",
  building: "M3 21h18M7 21V7h10v14M9 10h2m2 0h2M9 14h2m2 0h2",
  interior: "M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2zM8 9h8M8 13h5",
  parking: "M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v1M13 17h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z",
  security: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
};

export const AccordionSection = ({
  id,
  title,
  iconKey,
  count,
  isOpen,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  iconKey: string;
  count?: number;
  isOpen: boolean;
  onToggle: (id: string) => void;
  children: ReactNode;
}) => (
  <div style={{ borderBottom: "1px solid #F1F5F9" }}>
    <button
      onClick={() => onToggle(id)}
      aria-expanded={isOpen}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "18px 4px",
        background: "none",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: isOpen ? "#00C9A7" : "#F0FDF9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "background 0.2s ease",
        }}
      >
        <span style={{ filter: isOpen ? "brightness(0) invert(1)" : "none" }}>
          <SectionIcon d={ICONS[iconKey] ?? ICONS.profile} />
        </span>
      </div>
      <span style={{ fontSize: 14.5, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.2px" }}>{title}</span>
      {count != null && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#64748B",
            background: "#F1F5F9",
            borderRadius: 20,
            padding: "2px 9px",
          }}
        >
          {count}
        </span>
      )}
      <span style={{ marginLeft: "auto", display: "flex", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)", color: "#94A3B8" }}>
        <ChevronDown size={18} />
      </span>
    </button>

    <div className={`khenx-acc-body${isOpen ? " khenx-acc-open" : ""}`}>
      <div className="khenx-acc-inner">
        <div className="khenx-acc-content" style={{ paddingBottom: 22 }}>
          {children}
        </div>
      </div>
    </div>
  </div>
);

export const RowGrid = ({ children }: { children: ReactNode }) => (
  <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>{children}</div>
);

export const DetailRow = ({ label, value, emphasize }: { label: string; value: ReactNode; emphasize?: boolean }) => (
  <div
    style={{
      background: emphasize ? "#F0FDF9" : "#F8FAFC",
      border: `1px solid ${emphasize ? "#CFF8EC" : "#F1F5F9"}`,
      borderRadius: 12,
      padding: "13px 14px",
    }}
  >
    <div style={{ fontSize: 10.5, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
      {label}
    </div>
    <div style={{ fontSize: 14.5, color: emphasize ? "#00806E" : "#0F172A", fontWeight: 700, letterSpacing: "-0.2px" }}>{value}</div>
  </div>
);

export const Pill = ({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "teal" | "blue" }) => {
  const tones = {
    neutral: { background: "#F8FAFC", color: "#0F172A", border: "#E2E8F0" },
    teal: { background: "#ECFEFF", color: "#0F766E", border: "#A7F3D0" },
    blue: { background: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  }[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        borderRadius: 999,
        border: `1px solid ${tones.border}`,
        padding: "7px 12px",
        fontSize: 12.5,
        fontWeight: 700,
        color: tones.color,
        background: tones.background,
      }}
    >
      {children}
    </span>
  );
};

const PropertyAccordion = ({ title, hint, sections }: PropertyAccordionProps) => {
  const [openId, setOpenId] = useState<string | null>(sections[0]?.id ?? null);
  const toggle = (id: string) => setOpenId((current) => (current === id ? null : id));

  if (sections.length === 0) return null;

  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: "24px 26px 6px", border: "1px solid #E2E8F0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0F172A", margin: 0 }}>{title}</h2>
        <span style={{ fontSize: 11, color: "#94A3B8", background: "#F8FAFC", border: "1px solid #F1F5F9", borderRadius: 6, padding: "3px 9px" }}>
          {hint}
        </span>
      </div>

      <div>
        {sections.map((section) => (
          <AccordionSection
            key={section.id}
            id={section.id}
            title={section.title}
            iconKey={section.iconKey}
            count={section.count}
            isOpen={openId === section.id}
            onToggle={toggle}
          >
            {section.render()}
          </AccordionSection>
        ))}
      </div>

      <style>{`
        .khenx-acc-body {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .khenx-acc-open {
          grid-template-rows: 1fr;
        }
        .khenx-acc-inner {
          overflow: hidden;
          min-height: 0;
        }
        .khenx-acc-content {
          opacity: 0;
          transform: translateY(-6px);
          transition: opacity 0.25s ease, transform 0.25s ease;
        }
        .khenx-acc-open .khenx-acc-content {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0.08s;
        }
      `}</style>
    </div>
  );
};

export default PropertyAccordion;
