// Store items available to redeem with credits.
// Rendered as emoji badges over the companion.
export interface StoreItem {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  slot: "head" | "neck" | "hand" | "eyes" | "body" | "beside";
  desc: string;
}

export const STORE: StoreItem[] = [
  { id: "coffee", name: "Steaming Chai Mug", emoji: "☕", cost: 20, slot: "hand", desc: "For the long nights." },
  { id: "plant", name: "Little Pothos", emoji: "🪴", cost: 25, slot: "beside", desc: "A tiny green friend." },
  { id: "sunglasses", name: "Cool Shades", emoji: "🕶️", cost: 40, slot: "eyes", desc: "Post-call swagger." },
  { id: "chain", name: "Gold Chain", emoji: "🪙", cost: 60, slot: "neck", desc: "Understated flex." },
  { id: "scarf", name: "Soft Scarf", emoji: "🧣", cost: 35, slot: "neck", desc: "For the AC in ICU." },
  { id: "cap", name: "Beanie", emoji: "🧢", cost: 30, slot: "head", desc: "Cover the bedhead." },
  { id: "book", name: "Harrison's Pocketbook", emoji: "📕", cost: 45, slot: "hand", desc: "Serious study." },
  { id: "bandana", name: "Bandana", emoji: "🧻", cost: 25, slot: "head", desc: "Warrior mode." },
  { id: "donut", name: "Sneaky Donut", emoji: "🍩", cost: 20, slot: "hand", desc: "Duty room morale." },
  { id: "cake", name: "Birthday Cake", emoji: "🎂", cost: 80, slot: "beside", desc: "Celebrate you." },
  { id: "medal", name: "Kindness Medal", emoji: "🏅", cost: 100, slot: "neck", desc: "The important award." },
  { id: "crown", name: "Little Crown", emoji: "👑", cost: 200, slot: "head", desc: "Ward royalty." },
];

export const MILESTONES: { weeks: number; emoji: string; label: string }[] = [
  { weeks: 12, emoji: "🩺", label: "3-month stethoscope" },
  { weeks: 26, emoji: "🥼", label: "6-month gown" },
  { weeks: 39, emoji: "🎓", label: "9-month cap" },
  { weeks: 52, emoji: "📜", label: "12-month diploma" },
];

export function activeMilestones(completedWeeks: number) {
  return MILESTONES.filter((m) => completedWeeks >= m.weeks);
}
