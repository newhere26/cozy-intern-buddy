// Lightweight browser notification scheduler with a persisted queue.
// Reminders survive reload (rescheduled on init). Best-effort: only fires
// while the browser is running.

interface QueueEntry {
  id: string;
  title: string;
  body: string;
  at: number; // epoch ms
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

function fire(e: QueueEntry) {
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    try {
      new Notification(e.title, { body: e.body, tag: e.id });
    } catch {
      /* ignore */
    }
  }
  removeFromQueue(e.id);
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
  "A few sips for me? Your future self says thanks. 💧",
  "Water break, doctor. Just one glass. 🫧",
  "Hydration check — the ward can wait 20 seconds. 💧",
  "Sip sip. I'm holding your glass. 🥤",
  "One glass of water, and I'll stop nagging. Promise. 💧",
];

const MEAL_LINES: Record<string, string> = {
  breakfast: "Morning, doctor. Something warm before rounds? 🍵",
  lunch: "Lunch-ish o'clock. Even five bites count. 🍲",
  dinner: "Did you eat tonight? Sit for a minute with me. 🍛",
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

/** Reschedules today's hydration + meal + attendance nudges. Safe to call on app open. */
export function scheduleDailyCare(opts: {
  name?: string;
  attendanceOpensAt?: string; // "HH:MM" midpoint of shift
  attendanceLogged?: boolean;
}) {
  cancelByPrefix("care:");

  const who = opts.name ? `Dr. ${opts.name}` : "doctor";
  const entries: QueueEntry[] = [];

  // Hydration through the waking day
  [9, 12, 15, 18, 21].forEach((h, i) => {
    entries.push({
      id: `care:water:${h}`,
      title: "A little water?",
      body: pick(HYDRATION_LINES, h + i),
      at: todayAt(h, 30),
    });
  });

  // Meals
  ([
    ["breakfast", 8, 30],
    ["lunch", 13, 30],
    ["dinner", 20, 30],
  ] as const).forEach(([meal, h, m]) => {
    entries.push({
      id: `care:meal:${meal}`,
      title: "Something to eat",
      body: MEAL_LINES[meal] ?? "Please eat something. 🍲",
      at: todayAt(h, m),
    });
  });

  // Attendance: just after logging unlocks, plus an evening catch-all
  if (!opts.attendanceLogged) {
    if (opts.attendanceOpensAt) {
      const [h, m] = opts.attendanceOpensAt.split(":").map(Number);
      if (!Number.isNaN(h)) {
        entries.push({
          id: "care:attendance:open",
          title: "Attendance",
          body: `Halfway through, ${who}. Want to mark today in the calendar? 🗓️`,
          at: todayAt(h, (m ?? 0) + 15),
        });
      }
    }
    entries.push({
      id: "care:attendance:evening",
      title: "Attendance",
      body: `Before you rest, ${who} — today isn't marked yet. Takes one tap. 🌙`,
      at: todayAt(21, 30),
    });
  }

  schedule(futureOnly(entries));
}

export function cancelCareReminder(kind: "water" | "meal" | "attendance") {
  cancelByPrefix(`care:${kind}`);
}
