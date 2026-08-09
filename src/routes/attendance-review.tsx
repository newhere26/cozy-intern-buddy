import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ChevronLeft, Info } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { autoMarkedDays, clearDay, setDay, useApp } from "@/lib/store";
import type { DayStatus } from "@/lib/store";
import { fmtDate } from "@/lib/date";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/attendance-review")({
  head: () => ({
    meta: [
      { title: "Attendance review — Serenity" },
      {
        name: "description",
        content: "See which older days were marked present for you, and change any of them.",
      },
      { property: "og:title", content: "Attendance review — Serenity" },
      {
        property: "og:description",
        content: "See which older days were marked present for you, and change any of them.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AttendanceReviewPage,
});

const OPTIONS: { value: DayStatus; label: string }[] = [
  { value: "present", label: "Present" },
  { value: "cl", label: "CL" },
  { value: "pl", label: "PL" },
  { value: "absent", label: "Absent" },
];

function AttendanceReviewPage() {
  const app = useApp();
  const days = autoMarkedDays(app);

  const byMonth = useMemo(() => {
    const map = new Map<string, string[]>();
    days.forEach((d) => {
      const m = d.slice(0, 7);
      map.set(m, [...(map.get(m) ?? []), d]);
    });
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [days]);

  return (
    <AppShell>
      <div className="space-y-4 px-4 pt-6">
        <Link to="/journey" className="flex items-center gap-1 text-xs text-muted-foreground">
          <ChevronLeft className="h-3.5 w-3.5" /> Journey
        </Link>

        <div>
          <h1 className="font-display text-2xl text-foreground">Attendance review</h1>
          <p className="text-xs text-muted-foreground">
            Days you never got round to marking, filled in for you.
          </p>
        </div>

        <div className="flex gap-2 rounded-2xl bg-secondary/40 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Once a day is more than two weeks old and still blank, it's assumed you
            were present, so your weeks keep counting. Leaves and absences you
            logged yourself are never touched. Change anything here that isn't
            right — once you do, it stops being an auto-marked day.
          </p>
        </div>

        {byMonth.length === 0 && (
          <p className="rounded-3xl bg-card p-6 text-center text-xs text-muted-foreground">
            Nothing has been auto-marked. You've been keeping up.
          </p>
        )}

        {byMonth.map(([month, list]) => (
          <section key={month} className="rounded-3xl bg-card p-4">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-medium text-foreground">
                {new Date(month + "-01T00:00:00").toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <span className="text-[10px] text-muted-foreground">{list.length} days</span>
            </div>
            <div className="space-y-2.5">
              {list.map((d) => (
                <div key={d} className="rounded-2xl bg-secondary/30 p-2.5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs text-foreground">{fmtDate(d, app.country)}</span>
                    <button
                      onClick={() => clearDay(d)}
                      className="text-[10px] text-muted-foreground underline"
                    >
                      Leave it blank
                    </button>
                  </div>
                  <div className="flex gap-1.5">
                    {OPTIONS.map((o) => {
                      const active = app.days[d]?.status === o.value;
                      return (
                        <button
                          key={o.value}
                          onClick={() => setDay(d, { status: o.value })}
                          className={cn(
                            "flex-1 rounded-full py-1 text-[10px]",
                            active
                              ? "bg-primary text-primary-foreground"
                              : "border border-border text-muted-foreground",
                          )}
                        >
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
