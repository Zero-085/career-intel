import { useState } from "react";
import { analyze as analyzeApi } from "../api/analyzeApi.js";

/**
 * Custom hook that encapsulates all state and logic for the analysis flow.
 */
export function useAnalysis() {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async () => {
    if (!resume.trim() || !jd.trim()) {
      setError("Please paste both your resume and the job description.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeApi({
        resumeText: resume,
        jdText: jd,
        resumeFile: null,
      });
      setResult(data);
    } catch (err) {
      setError(
        err.message || "An unexpected error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResume("");
    setJd("");
    setResult(null);
    setError(null);
    setLoading(false);
  };

  return {
    resume,
    setResume,
    jd,
    setJd,
    result,
    loading,
    error,
    analyze,
    reset,
  };
}
