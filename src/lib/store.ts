import { useSyncExternalStore } from "react";

export type CompanionId = "capybara" | "cow" | "owl";
export type ThemeId = "sage" | "lavender" | "rose" | "ocean" | "cocoa" | "mist";
export type DayStatus = "present" | "cl" | "pl" | "absent";
export type Supervision = "observed" | "assisted" | "independent";

export interface DayEntry {
  status: DayStatus;
  night?: boolean;
  /** true when filled in automatically by the two-week backfill */
  auto?: boolean;
}

export type NudgeFrequency = "gentle" | "normal" | "often";

export interface NotifPrefs {
  hydration: boolean;
  nourishment: boolean;
  attendance: boolean;
  hydrationFrequency: NudgeFrequency;
  quietStart: string; // HH:MM
  quietEnd: string; // HH:MM
}

export interface Rotation {
  id: string;
  name: string;
  start: string; // YYYY-MM-DD
  end: string;
  checkIn?: string; // HH:MM
  checkOut?: string;
}

export interface ProcedureLog {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  ease: number;
  confidence: number;
  supervision: Supervision;
  notes?: string;
}

export interface Meal {
  id: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  note?: string;
  at: string; // ISO
}

export interface JournalEntry {
  id: string;
  date: string;
  title?: string;
  text: string;
  prompt?: string;
  procedureIds?: string[];
  rotationId?: string;
  rating?: number; // 1-5
}

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  remind?: boolean;
  createdAt?: string;
}

export interface RotationReview {
  felt: number; // 1-5
  learned: number; // 1-5
  pgInterest: number; // 1-5
  note?: string;
  at: string; // ISO
}


export interface WorkHours {
  checkIn?: string; // HH:MM
  checkOut?: string; // HH:MM
  totalHours?: number;
  note?: string;
}

export interface AppState {
  onboarded: boolean;
  name: string;
  country: string;
  city: string;
  college: string;
  startDate: string;
  durationWeeks: number;
  clAllotted: number;
  plAllotted: number;
  extPerPl: number;
  extPerAbsent: number;
  checkIn: string;
  checkOut: string;
  nightStart: string;
  nightEnd: string;
  postDutyOff: boolean;
  companion: CompanionId;
  theme: ThemeId;
  days: Record<string, DayEntry>;
  rotations: Rotation[];
  procedures: ProcedureLog[];
  meals: Record<string, Meal[]>;
  water: Record<string, number>;
  steps: Record<string, number>;
  workHours: Record<string, WorkHours>;
  stepGoal: number;
  /** true once the user has allowed motion sensors for automatic step counting */
  stepTracking: boolean;
  /** seconds spent in the breathing space, per local day (YYYY-MM-DD) */
  breathSeconds: Record<string, number>;
  journal: JournalEntry[];
  ratings: Record<string, number>;
  todos: Todo[];
  nightShiftUntil?: string; // ISO
  credits: number;
  claimedDays: number;
  ownedItems: string[];
  equippedItems: string[];
  ownedArt: string[];
  activeArt?: string;
  notifPrefs: NotifPrefs;
  rotationReviews: Record<string, RotationReview>;
  animationsEnabled: boolean;
}


const KEY = "serenity.v1";

const defaultState: AppState = {
  onboarded: false,
  name: "",
  country: "India",
  city: "",
  college: "",
  startDate: (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })(),
  durationWeeks: 54,
  clAllotted: 12,
  plAllotted: 15,
  extPerPl: 2,
  extPerAbsent: 3,
  checkIn: "08:00",
  checkOut: "16:00",
  nightStart: "16:00",
  nightEnd: "08:00",
  postDutyOff: false,
  companion: "capybara",
  theme: "sage",
  days: {},
  rotations: [],
  procedures: [],
  meals: {},
  water: {},
  steps: {},
  workHours: {},
  stepGoal: 6000,
  stepTracking: false,
  breathSeconds: {},
  journal: [],
  ratings: {},
  todos: [],
  credits: 50,
  claimedDays: 0,
  ownedItems: [],
  equippedItems: [],
  ownedArt: ["water-lilies"],
  activeArt: "water-lilies",
  notifPrefs: {
    hydration: true,
    nourishment: true,
    attendance: true,
    hydrationFrequency: "normal",
    quietStart: "22:30",
    quietEnd: "07:00",
  },
  rotationReviews: {},
  animationsEnabled: true,
};


/** Costs of the retired emoji-accessory store, used to refund old purchases. */
const LEGACY_ITEM_COSTS: Record<string, number> = {
  coffee: 20, plant: 25, sunglasses: 40, chain: 60, scarf: 35, cap: 30,
  book: 45, bandana: 25, donut: 20, cake: 80, medal: 100, crown: 200,
};

let state: AppState = load();
const listeners = new Set<() => void>();

function load(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState;
    const parsed = { ...defaultState, ...JSON.parse(raw) } as AppState;
    parsed.notifPrefs = { ...defaultState.notifPrefs, ...(parsed.notifPrefs ?? {}) };
    if (parsed.ownedArt?.includes("14572")) {
      parsed.ownedArt = parsed.ownedArt.map((id) => (id === "14572" ? "water-lilies" : id));
    }
    if (parsed.activeArt === "14572") {
      parsed.activeArt = "water-lilies";
    }
    parsed.ownedArt = parsed.ownedArt && parsed.ownedArt.length ? parsed.ownedArt : ["water-lilies"];
    if (parsed.activeArt === undefined) {
      parsed.activeArt = "water-lilies";
    }
    // Retired companions fall back to the capybara.
    if (!["capybara", "cow", "owl"].includes(parsed.companion)) {
      parsed.companion = "capybara";
    }
    // Accessory store retired: refund anything previously bought.
    if (parsed.ownedItems?.length) {
      const refund = parsed.ownedItems.reduce(
        (sum, id) => sum + (LEGACY_ITEM_COSTS[id] ?? 25),
        0,
      );
      parsed.credits += refund;
      parsed.ownedItems = [];
      parsed.equippedItems = [];
    }
    return parsed;
  } catch {
    return defaultState;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export function getState(): AppState {
  return state;
}

export function setState(patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) {
  const p = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...p };
  persist();
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(defaultState),
  );
}

export function useApp(): AppState {
  return useStore((s) => s);
}

// helpers ---------
/** Local calendar date (YYYY-MM-DD). Not UTC: in India, UTC would give "yesterday" until 5:30am. */
export const localDateKey = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const todayKey = () => localDateKey();

export function bumpBreathSeconds(date: string, delta: number) {
  setState((s) => ({
    breathSeconds: { ...s.breathSeconds, [date]: (s.breathSeconds[date] ?? 0) + delta },
  }));
}

/**
 * For someone who joins after their internship began: fill days that have no
 * step data yet with an average the user typed in. Real days are never touched.
 */
export function backfillSteps(avgPerDay: number) {
  const s = state;
  if (!s.startDate || avgPerDay <= 0) return 0;
  const start = new Date(s.startDate + "T00:00:00");
  if (Number.isNaN(start.getTime())) return 0;
  const yesterday = new Date();
  yesterday.setHours(0, 0, 0, 0);
  yesterday.setDate(yesterday.getDate() - 1);
  const patch: Record<string, number> = {};
  for (const d = new Date(start); d <= yesterday; d.setDate(d.getDate() + 1)) {
    const key = localDateKey(d);
    if (s.steps[key] === undefined) patch[key] = Math.round(avgPerDay);
  }
  const n = Object.keys(patch).length;
  if (n > 0) setState((cur) => ({ steps: { ...patch, ...cur.steps } }));
  return n;
}

export function setDay(date: string, entry: Partial<DayEntry>) {
  setState((s) => {
    const prev = s.days[date];
    const next: DayEntry = {
      // a manual edit clears the auto-marked flag
      status: entry.status ?? prev?.status ?? "present",
      night: entry.night ?? prev?.night,
    };
    return { days: { ...s.days, [date]: next } };
  });
}

export function addProcedure(p: Omit<ProcedureLog, "id">) {
  setState((s) => ({
    procedures: [{ ...p, id: crypto.randomUUID() }, ...s.procedures],
  }));
}

export function addMeal(date: string, meal: Omit<Meal, "id" | "at">) {
  setState((s) => ({
    meals: {
      ...s.meals,
      [date]: [
        ...(s.meals[date] ?? []),
        { ...meal, id: crypto.randomUUID(), at: new Date().toISOString() },
      ],
    },
  }));
}

export function bumpWater(date: string, delta: number) {
  setState((s) => ({
    water: { ...s.water, [date]: Math.max(0, (s.water[date] ?? 0) + delta) },
  }));
}

export function addRotation(r: Omit<Rotation, "id">) {
  setState((s) => ({
    rotations: [...s.rotations, { ...r, id: crypto.randomUUID() }],
  }));
}

export function removeRotation(id: string) {
  setState((s) => ({ rotations: s.rotations.filter((r) => r.id !== id) }));
}

export function addJournal(j: Omit<JournalEntry, "id">) {
  setState((s) => ({ journal: [{ ...j, id: crypto.randomUUID() }, ...s.journal] }));
}

export function updateJournal(id: string, patch: Partial<JournalEntry>) {
  setState((s) => ({
    journal: s.journal.map((j) => (j.id === id ? { ...j, ...patch } : j)),
  }));
}

export function removeJournal(id: string) {
  setState((s) => ({ journal: s.journal.filter((j) => j.id !== id) }));
}

export function setRating(date: string, r: number) {
  setState((s) => ({ ratings: { ...s.ratings, [date]: r } }));
}

export function addTodo(text: string) {
  const t = text.trim();
  if (!t) return;
  setState((s) => ({
    todos: [
      { id: crypto.randomUUID(), text: t, done: false, createdAt: new Date().toISOString() },
      ...s.todos,
    ],
  }));
}
export function toggleTodo(id: string) {
  setState((s) => ({ todos: s.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));
}
export function toggleTodoRemind(id: string) {
  setState((s) => ({ todos: s.todos.map((t) => (t.id === id ? { ...t, remind: !t.remind } : t)) }));
}
export function removeTodo(id: string) {
  setState((s) => ({ todos: s.todos.filter((t) => t.id !== id) }));
}

export function setNightShiftUntil(iso: string | undefined) {
  setState({ nightShiftUntil: iso });
}

export function addCredits(n: number) {
  setState((s) => ({ credits: s.credits + n }));
}
export function claimCredits(earned: number) {
  setState((s) => {
    const delta = Math.max(0, earned - s.claimedDays);
    if (delta === 0) return {};
    return { credits: s.credits + delta, claimedDays: earned };
  });
}
export function purchaseArt(id: string, cost: number) {
  setState((s) => {
    if (s.credits < cost || s.ownedArt.includes(id)) return {};
    return {
      credits: s.credits - cost,
      ownedArt: [...s.ownedArt, id],
      activeArt: id,
    };
  });
}

export function setActiveArt(id: string | undefined) {
  setState((s) => (id && !s.ownedArt.includes(id) ? {} : { activeArt: id }));
}

export function setNotifPrefs(patch: Partial<NotifPrefs>) {
  setState((s) => ({ notifPrefs: { ...s.notifPrefs, ...patch } }));
}

export function resetAll() {
  state = defaultState;
  persist();
  emit();
}

export function setRotationReview(
  rotationId: string,
  review: Omit<RotationReview, "at">,
) {
  setState((s) => ({
    rotationReviews: {
      ...s.rotationReviews,
      [rotationId]: { ...review, at: new Date().toISOString() },
    },
  }));
}

/**
 * Days older than two weeks that were never logged are assumed present,
 * so nobody loses credit for forgetting. Leaves/absences are never touched.
 */
export function backfillPresentDays() {
  const s = state;
  if (!s.onboarded || !s.startDate) return;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - 14);
  const start = new Date(s.startDate + "T00:00:00");
  if (Number.isNaN(start.getTime())) return;
  const patch: Record<string, DayEntry> = {};
  for (const d = new Date(start); d <= cutoff; d.setDate(d.getDate() + 1)) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!s.days[key]) patch[key] = { status: "present", auto: true };
  }
  if (Object.keys(patch).length === 0) return;
  setState((cur) => ({ days: { ...patch, ...cur.days } }));
}

/** Remove a day entry entirely (used by the attendance review). */
export function clearDay(date: string) {
  setState((s) => {
    if (!s.days[date]) return {};
    const days = { ...s.days };
    delete days[date];
    return { days };
  });
}

export function setSteps(date: string, count: number) {
  setState((s) => ({
    steps: { ...s.steps, [date]: Math.max(0, Math.round(count)) },
  }));
}

export function bumpSteps(date: string, delta: number) {
  setState((s) => {
    const cur = s.steps[date] ?? 0;
    return { steps: { ...s.steps, [date]: Math.max(0, cur + delta) } };
  });
}

export function setStepGoal(goal: number) {
  setState(() => ({ stepGoal: Math.max(1000, goal) }));
}

export function setAnimationsEnabled(enabled: boolean) {
  setState(() => ({ animationsEnabled: enabled }));
}

export function setWorkHours(
  date: string,
  hours: { checkIn?: string; checkOut?: string; totalHours?: number; note?: string },
) {
  setState((s) => ({
    workHours: {
      ...s.workHours,
      [date]: { ...s.workHours[date], ...hours },
    },
  }));
}

/**
 * Calculates work hours for a given day, checking actual log first then falling back to scheduled shift.
 */
export function calculateHoursForDay(app: AppState, dateKey: string): number {
  const actual = app.workHours[dateKey];
  if (actual?.totalHours !== undefined) return actual.totalHours;

  const day = app.days[dateKey];
  if (!day || day.status !== "present") return 0;

  const isNight = !!day.night;
  const rot = app.rotations.find((r) => dateKey >= r.start && dateKey <= r.end);

  const checkIn = actual?.checkIn || (isNight ? app.nightStart : rot?.checkIn || app.checkIn);
  const checkOut = actual?.checkOut || (isNight ? app.nightEnd : rot?.checkOut || app.checkOut);

  const [h1, m1] = (checkIn || "08:00").split(":").map(Number);
  const [h2, m2] = (checkOut || "16:00").split(":").map(Number);

  let startMin = h1 * 60 + m1;
  let endMin = h2 * 60 + m2;
  if (endMin <= startMin) endMin += 1440; // overnight

  return Math.round(((endMin - startMin) / 60) * 10) / 10;
}

/** Dates that the two-week backfill filled in on the user's behalf. */
export function autoMarkedDays(s: AppState): string[] {
  return Object.entries(s.days)
    .filter(([, e]) => e.auto)
    .map(([d]) => d)
    .sort();
}
