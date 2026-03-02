import React from "react";

export default function MatchedSkills({ skills }) {
  if (!skills || skills.length === 0) {
    return (
      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
        No matched skills found.
      </p>
    );
  }

  return (
    <div>
      <p className="section-title">
        Skills found in both your resume and the job description
      </p>
      <div className="skill-tags">
        {skills.map((skill, i) => (
          <span key={i} className="skill-tag skill-tag--matched">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
