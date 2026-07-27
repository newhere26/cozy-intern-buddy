export const LETTERS_ONLY = /^[A-Za-z][A-Za-z\s.'-]*$/;

export function isLettersOnly(v: string) {
  return v.trim().length > 0 && LETTERS_ONLY.test(v.trim());
}

export function sanitizeLetters(v: string) {
  return v.replace(/[^A-Za-z\s.'-]/g, "");
}

export function sanitizeInt(v: string) {
  return v.replace(/[^0-9]/g, "");
}

export function isPositiveInt(v: number | string) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n >= 0 && Number.isInteger(n);
}
