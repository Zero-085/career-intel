"""
jd_scraper.py — Scrape job descriptions from ATS platform URLs.

Supported (open HTML):  Greenhouse, Lever, Ashby, Workday, generic fallback
Not supported:          LinkedIn, Indeed, Glassdoor (bot protection / login wall)
"""

import re
import ssl
import urllib.request
import urllib.error
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

BLOCKED = {
    "linkedin.com":     "LinkedIn blocks automated access. Please copy the JD text and paste it manually.",
    "indeed.com":       "Indeed blocks automated access. Please copy the JD text and paste it manually.",
    "glassdoor.com":    "Glassdoor blocks automated access. Please copy the JD text and paste it manually.",
    "ziprecruiter.com": "ZipRecruiter blocks automated access. Please copy the JD text and paste it manually.",
    "naukri.com":       "Naukri blocks automated access. Please copy the JD text and paste it manually.",
    "monster.com":      "Monster blocks automated access. Please copy the JD text and paste it manually.",
}


# ── Public API ────────────────────────────────────────────────────────────────

def scrape_jd(url: str) -> dict:
    """
    Returns:
      { success: True,  text, title, company, platform }
      { success: False, error, blocked: bool }
    """
    url = url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    domain = _domain(url)

    for blocked_domain, msg in BLOCKED.items():
        if blocked_domain in domain:
            return {"success": False, "error": msg, "blocked": True}

    if "greenhouse.io" in domain:
        return _greenhouse(url)
    if "lever.co" in domain:
        return _lever(url)
    if "ashbyhq.com" in domain:
        return _ashby(url)
    if "myworkdayjobs.com" in domain:
        return _workday(url)

    return _generic(url)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _domain(url: str) -> str:
    m = re.search(r"https?://([^/]+)", url)
    return m.group(1).lower() if m else ""


def _fetch(url: str) -> str:
    ctx = ssl.create_default_context()
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, context=ctx, timeout=12) as res:
        charset = res.headers.get_content_charset() or "utf-8"
        return res.read().decode(charset, errors="replace")


def _clean(text: str) -> str:
    lines = [l.strip() for l in text.splitlines()]
    out, prev_blank = [], False
    for line in lines:
        if not line:
            if not prev_blank:
                out.append("")
            prev_blank = True
        else:
            out.append(line)
            prev_blank = False
    return "\n".join(out).strip()


def _txt(el) -> str:
    return el.get_text(strip=True) if el else ""


# ── Platform scrapers ─────────────────────────────────────────────────────────

def _greenhouse(url: str) -> dict:
    try:
        soup = BeautifulSoup(_fetch(url), "html.parser")
        title   = soup.select_one("h1.app-title, .job__title, h1")
        company = soup.select_one(".company-name, .header--title")
        body    = soup.select_one("#content, .job-description, .job__description, .content")
        return {"success": True, "platform": "Greenhouse",
                "title": _txt(title), "company": _txt(company),
                "text": _clean(body.get_text("\n") if body else soup.get_text("\n"))}
    except Exception as e:
        return {"success": False, "error": f"Greenhouse scrape failed: {e}", "blocked": False}


def _lever(url: str) -> dict:
    try:
        soup = BeautifulSoup(_fetch(url), "html.parser")
        title   = soup.select_one(".posting-headline h2, h2")
        company = soup.select_one(".main-header-logo img")
        body    = soup.select_one(".posting-description, .content, .section-wrapper")
        return {"success": True, "platform": "Lever",
                "title": _txt(title),
                "company": company.get("alt", "") if company else "",
                "text": _clean(body.get_text("\n") if body else soup.get_text("\n"))}
    except Exception as e:
        return {"success": False, "error": f"Lever scrape failed: {e}", "blocked": False}


def _ashby(url: str) -> dict:
    try:
        soup = BeautifulSoup(_fetch(url), "html.parser")
        title = soup.select_one("h1")
        body  = soup.select_one(".ashby-job-posting-brief-description, main, article")
        return {"success": True, "platform": "Ashby",
                "title": _txt(title), "company": "",
                "text": _clean(body.get_text("\n") if body else soup.get_text("\n"))}
    except Exception as e:
        return {"success": False, "error": f"Ashby scrape failed: {e}", "blocked": False}


def _workday(url: str) -> dict:
    try:
        soup = BeautifulSoup(_fetch(url), "html.parser")
        title = soup.select_one("[data-automation-id='jobPostingHeader'], h1")
        body  = soup.select_one("[data-automation-id='jobPostingDescription'], .wd-text, main")
        return {"success": True, "platform": "Workday",
                "title": _txt(title), "company": "",
                "text": _clean(body.get_text("\n") if body else soup.get_text("\n"))}
    except Exception as e:
        return {"success": False, "error": f"Workday scrape failed: {e}", "blocked": False}


def _generic(url: str) -> dict:
    try:
        soup = BeautifulSoup(_fetch(url), "html.parser")
        for tag in soup(["script", "style", "nav", "footer", "header", "aside", "noscript", "iframe"]):
            tag.decompose()

        body = None
        for sel in ["article", ".job-description", "#job-description",
                    ".description", ".posting", "main", "#main-content", ".content"]:
            candidate = soup.select_one(sel)
            if candidate and len(candidate.get_text(strip=True)) > 200:
                body = candidate
                break

        title = soup.select_one("h1")
        text  = _clean(body.get_text("\n") if body else soup.get_text("\n"))

        if len(text.strip()) < 100:
            return {"success": False, "blocked": False,
                    "error": "Could not extract enough text from this URL. The page may require JavaScript or login. Please paste the JD text manually."}

        return {"success": True, "platform": "Generic",
                "title": _txt(title), "company": "",
                "text": text[:10000]}

    except urllib.error.HTTPError as e:
        blocked = e.code in (401, 403, 429)
        return {"success": False, "blocked": blocked,
                "error": f"HTTP {e.code} — {'site blocked the request' if blocked else str(e)}. Please paste the JD text manually."}
    except urllib.error.URLError as e:
        return {"success": False, "blocked": False, "error": f"Could not reach URL: {e}"}
    except Exception as e:
        return {"success": False, "blocked": False, "error": f"Scraping failed: {e}"}