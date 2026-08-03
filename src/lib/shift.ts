import type { AppState } from "@/lib/store";

function toMin(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function fmtMin(mins: number) {
  const m = ((mins % 1440) + 1440) % 1440;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}

/** Expected shift window for a given date, in minutes from that day's midnight. */
export function shiftWindow(app: AppState, dateKey: string) {
  const night = !!app.days[dateKey]?.night;
  const rot = app.rotations.find((r) => dateKey >= r.start && dateKey <= r.end);
  const start = night ? app.nightStart : rot?.checkIn || app.checkIn;
  const end = night ? app.nightEnd : rot?.checkOut || app.checkOut;
  const s = toMin(start);
  let e = toMin(end);
  if (e <= s) e += 1440; // crosses midnight
  return { start: s, end: e, half: s + (e - s) / 2 };
}

/** Attendance is only loggable once >50% of the expected shift has elapsed. */
export function canLogAttendance(app: AppState, dateKey: string, todayKey: string) {
  if (dateKey < todayKey) return { allowed: true, opensAt: "" };
  if (dateKey > todayKey) return { allowed: false, opensAt: "" };
  const { half } = shiftWindow(app, dateKey);
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const allowed = nowMin >= half || nowMin + 1440 >= half;
  return { allowed: nowMin >= half % 1440 ? true : allowed && half < 1440 ? false : allowed, opensAt: fmtMin(half) };
}
