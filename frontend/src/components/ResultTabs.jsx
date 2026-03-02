import React, { useState } from "react";
import MatchedSkills from "./MatchedSkills.jsx";
import SkillGaps from "./SkillGaps.jsx";
import SkillRadar from "./SkillRadar.jsx";
import ResumeUpgrades from "./ResumeUpgrades.jsx";
import LearningRoadmap from "./LearningRoadmap.jsx";

const TABS = [
  { id: "radar", label: "Skill Radar" },
  { id: "matched", label: "Matched Skills" },
  { id: "gaps", label: "Skill Gaps" },
  { id: "upgrades", label: "Resume Upgrades" },
  { id: "roadmap", label: "Learning Roadmap" },
];

export default function ResultTabs({ result }) {
  const [activeTab, setActiveTab] = useState("radar");

  return (
    <div className="tabs">
      <div className="tabs__nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tabs__btn ${activeTab === tab.id ? "tabs__btn--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="fade-in" key={activeTab}>
        {activeTab === "radar" && <SkillRadar data={result.radar_data} />}
        {activeTab === "matched" && (
          <MatchedSkills skills={result.skill_analysis?.matched_skills} />
        )}
        {activeTab === "gaps" && (
          <SkillGaps missingSkills={result.skill_analysis?.missing_skills} />
        )}
        {activeTab === "upgrades" && (
          <ResumeUpgrades upgrades={result.resume_upgrades} />
        )}
        {activeTab === "roadmap" && (
          <LearningRoadmap roadmap={result.learning_roadmap} />
        )}
      </div>
    </div>
  );
}
