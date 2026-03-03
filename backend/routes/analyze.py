from fastapi import APIRouter, UploadFile, File, Form
from services.llm_adapter import generate_analysis
from utils.prompt_builder import build_prompt
from utils.json_parser import extract_json
from utils.score_enforcer import enforce_scores

import pdfplumber
import docx
import io
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/analyze")
async def analyze(
    resume_text: str = Form(None),
    jd_text: str = Form(...),
    resume_file: UploadFile = File(None)
):

    # 1 — Extract Resume Text
    if resume_file:
        content = await resume_file.read()

        if resume_file.filename.endswith(".pdf"):
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                resume_text = "\n".join(
                    page.extract_text() or "" for page in pdf.pages
                )
        elif resume_file.filename.endswith(".docx"):
            doc = docx.Document(io.BytesIO(content))
            resume_text = "\n".join(p.text for p in doc.paragraphs)
        else:
            return {"error": "Unsupported file format. Upload PDF or DOCX."}

    if not resume_text or not resume_text.strip():
        return {"error": "Resume text is required."}

    # 2 — Build Prompt
    prompt = build_prompt(resume_text, jd_text)

    # 3 — Call LLM
    try:
        raw_response = generate_analysis(prompt)
    except Exception as e:
        logger.error(f"LLM call failed: {e}")
        return {"error": f"LLM service error: {str(e)}"}

    if not raw_response:
        return {"error": "LLM returned an empty response."}

    # 4 — Parse JSON Safely
    parsed = extract_json(raw_response)

    if not parsed:
        logger.error(f"JSON parse failed. Raw (first 800):\n{raw_response[:800]}")
        return {
            "error": "Failed to parse LLM response as valid JSON.",
            "raw_preview": raw_response[:600],
            "hint": "The LLM may have returned truncated or malformed JSON. Try again."
        }

    # 5 — Enforce Scoring Rules in Python (source of truth)
    result = enforce_scores(parsed)

    return result


@router.post("/analyze/debug")
async def analyze_debug(
    resume_text: str = Form(None),
    jd_text: str = Form(...),
    resume_file: UploadFile = File(None)
):
    """Debug endpoint — returns raw LLM response without parsing."""
    if resume_file:
        content = await resume_file.read()
        if resume_file.filename.endswith(".pdf"):
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                resume_text = "\n".join(page.extract_text() or "" for page in pdf.pages)
        elif resume_file.filename.endswith(".docx"):
            doc = docx.Document(io.BytesIO(content))
            resume_text = "\n".join(p.text for p in doc.paragraphs)

    if not resume_text or not resume_text.strip():
        return {"error": "Resume text is required."}

    prompt = build_prompt(resume_text, jd_text)
    raw = generate_analysis(prompt)
    parsed = extract_json(raw)
    enforced = enforce_scores(parsed) if parsed else None

    return {
        "raw_response": raw,
        "parse_success": parsed is not None,
        "enforced_scores": {
            "match_score": enforced.get("match_score") if enforced else None,
            "ats_optimization": enforced.get("ats_optimization") if enforced else None,
            "scoring_breakdown": enforced.get("scoring_breakdown") if enforced else None,
        } if enforced else None
    }