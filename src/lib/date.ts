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

// Current week number (1-indexed): week that is currently in progress.
export function weeksSince(startISO: string) {
  const start = new Date(startISO + "T00:00:00").getTime();
  const now = Date.now();
  const diff = Math.max(0, now - start);
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
}

// Fully completed weeks (0-indexed floor). Use in "X / N weeks done".
export function fullyCompletedWeeks(startISO: string) {
  const start = new Date(startISO + "T00:00:00").getTime();
  const now = Date.now();
  const diff = Math.max(0, now - start);
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
}

export function daysSince(startISO: string) {
  const start = new Date(startISO + "T00:00:00").getTime();
  const now = Date.now();
  const diff = Math.max(0, now - start);
  return Math.floor(diff / (24 * 60 * 60 * 1000)) + 1;
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

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

// Full weeks (Sun-start) covering the given month, padded with neighbouring days.
export function monthMatrix(year: number, month: number): { key: string; inMonth: boolean }[] {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const cells: { key: string; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({ key: toKey(d), inMonth: d.getMonth() === month });
    if (i >= 34 && d.getMonth() !== month && d > first) {
      // stop once the last full week containing the month is complete
      if ((i + 1) % 7 === 0) break;
    }
  }
  return cells;
}
