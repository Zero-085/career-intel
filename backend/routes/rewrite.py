"""
rewrite.py — /api/rewrite-resume endpoint.
Accepts resume text + jd text + prior analysis JSON.
Returns a rewritten resume as a downloadable DOCX file.
"""

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.llm_adapter import generate_analysis
from utils.rewrite_builder import build_rewrite_prompt
from utils.docx_builder import build_resume_docx
import logging
import json

logger = logging.getLogger(__name__)
router = APIRouter()


class RewriteRequest(BaseModel):
    resume_text: str
    jd_text: str
    analysis: dict         # the full analysis result from /api/analyze
    candidate_name: str = "Candidate"


@router.post("/rewrite-resume")
async def rewrite_resume(req: RewriteRequest):
    if not req.resume_text.strip():
        return {"error": "Resume text is required."}
    if not req.jd_text.strip():
        return {"error": "Job description is required."}

    # 1 — Build rewrite prompt
    prompt = build_rewrite_prompt(req.resume_text, req.jd_text, req.analysis)

    # 2 — Call LLM
    try:
        rewritten_text = generate_analysis(prompt)
    except Exception as e:
        logger.error(f"Rewrite LLM call failed: {e}")
        return {"error": f"LLM error: {str(e)}"}

    if not rewritten_text or not rewritten_text.strip():
        return {"error": "LLM returned empty rewrite."}

    # 3 — Build DOCX
    try:
        role_title = req.analysis.get("role_title", "Target Role")
        docx_bytes = build_resume_docx(
            rewritten_text,
            candidate_name=req.candidate_name,
            role_title=role_title,
        )
    except Exception as e:
        logger.error(f"DOCX build failed: {e}")
        return {"error": f"Failed to generate DOCX: {str(e)}"}

    # 4 — Stream as download
    safe_name = req.candidate_name.replace(" ", "_")
    filename  = f"{safe_name}_Rewritten_Resume.docx"

    return StreamingResponse(
        iter([docx_bytes]),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )