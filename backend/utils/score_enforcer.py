"""
score_enforcer.py — Post-processing hard caps applied in Python.
Python is the source of truth for scoring. Never trust LLM math alone.
"""
import math


def enforce_scores(data: dict) -> dict:
    if not data:
        return data

    # ── 1. Get counts from scoring_breakdown (preferred) ─────────────
    breakdown = data.get("scoring_breakdown") or {}

    required_total    = int(breakdown.get("required_total", 0))
    required_matched  = int(breakdown.get("required_matched", 0))
    preferred_total   = int(breakdown.get("preferred_total", 0))
    preferred_matched = int(breakdown.get("preferred_matched", 0))

    # ── 2. Fallback: infer from skill_analysis ────────────────────────
    if required_total == 0:
        skill_analysis   = data.get("skill_analysis") or {}
        matched_list     = skill_analysis.get("matched_skills") or []
        missing_list     = skill_analysis.get("missing_skills") or []

        required_matched = len([s for s in matched_list if s])
        required_total   = required_matched + len(missing_list)

        # When inferring from skill_analysis, preferred counts are unknown.
        # If there are no missing skills at all, assume full preferred match.
        if len(missing_list) == 0 and required_matched > 0:
            preferred_total   = 1   # dummy — forces pct = 1.0
            preferred_matched = 1
        else:
            preferred_total   = 0
            preferred_matched = 0

    if required_total == 0:
        return data

    required_pct  = required_matched / required_total
    preferred_pct = (preferred_matched / preferred_total) if preferred_total > 0 else 0.0
    missing_count = required_total - required_matched

    match_score = int(data.get("match_score", 0))
    ats_score   = int(data.get("ats_optimization", 0))

    # ── 3. MATCH SCORE: hard caps + floors ───────────────────────────
    if required_pct < 0.20:
        match_score = min(match_score, 30)
    elif required_pct < 0.30:
        match_score = min(match_score, 40)
    elif required_pct < 0.50:
        match_score = min(match_score, 52)
    elif required_pct < 0.70:
        match_score = min(match_score, 65)
    elif required_pct < 0.85:
        match_score = min(match_score, 78)
    elif required_pct >= 1.0 and preferred_pct >= 1.0:
        match_score = max(match_score, 93)    # full match → floor 93
    elif required_pct >= 1.0 and preferred_pct >= 0.60:
        match_score = max(match_score, 88)    # full req + most pref → floor 88
    elif required_pct >= 0.85 and preferred_pct >= 0.60:
        match_score = max(match_score, 85)

    match_score = max(0, min(100, match_score))

    # ── 4. ATS SCORE: hard caps ───────────────────────────────────────
    if required_matched <= 2:
        ats_score = min(ats_score, 35)
    elif required_matched <= 4:
        ats_score = min(ats_score, 60)
    elif missing_count > 2:
        ats_score = min(ats_score, 72)
    elif required_matched >= required_total and preferred_pct >= 0.60:
        ats_score = max(ats_score, 82)

    ats_score = max(0, min(100, ats_score))

    # ── 5. Hiring recommendation (re-derived from final scores) ──────
    if match_score >= 85:
        rec = "Strong Interview"
    elif match_score >= 70:
        rec = "Interview"
    elif match_score >= 55:
        rec = "Upskill Required"
    else:
        rec = "Reject"

    # Never Strong Interview if any required skill is missing
    if missing_count > 0 and rec == "Strong Interview":
        rec = "Interview"

    data["match_score"]           = match_score
    data["ats_optimization"]      = ats_score
    data["hiring_recommendation"] = rec

    return data