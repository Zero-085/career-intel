import React from "react";
import { scoreColor } from "../utils/helpers.js";

const RADIUS = 52;
const STROKE = 7;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ScoreRing({ score, label }) {
  const clamped = Math.min(100, Math.max(0, score));
  const offset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE;
  const colorClass = scoreColor(clamped);

  // Map colorClass to a stroke color for the SVG
  const strokeMap = {
    "score--high": "#00f5c4",
    "score--mid": "#f5a623",
    "score--low": "#ff4d6d",
  };
  const strokeColor = strokeMap[colorClass];

  return (
    <div className="score-ring">
      <div style={{ position: "relative", width: 130, height: 130 }}>
        <svg
          className="score-ring__svg"
          width="130"
          height="130"
          viewBox="0 0 130 130"
        >
          {/* Track */}
          <circle
            cx="65"
            cy="65"
            r={RADIUS}
            fill="none"
            stroke="#1e2535"
            strokeWidth={STROKE}
          />
          {/* Progress */}
          <circle
            cx="65"
            cy="65"
            r={RADIUS}
            fill="none"
            stroke={strokeColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        {/* Center value */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span className={`score-ring__value ${colorClass}`}>{clamped}</span>
        </div>
      </div>
      <span className="score-ring__label">{label}</span>
    </div>
  );
}
