import React from "react";

export default function MatchedSkills({ skills }) {
  if (!skills?.length) {
    return <p className="empty">No matched skills found.</p>;
  }

  return (
    <div>
      <p className="section-desc">
        Skills clearly evidenced in your resume that align with the job
        description requirements.
      </p>
      <div className="skill-grid">
        {skills.map((skill, i) => (
          <span key={i} className="stag stag--matched">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
