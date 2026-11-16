import { useEffect, type ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { backfillPresentDays, todayKey, useApp } from "@/lib/store";
import {
  ensureNotifWorker,
  initScheduler,
  requestNotifPermission,
  scheduleDailyCare,
} from "@/lib/notify";
import { canLogAttendance } from "@/lib/shift";
import { COMPANIONS } from "@/lib/data";
import { rotationForDate } from "@/lib/postings";
import { resumeStepCountingIfEnabled } from "@/lib/pedometer";

export function AppShell({ children }: { children: ReactNode }) {
  const app = useApp();
  const key = todayKey();
  const day = app.days[key];
  const water = app.water[key] ?? 0;
  const meals = (app.meals[key] ?? []).map((m) => `${m.type}:${m.note ?? ""}`).join(",");
  const prefsKey = JSON.stringify(app.notifPrefs);

  // Fill in forgotten attendance older than two weeks.
  useEffect(() => {
    backfillPresentDays();
  }, [app.onboarded, app.startDate]);

  // Keep counting steps if the user already allowed the motion sensor.
  useEffect(() => {
    if (app.onboarded) resumeStepCountingIfEnabled();
  }, [app.onboarded]);

  // Cozy daily nudges: hydration, meals, attendance.
  useEffect(() => {
    if (!app.onboarded) return;
    initScheduler();
    void ensureNotifWorker();
    void requestNotifPermission();

    const mealsLogged: Record<string, string | undefined> = {};
    (app.meals[key] ?? []).forEach((m) => {
      mealsLogged[m.type] = m.note?.trim() || m.type;
    });

    scheduleDailyCare({
      name: app.name,
      prefs: app.notifPrefs,
      posting: rotationForDate(app.rotations, key)?.name,
      companionName: COMPANIONS.find((c) => c.id === app.companion)?.name,
      attendanceOpensAt: canLogAttendance(app, key, key).opensAt,
      attendanceLogged: !!day,
      glasses: water,
      glassGoal: 8,
      mealsLogged,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.onboarded, app.name, key, !!day, water, meals, prefsKey]);

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background">
      <main className="flex-1 pb-28">{children}</main>
      <BottomNav />
    </div>
  );
}
