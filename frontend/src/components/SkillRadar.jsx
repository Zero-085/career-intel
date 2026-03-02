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
  if (!data || data.length === 0) return null;

  return (
    <div>
      <div className="radar-container">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid stroke="#1e2535" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: "#8892a4", fontSize: 12, fontFamily: "DM Mono" }}
            />
            <Radar
              name="You"
              dataKey="candidate"
              stroke="#00f5c4"
              fill="#00f5c4"
              fillOpacity={0.18}
              strokeWidth={2}
            />
            <Radar
              name="Job Requirement"
              dataKey="jd"
              stroke="#7c6af7"
              fill="#7c6af7"
              fillOpacity={0.1}
              strokeWidth={2}
              strokeDasharray="4 2"
            />
            <Tooltip
              contentStyle={{
                background: "#141925",
                border: "1px solid #1e2535",
                borderRadius: "8px",
                color: "#eef2ff",
                fontFamily: "DM Mono",
                fontSize: "12px",
              }}
            />
            <Legend
              wrapperStyle={{ fontFamily: "DM Mono", fontSize: "12px", color: "#8892a4" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
