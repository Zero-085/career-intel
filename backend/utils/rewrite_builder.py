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

    missing_names  = [m["skill"] if isinstance(m, dict) else m for m in missing]
    upgrade_pairs  = "\n".join(
        f'  ORIGINAL: {u.get("original_bullet","")}\n  IMPROVED: {u.get("improved_bullet","")}'
        for u in upgrades if isinstance(u, dict)
    ) if upgrades else "  None provided"

    return f"""
You are an expert technical resume writer. Your job is to rewrite the candidate's resume
so it is maximally competitive for the specific role described in the JD below.

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
REWRITING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. PRESERVE FACTS — Never invent experience, companies, degrees, or dates.
   Only reframe and strengthen what already exists.

2. KEYWORD TARGETING — Weave JD keywords naturally into bullets and summary.
   If the JD says "microservices architecture", use that exact phrase if the
   candidate has relevant experience, not just "services".

3. BULLET FORMULA — Every experience bullet must follow:
   "Accomplished [X] by doing [Y], resulting in [Z with metric]"
   If no metric exists in the original, add a realistic estimate with a qualifier
   like "~30% reduction" or "serving ~10,000 users". Never fabricate specifics.

4. SKILLS SECTION — Reorder so JD-matched skills appear first.
   For missing skills the candidate has partial exposure to, include them
   with a qualifier: "Docker (proficient)", "Kubernetes (learning)".
   Never add skills the candidate has zero mention of.

5. SUMMARY — Rewrite the summary to directly mirror the JD's language.
   Lead with years of experience + domain + 2-3 strongest matched skills.

6. ATS OPTIMIZATION — Use exact JD phrases in headers and bullets.
   Avoid tables, columns, graphics in the text version.

7. STRUCTURE — Maintain this order:
   Name & Contact | Summary | Skills | Experience | Projects | Education | Certifications

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY the rewritten resume as plain text.
Use this exact structure with these exact section headers:

SUMMARY
-------
[2-3 sentence summary]

TECHNICAL SKILLS
----------------
[comma-separated skills, JD-matched first]

EXPERIENCE
----------
[Job Title] | [Company] | [Dates]
- [bullet]
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
[Cert name] | [Year if known]

Do NOT include a name/contact block (user will add that).
Do NOT add any commentary, preamble, or explanation outside the resume.
Do NOT use markdown bold (**), headers (#), or any special formatting.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JOB DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{jd_text}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORIGINAL RESUME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{resume_text}
"""