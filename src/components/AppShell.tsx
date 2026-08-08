import { useEffect, type ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { backfillPresentDays, todayKey, useApp } from "@/lib/store";
import { initScheduler, requestNotifPermission, scheduleDailyCare } from "@/lib/notify";
import { canLogAttendance } from "@/lib/shift";

export function AppShell({ children }: { children: ReactNode }) {
  const app = useApp();
  const key = todayKey();
  const day = app.days[key];
  const water = app.water[key] ?? 0;
  const meals = (app.meals[key] ?? []).map((m) => m.type).join(",");

  // Fill in forgotten attendance older than two weeks.
  useEffect(() => {
    backfillPresentDays();
  }, [app.onboarded, app.startDate]);

  // Cozy daily nudges: hydration, meals, attendance.
  useEffect(() => {
    if (!app.onboarded) return;
    initScheduler();
    void requestNotifPermission();
    scheduleDailyCare({
      name: app.name,
      attendanceOpensAt: canLogAttendance(app, key, key).opensAt,
      attendanceLogged: !!day,
      hydrated: water >= 8,
      mealsLogged: meals.split(",").filter(Boolean),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.onboarded, app.name, key, !!day, water >= 8, meals]);

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background">
      <main className="flex-1 pb-28">{children}</main>
      <BottomNav />
    </div>
  );
}
