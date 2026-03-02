def build_prompt(resume: str, jd: str) -> str:
    return f"""You are an expert ATS resume analyst and career coach.

Analyze the resume against the job description below and return ONLY a valid JSON object.
Do NOT include any markdown, code fences, explanation, or text outside the JSON.

RESUME:
{resume}

JOB DESCRIPTION:
{jd}

Return this exact JSON structure (all fields required):

{{
  "match_score": <integer 0-100>,
  "ats_optimization": <integer 0-100>,
  "executive_summary": "<2-3 sentence summary of the candidate's fit>",
  "skill_analysis": {{
    "matched_skills": ["<skill>", ...],
    "missing_skills": [
      {{"skill": "<skill>", "priority": "High|Medium|Low", "reason": "<why this skill matters for the role>"}}
    ]
  }},
  "radar_data": [
    {{"axis": "Technical Skills", "candidate": <0-100>, "jd": <0-100>}},
    {{"axis": "Leadership", "candidate": <0-100>, "jd": <0-100>}},
    {{"axis": "Domain Knowledge", "candidate": <0-100>, "jd": <0-100>}},
    {{"axis": "Tools", "candidate": <0-100>, "jd": <0-100>}},
    {{"axis": "Communication", "candidate": <0-100>, "jd": <0-100>}},
    {{"axis": "Experience Level", "candidate": <0-100>, "jd": <0-100>}}
  ],
  "resume_upgrades": [
    {{
      "original_bullet": "<the original or weak bullet from the resume>",
      "improved_bullet": "<rewritten using Google XYZ: Accomplished X by doing Y resulting in Z>",
      "reasoning": "<why this improvement helps>"
    }}
  ],
  "learning_roadmap": {{
    "week1": {{"theme": "<theme>", "tasks": ["<task>", ...]}},
    "week2": {{"theme": "<theme>", "tasks": ["<task>", ...]}},
    "week3": {{"theme": "<theme>", "tasks": ["<task>", ...]}},
    "week4": {{"theme": "<theme>", "tasks": ["<task>", ...]}}
  }}
}}

Rules:
- match_score: overall alignment between resume and JD
- ats_optimization: how well-formatted and keyword-rich the resume is for ATS systems
- matched_skills: skills that appear in both resume and JD
- missing_skills: important JD skills absent from the resume (include 3-6)
- radar_data: score candidate and JD requirement for each of the 6 axes (jd value = what the role needs)
- resume_upgrades: pick 3 weak or vague bullets and rewrite them with impact metrics
- learning_roadmap: a practical 4-week plan to close the top skill gaps

Return ONLY the JSON. No other text."""
