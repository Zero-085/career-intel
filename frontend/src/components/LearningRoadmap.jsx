import React from "react";

const WEEKS = ["week1", "week2", "week3", "week4"];

export default function LearningRoadmap({ roadmap }) {
  if (!roadmap) {
    return (
      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
        No roadmap available.
      </p>
    );
  }

  return (
    <div>
      <p className="section-title">A targeted plan to close your skill gaps</p>
      <div className="roadmap-grid">
        {WEEKS.map((weekKey, i) => {
          const week = roadmap[weekKey];
          if (!week) return null;
          return (
            <div key={weekKey} className="roadmap-week">
              <div className="roadmap-week__header">
                <span className="roadmap-week__badge">Week {i + 1}</span>
                <span className="roadmap-week__theme">{week.theme}</span>
              </div>
              <ul className="roadmap-week__tasks">
                {(week.tasks || []).map((task, j) => (
                  <li key={j} className="roadmap-week__task">
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
