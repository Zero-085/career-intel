import React, { useState, useEffect, useRef } from "react";
import { useAnalysis } from "../hooks/useAnalysis.js";
import SkillRadar from "../components/SkillRadar.jsx";
import MatchedSkills from "../components/MatchedSkills.jsx";
import SkillGaps from "../components/SkillGaps.jsx";
import ResumeUpgrades from "../components/ResumeUpgrades.jsx";
import LearningRoadmap from "../components/LearningRoadmap.jsx";
import AnimatedBackground from "./AnimatedBackground.jsx";
import logo from "../assets/logo.png";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

// ─── Helpers ───────────────────────────────────────────────────────
function scoreClass(s) {
  if (s >= 75) return "high";
  if (s >= 50) return "mid";
  return "low";
}
function recClass(rec) {
  if (!rec) return "upskill";
  const r = rec.toLowerCase();
  if (r.includes("strong")) return "strong";
  if (r.includes("interview")) return "interview";
  if (r.includes("upskill")) return "upskill";
  return "reject";
}

// ─── Loading Screen ────────────────────────────────────────────────
const LOADING_STEPS = [
  "Parsing resume content",
  "Extracting JD requirements",
  "Matching skills dynamically",
  "Scoring candidate fit",
  "Generating recommendations",
];

function LoadingScreen() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)),
      900,
    );
    return () => clearInterval(t);
  }, []);
  return (
    <div className="loading-screen">
      <div className="loading-ring">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="30" r="26" stroke="#22222c" strokeWidth="3" />
          <circle
            cx="30"
            cy="30"
            r="26"
            stroke="#e8b84b"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="60 100"
          />
        </svg>
      </div>
      <div className="loading-label">Analyzing your profile</div>
      <ul className="loading-steps-list">
        {LOADING_STEPS.map((s, i) => (
          <li
            key={i}
            className={`loading-step ${i === step ? "active" : i < step ? "done" : ""}`}
          >
            <span className="loading-step__dot" />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Rewrite Loading Screen ────────────────────────────────────────
const REWRITE_STEPS = [
  "Reading your current resume",
  "Identifying JD keywords",
  "Rewriting bullets with metrics",
  "Optimising for ATS",
  "Formatting your new DOCX",
];

function RewriteLoadingScreen() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setStep((s) => Math.min(s + 1, REWRITE_STEPS.length - 1)),
      1100,
    );
    return () => clearInterval(t);
  }, []);
  return (
    <div className="loading-screen">
      <div className="loading-ring">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="30" r="26" stroke="#22222c" strokeWidth="3" />
          <circle
            cx="30"
            cy="30"
            r="26"
            stroke="#4ecdc4"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="50 110"
          />
        </svg>
      </div>
      <div className="loading-label" style={{ color: "#4ecdc4" }}>
        Rewriting your resume
      </div>
      <ul className="loading-steps-list">
        {REWRITE_STEPS.map((s, i) => (
          <li
            key={i}
            className={`loading-step ${i === step ? "active" : i < step ? "done" : ""}`}
          >
            <span
              className="loading-step__dot"
              style={i === step ? { background: "#4ecdc4" } : {}}
            />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Score Card ────────────────────────────────────────────────────
function ScoreCard({ score, label, type }) {
  const cls = scoreClass(score);
  return (
    <div className={`score-card score-card--${type}`}>
      <div className={`score-card__num score-card__num--${cls}`}>{score}</div>
      <div className="score-card__label">{label}</div>
      <div className="score-card__bar">
        <div
          className={`score-card__fill score-card__fill--${cls}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// ─── Score Breakdown Panel ─────────────────────────────────────────
function ScoreBreakdownPanel({ breakdown, matchScore }) {
  if (!breakdown) return null;

  const reqMatched = breakdown.required_matched ?? 0;
  const reqTotal = breakdown.required_total ?? 0;
  const prefMatched = breakdown.preferred_matched ?? 0;
  const prefTotal = breakdown.preferred_total ?? 0;
  const E = breakdown.E ?? null;
  const R = breakdown.R ?? null;
  const P = breakdown.P ?? null;

  if (reqTotal === 0) return null; // no data to show

  const reqPct = reqTotal > 0 ? reqMatched / reqTotal : 0;
  const prefPct = prefTotal > 0 ? prefMatched / prefTotal : null;

  function BreakdownRow({ label, value, total, pts, ptsMax, barColor }) {
    const pct = total > 0 ? (value / total) * 100 : 0;
    return (
      <div className="sbd__row">
        <div className="sbd__row-label">{label}</div>
        <div className="sbd__row-right">
          <div className="sbd__bar-wrap">
            <div
              className="sbd__bar-fill"
              style={{ width: `${pct}%`, background: barColor }}
            />
          </div>
          <div className="sbd__fraction">
            <span className="sbd__matched" style={{ color: barColor }}>
              {value}
            </span>
            <span className="sbd__sep">/</span>
            <span className="sbd__total">{total}</span>
          </div>
          {pts !== null && (
            <div className="sbd__pts">
              {Math.round(pts)}
              <span className="sbd__pts-max">/{ptsMax}pts</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="sbd">
      <div className="sbd__header">
        <span className="sbd__icon">⚖</span>
        <span className="sbd__title">Score Breakdown</span>
        <span className="sbd__formula">R×70 + P×20 + E×10</span>
      </div>
      <div className="sbd__rows">
        <BreakdownRow
          label="Required Skills"
          value={reqMatched}
          total={reqTotal}
          pts={R}
          ptsMax={70}
          barColor={
            reqPct >= 1 ? "#4ecdc4" : reqPct >= 0.7 ? "#e8b84b" : "#f87171"
          }
        />
        {prefTotal > 0 && (
          <BreakdownRow
            label="Preferred Skills"
            value={prefMatched}
            total={prefTotal}
            pts={P}
            ptsMax={20}
            barColor="#a78bfa"
          />
        )}
        {E !== null && (
          <div className="sbd__row">
            <div className="sbd__row-label">Experience Depth</div>
            <div className="sbd__row-right">
              <div className="sbd__bar-wrap">
                <div
                  className="sbd__bar-fill"
                  style={{ width: `${E * 10}%`, background: "#60a5fa" }}
                />
              </div>
              <div className="sbd__fraction">
                <span className="sbd__matched" style={{ color: "#60a5fa" }}>
                  {E}
                </span>
                <span className="sbd__sep">/</span>
                <span className="sbd__total">10</span>
              </div>
              <div className="sbd__pts">
                {Math.round(E)}
                <span className="sbd__pts-max">/10pts</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="sbd__footer">
        Final score enforced by deterministic rules · Python is source of truth
      </div>
    </div>
  );
}

// ─── JD URL Input ──────────────────────────────────────────────────
function JDInput({ jd, setJd, jdUrl, setJdUrl, jdMode, setJdMode }) {
  const [fetching, setFetching] = useState(false);
  const [fetchMsg, setFetchMsg] = useState(null); // {type: "ok"|"warn"|"err", text}
  const [previewTitle, setPreview] = useState(null);

  async function handleFetch() {
    if (!jdUrl.trim()) return;
    setFetching(true);
    setFetchMsg(null);
    setPreview(null);
    try {
      const fd = new FormData();
      fd.append("jd_url", jdUrl.trim());
      const res = await fetch(`${API}/api/jd/fetch-url`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setJd(data.text);
        setPreview(data.title || "Job description loaded");
        setFetchMsg({
          type: "ok",
          text: `✓ Loaded from ${data.platform}${data.title ? " · " + data.title : ""}`,
        });
      } else {
        setFetchMsg({
          type: data.blocked ? "warn" : "err",
          text: data.error,
        });
      }
    } catch (e) {
      setFetchMsg({
        type: "err",
        text: "Network error — could not reach backend.",
      });
    } finally {
      setFetching(false);
    }
  }

  return (
    <div className="input-card">
      <div className="input-card__header">
        <div className="input-card__label">
          <span className="input-card__icon input-card__icon--jd">💼</span>
          Job Description
        </div>
        {/* Mode toggle */}
        <div style={S.modeToggle}>
          <button
            style={{
              ...S.modeBtn,
              ...(jdMode === "paste" ? S.modeBtnActive : {}),
            }}
            onClick={() => setJdMode("paste")}
          >
            Paste text
          </button>
          <button
            style={{
              ...S.modeBtn,
              ...(jdMode === "url" ? S.modeBtnActiveUrl : {}),
            }}
            onClick={() => setJdMode("url")}
          >
            🔗 URL
          </button>
        </div>
      </div>

      {jdMode === "paste" ? (
        <>
          <textarea
            className="input-card__textarea"
            placeholder="Paste the full job description here…"
            value={jd}
            onChange={(e) => setJd(e.target.value)}
          />
          <div className="input-card__footer">
            <span className="char-count">{jd.length} chars</span>
          </div>
        </>
      ) : (
        <div style={{ padding: "16px 0 4px" }}>
          <div style={S.urlRow}>
            <input
              style={S.urlInput}
              placeholder="https://boards.greenhouse.io/company/jobs/…"
              value={jdUrl}
              onChange={(e) => {
                setJdUrl(e.target.value);
                setFetchMsg(null);
                setPreview(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleFetch()}
            />
            <button
              style={{ ...S.urlBtn, opacity: fetching ? 0.5 : 1 }}
              onClick={handleFetch}
              disabled={fetching || !jdUrl.trim()}
            >
              {fetching ? "…" : "Import"}
            </button>
          </div>

          {/* Status message */}
          {fetchMsg && (
            <div
              style={{
                ...S.fetchMsg,
                background:
                  fetchMsg.type === "ok"
                    ? "rgba(78,205,196,0.08)"
                    : fetchMsg.type === "warn"
                      ? "rgba(232,184,75,0.08)"
                      : "rgba(255,107,107,0.08)",
                borderColor:
                  fetchMsg.type === "ok"
                    ? "rgba(78,205,196,0.3)"
                    : fetchMsg.type === "warn"
                      ? "rgba(232,184,75,0.3)"
                      : "rgba(255,107,107,0.3)",
                color:
                  fetchMsg.type === "ok"
                    ? "#4ecdc4"
                    : fetchMsg.type === "warn"
                      ? "#e8b84b"
                      : "#ff6b6b",
              }}
            >
              {fetchMsg.text}
            </div>
          )}

          {/* Supported platforms note */}
          {!fetchMsg && (
            <div style={S.platformNote}>
              ✓ Greenhouse · Lever · Ashby · Workday · most ATS boards
              <br />✗ LinkedIn &amp; Indeed require manual paste
            </div>
          )}

          {/* Preview of loaded text */}
          {jd && fetchMsg?.type === "ok" && (
            <div style={S.previewBox}>
              <div style={S.previewLabel}>Loaded JD preview</div>
              <div style={S.previewText}>
                {jd.slice(0, 300)}
                {jd.length > 300 ? "…" : ""}
              </div>
              <button
                style={S.clearBtn}
                onClick={() => {
                  setJd("");
                  setJdUrl("");
                  setFetchMsg(null);
                }}
              >
                ✕ Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Rewrite Button + Download ─────────────────────────────────────
function RewriteSection({ result }) {
  const [rewriting, setRewriting] = useState(false);
  const [rewriteError, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [name, setName] = useState("");

  async function handleRewrite() {
    setRewriting(true);
    setError(null);
    setDone(false);
    try {
      const res = await fetch(`${API}/api/rewrite-resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: result._resume_text || "",
          jd_text: result._jd_text || "",
          analysis: result,
          candidate_name: name.trim() || "Candidate",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }

      // Download the DOCX
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const safeName = (name.trim() || "Candidate").replace(/\s+/g, "_");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeName}_Rewritten_Resume.docx`;
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setRewriting(false);
    }
  }

  if (rewriting) return <RewriteLoadingScreen />;

  return (
    <div style={S.rewriteSection}>
      <div style={S.rewriteHeader}>
        <div style={S.rewriteIcon}>✦</div>
        <div>
          <div style={S.rewriteTitle}>Rewrite My Resume</div>
          <div style={S.rewriteSub}>
            Get a fully rewritten, JD-targeted resume as a downloadable DOCX —
            keywords optimised, bullets strengthened, ATS-ready.
          </div>
        </div>
      </div>

      <div style={S.rewriteInputRow}>
        <input
          style={S.nameInput}
          placeholder="Your name (for the file)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRewrite()}
        />
        <button
          style={{ ...S.rewriteBtn, opacity: rewriting ? 0.5 : 1 }}
          onClick={handleRewrite}
          disabled={rewriting}
        >
          {done ? "↓ Download again" : "Generate & Download  ↓"}
        </button>
      </div>

      {rewriteError && (
        <div
          style={{
            ...S.fetchMsg,
            background: "rgba(255,107,107,0.08)",
            borderColor: "rgba(255,107,107,0.3)",
            color: "#ff6b6b",
            marginTop: 10,
          }}
        >
          {rewriteError}
        </div>
      )}

      {done && !rewriteError && (
        <div
          style={{
            ...S.fetchMsg,
            background: "rgba(78,205,196,0.08)",
            borderColor: "rgba(78,205,196,0.3)",
            color: "#4ecdc4",
            marginTop: 10,
          }}
        >
          ✓ Your rewritten resume was downloaded. Check your downloads folder.
        </div>
      )}
    </div>
  );
}

// ─── Tabs ──────────────────────────────────────────────────────────
const TABS = [
  { id: "radar", label: "Skill Radar" },
  { id: "matched", label: "Matched Skills" },
  { id: "gaps", label: "Skill Gaps" },
  { id: "upgrades", label: "Resume Upgrades" },
  { id: "roadmap", label: "Learning Path" },
];

// ─── Main Page ─────────────────────────────────────────────────────
export default function HomePage() {
  const {
    resume,
    setResume,
    jd,
    setJd,
    resumeFile,
    setResumeFile,
    result,
    loading,
    error,
    analyze,
    reset,
  } = useAnalysis();

  const [activeTab, setActiveTab] = useState("radar");
  const [jdMode, setJdMode] = useState("paste");
  const [jdUrl, setJdUrl] = useState("");

  const step = result ? 2 : 0;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setResume("");
    }
  };
  const clearFile = () => setResumeFile(null);

  // Pass jdUrl into analyze if URL mode
  function handleAnalyze() {
    if (jdMode === "url" && jdUrl.trim() && !jd.trim()) {
      // jd wasn't fetched yet — show message
      return;
    }
    analyze();
  }

  const canAnalyze = loading
    ? false
    : !resume.trim() && !resumeFile
      ? false
      : jdMode === "url"
        ? !!jd.trim() // URL mode: need fetched jd
        : !!jd.trim(); // paste mode: need jd text

  return (
    <div className="app">
      <AnimatedBackground />
      {loading && <LoadingScreen />}

      {/* Nav */}
      <nav className="nav">
        <div className="container">
          <div className="nav__inner">
            <div
              className="nav__brand"
              onClick={result ? reset : undefined}
              style={result ? { cursor: "pointer" } : {}}
            >
              <img src={logo} alt="Career Intel Logo" className="nav__logo" />
              <div className="nav__name">
                Career <span>Intel</span>
              </div>
            </div>
            <div className="nav__badge">AI-POWERED · v2.0</div>
          </div>
        </div>
      </nav>

      <main style={{ flex: 1 }}>
        <div className="container--narrow">
          {/* Hero */}
          {!result && (
            <div className="hero fade-in">
              <div className="hero__eyebrow">Dynamic JD Analysis</div>
              <h1 className="hero__title">
                Know exactly how you <em>match</em> any role
              </h1>
              <p className="hero__sub">
                Paste your resume and any job description — or drop a URL.
                Career Intel extracts requirements and gives you an honest,
                actionable fit score.
              </p>
              <div className="steps">
                {["Add Resume", "Add JD", "View Results"].map((label, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <div className="step-connector" />}
                    <div
                      className={`step ${step === i ? "step--active" : step > i ? "step--done" : ""}`}
                    >
                      <div className="step__num">{step > i ? "✓" : i + 1}</div>
                      <div className="step__label">{label}</div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Input Section */}
          {!result && (
            <div className="fade-in">
              <div className="input-panel">
                {/* Resume card */}
                <div className="input-card">
                  <div className="input-card__header">
                    <div className="input-card__label">
                      <span className="input-card__icon input-card__icon--resume">
                        📄
                      </span>
                      Your Resume
                    </div>
                  </div>
                  <textarea
                    className="input-card__textarea"
                    placeholder={
                      "Paste your full resume text here…\n\nInclude work experience, skills, education, and achievements."
                    }
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                    disabled={loading || !!resumeFile}
                    style={
                      resumeFile ? { opacity: 0.4, pointerEvents: "none" } : {}
                    }
                  />
                  <div className="input-card__footer">
                    {resumeFile && (
                      <div className="file-pill">
                        <span className="file-name">✓ {resumeFile.name}</span>
                        <button className="file-clear" onClick={clearFile}>
                          ✕
                        </button>
                      </div>
                    )}
                    {!resumeFile && (
                      <span className="char-count">{resume.length} chars</span>
                    )}
                    <label className="file-upload-label">
                      Upload PDF/DOCX
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                </div>

                {/* JD card — with URL mode */}
                <JDInput
                  jd={jd}
                  setJd={setJd}
                  jdUrl={jdUrl}
                  setJdUrl={setJdUrl}
                  jdMode={jdMode}
                  setJdMode={setJdMode}
                />
              </div>

              {error && (
                <div
                  className={`error-banner${error.includes("job description in the Resume") ? " error-banner--swap" : ""}`}
                >
                  {error.includes("job description in the Resume") ? (
                    <>⚠️ {error}</>
                  ) : (
                    <>
                      <strong>Error:</strong> {error}
                    </>
                  )}
                </div>
              )}

              <div className="analyze-section">
                <button
                  className="btn-analyze"
                  onClick={handleAnalyze}
                  disabled={!canAnalyze}
                >
                  Analyze My Fit
                  <span className="btn-analyze__arrow">→</span>
                </button>

                {jdMode === "url" && jdUrl && !jd && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: "0.78rem",
                      color: "#6e6a64",
                    }}
                  >
                    Click "Import" above to load the JD first
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="results slide-up">
              {/* Header */}
              <div className="results-header">
                <div className="results-header__meta">
                  {result.role_title && (
                    <span className="role-badge role-badge--domain">
                      {result.role_title}
                    </span>
                  )}
                  {result.domain && result.domain !== result.role_title && (
                    <span className="role-badge role-badge--domain">
                      {result.domain}
                    </span>
                  )}
                  {result.role_level && (
                    <span className="role-badge role-badge--level">
                      {result.role_level}
                    </span>
                  )}
                  {result.jd_platform && (
                    <span
                      className="role-badge"
                      style={{
                        background: "rgba(78,205,196,0.12)",
                        color: "#4ecdc4",
                        border: "1px solid rgba(78,205,196,0.25)",
                      }}
                    >
                      via {result.jd_platform}
                    </span>
                  )}
                </div>
                <h2 className="results-header__title">Your Analysis Report</h2>
              </div>

              {/* Scores */}
              <div className="score-dashboard">
                <ScoreCard
                  score={result.match_score}
                  label="Match Score"
                  type="match"
                />
                <ScoreCard
                  score={result.ats_optimization}
                  label="ATS Score"
                  type="ats"
                />
                <div
                  className="score-card score-card--rec"
                  style={{ justifyContent: "center" }}
                >
                  <div
                    className="score-card__label"
                    style={{ marginBottom: 8 }}
                  >
                    Recommendation
                  </div>
                  <div
                    className={`rec-badge rec-badge--${recClass(result.hiring_recommendation)}`}
                  >
                    {result.hiring_recommendation}
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <ScoreBreakdownPanel
                breakdown={result.scoring_breakdown}
                matchScore={result.match_score}
              />

              {/* Summary */}
              {(result.executive_summary ||
                result.top_strengths ||
                result.critical_gaps) && (
                <div className="summary-block">
                  <div className="summary-block__head">
                    <span
                      className="summary-block__icon"
                      style={{ background: "var(--gold-glow)" }}
                    >
                      📋
                    </span>
                    <span className="summary-block__h">Executive Summary</span>
                  </div>
                  {result.executive_summary && (
                    <p className="summary-block__text">
                      {result.executive_summary}
                    </p>
                  )}
                  {(result.top_strengths?.length ||
                    result.critical_gaps?.length) && (
                    <div className="strengths-gaps">
                      {result.top_strengths?.length > 0 && (
                        <div className="sg-list">
                          <div className="sg-list__title sg-list__title--strengths">
                            ✦ Top Strengths
                          </div>
                          {result.top_strengths.map((s, i) => (
                            <div key={i} className="sg-item">
                              <span className="sg-dot sg-dot--strength" />
                              {s}
                            </div>
                          ))}
                        </div>
                      )}
                      {result.critical_gaps?.length > 0 && (
                        <div className="sg-list">
                          <div className="sg-list__title sg-list__title--gaps">
                            ✦ Critical Gaps
                          </div>
                          {result.critical_gaps.map((g, i) => (
                            <div key={i} className="sg-item">
                              <span className="sg-dot sg-dot--gap" />
                              {g}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="divider" />

              {/* Tabs */}
              <div className="tab-bar">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    className={`tab-btn ${activeTab === t.id ? "tab-btn--active" : ""}`}
                    onClick={() => setActiveTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="fade-in" key={activeTab}>
                {activeTab === "radar" && (
                  <SkillRadar data={result.radar_data} />
                )}
                {activeTab === "matched" && (
                  <MatchedSkills
                    skills={result.skill_analysis?.matched_skills}
                  />
                )}
                {activeTab === "gaps" && (
                  <SkillGaps
                    missingSkills={result.skill_analysis?.missing_skills}
                  />
                )}
                {activeTab === "upgrades" && (
                  <ResumeUpgrades upgrades={result.resume_upgrades} />
                )}
                {activeTab === "roadmap" && (
                  <LearningRoadmap roadmap={result.learning_roadmap} />
                )}
              </div>

              <div className="divider" />

              {/* ── Rewrite Resume ─────────────────────────────── */}
              <RewriteSection result={result} />

              <div className="divider" />

              <div className="action-row" style={{ justifyContent: "center" }}>
                <button className="btn-reset" onClick={reset}>
                  ← Analyze another role
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="footer">
        <p>
          Built with passion by{" "}
          <a
            href="https://www.linkedin.com/in/himanshumishra29/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Himanshu Mishra
          </a>{" "}
          · Career Intel © 2026
        </p>
      </footer>
    </div>
  );
}

// ─── Inline styles for new components ─────────────────────────────
const S = {
  modeToggle: {
    display: "flex",
    gap: 4,
    background: "rgba(255,255,255,0.03)",
    borderRadius: 8,
    padding: 3,
    border: "1px solid rgba(255,255,255,0.06)",
  },
  modeBtn: {
    fontFamily: "Space Grotesk, sans-serif",
    fontSize: "0.72rem",
    fontWeight: 500,
    padding: "4px 12px",
    borderRadius: 6,
    border: "none",
    background: "transparent",
    color: "#6e6a64",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  modeBtnActive: {
    background: "rgba(232,184,75,0.15)",
    color: "#e8b84b",
  },
  modeBtnActiveUrl: {
    background: "rgba(78,205,196,0.15)",
    color: "#4ecdc4",
  },

  urlRow: {
    display: "flex",
    gap: 10,
    marginBottom: 10,
  },
  urlInput: {
    flex: 1,
    fontFamily: "JetBrains Mono, monospace",
    fontSize: "0.78rem",
    padding: "10px 14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 9,
    color: "#c8c4bc",
    outline: "none",
  },
  urlBtn: {
    fontFamily: "Space Grotesk, sans-serif",
    fontSize: "0.8rem",
    fontWeight: 600,
    padding: "10px 20px",
    background: "rgba(78,205,196,0.12)",
    border: "1px solid rgba(78,205,196,0.3)",
    borderRadius: 9,
    color: "#4ecdc4",
    cursor: "pointer",
    transition: "all 0.15s",
    flexShrink: 0,
  },
  fetchMsg: {
    fontFamily: "Space Grotesk, sans-serif",
    fontSize: "0.78rem",
    padding: "9px 14px",
    borderRadius: 8,
    border: "1px solid",
    lineHeight: 1.5,
    marginBottom: 8,
  },
  platformNote: {
    fontFamily: "JetBrains Mono, monospace",
    fontSize: "0.66rem",
    color: "#3a3830",
    lineHeight: 1.7,
    marginBottom: 8,
  },
  previewBox: {
    background: "rgba(78,205,196,0.05)",
    border: "1px solid rgba(78,205,196,0.12)",
    borderRadius: 8,
    padding: "10px 14px",
    marginTop: 8,
  },
  previewLabel: {
    fontFamily: "JetBrains Mono, monospace",
    fontSize: "0.62rem",
    color: "#4ecdc4",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  previewText: {
    fontFamily: "Space Grotesk, sans-serif",
    fontSize: "0.75rem",
    color: "#6e6a64",
    lineHeight: 1.55,
    whiteSpace: "pre-wrap",
  },
  clearBtn: {
    marginTop: 8,
    fontFamily: "Space Grotesk, sans-serif",
    fontSize: "0.7rem",
    padding: "3px 10px",
    background: "transparent",
    border: "1px solid rgba(255,107,107,0.3)",
    borderRadius: 6,
    color: "#ff6b6b",
    cursor: "pointer",
  },

  // Rewrite section
  rewriteSection: {
    background:
      "linear-gradient(135deg, rgba(78,205,196,0.05) 0%, rgba(167,139,250,0.05) 100%)",
    border: "1px solid rgba(78,205,196,0.15)",
    borderRadius: 16,
    padding: "28px 32px",
    margin: "24px 0",
  },
  rewriteHeader: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
    marginBottom: 20,
  },
  rewriteIcon: {
    width: 40,
    height: 40,
    background: "rgba(78,205,196,0.12)",
    border: "1px solid rgba(78,205,196,0.25)",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#4ecdc4",
    fontSize: "1.1rem",
    flexShrink: 0,
  },
  rewriteTitle: {
    fontFamily: "Space Grotesk, sans-serif",
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "#f4f0e8",
    marginBottom: 4,
  },
  rewriteSub: {
    fontSize: "0.82rem",
    color: "#6e6a64",
    lineHeight: 1.6,
  },
  rewriteInputRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  nameInput: {
    fontFamily: "Space Grotesk, sans-serif",
    fontSize: "0.85rem",
    padding: "11px 16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 10,
    color: "#c8c4bc",
    outline: "none",
    flex: "1",
    minWidth: 160,
  },
  rewriteBtn: {
    fontFamily: "Space Grotesk, sans-serif",
    fontSize: "0.88rem",
    fontWeight: 600,
    padding: "11px 24px",
    background: "rgba(78,205,196,0.12)",
    border: "1px solid rgba(78,205,196,0.35)",
    borderRadius: 10,
    color: "#4ecdc4",
    cursor: "pointer",
    transition: "all 0.15s",
    letterSpacing: "0.01em",
    flexShrink: 0,
  },
};
