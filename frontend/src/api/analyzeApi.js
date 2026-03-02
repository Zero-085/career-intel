const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

/**
 * Sends resume text or file + job description to backend
 */
export async function analyze({ resumeText, jdText, resumeFile }) {
  const formData = new FormData();

  if (resumeFile) {
    formData.append("resume_file", resumeFile);
  } else {
    formData.append("resume_text", resumeText);
  }

  formData.append("jd_text", jdText);

  const response = await fetch(`${BACKEND_URL}/api/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `Server error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.detail || errorMessage;
    } catch {
      // Ignore JSON parsing error
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}
