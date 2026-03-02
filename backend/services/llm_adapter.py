"""
LLM Adapter — pluggable provider abstraction.
To switch providers, change LLM_PROVIDER in your .env file.
Currently supported: anthropic, openai
"""

import os
from dotenv import load_dotenv

load_dotenv()

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "anthropic").lower()


def generate_analysis(prompt: str) -> str:
    return """
    {
      "match_score": 78,
      "ats_optimization": 70,
      "executive_summary": "Strong technical foundation with moderate alignment to the job requirements. Targeted improvements in deployment and cloud tooling would significantly increase competitiveness.",
      "skill_analysis": {
        "matched_skills": ["Python", "React", "FastAPI"],
        "missing_skills": [
          {"skill": "Docker", "priority": "High", "reason": "Required for containerized deployment."},
          {"skill": "AWS", "priority": "Medium", "reason": "Preferred cloud experience in JD."}
        ]
      },
      "radar_data": [
        {"axis": "Technical Skills", "candidate": 80, "jd": 100},
        {"axis": "Leadership", "candidate": 65, "jd": 100},
        {"axis": "Domain Knowledge", "candidate": 70, "jd": 100},
        {"axis": "Tools", "candidate": 60, "jd": 100},
        {"axis": "Communication", "candidate": 85, "jd": 100},
        {"axis": "Experience Level", "candidate": 75, "jd": 100}
      ],
      "resume_upgrades": [
        {
          "original_bullet": "Built backend APIs.",
          "improved_bullet": "Designed and deployed 10+ REST APIs reducing response time by 30% for 3,000+ monthly users.",
          "reasoning": "Adds measurable impact and scale using the XYZ formula."
        }
      ],
      "learning_roadmap": {
        "week1": {"theme": "Docker Basics", "tasks": ["Learn containers", "Dockerize sample app"]},
        "week2": {"theme": "AWS Intro", "tasks": ["Study EC2 & S3", "Deploy sample project"]},
        "week3": {"theme": "CI/CD", "tasks": ["Learn GitHub Actions", "Automate build pipeline"]},
        "week4": {"theme": "Portfolio Update", "tasks": ["Improve resume", "Push updated project"]}
      }
    }
    """

# ─── Anthropic ────────────────────────────────────────────────────────────────

def _call_anthropic(prompt: str) -> str:
    import anthropic

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise EnvironmentError("ANTHROPIC_API_KEY is not set in your .env file.")

    client = anthropic.Anthropic(api_key=api_key)
    model = os.getenv("ANTHROPIC_MODEL", "claude-opus-4-5")

    message = client.messages.create(
        model=model,
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text


# ─── OpenAI ───────────────────────────────────────────────────────────────────

def _call_openai(prompt: str) -> str:
    from openai import OpenAI

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise EnvironmentError("OPENAI_API_KEY is not set in your .env file.")

    client = OpenAI(api_key=api_key)
    model = os.getenv("OPENAI_MODEL", "gpt-4o")

    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=4096,
    )
    return response.choices[0].message.content
