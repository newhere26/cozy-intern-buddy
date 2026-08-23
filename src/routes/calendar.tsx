import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Footprints,
  MoonStar,
  Plus,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  addRotation,
  calculateHoursForDay,
  removeRotation,
  setDay,
  setNightShiftUntil,
  setSteps,
  setWorkHours,
  useApp,
} from "@/lib/store";
import type { DayStatus } from "@/lib/store";
import { WEEKDAYS, fmtShort, monthLabel, monthMatrix, toKey } from "@/lib/date";
import { canLogAttendance } from "@/lib/shift";
import { postingColor } from "@/lib/postings";
import { PostingReview } from "@/components/PostingReview";

import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Serenity" },
      { name: "description", content: "Log rotations, attendance, and night shifts." },
    ],
  }),
  component: CalendarPage,
});

const STATUS_STYLES: Record<DayStatus, string> = {
  present: "bg-present/80 text-background",
  cl: "bg-cl/80 text-background",
  pl: "bg-pl/80 text-background",
  absent: "bg-absent/60 text-background",
};

function CalendarPage() {
  const app = useApp();
  const [today, setToday] = useState<string>("");
  const [selected, setSelected] = useState("");
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    const k = toKey(new Date());
    setToday(k);
    setSelected(k);
  }, []);

  const selectedEntry = selected ? app.days[selected] : undefined;
  const cells = monthMatrix(cursor.y, cursor.m);
  const rotations = [...app.rotations].sort((a, b) => a.start.localeCompare(b.start));

  const currentIdx = rotations.findIndex((r) => today >= r.start && today <= r.end);
  const anchor = currentIdx >= 0 ? currentIdx : 0;

  const gate = today && selected ? canLogAttendance(app, selected, today) : { allowed: false, opensAt: "" };

  const shiftMonth = (delta: number) => {
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  const toggleNight = (on: boolean) => {
    setDay(selected, { night: on });
    if (on && selected === today) {
      const [h, m] = app.nightEnd.split(":").map(Number);
      const end = new Date();
      end.setHours(h ?? 8, m ?? 0, 0, 0);
      if (end.getTime() < Date.now()) end.setDate(end.getDate() + 1);
      setNightShiftUntil(end.toISOString());
    } else if (!on && selected === today) {
      setNightShiftUntil(undefined);
    }
  };

  return (
    <AppShell>
      <div className="space-y-5 px-4 pt-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1 text-xs text-muted-foreground">
            <ChevronLeft className="h-4 w-4" /> Home
          </Link>
          <h1 className="font-display text-xl text-foreground">Calendar</h1>
          <div className="w-10" />
        </div>

        <div className="rounded-3xl bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              className="grid h-7 w-7 place-items-center rounded-full bg-secondary/50 text-muted-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="font-display text-base text-foreground">
              {monthLabel(cursor.y, cursor.m)}
            </div>
            <button
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className="grid h-7 w-7 place-items-center rounded-full bg-secondary/50 text-muted-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-center text-[9px] uppercase tracking-wide text-muted-foreground">
                {w.slice(0, 1)}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map(({ key: k, inMonth }) => {
              const s = app.days[k]?.status;
              const night = app.days[k]?.night;
              const isSel = k === selected;
              return (
                <button
                  key={k}
                  onClick={() => inMonth && setSelected(k)}
                  disabled={!inMonth}
                  className={cn(
                    "relative flex aspect-square flex-col items-center justify-center rounded-lg border border-border/40 text-[10px]",
                    !inMonth && "opacity-30",
                    isSel && "ring-2 ring-primary",
                    k === today && !isSel && "ring-1 ring-primary/50",
                    s === "present" && "bg-present/70 text-background",
                    s === "cl" && "bg-cl/70 text-background",
                    s === "pl" && "bg-pl/70 text-background",
                    s === "absent" && "bg-absent/50 text-background",
                  )}
                >
                  <span className="font-medium">{Number(k.slice(-2))}</span>
                  {night && (
                    <MoonStar className="absolute right-0.5 top-0.5 h-2.5 w-2.5 text-amber-300" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl bg-secondary/40 p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {selected ? fmtShort(selected, app.country) : ""}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(["present", "cl", "pl", "absent"] as DayStatus[]).map((st) => (
              <button
                key={st}
                disabled={!gate.allowed}
                onClick={() => setDay(selected, { status: st })}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium",
                  selectedEntry?.status === st
                    ? STATUS_STYLES[st]
                    : "border border-border bg-transparent text-muted-foreground",
                  !gate.allowed && "cursor-not-allowed opacity-40",
                )}
              >
                {st === "present" ? "Present" : st === "cl" ? "CL" : st === "pl" ? "PL" : "Absent"}
              </button>
            ))}
          </div>
          {!gate.allowed && selected && (
            <p className="mt-2 text-[10px] text-muted-foreground">
              {selected > today
                ? "This day hasn't happened yet."
                : `You can log attendance after ${gate.opensAt} — once half your shift is done.`}
            </p>
          )}
          <label className="mt-3 flex items-center gap-2 text-xs text-foreground">
            <input
              type="checkbox"
              className="accent-primary"
              checked={!!selectedEntry?.night}
              onChange={(e) => toggleNight(e.target.checked)}
            />
            <MoonStar className="h-3.5 w-3.5" /> Night shift
          </label>

          {selectedEntry?.status === "present" && (
            <div className="mt-3.5 border-t border-border/50 pt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>Work Hours: {calculateHoursForDay(app, selected)} hrs</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Footprints className="h-3 w-3" />
                  <span>{(app.steps[selected] || 0).toLocaleString()} steps</span>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[10px] text-muted-foreground">Check-in</span>
                  <input
                    type="time"
                    value={
                      app.workHours[selected]?.checkIn ||
                      (selectedEntry.night ? app.nightStart : app.checkIn)
                    }
                    onChange={(e) =>
                      setWorkHours(selected, { checkIn: e.target.value })
                    }
                    className="mt-0.5 w-full rounded-lg border border-border bg-background px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground">Check-out</span>
                  <input
                    type="time"
                    value={
                      app.workHours[selected]?.checkOut ||
                      (selectedEntry.night ? app.nightEnd : app.checkOut)
                    }
                    onChange={(e) =>
                      setWorkHours(selected, { checkOut: e.target.value })
                    }
                    className="mt-0.5 w-full rounded-lg border border-border bg-background px-2 py-1 text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium text-foreground">Postings</div>
            <button
              onClick={() => setShowAdd((v) => !v)}
              className="flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-1 text-[11px] text-primary"
            >
              <Plus className="h-3 w-3" /> Add
            </button>
          </div>
          {showAdd && <AddRotationForm onDone={() => setShowAdd(false)} />}

          {rotations.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">No postings yet.</p>
          ) : (
            <div className="max-h-[300px] snap-y snap-mandatory space-y-2 overflow-y-auto pr-1">
              {rotations.map((r, i) => {
                const c = postingColor(i);
                const highlight = i === anchor - 1 || i === anchor || i === anchor + 1;
                return (
                  <div
                    key={r.id}
                    className={cn(
                      "snap-start rounded-2xl p-3 ring-1 transition-opacity",
                      c.bg,
                      c.ring,
                      !highlight && "opacity-60",
                    )}
                    style={{ minHeight: 88 }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className={cn("font-medium", c.text)}>{r.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {fmtShort(r.start, app.country)} – {fmtShort(r.end, app.country)}
                          {r.checkIn && ` · ${r.checkIn}–${r.checkOut}`}
                        </div>
                        {i === anchor && (
                          <span className="mt-1 inline-block rounded-full bg-primary/30 px-2 py-0.5 text-[9px] uppercase tracking-wider text-primary">
                            current
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeRotation(r.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {r.end < today && <PostingReview rotation={r} />}
                  </div>

                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function AddRotationForm({ onDone }: { onDone: () => void }) {
  const app = useApp();
  const [name, setName] = useState("");
  const [start, setStart] = useState(toKey(new Date()));
  const [end, setEnd] = useState(toKey(new Date()));
  const [checkIn, setCheckIn] = useState(app.checkIn);
  const [checkOut, setCheckOut] = useState(app.checkOut);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        addRotation({ name: name.trim(), start, end, checkIn, checkOut });
        onDone();
      }}
      className="mb-2 space-y-2 rounded-2xl bg-secondary/40 p-3"
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. General Medicine"
        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs"
      />
      <div className="grid grid-cols-2 gap-2">
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs" />
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs" />
        <input type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs" />
        <input type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs" />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="flex-1 rounded-full bg-primary py-1.5 text-xs font-medium text-primary-foreground">Save</button>
        <button type="button" onClick={onDone} className="rounded-full border border-border px-3 py-1.5 text-xs">Cancel</button>
      </div>
    </form>
  );
}
