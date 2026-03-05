"""
rewrite_builder.py — Builds the prompt for resume rewriting.
Takes the original resume text + analysis result and produces
a fully rewritten, JD-targeted resume as plain text.
"""


def build_rewrite_prompt(resume_text: str, jd_text: str, analysis: dict) -> str:
    role_title  = analysis.get("role_title", "the target role")
    matched     = analysis.get("skill_analysis", {}).get("matched_skills", [])
    missing     = analysis.get("skill_analysis", {}).get("missing_skills", [])
    upgrades    = analysis.get("resume_upgrades", [])
    strengths   = analysis.get("top_strengths", [])
    gaps        = analysis.get("critical_gaps", [])
    match_score = analysis.get("match_score", 0)

    missing_names = [m["skill"] if isinstance(m, dict) else m for m in missing]
    upgrade_pairs = "\n".join(
        f'  ORIGINAL: {u.get("original_bullet","")}\n  IMPROVED: {u.get("improved_bullet","")}'
        for u in upgrades if isinstance(u, dict)
    ) if upgrades else "  None provided"

    return f"""You are a senior technical resume writer. Rewrite the candidate's resume to be
maximally competitive for the target role below. Every decision must be grounded
in what the candidate has actually done — no invention, no fabrication.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTEXT FROM PRIOR ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Target Role:    {role_title}
Current Score:  {match_score}/100
Matched Skills: {", ".join(matched) if matched else "None"}
Skill Gaps:     {", ".join(missing_names) if missing_names else "None"}
Top Strengths:  {", ".join(strengths) if strengths else "None"}
Critical Gaps:  {", ".join(gaps) if gaps else "None"}

Suggested bullet improvements from analysis:
{upgrade_pairs}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABSOLUTE CONSTRAINTS — NEVER VIOLATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FACT PRESERVATION
  - Do NOT invent companies, job titles, degrees, dates, or technologies.
  - Do NOT add skills the resume shows zero evidence of.
  - Do NOT invent or estimate metrics (no "~30% improvement", no "10,000 users"
    unless the original resume already states a number).
  - If a bullet has no metric, strengthen the action and outcome using only
    words — do not insert placeholder numbers.

SKILLS SECTION INTEGRITY
  - Only include skills explicitly present or clearly demonstrated in the original resume.
  - Do NOT add gap skills as "learning" or "proficient" qualifiers unless the
    original resume mentions them. Silence is more honest than fabrication.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REWRITING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. KEYWORD ALIGNMENT
   Weave JD keywords naturally into bullets and the summary wherever the
   candidate has genuine evidence for them. Use the JD's exact phrasing
   (e.g. "microservices architecture", "CI/CD pipelines") when the candidate
   demonstrably has that experience. Do not force keywords where no evidence exists.

2. BULLET STRENGTHENING
   Rewrite bullets to lead with a strong action verb and make the outcome explicit.
   Preferred pattern: "Verb + what you built/did + how/with what + concrete outcome."
   Only include a metric if one already exists in the original resume — never estimate.

3. SKILLS SECTION
   List only verified skills from the original resume.
   Reorder so JD-matched skills appear first, grouped logically
   (e.g. Languages | Frameworks | Cloud | Tools).

4. SUMMARY
   2-3 sentences. Lead with the candidate's domain and strongest matched skills.
   Mirror the JD's language and seniority level. Do not claim experience the
   resume does not support.

5. ATS OPTIMISATION
   Use exact JD phrases in the summary and bullets where evidence exists.
   Plain text only — no tables, columns, or graphics.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT RULES — STRICTLY ENFORCED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY the rewritten resume text. Nothing else.
- No preamble ("Here is your rewritten resume...")
- No commentary or explanations after the resume
- No markdown: no **, no ##, no ```, no bullet symbols other than "-"
- No extra blank lines between section header and its underline
- The very first character of your response must be "SUMMARY"

Use EXACTLY these section headers in EXACTLY this order.
Omit a section only if the original resume has no content for it whatsoever.

SUMMARY
-------
[2–3 sentence targeted summary]

TECHNICAL SKILLS
----------------
[Comma-separated, JD-matched skills first]

EXPERIENCE
----------
[Job Title] | [Company] | [Dates]
- [bullet]
- [bullet]

PROJECTS
--------
[Project Name] — [tech stack]
- [bullet]

EDUCATION
---------
[Degree] | [Institution] | [Year]

CERTIFICATIONS
--------------
[Certification name] | [Year if known]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<<<JD_START>>>
{jd_text}
<<<JD_END>>>

<<<RESUME_START>>>
{resume_text}
<<<RESUME_END>>>
"""