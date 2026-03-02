"""
LLM Adapter — pluggable provider abstraction.
Supported providers:
- anthropic
- openai
- groq (OpenAI-compatible)
"""

import os
from dotenv import load_dotenv

load_dotenv()

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "groq").lower()


def generate_analysis(prompt: str) -> str:
    if LLM_PROVIDER == "anthropic":
        return _call_anthropic(prompt)

    elif LLM_PROVIDER == "openai":
        return _call_openai(prompt)

    elif LLM_PROVIDER == "groq":
        return _call_groq(prompt)

    else:
        raise ValueError(f"Unsupported LLM provider: {LLM_PROVIDER}")


# ─── Anthropic ────────────────────────────────────────────────────────────────

def _call_anthropic(prompt: str) -> str:
    import anthropic

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise EnvironmentError("ANTHROPIC_API_KEY is not set.")

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
        raise EnvironmentError("OPENAI_API_KEY is not set.")

    client = OpenAI(api_key=api_key)
    model = os.getenv("OPENAI_MODEL", "gpt-4o")

    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=4096,
    )

    return response.choices[0].message.content


# ─── Groq (OpenAI-Compatible) ────────────────────────────────────────────────

def _call_groq(prompt: str) -> str:
    from openai import OpenAI

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise EnvironmentError("GROQ_API_KEY is not set.")

    client = OpenAI(
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1",
    )

    model = os.getenv("GROQ_MODEL", "llama3-70b-8192")

    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1500,
    )

    return response.choices[0].message.content