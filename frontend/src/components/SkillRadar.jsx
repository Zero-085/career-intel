import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

export default function SkillRadar({ data }) {
  if (!data?.length) return <p className="empty">No radar data available.</p>;

  return (
    <div>
      <p className="section-desc">
        Visual comparison across the key competency axes extracted from this job
        description.
      </p>
      <div className="radar-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={data}
            margin={{ top: 16, right: 40, bottom: 16, left: 40 }}
          >
            <PolarGrid stroke="#22222c" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{
                fill: "#6e6a64",
                fontSize: 11,
                fontFamily: "JetBrains Mono",
              }}
            />
            <Radar
              name="You"
              dataKey="candidate"
              stroke="#4ecdc4"
              fill="#4ecdc4"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Radar
              name="Job Requirement"
              dataKey="jd"
              stroke="#e8b84b"
              fill="#e8b84b"
              fillOpacity={0.06}
              strokeWidth={2}
              strokeDasharray="5 3"
            />
            <Tooltip
              contentStyle={{
                background: "#111118",
                border: "1px solid #2e2e3a",
                borderRadius: "10px",
                color: "#f4f0e8",
                fontFamily: "JetBrains Mono",
                fontSize: "11px",
              }}
            />
            <Legend
              wrapperStyle={{
                fontFamily: "JetBrains Mono",
                fontSize: "11px",
                color: "#6e6a64",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
