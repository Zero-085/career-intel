<div align="center">
  <img src="./frontend/public/logo.png" alt="Career Intel" height="80" />
  <br /><br />
  <p><strong>AI-powered resume analysis. Transparent scoring. Actionable results.</strong></p>
  <p>
    Paste your resume and any job description — or drop a URL.<br/>
    Career Intel extracts requirements, scores your fit with a deterministic formula,<br/>
    identifies every skill gap, and rewrites your resume targeting the role.
  </p>
  <br/>
  <img src="https://img.shields.io/badge/version-2.0-E8B84B?style=flat-square&labelColor=0A0A0F" alt="v2.0"/>
  <img src="https://img.shields.io/badge/FastAPI-0.110+-4ECDC4?style=flat-square&labelColor=0A0A0F" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/React-18-E8B84B?style=flat-square&labelColor=0A0A0F" alt="React 18"/>
  <img src="https://img.shields.io/badge/LLM-Claude%20%7C%20GPT--4o%20%7C%20Groq-4ECDC4?style=flat-square&labelColor=0A0A0F" alt="LLM"/>
  <img src="https://img.shields.io/badge/license-MIT-E8B84B?style=flat-square&labelColor=0A0A0F" alt="MIT"/>
</div>

---

## Table of Contents

1. [Overview](#overview)
2. [Screenshots](#screenshots)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [Architecture](#architecture)
6. [Scoring Model](#scoring-model)
7. [Project Structure](#project-structure)
8. [Getting Started](#getting-started)
9. [Environment Variables](#environment-variables)
10. [API Reference](#api-reference)
11. [LLM Providers](#llm-providers)
12. [Deployment](#deployment)
13. [Known Limitations](#known-limitations)

---

## Overview

Most resume tools produce a black-box score with no explanation. Career Intel is different — it shows you the exact formula, which required skills were matched or missed, how many points each component contributed, and what to do about the gaps.

The scoring is **deterministic**: the LLM computes a raw score, then Python applies hard caps and floors to enforce logical consistency. The same resume against the same JD always produces the same verdict.

Built for developers, job seekers, and technical recruiters who want a system they can trust — not one they have to second-guess.

---

## Screenshots

|             Landing Page              |           Analysis Report           |
| :-----------------------------------: | :---------------------------------: |
| ![Landing](./screenshots/landing.png) | ![Report](./screenshots/report.png) |

> _Dark editorial design · Gold accent palette · Layered animated glow background_

---

## Features

|     | Feature                       | What it does                                                                                          |
| --- | ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| 📊  | **Match Score**               | Transparent formula: Required Skills (70 pts) + Preferred Skills (20 pts) + Experience Depth (10 pts) |
| 🔒  | **Deterministic Enforcement** | Python hard-caps and floors override LLM arithmetic — Python is the source of truth                   |
| 📋  | **Score Breakdown Panel**     | Displays `R×70 + P×20 + E×10` with fraction bars and per-component point totals                       |
| 🎯  | **ATS Score**                 | Keyword density, action verbs, and formatting quality — scored independently of skill match           |
| 🔍  | **Skill Gap Analysis**        | Every missing skill ranked High / Medium / Low with role-specific reasoning                           |
| 📡  | **Skill Radar Chart**         | 6-axis visual comparing your profile vs JD requirements                                               |
| ✍️  | **Resume Rewrite**            | Targeted rewrite against the JD — zero fabricated facts, zero invented metrics                        |
| 📄  | **DOCX Download**             | Rewritten resume exported as a formatted, ready-to-send Word document                                 |
| 🔗  | **JD URL Import**             | Paste a Greenhouse / Lever / Ashby / Workday URL — JD scraped automatically                           |
| 🗺️  | **Learning Roadmap**          | 4-week personalised upskill plan built from your actual gaps                                          |
| 🤖  | **Multi-provider LLM**        | Claude (default), GPT-4o, Groq Llama 3, or mock mode — swap via one env var                           |
| ✨  | **Animated Background**       | Layered CSS gold glow blobs, `prefers-reduced-motion` respected, zero JS overhead                     |

---

## Tech Stack

**Frontend**

| Tool                             | Purpose                                    |
| -------------------------------- | ------------------------------------------ |
| React 18 + Vite                  | SPA framework and HMR dev server           |
| Recharts                         | Skill radar chart                          |
| Space Grotesk + Instrument Serif | Typography                                 |
| Pure CSS keyframe animations     | Animated background — no animation library |

**Backend**

| Tool                  | Purpose                                      |
| --------------------- | -------------------------------------------- |
| FastAPI + Pydantic v2 | API framework and request validation         |
| pdfplumber            | Resume PDF text extraction                   |
| python-docx           | DOCX parsing and rewritten resume generation |
| BeautifulSoup4        | JD URL scraping                              |
| python-dotenv         | Environment variable management              |

**LLM Layer**

| Provider              | Model               | SDK                        |
| --------------------- | ------------------- | -------------------------- |
| Anthropic _(default)_ | `claude-sonnet-4-6` | `anthropic`                |
| OpenAI                | `gpt-4o`            | `openai`                   |
| Groq                  | `llama3-70b-8192`   | `openai` via Groq base URL |
| Mock                  | built-in fixture    | none                       |

All providers run at `temperature=0` for deterministic, repeatable scoring.

---

## Architecture

```
┌──────────────────────────────────────────┐
│             React Frontend               │
│          Vite · localhost:5173           │
│                                          │
│  App.jsx                                 │
│  └── pages/HomePage.jsx                  │
│        ├── ScoreBreakdownPanel           │  ← R×70 + P×20 + E×10 inline
│        ├── components/ScoreRing          │  ← animated score dial
│        ├── components/ResultTabs         │  ← tab navigation
│        ├── components/SkillRadar         │  ← Recharts 6-axis radar
│        ├── components/SkillGaps          │  ← priority-ranked gap cards
│        ├── components/MatchedSkills      │  ← matched skill chips
│        ├── components/ResumeUpgrades     │  ← before/after bullets
│        ├── components/LearningRoadmap    │  ← 4-week plan
│        ├── components/LoadingOverlay     │
│        └── pages/AnimatedBackground      │  ← fixed layer, z-index: -1
└─────────────────┬────────────────────────┘
                  │  multipart/form-data · JSON
┌─────────────────▼────────────────────────┐
│             FastAPI Backend              │
│          uvicorn · localhost:8000        │
│                                          │
│  main.py  (CORS · router registration)   │
│                                          │
│  routes/analyze.py                       │
│    ├── POST /api/analyze                 │
│    │     ├── utils/prompt_builder.py     │  ← 3-phase structured prompt
│    │     ├── services/llm_adapter.py     │  ← pluggable LLM call
│    │     ├── utils/json_parser.py        │  ← JSON extraction + repair
│    │     └── utils/score_enforcer.py     │  ← caps, floors, verdict
│    └── POST /api/jd/fetch-url            │
│          └── utils/jd_scraper.py         │  ← Greenhouse/Lever/Ashby
│                                          │
│  routes/rewrite.py                       │
│    └── POST /api/rewrite-resume          │
│          ├── utils/rewrite_builder.py    │  ← fact-preserving prompt
│          ├── services/llm_adapter.py     │
│          └── utils/docx_builder.py       │  ← Word doc output
└──────────────────────────────────────────┘
```

> **No database.** All state is in-request. The frontend passes the full analysis JSON back to the backend when requesting a resume rewrite.

---

## Scoring Model

The match score is built from a three-component formula. The LLM computes the raw score; Python validates and enforces the result.

### Formula

```
R = (required_matched / required_total) × 70     ← max 70 pts
P = (preferred_matched / preferred_total) × 20   ← max 20 pts  (0 if no preferred)
E = experience depth score 0–10                  ← max 10 pts

raw_match = R + P + E
```

This formula is shown directly in the UI alongside the Score Breakdown panel.

### Hard Caps — Python-enforced

| Required skill coverage | Score capped at |
| ----------------------- | --------------- |
| < 20%                   | 30              |
| < 30%                   | 40              |
| < 50%                   | 52              |
| < 70%                   | 65              |
| < 85%                   | 78              |

### Floors — Python-enforced

| Condition                           | Score floor |
| ----------------------------------- | ----------- |
| 100% required + 100% preferred      | 93          |
| 100% required + ≥ 60% preferred     | 88          |
| 100% required (any preferred count) | 75          |
| 100% required — ATS floor           | ATS ≥ 68    |

### Hiring Recommendation

| Match Score | Verdict            |
| ----------- | ------------------ |
| 85 – 100    | ✦ Strong Interview |
| 70 – 84     | ✔ Interview        |
| 55 – 69     | ▲ Upskill Required |
| 0 – 54      | ✕ Reject           |

> A candidate who scores Strong Interview but has any missing required skill is automatically downgraded to Interview.

### Skill Equivalence Rules

The LLM matches on **demonstrated capability**, not exact keywords:

- `"CI/CD pipelines"` → matched by GitHub Actions, GitLab CI, Jenkins, CircleCI
- `"FastAPI or Django"` → one required slot, matched by either
- `"AWS"` → matched by any AWS service (EC2, S3, Lambda, IAM…)
- `"Docker"` → matched by Docker, docker-compose, Dockerfile, containerisation

---

## Project Structure

```
career-intel/
│
├── backend/
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── analyze.py          ← POST /api/analyze · POST /api/jd/fetch-url
│   │   └── rewrite.py          ← POST /api/rewrite-resume
│   ├── services/
│   │   ├── __init__.py
│   │   └── llm_adapter.py      ← Anthropic / OpenAI / Groq / mock
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── docx_builder.py     ← rewritten resume → Word document
│   │   ├── jd_scraper.py       ← URL → clean JD text
│   │   ├── json_parser.py      ← LLM JSON extraction + truncation repair
│   │   ├── prompt_builder.py   ← 3-phase structured analysis prompt
│   │   ├── rewrite_builder.py  ← fact-preserving rewrite prompt
│   │   └── score_enforcer.py   ← deterministic caps, floors, recommendation
│   ├── venv/
│   ├── .env                    ← your secrets (never commit)
│   ├── .env.example
│   ├── main.py                 ← FastAPI entry point, CORS, router registration
│   └── requirements.txt
│
└── frontend/
    ├── public/
    │   └── logo.png            ← app logo (navbar + browser tab)
    ├── src/
    │   ├── api/                ← API call wrappers
    │   ├── components/
    │   │   ├── LearningRoadmap.jsx   ← 4-week upskill plan cards
    │   │   ├── LoadingOverlay.jsx    ← analysis loading screen
    │   │   ├── MatchedSkills.jsx     ← matched skill chip list
    │   │   ├── ResultTabs.jsx        ← tab bar for result sections
    │   │   ├── ResumeUpgrades.jsx    ← before/after bullet comparison
    │   │   ├── ScoreRing.jsx         ← animated score dial
    │   │   ├── SkillGaps.jsx         ← priority-ranked gap cards
    │   │   └── SkillRadar.jsx        ← Recharts 6-axis radar
    │   ├── hooks/
    │   │   └── useAnalysis.js        ← analysis state + API call
    │   ├── pages/
    │   │   ├── AnimatedBackground.jsx  ← layered CSS gold glow blobs
    │   │   └── HomePage.jsx            ← app shell + ScoreBreakdownPanel + Footer
    │   ├── styles/
    │   │   └── globals.css     ← design tokens + all component CSS
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env
    ├── .env.example
    ├── index.html              ← favicon + page title configured
    ├── package.json
    ├── vite.config.js
    └── .gitignore
```

---

## Getting Started

### Prerequisites

- Python **3.10+**
- Node.js **18+** and npm
- API key for at least one LLM provider _(or use `mock` — no key needed)_

### 1. Clone the repository

```bash
git clone https://github.com/your-username/career-intel.git
cd career-intel
```

### 2. Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Open .env and set LLM_PROVIDER + the matching API key

# Start the dev server
uvicorn main:app --reload --port 8000
```

Backend runs at **http://localhost:8000** — confirm with `GET /health`.

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment (optional — defaults to localhost:8000)
cp .env.example .env

# Start dev server
npm run dev
```

Frontend runs at **http://localhost:5173**.

### 4. Quick test — no API key needed

Set `LLM_PROVIDER=mock` in `backend/.env`. The server returns a deterministic fixture response instantly. Every UI feature works — scores, gaps, radar, roadmap, rewrite — with zero LLM calls.

---

## Environment Variables

### Backend — `backend/.env`

| Variable            | Required     | Default                 | Description                                 |
| ------------------- | ------------ | ----------------------- | ------------------------------------------- |
| `LLM_PROVIDER`      | ✅           | `anthropic`             | `anthropic` \| `openai` \| `groq` \| `mock` |
| `ANTHROPIC_API_KEY` | If Anthropic | —                       | Your Anthropic API key                      |
| `OPENAI_API_KEY`    | If OpenAI    | —                       | Your OpenAI API key                         |
| `GROQ_API_KEY`      | If Groq      | —                       | Your Groq API key                           |
| `ANTHROPIC_MODEL`   | No           | `claude-sonnet-4-6`     | Override the Anthropic model                |
| `OPENAI_MODEL`      | No           | `gpt-4o`                | Override the OpenAI model                   |
| `GROQ_MODEL`        | No           | `llama3-70b-8192`       | Override the Groq model                     |
| `ALLOWED_ORIGINS`   | No           | `http://localhost:5173` | Comma-separated CORS origins                |

### Frontend — `frontend/.env`

| Variable           | Required | Default                 | Description          |
| ------------------ | -------- | ----------------------- | -------------------- |
| `VITE_BACKEND_URL` | No       | `http://localhost:8000` | Backend API base URL |

---

## API Reference

All routes are prefixed with `/api`.

---

### `POST /api/analyze`

Analyse a resume against a job description.

**Request** — `multipart/form-data`

| Field         | Type   | Notes                                                 |
| ------------- | ------ | ----------------------------------------------------- |
| `resume_text` | string | Raw resume text. Use this **or** `resume_file`        |
| `resume_file` | file   | PDF or DOCX upload. Takes priority over `resume_text` |
| `jd_text`     | string | Job description text. Use this **or** `jd_url`        |
| `jd_url`      | string | Job posting URL — scraped automatically               |

**Response** — `application/json`

```jsonc
{
  "role_title": "Backend Platform Engineer – Cloud Infrastructure",
  "domain": "Backend Engineering, Cloud Infrastructure",
  "role_level": "senior",
  "match_score": 30,
  "ats_optimization": 30,
  "hiring_recommendation": "Reject",
  "scoring_breakdown": {
    "required_total": 8,
    "required_matched": 1,
    "preferred_total": 5,
    "preferred_matched": 0,
    "R": 9,
    "P": 0,
    "E": 2,
    "raw_match": 11,
  },
  "executive_summary": "...",
  "skill_analysis": {
    "matched_skills": ["Python"],
    "missing_skills": [
      {
        "skill": "Kubernetes",
        "priority": "High",
        "reason": "Core orchestration platform for this role",
      },
    ],
  },
  "radar_data": [
    { "axis": "Cloud Infrastructure", "candidate": 10, "jd": 100 },
  ],
  "resume_upgrades": [
    {
      "original_bullet": "Worked on APIs",
      "improved_bullet": "Built 3 REST APIs using FastAPI...",
      "reasoning": "Added specifics and impact",
    },
  ],
  "learning_roadmap": {
    "week1": { "theme": "Kubernetes Foundations", "tasks": ["..."] },
  },
  "top_strengths": ["Frontend fundamentals", "Basic Python"],
  "critical_gaps": [
    "No Kubernetes experience",
    "No cloud infrastructure background",
  ],
}
```

---

### `POST /api/rewrite-resume`

Rewrites a resume targeting the given JD. Returns a `.docx` file stream.

**Request** — `application/json`

```json
{
  "resume_text": "...",
  "jd_text": "...",
  "analysis": {},
  "candidate_name": "Himanshu Mishra"
}
```

**Response** — DOCX file download: `Himanshu_Mishra_Rewritten_Resume.docx`

> The rewrite preserves all facts from the original resume. No metrics are invented. No skills are added that weren't present originally.

---

### `POST /api/jd/fetch-url`

Scrape a job posting URL and return cleaned JD text.

**Request** — `multipart/form-data`: field `jd_url`

**Response**

```json
{
  "success": true,
  "text": "We are looking for a Senior Backend Platform Engineer...",
  "title": "Backend Platform Engineer – Cloud Infrastructure",
  "company": "Acme Corp",
  "platform": "greenhouse"
}
```

**Supported:** Greenhouse · Lever · Ashby · Workday · Generic HTML fallback

**Blocked** _(bot protection — paste text manually):_ LinkedIn · Indeed · Glassdoor · Naukri · ZipRecruiter

---

### `GET /health`

Readiness probe. Returns `{ "status": "ok", "version": "2.0" }`.

---

## LLM Providers

| Provider                  | Model               | Strength                                         |
| ------------------------- | ------------------- | ------------------------------------------------ |
| **Anthropic** _(default)_ | `claude-sonnet-4-6` | Best structured JSON output, strongest reasoning |
| **OpenAI**                | `gpt-4o`            | Strong alternative, comparable quality           |
| **Groq**                  | `llama3-70b-8192`   | Fastest response, ~10× cheaper per call          |
| **Mock**                  | built-in fixture    | No API key — for local dev and CI                |

**Estimated cost per full analysis** _(~3,000 tokens in · ~2,000 tokens out)_:

| Provider                | Per analysis   |
| ----------------------- | -------------- |
| Anthropic Claude Sonnet | ~$0.04 – $0.09 |
| OpenAI GPT-4o           | ~$0.03 – $0.07 |
| Groq Llama 3 70B        | ~$0.004        |

Resume rewrite calls cost ~2–3× a standard analysis due to longer output.

---

## Deployment

See [`CareerIntel_Deployment_Guide.docx`](./CareerIntel_Deployment_Guide.docx) for full step-by-step instructions covering Vercel + Railway, AWS EC2, Docker, Caddy/nginx, and systemd.

**Quick production start:**

```bash
# 1. Build frontend
cd frontend
VITE_BACKEND_URL=https://api.yourdomain.com npm run build
# Serve the dist/ folder from Vercel, Netlify, S3, or nginx

# 2. Run backend with Gunicorn
cd backend
pip install gunicorn
gunicorn main:app \
  -k uvicorn.workers.UvicornWorker \
  --workers 2 \
  --bind 0.0.0.0:8000 \
  --timeout 120
```

**Pre-launch checklist:**

- [ ] `backend/.env` is listed in `.gitignore` — never committed
- [ ] `ALLOWED_ORIGINS` set to your exact frontend domain — never `*`
- [ ] LLM API key has a spend limit set in the provider dashboard
- [ ] `GET /health` returns `200` from your production URL
- [ ] Frontend was built _after_ setting `VITE_BACKEND_URL` to the production API URL
- [ ] `logo.png` is present in `frontend/public/` before building

---

## Known Limitations

- **LinkedIn / Indeed / Glassdoor** job URLs cannot be scraped due to bot protection — paste the JD text manually for these platforms.
- **Resume rewrite** strengthens what exists. It does not add skills or experience the original resume doesn't contain.
- **No persistent storage** — results are held in browser memory only. Refreshing the page clears the session.
- **Long inputs** — resumes over 4 pages or JDs over ~1,500 words may reduce output quality near the 5,000 token output limit. The JSON parser includes truncation repair, but very large inputs are best trimmed first.
- **Cross-provider score variance** — `temperature=0` minimises variance, but different providers tokenise identical inputs differently, which can produce ±2–3 point differences on edge cases.

---

## License

MIT — see [LICENSE](./LICENSE) for details.

---

<div align="center">
  <p>Built with passion by <strong>Himanshu Mishra</strong> · Career Intel © 2026</p>
</div>
