from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.llm_adapter import generate_analysis
from utils.json_parser import extract_json
from utils.prompt_builder import build_prompt

router = APIRouter()


class AnalyzeRequest(BaseModel):
    resume: str
    jd: str


@router.post("/analyze")
async def analyze(request: AnalyzeRequest):
    if not request.resume.strip():
        raise HTTPException(status_code=400, detail="Resume text is required.")
    if not request.jd.strip():
        raise HTTPException(status_code=400, detail="Job description text is required.")

    prompt = build_prompt(request.resume, request.jd)

    try:
        raw_output = generate_analysis(prompt)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM call failed: {str(e)}")

    result = extract_json(raw_output)
    if result is None:
        raise HTTPException(status_code=500, detail="Failed to parse LLM response as valid JSON.")

    return result
