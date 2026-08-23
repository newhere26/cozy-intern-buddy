import { AppState, calculateHoursForDay } from "./store";

export interface PostingSummary {
  rotationId: string;
  name: string;
  startDate: string;
  endDate: string;
  daysPresent: number;
  nightShifts: number;
  totalHours: number;
  avgDailyHours: number;
  review?: {
    felt: number;
    learned: number;
    pgInterest: number;
    note?: string;
  };
}

export interface MonthlyRoundup {
  monthKey: string;
  label: string;
  daysPresent: number;
  nightShifts: number;
  totalHours: number;
  totalSteps: number;
  avgStepsPerDay: number;
  proceduresLogged: number;
  journalEntries: number;
  mealsLogged: number;
  waterGlasses: number;
}

export interface AnnualReport {
  internName: string;
  college?: string;
  city?: string;
  startDate: string;
  totalDaysLogged: number;
  totalDaysPresent: number;
  totalNightShifts: number;
  totalWorkHours: number;
  avgShiftHours: number;
  longestShiftHours: number;
  totalStepsWalked: number;
  estimatedKmWalked: number;
  topPostingFelt?: { name: string; score: number };
  topPostingLearned?: { name: string; score: number };
  topPostingPG?: { name: string; score: number };
  totalProcedures: number;
  topProcedures: { name: string; count: number }[];
  independentProcedures: number;
  journalEntriesCount: number;
  averageDiaryRating: number;
  postings: PostingSummary[];
  monthlyBreakdown: MonthlyRoundup[];
}

export function generateAnnualReport(app: AppState): AnnualReport {
  const dayKeys = Object.keys(app.days).sort();
  let totalDaysPresent = 0;
  let totalNightShifts = 0;
  let totalWorkHours = 0;
  let maxShiftHours = 0;

  const monthlyMap: Record<string, MonthlyRoundup> = {};

  for (const dateKey of dayKeys) {
    const day = app.days[dateKey];
    if (!day) continue;

    const monthKey = dateKey.slice(0, 7);
    if (!monthlyMap[monthKey]) {
      const [y, m] = monthKey.split("-").map(Number);
      const date = new Date(y, m - 1, 1);
      const label = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      monthlyMap[monthKey] = {
        monthKey,
        label,
        daysPresent: 0,
        nightShifts: 0,
        totalHours: 0,
        totalSteps: 0,
        avgStepsPerDay: 0,
        proceduresLogged: 0,
        journalEntries: 0,
        mealsLogged: 0,
        waterGlasses: 0,
      };
    }

    if (day.status === "present") {
      totalDaysPresent++;
      monthlyMap[monthKey].daysPresent++;

      const hours = calculateHoursForDay(app, dateKey);
      totalWorkHours += hours;
      monthlyMap[monthKey].totalHours += hours;
      if (hours > maxShiftHours) maxShiftHours = hours;
    }

    if (day.night) {
      totalNightShifts++;
      monthlyMap[monthKey].nightShifts++;
    }
  }

  let totalSteps = 0;
  for (const [dateKey, count] of Object.entries(app.steps)) {
    totalSteps += count;
    const monthKey = dateKey.slice(0, 7);
    if (monthlyMap[monthKey]) {
      monthlyMap[monthKey].totalSteps += count;
    }
  }

  for (const [dateKey, count] of Object.entries(app.water)) {
    const monthKey = dateKey.slice(0, 7);
    if (monthlyMap[monthKey]) monthlyMap[monthKey].waterGlasses += count;
  }

  for (const [dateKey, meals] of Object.entries(app.meals)) {
    const monthKey = dateKey.slice(0, 7);
    if (monthlyMap[monthKey]) monthlyMap[monthKey].mealsLogged += meals.length;
  }

  for (const proc of app.procedures) {
    const monthKey = proc.date.slice(0, 7);
    if (monthlyMap[monthKey]) monthlyMap[monthKey].proceduresLogged++;
  }

  for (const j of app.journal) {
    const monthKey = j.date.slice(0, 7);
    if (monthlyMap[monthKey]) monthlyMap[monthKey].journalEntries++;
  }

  for (const m of Object.values(monthlyMap)) {
    m.avgStepsPerDay = m.daysPresent > 0 ? Math.round(m.totalSteps / m.daysPresent) : 0;
    m.totalHours = Math.round(m.totalHours * 10) / 10;
  }

  const postings: PostingSummary[] = app.rotations.map((rot) => {
    let pDays = 0;
    let pNights = 0;
    let pHours = 0;

    for (const [dateKey, day] of Object.entries(app.days)) {
      if (dateKey >= rot.start && dateKey <= rot.end && day.status === "present") {
        pDays++;
        if (day.night) pNights++;
        pHours += calculateHoursForDay(app, dateKey);
      }
    }

    const review = app.rotationReviews[rot.id];

    return {
      rotationId: rot.id,
      name: rot.name,
      startDate: rot.start,
      endDate: rot.end,
      daysPresent: pDays,
      nightShifts: pNights,
      totalHours: Math.round(pHours * 10) / 10,
      avgDailyHours: pDays > 0 ? Math.round((pHours / pDays) * 10) / 10 : 0,
      review: review
        ? {
            felt: review.felt,
            learned: review.learned,
            pgInterest: review.pgInterest,
            note: review.note,
          }
        : undefined,
    };
  });

  let topFelt: { name: string; score: number } | undefined;
  let topLearned: { name: string; score: number } | undefined;
  let topPG: { name: string; score: number } | undefined;

  for (const p of postings) {
    if (p.review) {
      if (!topFelt || p.review.felt > topFelt.score) {
        topFelt = { name: p.name, score: p.review.felt };
      }
      if (!topLearned || p.review.learned > topLearned.score) {
        topLearned = { name: p.name, score: p.review.learned };
      }
      if (!topPG || p.review.pgInterest > topPG.score) {
        topPG = { name: p.name, score: p.review.pgInterest };
      }
    }
  }

  const procCounts: Record<string, number> = {};
  let independentCount = 0;
  for (const proc of app.procedures) {
    procCounts[proc.name] = (procCounts[proc.name] || 0) + 1;
    if (proc.supervision === "independent") independentCount++;
  }

  const topProcedures = Object.entries(procCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const ratedEntries = app.journal.filter((j) => typeof j.rating === "number" && j.rating > 0);
  const avgRating =
    ratedEntries.length > 0
      ? ratedEntries.reduce((acc, j) => acc + (j.rating || 0), 0) / ratedEntries.length
      : 0;

  const estimatedKm = Math.round(totalSteps * 0.00075);

  return {
    internName: app.name || "Doctor",
    college: app.college,
    city: app.city,
    startDate: app.startDate,
    totalDaysLogged: dayKeys.length,
    totalDaysPresent,
    totalNightShifts,
    totalWorkHours: Math.round(totalWorkHours * 10) / 10,
    avgShiftHours:
      totalDaysPresent > 0 ? Math.round((totalWorkHours / totalDaysPresent) * 10) / 10 : 0,
    longestShiftHours: maxShiftHours,
    totalStepsWalked: totalSteps,
    estimatedKmWalked: estimatedKm,
    topPostingFelt: topFelt,
    topPostingLearned: topLearned,
    topPostingPG: topPG,
    totalProcedures: app.procedures.length,
    topProcedures,
    independentProcedures: independentCount,
    journalEntriesCount: app.journal.length,
    averageDiaryRating: Math.round(avgRating * 10) / 10,
    postings,
    monthlyBreakdown: Object.values(monthlyMap).sort((a, b) =>
      a.monthKey.localeCompare(b.monthKey),
    ),
  };
}
