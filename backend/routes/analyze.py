from fastapi import APIRouter, UploadFile, File, Form
from services.llm_adapter import generate_analysis
from utils.json_parser import extract_json
from utils.prompt_builder import build_prompt

import pdfplumber
import docx
import io

router = APIRouter()

@router.post("/analyze")
async def analyze(
    resume_text: str = Form(None),
    jd_text: str = Form(...),
    resume_file: UploadFile = File(None)
):
    # --- Extract resume text ---
    if resume_file:
        content = await resume_file.read()

        if resume_file.filename.endswith(".pdf"):
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                resume_text = "\n".join(page.extract_text() or "" for page in pdf.pages)

        elif resume_file.filename.endswith(".docx"):
            doc = docx.Document(io.BytesIO(content))
            resume_text = "\n".join(p.text for p in doc.paragraphs)

        else:
            return {"error": "Unsupported file format. Upload PDF or DOCX."}

    if not resume_text:
        return {"error": "Resume text is required."}

    # --- Build prompt ---
    prompt = build_prompt(resume_text, jd_text)

    # --- Call LLM ---
    raw_response = generate_analysis(prompt)

    # --- Parse JSON safely ---
    parsed = extract_json(raw_response)

    return parsed