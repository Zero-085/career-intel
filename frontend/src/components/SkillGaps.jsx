import React from "react";

function priorityClass(priority) {
  switch (priority?.toLowerCase()) {
    case "high":   return "priority-badge--high";
    case "medium": return "priority-badge--medium";
    case "low":    return "priority-badge--low";
    default:       return "priority-badge--low";
  }
}

export default function SkillGaps({ missingSkills }) {
  if (!missingSkills || missingSkills.length === 0) {
    return <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No significant skill gaps found!</p>;
  }

  return (
    <div>
      <p className="section-title">Skills to develop to strengthen your application</p>
      <div className="skill-gap-list">
        {missingSkills.map((item, i) => (
          <div key={i} className="skill-gap-item">
            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <div className="skill-gap-item__name">{item.skill}</div>
                <div className="skill-gap-item__reason">{item.reason}</div>
              </div>
              <span className={`priority-badge ${priorityClass(item.priority)}`}>
                {item.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
