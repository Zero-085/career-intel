import React from "react";

const WEEKS = ["week1", "week2", "week3", "week4"];

export default function LearningRoadmap({ roadmap }) {
  if (!roadmap) return <p className="empty">No roadmap available.</p>;

  return (
    <div>
      <p className="section-desc">
        A targeted 4-week plan to close your skill gaps and strengthen your
        application for this specific role.
      </p>
      <div className="roadmap-grid">
        {WEEKS.map((key, i) => {
          const week = roadmap[key];
          if (!week) return null;
          return (
            <div key={key} className="rw-card" data-week={i + 1}>
              <div className="rw-card__week">Week {i + 1}</div>
              <div className="rw-card__theme">{week.theme}</div>
              {(week.tasks || []).map((task, j) => (
                <div key={j} className="rw-task">
                  {task}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
