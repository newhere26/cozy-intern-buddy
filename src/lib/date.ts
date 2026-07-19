const SUBCONTINENT = new Set([
  "India",
  "Pakistan",
  "Bangladesh",
  "Sri Lanka",
  "Nepal",
  "Bhutan",
  "Maldives",
]);

export function isSubcontinent(country: string) {
  return SUBCONTINENT.has(country);
}

export function fmtDate(iso: string, country: string) {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return isSubcontinent(country) ? `${dd}/${mm}/${yy}` : `${mm}/${dd}/${yy}`;
}

export function fmtShort(iso: string, country: string) {
  const d = new Date(iso + "T00:00:00");
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return isSubcontinent(country) ? `${dd}/${mm}` : `${mm}/${dd}`;
}

export function toKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function weeksSince(startISO: string) {
  const start = new Date(startISO + "T00:00:00").getTime();
  const now = Date.now();
  const diff = Math.max(0, now - start);
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
}

export function addDays(iso: string, n: number) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return toKey(d);
}

export function dayLabel(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}
