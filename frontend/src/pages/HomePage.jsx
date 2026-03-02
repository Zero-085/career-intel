import React from "react";
import { useAnalysis } from "../hooks/useAnalysis.js";
import LoadingOverlay from "../components/LoadingOverlay.jsx";
import ScoreRing from "../components/ScoreRing.jsx";
import ResultTabs from "../components/ResultTabs.jsx";

export default function HomePage() {
  const { resume, setResume, jd, setJd, result, loading, error, analyze, reset } = useAnalysis();

  return (
    <div>
      {loading && <LoadingOverlay />}

      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header__inner">
            <div className="header__logo">⚡</div>
            <div>
              <div className="header__title">Career Match Analyzer</div>
              <div className="header__sub">AI-powered resume ↔ JD alignment engine</div>
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        {/* Input Section */}
        <section className="input-section">
          <div className="input-section__grid">
            <div className="input-group">
              <label htmlFor="resume-input">Your Resume</label>
              <textarea
                id="resume-input"
                placeholder="Paste your full resume text here..."
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="input-group">
              <label htmlFor="jd-input">Job Description</label>
              <textarea
                id="jd-input"
                placeholder="Paste the job description here..."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="error-banner">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <div className="btn-row">
            <button
              className="btn btn--primary"
              onClick={analyze}
              disabled={loading || !resume.trim() || !jd.trim()}
            >
              {loading ? "Analyzing..." : "Analyze Match →"}
            </button>
            {result && (
              <button className="btn btn--ghost" onClick={reset}>
                Start Over
              </button>
            )}
          </div>
        </section>

        {/* Results */}
        {result && (
          <section className="results fade-in">
            <div className="divider" />

            {/* Score Row */}
            <div className="score-row">
              <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ScoreRing score={result.match_score} label="Match Score" />
              </div>
              <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ScoreRing score={result.ats_optimization} label="ATS Optimization" />
              </div>
            </div>

            {/* Executive Summary */}
            {result.executive_summary && (
              <div className="card summary-card" style={{ marginBottom: 32 }}>
                <div className="card__title">Executive Summary</div>
                <p>{result.executive_summary}</p>
              </div>
            )}

            <div className="divider" />

            {/* Tabs */}
            <ResultTabs result={result} />
          </section>
        )}
      </main>
    </div>
  );
}
