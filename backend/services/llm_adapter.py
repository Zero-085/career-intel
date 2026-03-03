"""
LLM Adapter — pluggable provider abstraction.
Supported: anthropic | openai | groq
"""
import os
from dotenv import load_dotenv

load_dotenv()

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "anthropic").lower()

# Our prompt + full JSON response needs ~3500-5000 tokens.
# The original Groq setting of 1500 caused silent truncation for longer resumes.
MAX_TOKENS = 5000


def generate_analysis(prompt: str) -> str:
    if LLM_PROVIDER == "mock":
        return _mock_response()
    elif LLM_PROVIDER == "anthropic":
        return _call_anthropic(prompt)
    elif LLM_PROVIDER == "openai":
        return _call_openai(prompt)
    elif LLM_PROVIDER == "groq":
        return _call_groq(prompt)
    else:
        raise ValueError(f"Unsupported LLM provider: {LLM_PROVIDER}")


def _call_anthropic(prompt: str) -> str:
    import anthropic
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise EnvironmentError("ANTHROPIC_API_KEY is not set.")
    client  = anthropic.Anthropic(api_key=api_key)
    model   = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")
    message = client.messages.create(
        model=model,
        max_tokens=MAX_TOKENS,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text


def _call_openai(prompt: str) -> str:
    from openai import OpenAI
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise EnvironmentError("OPENAI_API_KEY is not set.")
    client   = OpenAI(api_key=api_key)
    model    = os.getenv("OPENAI_MODEL", "gpt-4o")
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=MAX_TOKENS,
    )
    return response.choices[0].message.content


def _call_groq(prompt: str) -> str:
    from openai import OpenAI
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise EnvironmentError("GROQ_API_KEY is not set.")
    client = OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")
    model  = os.getenv("GROQ_MODEL", "llama3-70b-8192")
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=min(MAX_TOKENS, 6000),
        temperature=0.1,  # Lower = more deterministic JSON output
    )
    return response.choices[0].message.content


def _mock_response():
    return '{"role_title":"Backend Engineer","domain":"Backend Engineering","role_level":"mid","scoring_breakdown":{"required_total":7,"required_matched":4,"preferred_total":3,"preferred_matched":1,"required_pct":0.57,"R":40,"P":6.7,"E":7,"raw_match":53.7},"match_score":54,"ats_optimization":55,"hiring_recommendation":"Upskill Required","executive_summary":"Mock response for development.","skill_analysis":{"matched_skills":["Python","FastAPI","PostgreSQL","Docker"],"missing_skills":[{"skill":"AWS","priority":"High","reason":"Cloud deployment required"},{"skill":"CI/CD","priority":"High","reason":"Required for release automation"},{"skill":"Microservices","priority":"Medium","reason":"System design pattern used"}]},"radar_data":[{"axis":"Python / APIs","candidate":80,"jd":100},{"axis":"Cloud & AWS","candidate":20,"jd":100},{"axis":"DevOps & CI/CD","candidate":25,"jd":100},{"axis":"Databases","candidate":75,"jd":100},{"axis":"Architecture","candidate":40,"jd":100},{"axis":"Observability","candidate":10,"jd":100}],"resume_upgrades":[{"original_bullet":"Worked on backend APIs","improved_bullet":"Developed 12 REST APIs using FastAPI serving 50K monthly users, reducing response time by 30%","reasoning":"Added specifics, metrics, and impact"}],"learning_roadmap":{"week1":{"theme":"AWS Foundations","tasks":["Complete AWS Cloud Practitioner free course","Set up EC2 and deploy Flask app","Learn S3 via boto3"]},"week2":{"theme":"Docker & CI/CD","tasks":["Dockerize your Django project","Set up GitHub Actions for tests","Deploy container to EC2"]},"week3":{"theme":"Microservices","tasks":["Split monolith into 2 services","Add inter-service REST calls","Read Martin Fowler Microservices guide"]},"week4":{"theme":"Portfolio & Practice","tasks":["Build end-to-end project using all skills","Practice system design questions","Review AWS IAM and security basics"]}},"top_strengths":["Strong Python and FastAPI fundamentals","Solid PostgreSQL experience","Docker basics in place"],"critical_gaps":["No AWS experience","No CI/CD pipeline experience"]}'