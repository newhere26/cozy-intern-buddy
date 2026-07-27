// 20 distinct pastel color tokens for postings (rotations).
// Deterministic assignment by rotation index.
export const POSTING_COLORS: { bg: string; ring: string; text: string }[] = [
  { bg: "bg-rose-400/25", ring: "ring-rose-300/60", text: "text-rose-100" },
  { bg: "bg-amber-400/25", ring: "ring-amber-300/60", text: "text-amber-100" },
  { bg: "bg-yellow-400/25", ring: "ring-yellow-300/60", text: "text-yellow-100" },
  { bg: "bg-lime-400/25", ring: "ring-lime-300/60", text: "text-lime-100" },
  { bg: "bg-emerald-400/25", ring: "ring-emerald-300/60", text: "text-emerald-100" },
  { bg: "bg-teal-400/25", ring: "ring-teal-300/60", text: "text-teal-100" },
  { bg: "bg-cyan-400/25", ring: "ring-cyan-300/60", text: "text-cyan-100" },
  { bg: "bg-sky-400/25", ring: "ring-sky-300/60", text: "text-sky-100" },
  { bg: "bg-blue-400/25", ring: "ring-blue-300/60", text: "text-blue-100" },
  { bg: "bg-indigo-400/25", ring: "ring-indigo-300/60", text: "text-indigo-100" },
  { bg: "bg-violet-400/25", ring: "ring-violet-300/60", text: "text-violet-100" },
  { bg: "bg-purple-400/25", ring: "ring-purple-300/60", text: "text-purple-100" },
  { bg: "bg-fuchsia-400/25", ring: "ring-fuchsia-300/60", text: "text-fuchsia-100" },
  { bg: "bg-pink-400/25", ring: "ring-pink-300/60", text: "text-pink-100" },
  { bg: "bg-red-400/25", ring: "ring-red-300/60", text: "text-red-100" },
  { bg: "bg-orange-400/25", ring: "ring-orange-300/60", text: "text-orange-100" },
  { bg: "bg-stone-400/25", ring: "ring-stone-300/60", text: "text-stone-100" },
  { bg: "bg-slate-400/25", ring: "ring-slate-300/60", text: "text-slate-100" },
  { bg: "bg-zinc-400/25", ring: "ring-zinc-300/60", text: "text-zinc-100" },
  { bg: "bg-neutral-400/25", ring: "ring-neutral-300/60", text: "text-neutral-100" },
];

export function postingColor(index: number) {
  return POSTING_COLORS[index % POSTING_COLORS.length];
}

export function rotationForDate(
  rotations: { id: string; name: string; start: string; end: string }[],
  date: string,
) {
  return rotations.find((r) => date >= r.start && date <= r.end);
}
