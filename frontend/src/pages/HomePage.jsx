import React, { useState, useEffect } from "react";
import { useAnalysis } from "../hooks/useAnalysis.js";
import SkillRadar from "../components/SkillRadar.jsx";
import MatchedSkills from "../components/MatchedSkills.jsx";
import SkillGaps from "../components/SkillGaps.jsx";
import ResumeUpgrades from "../components/ResumeUpgrades.jsx";
import LearningRoadmap from "../components/LearningRoadmap.jsx";

// ─── Score helpers ─────────────────────────────────────────────────
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
    const timer = setInterval(() => {
      setStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 900);
    return () => clearInterval(timer);
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
  const step = result ? 2 : 0;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setResume("");
    }
  };

  const clearFile = () => {
    setResumeFile(null);
  };

  return (
    <div className="app">
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
              <div className="nav__mark">CI</div>
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
                Paste your resume and any job description. Career Intel
                dynamically extracts requirements and gives you an honest,
                actionable fit score.
              </p>

              {/* Steps */}
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
                {/* Resume */}
                <div className={`input-card`}>
                  <div className="input-card__header">
                    <div className="input-card__label">
                      <span className="input-card__icon input-card__icon--resume">
                        📄
                      </span>
                      Your Resume
                    </div>
                  </div>
                  <textarea
                    placeholder="Paste your full resume text here…&#10;&#10;Include work experience, skills, education, and achievements."
                    value={resume}
                    onChange={(e) => {
                      setResume(e.target.value);
                      clearFile();
                    }}
                    disabled={loading || !!resumeFile}
                    style={
                      resumeFile ? { opacity: 0.4, pointerEvents: "none" } : {}
                    }
                  />
                  <div className="input-card__footer">
                    <label className="file-upload-btn">
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleFileChange}
                        disabled={loading}
                      />
                      ↑ Upload PDF / DOCX
                    </label>
                    {resumeFile && (
                      <>
                        <span className="file-name">✓ {resumeFile.name}</span>
                        <button
                          onClick={clearFile}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--text-2)",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            marginLeft: 4,
                          }}
                        >
                          ✕
                        </button>
                      </>
                    )}
                    {!resumeFile && (
                      <span className="char-count">{resume.length} chars</span>
                    )}
                  </div>
                </div>

                {/* JD */}
                <div className="input-card">
                  <div className="input-card__header">
                    <div className="input-card__label">
                      <span className="input-card__icon input-card__icon--jd">
                        💼
                      </span>
                      Job Description
                    </div>
                  </div>
                  <textarea
                    placeholder="Paste the full job description here…&#10;&#10;Include responsibilities, requirements, and preferred qualifications."
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    disabled={loading}
                  />
                  <div className="input-card__footer">
                    <span className="char-count">{jd.length} chars</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="error-msg">
                  <span>⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="action-row">
                <button
                  className="btn-analyze"
                  onClick={analyze}
                  disabled={
                    loading || (!resume.trim() && !resumeFile) || !jd.trim()
                  }
                >
                  Analyze My Fit
                  <span className="btn-analyze__arrow">→</span>
                </button>
              </div>
            </div>
          )}

          {/* ── RESULTS ────────────────────────────────────────────── */}
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

              <div className="action-row" style={{ justifyContent: "center" }}>
                <button className="btn-reset" onClick={reset}>
                  ← Analyze another role
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
