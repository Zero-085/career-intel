"""
json_parser.py — Safely extract and validate JSON from LLM responses.
LLMs sometimes wrap JSON in markdown fences or add extra text.
This module strips all of that and returns a clean Python dict.
"""

import json
import re


def extract_json(raw: str) -> dict | None:
    """
    Attempt to extract a valid JSON object from a raw LLM string.
    Handles markdown code fences and leading/trailing text.
    Returns a dict on success, None on failure.
    """
    if not raw:
        return None

    # Step 1: Strip markdown code fences like ```json ... ``` or ``` ... ```
    cleaned = re.sub(r"```(?:json)?\s*", "", raw).strip()
    cleaned = re.sub(r"```\s*$", "", cleaned).strip()

    # Step 2: Try to parse the whole string
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Step 3: Try to find the first { ... } block (greedy)
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    return None
