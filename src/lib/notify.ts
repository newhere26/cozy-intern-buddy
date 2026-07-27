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
