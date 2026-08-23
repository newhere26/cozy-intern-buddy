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
}


const KEY = "serenity.v1";

const defaultState: AppState = {
  onboarded: false,
  name: "",
  country: "India",
  city: "",
  college: "",
  startDate: new Date().toISOString().slice(0, 10),
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
  journal: [],
  ratings: {},
  todos: [],
  credits: 50,
  claimedDays: 0,
  ownedItems: [],
  equippedItems: [],
  ownedArt: ["14572"],
  activeArt: "14572",
  notifPrefs: {
    hydration: true,
    nourishment: true,
    attendance: true,
    hydrationFrequency: "normal",
    quietStart: "22:30",
    quietEnd: "07:00",
  },
  rotationReviews: {},
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
    parsed.ownedArt = parsed.ownedArt && parsed.ownedArt.length ? parsed.ownedArt : ["14572"];
    if (parsed.activeArt === undefined && parsed.ownedArt.includes("14572")) {
      parsed.activeArt = "14572";
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
export const todayKey = () => new Date().toISOString().slice(0, 10);

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

/** Dates that the two-week backfill filled in on the user's behalf. */
export function autoMarkedDays(s: AppState): string[] {
  return Object.entries(s.days)
    .filter(([, e]) => e.auto)
    .map(([d]) => d)
    .sort();
}
