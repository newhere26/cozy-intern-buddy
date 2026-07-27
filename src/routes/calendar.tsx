import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, MoonStar, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  addRotation,
  removeRotation,
  setDay,
  setNightShiftUntil,
  useApp,
} from "@/lib/store";
import type { DayStatus } from "@/lib/store";
import { fmtShort, toKey } from "@/lib/date";
import { postingColor } from "@/lib/postings";
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
  const today = toKey(new Date());
  const [selected, setSelected] = useState(today);
  const [showAdd, setShowAdd] = useState(false);

  const selectedEntry = app.days[selected];
  const days = last28Days();
  const rotations = [...app.rotations].sort((a, b) => a.start.localeCompare(b.start));

  // find current/prev/next posting index
  const currentIdx = rotations.findIndex((r) => today >= r.start && today <= r.end);
  const anchor = currentIdx >= 0 ? currentIdx : 0;

  const toggleNight = (on: boolean) => {
    setDay(selected, { night: on });
    if (on && selected === today) {
      const [h, m] = app.nightEnd.split(":").map(Number);
      const end = new Date();
      // if end is earlier in day, roll to next day
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
          <div className="grid grid-cols-7 gap-1">
            {days.map((k) => {
              const s = app.days[k]?.status;
              const night = app.days[k]?.night;
              const isSel = k === selected;
              return (
                <button
                  key={k}
                  onClick={() => setSelected(k)}
                  className={cn(
                    "relative flex aspect-square flex-col items-center justify-center rounded-lg border border-border/40 text-[10px]",
                    isSel && "ring-2 ring-primary",
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
            {fmtShort(selected, app.country)}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(["present", "cl", "pl", "absent"] as DayStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => setDay(selected, { status: st })}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium",
                  selectedEntry?.status === st
                    ? STATUS_STYLES[st]
                    : "border border-border bg-transparent text-muted-foreground",
                )}
              >
                {st === "present" ? "Present" : st === "cl" ? "CL" : st === "pl" ? "PL" : "Absent"}
              </button>
            ))}
          </div>
          <label className="mt-3 flex items-center gap-2 text-xs text-foreground">
            <input
              type="checkbox"
              className="accent-primary"
              checked={!!selectedEntry?.night}
              onChange={(e) => toggleNight(e.target.checked)}
            />
            <MoonStar className="h-3.5 w-3.5" /> Night shift
          </label>
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
            <div className="scroll-snap-y-mandatory max-h-[300px] snap-y snap-mandatory space-y-2 overflow-y-auto pr-1">
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

function last28Days(): string[] {
  const arr: string[] = [];
  const today = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    arr.push(toKey(d));
  }
  return arr;
}
