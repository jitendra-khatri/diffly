export const SESSION_STORAGE_KEY = "diffly:comparison:v1";

export function readSessionContent(storage, fallback) {
  try {
    const saved = JSON.parse(storage.getItem(SESSION_STORAGE_KEY));
    if (typeof saved?.original === "string" && typeof saved?.revised === "string") {
      return { original: saved.original, revised: saved.revised };
    }
  } catch {
    // Storage can be unavailable or contain invalid data. In either case, the
    // app remains usable with its normal initial content.
  }
  return { ...fallback };
}

export function writeSessionContent(storage, content) {
  try {
    storage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
      original: content.original,
      revised: content.revised,
    }));
    return true;
  } catch {
    // A full or disabled storage area should never prevent comparison.
    return false;
  }
}
