import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckSquare, ChevronLeft, Info, Square, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { autoMarkedDays, clearDay, setDay, useApp } from "@/lib/store";
import type { DayStatus } from "@/lib/store";
import { fmtDate } from "@/lib/date";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/attendance-review")({
  head: () => ({
    meta: [
      { title: "Attendance review — WithYou" },
      {
        name: "description",
        content: "See which older days were marked present for you, and change any of them.",
      },
      { property: "og:title", content: "Attendance review — WithYou" },
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

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<string | null>(null);

  const byMonth = useMemo(() => {
    const map = new Map<string, string[]>();
    days.forEach((d) => {
      const m = d.slice(0, 7);
      map.set(m, [...(map.get(m) ?? []), d]);
    });
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [days]);

  const allSelected = days.length > 0 && selected.size === days.length;

  const toggleOne = (date: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const toggleMonth = (list: string[]) => {
    const allInMonth = list.every((d) => selected.has(d));
    setSelected((prev) => {
      const next = new Set(prev);
      list.forEach((d) => {
        if (allInMonth) next.delete(d);
        else next.add(d);
      });
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(days));
    }
  };

  const handleBulkPresent = () => {
    const count = selected.size;
    if (count === 0) return;
    selected.forEach((d) => setDay(d, { status: "present" }));
    setSelected(new Set());
    setFeedback(`Marked ${count} day${count === 1 ? "" : "s"} as Present.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleBulkClear = () => {
    const count = selected.size;
    if (count === 0) return;
    selected.forEach((d) => clearDay(d));
    setSelected(new Set());
    setFeedback(`Cleared ${count} day${count === 1 ? "" : "s"} (left blank).`);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <AppShell>
      <div className="space-y-4 px-4 pt-6 pb-12">
        <Link to="/journey" className="flex items-center gap-1 text-xs text-muted-foreground">
          <ChevronLeft className="h-3.5 w-3.5" /> Journey
        </Link>

        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl text-foreground">Attendance review</h1>
            <p className="text-xs text-muted-foreground">
              Days you never got round to marking, filled in for you.
            </p>
          </div>
          {days.length > 0 && (
            <button
              onClick={toggleAll}
              className="mt-1 flex shrink-0 items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-secondary/40"
            >
              {allSelected ? (
                <>
                  <CheckSquare className="h-3 w-3 text-primary" /> Deselect all
                </>
              ) : (
                <>
                  <Square className="h-3 w-3 text-muted-foreground" /> Select all ({days.length})
                </>
              )}
            </button>
          )}
        </div>

        {feedback && (
          <div className="flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/10 px-3.5 py-2.5 text-xs font-medium text-primary animate-in fade-in slide-in-from-top-2">
            <span>{feedback}</span>
            <button onClick={() => setFeedback(null)} className="p-0.5 opacity-70 hover:opacity-100">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

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

        {byMonth.map(([month, list]) => {
          const monthAllSelected = list.every((d) => selected.has(d));
          return (
            <section key={month} className="rounded-3xl bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-medium text-foreground">
                  {new Date(month + "-01T00:00:00").toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{list.length} days</span>
                  <button
                    onClick={() => toggleMonth(list)}
                    className="rounded-full border border-border/70 bg-secondary/30 px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {monthAllSelected ? "Deselect month" : "Select month"}
                  </button>
                </div>
              </div>
              <div className="space-y-2.5">
                {list.map((d) => {
                  const isChecked = selected.has(d);
                  return (
                    <div
                      key={d}
                      className={cn(
                        "rounded-2xl border p-2.5 transition-colors",
                        isChecked
                          ? "border-primary/50 bg-primary/5"
                          : "border-transparent bg-secondary/30",
                      )}
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleOne(d)}
                            className="h-3.5 w-3.5 rounded accent-primary cursor-pointer"
                          />
                          <span className="text-xs font-medium text-foreground">
                            {fmtDate(d, app.country)}
                          </span>
                        </label>
                        <button
                          onClick={() => clearDay(d)}
                          className="text-[10px] text-muted-foreground underline hover:text-foreground"
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
                                "flex-1 rounded-full py-1 text-[10px] font-medium transition-colors",
                                active
                                  ? "bg-primary text-primary-foreground shadow-xs"
                                  : "border border-border text-muted-foreground hover:bg-secondary/50",
                              )}
                            >
                              {o.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Sticky Action Bar when items are selected */}
        {selected.size > 0 && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40 animate-in fade-in slide-in-from-bottom-4">
            <div className="rounded-2xl border border-border/80 bg-card/95 p-3 shadow-xl backdrop-blur-md">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  {selected.size} day{selected.size === 1 ? "" : "s"} selected
                </span>
                <button
                  onClick={() => setSelected(new Set())}
                  className="text-[11px] text-muted-foreground hover:underline"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkPresent}
                  className="flex-1 rounded-xl bg-primary py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-opacity hover:opacity-90 active:scale-98"
                >
                  Mark Present
                </button>
                <button
                  onClick={handleBulkClear}
                  className="flex-1 rounded-xl border border-border bg-secondary/60 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary active:scale-98"
                >
                  Leave blank
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

