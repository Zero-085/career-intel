import React from "react";

const PRIORITY_CONFIG = {
  high: {
    label: "CRITICAL",
    color: "#ff6b6b",
    bg: "rgba(255, 107, 107, 0.07)",
    border: "rgba(255, 107, 107, 0.22)",
    barColor: "#ff6b6b",
    icon: "⬆",
    urgency: "Address immediately",
    barW: 100,
  },
  medium: {
    label: "IMPORTANT",
    color: "#e8b84b",
    bg: "rgba(232, 184, 75, 0.07)",
    border: "rgba(232, 184, 75, 0.2)",
    barColor: "#e8b84b",
    icon: "→",
    urgency: "Develop within 30 days",
    barW: 62,
  },
  low: {
    label: "MINOR",
    color: "#a78bfa",
    bg: "rgba(167, 139, 250, 0.07)",
    border: "rgba(167, 139, 250, 0.18)",
    barColor: "#a78bfa",
    icon: "↓",
    urgency: "Nice-to-have",
    barW: 35,
  },
};

function getKey(p) {
  const v = p?.toLowerCase();
  if (v === "high") return "high";
  if (v === "medium") return "medium";
  return "low";
}

export default function SkillGaps({ missingSkills }) {
  if (!missingSkills?.length) {
    return (
      <div style={{ textAlign: "center", padding: "56px 0" }}>
        <div style={{ fontSize: "2rem", marginBottom: 12 }}>✦</div>
        <div
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: "1rem",
            fontWeight: 600,
            color: "#b8b4ac",
            marginBottom: 6,
          }}
        >
          No skill gaps found
        </div>
        <div style={{ fontSize: "0.82rem", color: "#6e6a64" }}>
          Your resume aligns strongly with this role.
        </div>
      </div>
    );
  }

  const counts = { high: 0, medium: 0, low: 0 };
  missingSkills.forEach((s) => counts[getKey(s.priority)]++);

  return (
    <div>
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: "0.82rem", color: "#6e6a64", lineHeight: 1.6 }}>
          Skills identified in the JD that are missing or underrepresented in
          your resume.
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {counts.high > 0 && (
            <Chip
              n={counts.high}
              label="Critical"
              color="#ff6b6b"
              bg="rgba(255,107,107,0.08)"
              border="rgba(255,107,107,0.28)"
            />
          )}
          {counts.medium > 0 && (
            <Chip
              n={counts.medium}
              label="Important"
              color="#e8b84b"
              bg="rgba(232,184,75,0.08)"
              border="rgba(232,184,75,0.28)"
            />
          )}
          {counts.low > 0 && (
            <Chip
              n={counts.low}
              label="Minor"
              color="#a78bfa"
              bg="rgba(167,139,250,0.08)"
              border="rgba(167,139,250,0.28)"
            />
          )}
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {missingSkills.map((item, i) => {
          const key = getKey(item.priority);
          const cfg = PRIORITY_CONFIG[key];
          return <GapCard key={i} item={item} cfg={cfg} index={i} />;
        })}
      </div>
    </div>
  );
}

function Chip({ n, label, color, bg, border }) {
  return (
    <span
      style={{
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "0.63rem",
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 999,
        border: `1px solid ${border}`,
        background: bg,
        color,
        letterSpacing: "0.04em",
      }}
    >
      {n} {label}
    </span>
  );
}

function GapCard({ item, cfg, index }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        borderRadius: 12,
        border: `1px solid ${hovered ? cfg.color + "55" : cfg.border}`,
        background: hovered ? cfg.bg.replace("0.07", "0.11") : cfg.bg,
        overflow: "hidden",
        transition:
          "border-color 0.2s, background 0.2s, transform 0.15s, box-shadow 0.15s",
        transform: hovered ? "translateX(3px)" : "none",
        boxShadow: hovered ? `0 2px 16px ${cfg.color}18` : "none",
        animationDelay: `${index * 55}ms`,
      }}
    >
      {/* Left accent stripe */}
      <div
        style={{
          width: 3,
          background: `linear-gradient(to bottom, ${cfg.color}, ${cfg.color}66)`,
          flexShrink: 0,
        }}
      />

      <div style={{ flex: 1, padding: "14px 18px" }}>
        {/* Top row: skill name + priority pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.88rem",
              fontWeight: 500,
              color: "#f4f0e8",
            }}
          >
            {item.skill}
          </div>
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              padding: "3px 9px",
              borderRadius: 999,
              border: `1px solid ${cfg.border}`,
              color: cfg.color,
              display: "flex",
              alignItems: "center",
              gap: 5,
              flexShrink: 0,
            }}
          >
            <span>{cfg.icon}</span>
            {cfg.label}
          </div>
        </div>

        {/* Reason */}
        <div
          style={{
            fontSize: "0.79rem",
            color: "#6e6a64",
            lineHeight: 1.55,
            marginBottom: 12,
          }}
        >
          {item.reason}
        </div>

        {/* Impact bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.58rem",
              color: "#3a3830",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              width: 42,
              flexShrink: 0,
            }}
          >
            Impact
          </div>
          <div
            style={{
              flex: 1,
              height: 3,
              background: "rgba(255,255,255,0.05)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${cfg.barW}%`,
                background: cfg.barColor,
                borderRadius: 2,
                boxShadow: `0 0 6px ${cfg.barColor}55`,
              }}
            />
          </div>
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.6rem",
              color: cfg.color,
              opacity: 0.75,
              flexShrink: 0,
              minWidth: 130,
              textAlign: "right",
            }}
          >
            {cfg.urgency}
          </div>
        </div>
      </div>
    </div>
  );
}
