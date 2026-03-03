import React from "react";

export default function ResumeUpgrades({ upgrades }) {
  if (!upgrades?.length) {
    return <p className="empty">No upgrade suggestions available.</p>;
  }

  return (
    <div>
      <p className="section-desc">
        Your existing bullets rewritten using the Google XYZ formula:{" "}
        <em>Accomplished X by doing Y, resulting in Z.</em>
      </p>
      <div className="upgrade-list">
        {upgrades.map((item, i) => (
          <div key={i} className="upgrade-card">
            <div className="upgrade-card__section upgrade-card__section--before">
              <div className="upgrade-card__caption upgrade-card__caption--before">
                Before
              </div>
              <p className="upgrade-card__text upgrade-card__text--before">
                {item.original_bullet}
              </p>
            </div>
            <div className="upgrade-card__section upgrade-card__section--after">
              <div className="upgrade-card__caption upgrade-card__caption--after">
                After
              </div>
              <p className="upgrade-card__text upgrade-card__text--after">
                {item.improved_bullet}
              </p>
            </div>
            <div className="upgrade-card__why">
              <span style={{ color: "var(--violet)", flexShrink: 0 }}>✦</span>
              {item.reasoning}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
