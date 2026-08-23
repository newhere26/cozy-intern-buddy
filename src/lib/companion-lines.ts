// Human-sounding companion lines. Day & night pools + meal reactions.
// Selection is date-seeded so lines feel steady across a day.

import { getState } from "./store";
import { fullyCompletedWeeks, weeksSince, daysSince } from "./date";

export const DAY_LINES = [
  "Hey. How are you holding up today?",
  "Did you drink water yet? Just checking.",
  "Have you eaten something warm today?",
  "How did rounds go?",
  "How is your body feeling right now?",
  "You looked tired earlier. Are you okay?",
  "One deep breath before the next patient, if you can.",
  "Is there a case sitting with you today?",
  "What did you learn today, even something tiny?",
  "You're doing more than you notice.",
  "I saw you carry a heavy morning. I'm proud of you.",
  "Any small win today? Tell me.",
  "How's the senior situation today?",
  "Would you like to sit for two minutes?",
  "Did you get to pee today? Genuine question.",
  "Chart can wait five minutes. Breathe.",
  "You don't have to be composed for me.",
  "Any patient you're worrying about?",
  "Was lunch a whole meal or was it 'a bite'?",
  "Take off your stethoscope for a moment. Just for me.",
  "You're the same person who was funny last weekend, remember?",
  "Nothing about you needs fixing right now.",
  "One glass of water. Right now. Please.",
  "Tell me one soft thing from today.",
  "Did anyone thank you today? If not, I do.",
  "How's your back? Straighten up for a second.",
  "You can leave one message unread. It's okay.",
  "What was the kindest thing someone said to you today?",
  "Did you get even five minutes of fresh air?",
  "How is your heart after that emergency?",
  "What's one thing you want to leave behind when you leave the hospital today?",
  "You are learning a whole language of healing. Be patient with yourself.",
  "Remember to unclench your jaw and drop your shoulders.",
  "Did you manage to sit down during rounds?",
  "Who was the sweetest patient on your list today?",
];

export const NIGHT_LINES = [
  "I'm here. Corridors get quieter after 2am.",
  "You are not alone on this shift.",
  "Sip that coffee slowly. It's the only warm thing.",
  "The sun comes up. It always does.",
  "One patient at a time. That's all.",
  "You can sit for a minute between calls.",
  "Cold water on your wrists helps. Try it.",
  "Whatever you're holding right now, I'm holding it with you.",
  "The morning team will come. You're allowed to be tired.",
  "Whisper the plan to yourself. It'll come.",
  "Your hands are steadier than you think tonight.",
  "The seniors are sleeping. You're the one on watch. That is huge.",
  "This is the hard part of the job. You're doing it.",
  "Warm chai after this. That is the plan.",
  "You are not a machine. Sit down if you can.",
  "One more hour is one less hour. Softly.",
  "The lamp is on. I'm right here.",
  "Even quiet nights count. Even the boring ones.",
  "You saw something today no one else did. That matters.",
  "Dawn is closer than you think.",
  "Is there a patient keeping your thoughts busy tonight?",
  "How are you really feeling at this quiet hour?",
  "What's the hardest thing you handled so far on this duty?",
  "Did you drink any water since the shift started?",
  "What are you looking forward to doing once you reach home tomorrow?",
  "Is the casualty quiet right now, or is it non-stop?",
  "What's something you did tonight that you're quietly proud of?",
];

export const MEAL_LINES = [
  "Good. A whole meal is doctor's orders.",
  "Warm food. That was the right call.",
  "Look at you, being a person.",
  "That'll help. Even the small bites help.",
  "Proud of you for stopping.",
  "One less thing your body has to fight.",
  "I'll tell your future self thank you.",
  "That's how we keep going.",
  "Slow bites if you can. There's time.",
  "Thank you for feeding this body I care about.",
  "The chart can wait ten more minutes.",
  "That was overdue, wasn't it? Glad.",
  "This is how we last 54 weeks.",
  "You just gave yourself a little kindness.",
  "Even if it was cold, it counts.",
  "Real fuel. Not just caffeine. Good.",
  "The best interns eat lunch. Fact.",
  "That was maintenance. You're allowed maintenance.",
  "I noticed. Nice work.",
  "Chew if you can, please. No swallowing whole.",
  "The pager can survive a full plate.",
  "You just did something soft for yourself.",
  "That earns a real sit-down, if you can.",
  "Onwards. Well fed you is a better doctor.",
];

function seedIndex(seed: string, mod: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % mod;
}

export function progressLine(): string {
  const s = getState();
  const done = fullyCompletedWeeks(s.startDate);
  const cur = weeksSince(s.startDate);
  const total = s.durationWeeks || 54;
  const left = Math.max(0, total - done);
  const pct = Math.min(100, (done / total) * 100);
  const days = daysSince(s.startDate);
  const dayPct = ((1 / (total * 7)) * 100).toFixed(3);
  const options = [
    `You're ${done} weeks in. Only ${left} to go.`,
    `You're ${pct.toFixed(0)}% through your internship.`,
    `Every day is ${dayPct}% closer to done. Today counted.`,
    `Day ${days} of ${total * 7}. Softly forward.`,
    `${left} weeks left. That's a finite number.`,
    `Week ${cur} of ${total}. You are on the map.`,
  ];
  return options[seedIndex(new Date().toDateString() + "p", options.length)];
}

export function pickDailyLine(kind: "day" | "night"): string {
  const pool = kind === "night" ? NIGHT_LINES : DAY_LINES;
  const seed = new Date().toDateString() + kind;
  const idx = seedIndex(seed, pool.length + 3);
  // ~1 in 4 days give the progress line
  if (idx >= pool.length) return progressLine();
  return pool[idx];
}

export function pickCompanionLine(kind: "day" | "night"): string {
  const now = Date.now();
  const pool = kind === "night" ? NIGHT_LINES : DAY_LINES;
  // On tap: rotate through pool, occasionally sprinkle progress line
  if (Math.random() < 0.2) return progressLine();
  return pool[Math.floor((now / 1000) % pool.length)];
}

export function pickMealLine(): string {
  // Persist last 7 indices to avoid repeats within a week.
  const KEY = "serenity.mealLineHistory";
  let hist: number[] = [];
  try {
    hist = JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    /* ignore */
  }
  let idx = Math.floor(Math.random() * MEAL_LINES.length);
  let attempts = 0;
  while (hist.includes(idx) && attempts < 30) {
    idx = Math.floor(Math.random() * MEAL_LINES.length);
    attempts++;
  }
  hist = [idx, ...hist].slice(0, 7);
  try {
    localStorage.setItem(KEY, JSON.stringify(hist));
  } catch {
    /* ignore */
  }
  return MEAL_LINES[idx];
}
