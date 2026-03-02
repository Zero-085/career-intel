/**
 * Returns a color class string based on a numeric score.
 */
export function scoreColor(score) {
  if (score >= 80) return "score--high";
  if (score >= 55) return "score--mid";
  return "score--low";
}

/**
 * Returns a color hex for radar chart lines.
 */
export function radarColor(key) {
  return key === "candidate" ? "#00f5c4" : "#7c6af7";
}

/**
 * Capitalize first letter of a string.
 */
export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Clamp a number between min and max.
 */
export function clamp(val, min = 0, max = 100) {
  return Math.min(max, Math.max(min, val));
}
