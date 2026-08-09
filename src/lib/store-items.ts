// Milestone gear the companion earns over the internship.
// (The purchasable emoji-accessory store was retired in favour of art backdrops.)

export const MILESTONES: { weeks: number; emoji: string; label: string }[] = [
  { weeks: 12, emoji: "🩺", label: "3-month stethoscope" },
  { weeks: 26, emoji: "🥼", label: "6-month gown" },
  { weeks: 39, emoji: "🎓", label: "9-month cap" },
  { weeks: 52, emoji: "📜", label: "12-month diploma" },
];

export function activeMilestones(completedWeeks: number) {
  return MILESTONES.filter((m) => completedWeeks >= m.weeks);
}
