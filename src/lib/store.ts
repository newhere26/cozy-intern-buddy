import { useSyncExternalStore } from "react";

export type CompanionId = "capybara" | "redpanda" | "cow" | "turtle" | "owl";
export type ThemeId = "sage" | "lavender" | "rose" | "ocean" | "cocoa" | "mist";
export type DayStatus = "present" | "cl" | "pl" | "absent";
export type Supervision = "observed" | "assisted" | "independent";

export interface DayEntry {
  status: DayStatus;
  night?: boolean;
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
  text: string;
  prompt?: string;
  procedureIds?: string[];
}

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  remind?: boolean;
}

export interface AppState {
  onboarded: boolean;
  name: string;
  country: string;
  city: string;
  startDate: string;
  durationWeeks: number;
  clAllotted: number;
  plAllotted: number;
  checkIn: string;
  checkOut: string;
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
}

const KEY = "serenity.v1";

const defaultState: AppState = {
  onboarded: false,
  name: "",
  country: "India",
  city: "",
  startDate: new Date().toISOString().slice(0, 10),
  durationWeeks: 54,
  clAllotted: 12,
  plAllotted: 15,
  checkIn: "09:00",
  checkOut: "17:00",
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
};

let state: AppState = load();
const listeners = new Set<() => void>();

function load(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
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

export function setRating(date: string, r: number) {
  setState((s) => ({ ratings: { ...s.ratings, [date]: r } }));
}

export function addTodo(text: string) {
  const t = text.trim();
  if (!t) return;
  setState((s) => ({ todos: [{ id: crypto.randomUUID(), text: t, done: false }, ...s.todos] }));
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

export function resetAll() {
  state = defaultState;
  persist();
  emit();
}
