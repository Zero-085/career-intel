import React from "react";

export default function ResumeUpgrades({ upgrades }) {
  if (!upgrades || upgrades.length === 0) {
    return (
      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
        No upgrade suggestions available.
      </p>
    );
  }

  return (
    <div>
      <p className="section-title">
        Rewritten using the Google XYZ formula: Accomplished X by doing Y
        resulting in Z
      </p>
      <div className="upgrade-list">
        {upgrades.map((item, i) => (
          <div key={i} className="upgrade-card">
            <div className="upgrade-card__label upgrade-card__label--before">
              Before
            </div>
            <p className="upgrade-card__text upgrade-card__text--before">
              {item.original_bullet}
            </p>

            <div className="upgrade-divider">↓</div>

            <div className="upgrade-card__label upgrade-card__label--after">
              After
            </div>
            <p className="upgrade-card__text upgrade-card__text--after">
              {item.improved_bullet}
            </p>

            <div className="upgrade-card__reasoning">{item.reasoning}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
