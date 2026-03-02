const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

/**
 * Sends resume and job description to the backend for analysis.
 * @param {string} resume
 * @param {string} jd
 * @returns {Promise<object>} Parsed analysis result
 */
export async function analyzeResume(resume, jd) {
  const response = await fetch(`${BACKEND_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume, jd }),
  });

  if (!response.ok) {
    let errorMessage = `Server error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // response body wasn't JSON — keep default message
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data;
}
