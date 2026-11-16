import type { AppState } from "@/lib/store";
import { toKey } from "@/lib/date";
import { FELT_EMOJI } from "@/components/PostingReview";

export interface Achievement {
  id: string;
  title: string;
  line: string;
  earned: boolean;
  meta?: string;
  emoji: string;
}

function daysBetween(a: string, b: string) {
  const d1 = new Date(a + "T00:00:00").getTime();
  const d2 = new Date(b + "T00:00:00").getTime();
  return Math.floor((d2 - d1) / 86_400_000);
}

export function buildAchievements(app: AppState): Achievement[] {
  const out: Achievement[] = [];
  const today = toKey(new Date());
  const procs = app.procedures;
  const dayEntries = Object.entries(app.days);

  // first night duty
  const nights = dayEntries.filter(([, e]) => e.night).map(([d]) => d).sort();
  out.push({
    id: "first-night",
    emoji: "🌙",
    title: "First night duty",
    line: nights.length
      ? "You stayed up, and morning still came."
      : "The first long night is still ahead.",
    earned: nights.length > 0,
    meta: nights[0],
  });
  if (nights.length >= 10)
    out.push({
      id: "ten-nights",
      emoji: "🕯️",
      title: "Ten nights kept",
      line: `${nights.length} night shifts logged.`,
      earned: true,
    });

  // procedures
  const byName = new Map<string, typeof procs>();
  procs.forEach((p) => {
    byName.set(p.name, [...(byName.get(p.name) ?? []), p]);
  });

  out.push({
    id: "first-procedure",
    emoji: "🩺",
    title: "First procedure logged",
    line: procs.length ? "Hands remember what books can't teach." : "Log your first one when it happens.",
    earned: procs.length > 0,
    meta: procs.length ? [...procs].sort((a, b) => a.date.localeCompare(b.date))[0]?.date : undefined,
  });

  [...byName.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([name, list]) => {
      const first = [...list].sort((a, b) => a.date.localeCompare(b.date))[0];
      out.push({
        id: `first-${name}`,
        emoji: "✨",
        title: `First ${name}`,
        line: `${list.length} logged so far.`,
        earned: true,
        meta: first?.date,
      });
    });

  const counts = [...byName.entries()].sort((a, b) => b[1].length - a[1].length);
  const topCount = counts[0]?.[1].length ?? 0;
  const tied = counts.filter(([, list]) => list.length === topCount);
  if (topCount > 0)
    out.push({
      id: "most-performed",
      emoji: "🏅",
      title: tied.length > 1 ? "Most performed procedures" : "Most performed procedure",
      line:
        tied.length > 1
          ? `${tied.map(([n]) => n).join(", ")} — ${topCount} times each.`
          : `${tied[0][0]} — ${topCount} times.`,
      earned: true,
    });

  const independent = procs.filter((p) => p.supervision === "independent");
  out.push({
    id: "first-independent",
    emoji: "🕊️",
    title: "First independent procedure",
    line: independent.length
      ? `${independent.length} done on your own.`
      : "One day it will be just you, and that's okay.",
    earned: independent.length > 0,
  });

  const byDay = new Map<string, number>();
  procs.forEach((p) => byDay.set(p.date, (byDay.get(p.date) ?? 0) + 1));
  const busiest = [...byDay.entries()].sort((a, b) => b[1] - a[1])[0];
  if (busiest)
    out.push({
      id: "busiest-day",
      emoji: "⚡",
      title: "Busiest hands",
      line: `${busiest[1]} procedures in one day.`,
      earned: true,
      meta: busiest[0],
    });

  [10, 25, 50, 100].forEach((n) =>
    out.push({
      id: `procs-${n}`,
      emoji: "📈",
      title: `${n} procedures`,
      line: `${procs.length} logged in total.`,
      earned: procs.length >= n,
    }),
  );

  // journal
  out.push({
    id: "first-journal",
    emoji: "📖",
    title: "First diary entry",
    line: app.journal.length ? `${app.journal.length} entries written.` : "Some days deserve words.",
    earned: app.journal.length > 0,
  });

  // reviews & posting rankings
  const reviewed = app.rotations
    .map((r) => ({ r, rev: app.rotationReviews[r.id] }))
    .filter((x) => x.rev);

  out.push({
    id: "first-review",
    emoji: "📝",
    title: "First posting reviewed",
    line: reviewed.length
      ? `${reviewed.length} postings looked back on.`
      : "Rate a posting when it ends.",
    earned: reviewed.length > 0,
  });

  const bestFelt = [...reviewed].sort((a, b) => b.rev!.felt - a.rev!.felt)[0];
  if (bestFelt)
    out.push({
      id: "happiest-posting",
      emoji: FELT_EMOJI[(bestFelt.rev!.felt ?? 3) - 1] ?? "🙂",
      title: "Happiest posting",
      line: `${bestFelt.r.name} felt the kindest.`,
      earned: true,
    });

  const bestPg = [...reviewed].sort((a, b) => b.rev!.pgInterest - a.rev!.pgInterest)[0];
  if (bestPg && bestPg.rev!.pgInterest >= 4)
    out.push({
      id: "pg-pull",
      emoji: "🎓",
      title: "Calling found",
      line: `${bestPg.r.name} — the one you'd choose for PG.`,
      earned: true,
    });

  const procsByPosting = new Map<string, number>();
  procs.forEach((p) => {
    const rot = app.rotations.find((r) => p.date >= r.start && p.date <= r.end);
    if (rot) procsByPosting.set(rot.name, (procsByPosting.get(rot.name) ?? 0) + 1);
  });
  const topPosting = [...procsByPosting.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topPosting)
    out.push({
      id: "hands-on-posting",
      emoji: "🔧",
      title: "Most hands-on posting",
      line: `${topPosting[0]} — ${topPosting[1]} procedures.`,
      earned: true,
    });

  // time milestones
  const daysIn = Math.max(0, daysBetween(app.startDate, today));
  ([
    [7, "First week", "🌱"],
    [30, "First month", "🌿"],
    [90, "Three months", "🌳"],
    [180, "Six months", "🌸"],
    [270, "Nine months", "🍂"],
    [365, "One full year", "🏆"],
  ] as const).forEach(([n, title, emoji]) =>
    out.push({
      id: `time-${n}`,
      emoji,
      title,
      line: `${daysIn} days into your internship.`,
      earned: daysIn >= n,
    }),
  );

  // wellness
  const bestWater = Math.max(0, ...Object.values(app.water));
  out.push({
    id: "hydration",
    emoji: "💧",
    title: "Eight glasses in a day",
    line: bestWater ? `Best day: ${bestWater} glasses.` : "Water counts as self-care.",
    earned: bestWater >= 8,
  });

  const mealDays = Object.values(app.meals).filter((m) => m.length >= 3).length;
  out.push({
    id: "three-meals",
    emoji: "🍲",
    title: "Three meals in a day",
    line: mealDays ? `${mealDays} days fully fed.` : "Warm food when you can.",
    earned: mealDays > 0,
  });

  // attendance streak
  const presentDays = dayEntries
    .filter(([, e]) => e.status === "present")
    .map(([d]) => d)
    .sort();
  let best = 0;
  let run = 0;
  for (let i = 0; i < presentDays.length; i++) {
    if (i > 0 && daysBetween(presentDays[i - 1]!, presentDays[i]!) === 1) run += 1;
    else run = 1;
    best = Math.max(best, run);
  }
  [7, 14, 30].forEach((n) =>
    out.push({
      id: `attendance-${n}`,
      emoji: "📅",
      title: `${n} days present in a row`,
      line: best ? `Longest quiet stretch: ${best} days.` : "No streaks here — just a note.",
      earned: best >= n,
    }),
  );

  // Only collected ones are shown; pending goals would just add noise.
  return out.filter((a) => a.earned);
}
