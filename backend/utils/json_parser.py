"""
json_parser.py — Robust JSON extraction from LLM responses.
Handles: markdown fences, preamble text, truncated responses,
partial nested objects, and mid-string truncation.
"""
import json
import re


def extract_json(raw: str) -> dict | None:
    if not raw or not raw.strip():
        return None

    # ── 1. Strip markdown fences ──────────────────────────────────────
    text = re.sub(r"```(?:json)?\s*", "", raw).strip()
    text = re.sub(r"```\s*$", "", text).strip()

    # ── 2. Try full string ────────────────────────────────────────────
    result = _try_parse(text)
    if result:
        return result

    # ── 3. Find opening brace ─────────────────────────────────────────
    start = text.find("{")
    if start == -1:
        return None
    fragment = text[start:]

    # ── 4. Try fragment as-is ─────────────────────────────────────────
    result = _try_parse(fragment)
    if result:
        return result

    # ── 5. Brace-balanced extraction ──────────────────────────────────
    balanced = _extract_balanced(fragment)
    if balanced:
        result = _try_parse(balanced)
        if result:
            return result

    # ── 6. Suffix repair (open braces/brackets) ───────────────────────
    result = _suffix_repair(fragment)
    if result:
        return result

    # ── 7. Walk-back repair (truncated mid-value) ─────────────────────
    # Strip from the end back to the last complete structural boundary
    result = _walkback_repair(fragment)
    if result:
        return result

    return None


def _try_parse(text: str):
    try:
        r = json.loads(text)
        return r if isinstance(r, dict) else None
    except (json.JSONDecodeError, ValueError):
        return None


def _extract_balanced(text: str):
    """Extract the first complete balanced { } block."""
    depth = 0
    in_str = False
    esc    = False
    for i, ch in enumerate(text):
        if esc:             esc = False;   continue
        if ch == "\\" and in_str: esc = True; continue
        if ch == '"':       in_str = not in_str; continue
        if in_str:          continue
        if ch == "{":       depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return text[:i + 1]
    return None


def _suffix_repair(fragment: str):
    """Count unclosed braces/brackets and append closers."""
    depth_obj = 0
    depth_arr = 0
    in_str = False
    esc    = False

    for ch in fragment:
        if esc:             esc = False;    continue
        if ch == "\\" and in_str: esc = True; continue
        if ch == '"':       in_str = not in_str; continue
        if in_str:          continue
        if ch == "{":       depth_obj += 1
        elif ch == "}":     depth_obj -= 1
        elif ch == "[":     depth_arr += 1
        elif ch == "]":     depth_arr -= 1

    suffixes = []
    for q in ["", '"']:
        for a in ["", "]" * max(0, depth_arr)]:
            for o in ["}" * max(0, depth_obj)]:
                s = q + a + o
                if s:
                    suffixes.append(s)
    # Extra common closers
    suffixes += ['"}' + "}" * i for i in range(5)]
    suffixes += ['"}]}' + "}" * i for i in range(4)]
    suffixes += ['"]}' + "}" * i for i in range(4)]

    for suffix in suffixes:
        result = _try_parse(fragment + suffix)
        if result:
            return result
    return None


def _walkback_repair(fragment: str):
    """
    For truncation mid-string-value: walk backwards from the end,
    trimming to the last complete structural boundary (comma or {).
    Then reapply suffix repair.
    """
    # Find candidate trim points: last occurrence of }, ], or ,
    # at the structural level (not inside a string)
    positions = []
    in_str = False
    esc    = False
    depth  = 0

    for i, ch in enumerate(fragment):
        if esc:             esc = False;   continue
        if ch == "\\" and in_str: esc = True; continue
        if ch == '"':
            in_str = not in_str
            continue
        if in_str:          continue
        if ch in "{[":      depth += 1
        elif ch in "}]":    depth -= 1
        if ch == "," and depth >= 1:
            positions.append(i)

    # Try trimming at each comma from the end (last complete field)
    for pos in reversed(positions[-6:]):   # only last 6 to stay fast
        trimmed = fragment[:pos]
        result = _suffix_repair(trimmed)
        if result:
            return result

    return None