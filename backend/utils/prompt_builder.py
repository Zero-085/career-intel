"""
Prompt Builder — Dynamic JD-driven evaluation with strict scoring.
Skills are extracted FROM the job description itself, not hardcoded.
"""

def build_prompt(resume_text: str, jd_text: str) -> str:
    return f"""
You are a strict, senior technical hiring manager. You do NOT inflate scores.
You are accountable for every number you produce. Be honest and precise.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1 — EXTRACT REQUIREMENTS FROM THE JD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Read the job description carefully. Identify:
- required_skills: hard requirements (MUST-HAVE). Count them as required_total.
- preferred_skills: nice-to-have / bonus skills. Count them as preferred_total.
- role_title: the job title
- role_level: junior / mid / senior / lead / principal
- domain: e.g. "Backend Engineering", "Data Science", "DevOps"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2 — EVALUATE THE RESUME PRECISELY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For each required skill: does the resume clearly demonstrate it? (yes/no)
For each preferred skill: does the resume clearly demonstrate it? (yes/no)

Count:
  required_matched = number of required skills found in resume
  preferred_matched = number of preferred skills found in resume

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3 — CALCULATE SCORES (SHOW YOUR WORK)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MATCH SCORE FORMULA:
  required_pct = required_matched / required_total
  R = required_pct * 70           (max 70 points)
  P = (preferred_matched / preferred_total) * 20   (max 20, use 0 if no preferred)
  E = experience depth score 0-10  (seniority fit, years, domain relevance)

  raw_match = R + P + E

HARD CAPS on match_score — apply AFTER computing raw_match:
  IF required_pct < 0.20  -> match_score = MIN(raw_match, 30)
  IF required_pct < 0.30  -> match_score = MIN(raw_match, 40)
  IF required_pct < 0.50  -> match_score = MIN(raw_match, 52)
  IF required_pct < 0.70  -> match_score = MIN(raw_match, 65)
  IF required_pct < 0.85  -> match_score = MIN(raw_match, 78)
  IF required_pct >= 0.85 AND preferred_pct >= 0.66 -> match_score = MAX(raw_match, 88)
  IF required_pct == 1.0  AND preferred_pct == 1.0  -> match_score = MAX(raw_match, 93)

  Final match_score = apply caps, round to whole number, cap at 100.

ATS SCORE FORMULA:
  ATS measures: keyword density, quantified achievements, action verbs,
  formatting clarity, JD language alignment.

  ATS HARD RULES (strictly enforce):
  - IF required_matched <= 2  -> ats_optimization MUST be <= 35
  - IF required_matched <= 4  -> ats_optimization MUST be <= 60
  - IF required_matched == required_total AND preferred_matched >= ceil(preferred_total * 0.6)
    -> ats_optimization can range 85-95
  - Missing required keywords DIRECTLY hurt ATS score
  - NEVER give ats_optimization > 75 if more than 2 required skills are absent

HIRING RECOMMENDATION:
  match_score < 55  -> "Reject"
  55-69             -> "Upskill Required"
  70-84             -> "Interview"
  85+               -> "Strong Interview"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 4 — GENERATE INSIGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

radar_data: 6 axes most relevant to THIS role and domain.
  Score each axis 0-100 for candidate vs jd (jd always 100).

resume_upgrades: 3-5 actual bullets rewritten as:
  "Accomplished [X] by doing [Y], resulting in [Z with metric]"

learning_roadmap: 4-week plan targeting ACTUAL gaps found.
  If no gaps, provide an excellence roadmap.

top_strengths: 3 specific strengths for THIS resume vs THIS role.
critical_gaps: Skills completely absent. Empty array if none.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT — RETURN ONLY VALID JSON, NO MARKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{{
  "role_title": "string",
  "domain": "string",
  "role_level": "junior|mid|senior|lead|principal",
  "scoring_breakdown": {{
    "required_total": number,
    "required_matched": number,
    "preferred_total": number,
    "preferred_matched": number,
    "required_pct": number,
    "R": number,
    "P": number,
    "E": number,
    "raw_match": number
  }},
  "match_score": number,
  "ats_optimization": number,
  "hiring_recommendation": "Reject|Upskill Required|Interview|Strong Interview",
  "executive_summary": "2-3 sentences. Honest. Mention biggest strength and biggest gap.",
  "skill_analysis": {{
    "matched_skills": ["skill1", "skill2"],
    "missing_skills": [
      {{
        "skill": "Skill Name",
        "priority": "High|Medium|Low",
        "reason": "Why this skill matters for this specific role"
      }}
    ]
  }},
  "radar_data": [
    {{ "axis": "Axis Label", "candidate": number, "jd": 100 }},
    {{ "axis": "Axis Label", "candidate": number, "jd": 100 }},
    {{ "axis": "Axis Label", "candidate": number, "jd": 100 }},
    {{ "axis": "Axis Label", "candidate": number, "jd": 100 }},
    {{ "axis": "Axis Label", "candidate": number, "jd": 100 }},
    {{ "axis": "Axis Label", "candidate": number, "jd": 100 }}
  ],
  "resume_upgrades": [
    {{
      "original_bullet": "exact text or [suggested]",
      "improved_bullet": "Accomplished X by doing Y, resulting in Z",
      "reasoning": "what was improved"
    }}
  ],
  "learning_roadmap": {{
    "week1": {{ "theme": "string", "tasks": ["task1", "task2", "task3"] }},
    "week2": {{ "theme": "string", "tasks": ["task1", "task2", "task3"] }},
    "week3": {{ "theme": "string", "tasks": ["task1", "task2", "task3"] }},
    "week4": {{ "theme": "string", "tasks": ["task1", "task2", "task3"] }}
  }},
  "top_strengths": ["strength1", "strength2", "strength3"],
  "critical_gaps": ["gap1", "gap2"]
}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESUME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{resume_text}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JOB DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{jd_text}
"""