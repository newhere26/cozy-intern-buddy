import { CalendarDays, ChevronRight, MoonStar } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { addDays, dayLabel, fmtShort, fullyCompletedWeeks, toKey } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { DayStatus } from "@/lib/store";

const STATUS_STYLES: Record<DayStatus, string> = {
  present: "bg-present/80 text-background",
  cl: "bg-cl/80 text-background",
  pl: "bg-pl/80 text-background",
  absent: "bg-absent/60 text-background",
};

const STATUS_LABEL: Record<DayStatus, string> = {
  present: "P",
  cl: "CL",
  pl: "PL",
  absent: "A",
};

export function CalendarTile() {
  const app = useApp();
  const today = toKey(new Date());
  const done = fullyCompletedWeeks(app.startDate);
  const total = app.durationWeeks;

  return (
    <Link
      to="/calendar"
      className="block rounded-3xl bg-card p-4 shadow-sm active:scale-[0.98] transition-transform"
    >
      <div className="flex w-full items-start justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Calendar</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="mt-3">
        <div className="font-display text-3xl leading-none text-foreground">
          {done}
          <span className="text-lg text-muted-foreground"> / {total}</span>
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">weeks done</div>

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {[-2, -1, 0].map((offset) => {
            const key = addDays(today, offset);
            const status = app.days[key]?.status;
            const night = app.days[key]?.night;
            return (
              <div
                key={key}
                className={cn(
                  "flex flex-col items-center rounded-xl border border-border/60 p-1.5",
                  offset === 0 && "ring-1 ring-primary/40",
                )}
              >
                <span className="text-[9px] uppercase text-muted-foreground">
                  {dayLabel(key)}
                </span>
                <span className="text-xs font-medium text-foreground">
                  {fmtShort(key, app.country)}
                </span>
                <div className="mt-1 flex items-center gap-0.5">
                  {status && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-[1px] text-[9px] font-semibold",
                        STATUS_STYLES[status],
                      )}
                    >
                      {STATUS_LABEL[status]}
                    </span>
                  )}
                  {night && <MoonStar className="h-2.5 w-2.5 text-amber-300" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Link>
  );
}
