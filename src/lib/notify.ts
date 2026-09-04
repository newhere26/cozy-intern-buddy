import { getState, type NotifPrefs } from "./store";
import { toast } from "sonner";

// Lightweight browser notification scheduler with a persisted queue.
// Reminders survive reload (rescheduled on init). Best-effort: only fires
// while the browser is running.

interface QueueEntry {
  id: string;
  title: string;
  body: string;
  at: number; // epoch ms
  /** shows snooze actions when fired through the service worker */
  snoozable?: boolean;
}

const KEY = "serenity.notifyQueue";
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function loadQueue(): QueueEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function saveQueue(q: QueueEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(q));
  } catch {
    /* ignore */
  }
}

export async function requestNotifPermission() {
  if (typeof Notification === "undefined") return "denied";
  if (Notification.permission === "default") return await Notification.requestPermission();
  return Notification.permission;
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h)) return null;
  return h * 60 + (m || 0);
}

/** Format an epoch timestamp as h:mm A (e.g. 7:30 AM). */
export function formatTimeAmPm(epochMs: number): string {
  const d = new Date(epochMs);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

/**
 * Given a target timestamp and the user's notification prefs, pushes the time forward
 * to the exact moment quiet hours end if it lands inside quiet hours (handles midnight wrap).
 */
export function adjustTimeForQuietHours(targetMs: number, prefs?: NotifPrefs): number {
  const p = prefs ?? getState().notifPrefs;
  if (!p) return targetMs;
  const start = toMinutes(p.quietStart);
  const end = toMinutes(p.quietEnd);
  if (start == null || end == null || start === end) return targetMs;

  const d = new Date(targetMs);
  const mins = d.getHours() * 60 + d.getMinutes();
  const isQuiet = start < end ? mins >= start && mins < end : mins >= start || mins < end;

  if (!isQuiet) return targetMs;

  const endH = Math.floor(end / 60);
  const endM = end % 60;

  const adjusted = new Date(targetMs);
  if (start > end && mins >= start) {
    // Falls in late evening portion of midnight-wrapping quiet hours -> ends tomorrow morning
    adjusted.setDate(adjusted.getDate() + 1);
  }
  adjusted.setHours(endH, endM, 0, 0);

  // Guard against any edge case where adjusted time is in the past
  if (adjusted.getTime() <= targetMs) {
    adjusted.setDate(adjusted.getDate() + 1);
  }

  return adjusted.getTime();
}

function fire(e: QueueEntry) {
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    const sw = navigator.serviceWorker?.controller;
    if (e.snoozable && sw) {
      // Service worker notifications can carry snooze buttons.
      sw.postMessage({ type: "show", title: e.title, body: e.body, tag: e.id, snoozable: true });
    } else {
      try {
        new Notification(e.title, { body: e.body, tag: e.id });
      } catch {
        /* ignore */
      }
    }
  }
  removeFromQueue(e.id);
}

/**
 * Push a reminder forward by n minutes. Respects quiet hours and reports the next nudge time.
 * Returns the scheduled timestamp.
 */
export function snooze(
  entry: { id: string; title: string; body: string },
  minutes: number,
  prefs?: NotifPrefs,
): number {
  const p = prefs ?? getState().notifPrefs;
  const targetMs = Date.now() + minutes * 60_000;
  const finalAt = adjustTimeForQuietHours(targetMs, p);
  const timeStr = formatTimeAmPm(finalAt);

  try {
    toast(`Okay — I'll nudge you again at ${timeStr}.`);
  } catch {
    /* ignore */
  }

  const baseBody = entry.body.replace(/\s*\(Next nudge at [^)]+\)/, "");
  const nextBody = `${baseBody} (Next nudge at ${timeStr})`;

  schedule([
    {
      id: `${entry.id}:snoozed:${Date.now()}`,
      title: entry.title,
      body: nextBody,
      at: finalAt,
      snoozable: true,
    },
  ]);

  return finalAt;
}

let swReady = false;
/** Registers the notification service worker (needed for snooze buttons). */
export async function ensureNotifWorker() {
  if (swReady || typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  swReady = true;
  try {
    await navigator.serviceWorker.register("/notif-sw.js");
    navigator.serviceWorker.addEventListener("message", (ev) => {
      const d = ev.data || {};
      if (d.type === "snooze") {
        snooze(
          { id: String(d.tag ?? "care"), title: d.title || "Gentle reminder", body: d.body || "" },
          Number(d.minutes) || 30,
        );
      }
    });
  } catch {
    swReady = false;
  }
}

function armEntry(e: QueueEntry) {
  const delay = e.at - Date.now();
  if (delay <= 0) {
    fire(e);
    return;
  }
  // setTimeout max ~24.8 days; we cap at 24h anyway.
  const t = setTimeout(() => fire(e), delay);
  timers.set(e.id, t);
}

function removeFromQueue(id: string) {
  const t = timers.get(id);
  if (t) clearTimeout(t);
  timers.delete(id);
  const q = loadQueue().filter((x) => x.id !== id);
  saveQueue(q);
}

export function schedule(entries: QueueEntry[]) {
  const q = [...loadQueue(), ...entries];
  saveQueue(q);
  entries.forEach(armEntry);
}

export function cancelByPrefix(prefix: string) {
  const q = loadQueue();
  q.filter((e) => e.id.startsWith(prefix)).forEach((e) => removeFromQueue(e.id));
}

export function initScheduler() {
  if (typeof window === "undefined") return;
  const now = Date.now();
  const q = loadQueue().filter((e) => e.at > now - 60_000); // drop very old
  saveQueue(q);
  q.forEach(armEntry);
}

// ---- Todo reminder ladder ----
const LADDER_MIN = [3, 5, 15, 60, 180, 300, 420, 540, 660, 780, 900, 1020, 1140, 1260, 1440];

export function scheduleTodoLadder(id: string, text: string) {
  cancelByPrefix(`todo:${id}:`);
  const now = Date.now();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const entries: QueueEntry[] = [];
  LADDER_MIN.forEach((m, i) => {
    const at = now + m * 60_000;
    if (at > endOfDay.getTime()) return;
    entries.push({
      id: `todo:${id}:${i}`,
      title: "Gentle nudge",
      body: text,
      at,
    });
  });
  schedule(entries);
}

export function cancelTodoLadder(id: string) {
  cancelByPrefix(`todo:${id}:`);
}

// ---- Daily cozy reminders (hydration, meals, attendance) ----


const HYDRATION_LINES = [
  (w: string) => `A few sips for me, ${w}? Your future self says thanks. 💧`,
  (w: string) => `Water break, ${w}. Just one glass, then back to it. 🫧`,
  () => `Hydration check — the ward can wait twenty seconds. 💧`,
  (w: string) => `Sip sip, ${w}. I'm holding your glass. 🥤`,
  () => `One glass of water and I'll stop nagging. Promise. 💧`,
  (w: string) => `Your hands have been busy all day, ${w}. Give them a warm cup. ☕`,
];

const MEAL_LINES: Record<string, (w: string) => string> = {
  breakfast: (w) => `Morning, ${w}. Something warm before rounds? 🍵`,
  lunch: (w) => `Lunch-ish o'clock, ${w}. Even five bites count. 🍲`,
  dinner: (w) => `Did you eat tonight, ${w}? Sit for a minute with me. 🍛`,
};

function pick<T>(arr: T[], seed: number) {
  return arr[Math.abs(seed) % arr.length];
}

function todayAt(hh: number, mm = 0) {
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d.getTime();
}

function futureOnly(entries: QueueEntry[]) {
  const now = Date.now();
  return entries.filter((e) => e.at > now + 30_000);
}

/** True when a timestamp falls inside the user's quiet hours (can wrap midnight). */
function inQuietHours(at: number, prefs: NotifPrefs) {
  const start = toMinutes(prefs.quietStart);
  const end = toMinutes(prefs.quietEnd);
  if (start == null || end == null || start === end) return false;
  const d = new Date(at);
  const mins = d.getHours() * 60 + d.getMinutes();
  return start < end ? mins >= start && mins < end : mins >= start || mins < end;
}

const HYDRATION_HOURS: Record<NotifPrefs["hydrationFrequency"], number[]> = {
  gentle: [11, 17],
  normal: [9, 12, 15, 18, 21],
  often: [8, 10, 12, 14, 16, 18, 20, 21],
};

export interface DailyCareContext {
  name?: string;
  prefs: NotifPrefs;
  posting?: string;
  companionName?: string;
  attendanceOpensAt?: string; // "HH:MM" midpoint of shift
  attendanceLogged?: boolean;
  glasses?: number;
  glassGoal?: number;
  /** meal type → what they wrote down, e.g. { lunch: "dal rice" } */
  mealsLogged?: Record<string, string | undefined>;
}

/** Reschedules today's hydration + meal + attendance nudges. Safe to call on app open. */
export function scheduleDailyCare(ctx: DailyCareContext) {
  cancelByPrefix("care:");

  const { prefs } = ctx;
  const who = ctx.name ? `Dr. ${ctx.name}` : "doctor";
  const glasses = ctx.glasses ?? 0;
  const goal = ctx.glassGoal ?? 8;
  const entries: QueueEntry[] = [];
  const daySeed = new Date().getDate();

  // Hydration through the waking day
  if (prefs.hydration && glasses < goal) {
    HYDRATION_HOURS[prefs.hydrationFrequency].forEach((h, i) => {
      const base = pick(HYDRATION_LINES, h + i + daySeed)(who);
      const progress =
        glasses > 0
          ? ` That's ${glasses} glass${glasses === 1 ? "" : "es"} today — ${goal - glasses} to go.`
          : "";
      entries.push({
        id: `care:water:${h}`,
        title: "A little water?",
        body: base + progress,
        at: todayAt(h, 30),
        snoozable: true,
      });
    });
  }

  // Meals
  if (prefs.nourishment) {
    ([
      ["breakfast", 8, 30, "lunch"],
      ["lunch", 13, 30, "dinner"],
      ["dinner", 20, 30, undefined],
    ] as const).forEach(([meal, h, m, next]) => {
      if (ctx.mealsLogged?.[meal] !== undefined) return;
      let body = MEAL_LINES[meal]?.(who) ?? `Please eat something, ${who}. 🍲`;
      // Mention what they last ate, when we know it.
      const prev = meal === "lunch" ? ctx.mealsLogged?.breakfast : meal === "dinner" ? ctx.mealsLogged?.lunch : undefined;
      if (prev) body = `You had ${prev} earlier — ${meal} too? 🍲`;
      if (ctx.posting) body += ` ${ctx.posting} runs long.`;
      entries.push({
        id: `care:meal:${meal}`,
        title: "Something to eat",
        body,
        at: todayAt(h, m),
        snoozable: true,
      });
      void next;
    });
  }

  // Attendance: just after logging unlocks, plus an evening catch-all
  if (prefs.attendance && !ctx.attendanceLogged) {
    if (ctx.attendanceOpensAt) {
      const [h, m] = ctx.attendanceOpensAt.split(":").map(Number);
      if (!Number.isNaN(h)) {
        entries.push({
          id: "care:attendance:open",
          title: "Attendance",
          body: `Halfway through${ctx.posting ? ` ${ctx.posting}` : ""}, ${who}. Want to mark today in the calendar? 🗓️`,
          at: todayAt(h, (m ?? 0) + 15),
          snoozable: true,
        });
      }
    }
    entries.push({
      id: "care:attendance:evening",
      title: "Attendance",
      body: `Before you rest, ${who} — today isn't marked yet. One tap and ${ctx.companionName ?? "I"} will tuck it away. 🌙`,
      at: todayAt(21, 30),
      snoozable: true,
    });
  }

  schedule(futureOnly(entries).filter((e) => !inQuietHours(e.at, prefs)));
}

export function cancelCareReminder(kind: "water" | "meal" | "attendance") {
  cancelByPrefix(`care:${kind}`);
}

/**
 * Fires an immediate sample notification for testing.
 * Bypasses quiet hours (user-initiated) and includes snooze buttons.
 */
export async function sendTestNotification(
  kind: "hydration" | "nourishment" | "attendance",
  ctx?: Partial<DailyCareContext>,
): Promise<{ success: boolean; reason?: "denied" | "unsupported" }> {
  if (typeof Notification === "undefined") {
    return { success: false, reason: "unsupported" };
  }
  const perm = await requestNotifPermission();
  if (perm !== "granted") {
    return { success: false, reason: "denied" };
  }

  await ensureNotifWorker();

  const state = getState();
  const who = ctx?.name || (state.name ? `Dr. ${state.name}` : "doctor");
  let title = "Gentle reminder";
  let body = "";

  if (kind === "hydration") {
    title = "A little water?";
    const lineFn = pick(HYDRATION_LINES, Math.floor(Math.random() * HYDRATION_LINES.length));
    body = lineFn(who);
  } else if (kind === "nourishment") {
    title = "Something to eat";
    const meals = ["breakfast", "lunch", "dinner"] as const;
    const m = meals[Math.floor(Math.random() * meals.length)];
    body = MEAL_LINES[m]?.(who) ?? `Please eat something, ${who}. 🍲`;
  } else {
    title = "Attendance";
    body = `Before you rest, ${who} — today isn't marked yet. One tap and ${ctx?.companionName || "I"} will tuck it away. 🌙`;
  }

  fire({
    id: `test:${kind}:${Date.now()}`,
    title,
    body,
    at: Date.now(),
    snoozable: true,
  });

  return { success: true };
}
