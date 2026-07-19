import { useState } from "react";
import { CalendarDays, ChevronDown, MoonStar, Plus, Trash2 } from "lucide-react";
import { addRotation, removeRotation, setDay, useApp } from "@/lib/store";
import type { DayStatus } from "@/lib/store";
import { addDays, dayLabel, fmtShort, toKey, weeksSince } from "@/lib/date";
import { cn } from "@/lib/utils";

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

export function CalendarTile({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  const app = useApp();
  const today = toKey(new Date());
  const week = weeksSince(app.startDate);
  const total = app.durationWeeks;

  return (
    <div className="rounded-3xl bg-card p-4 shadow-sm">
      <button
        onClick={onToggle}
        className="flex w-full items-start justify-between"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Calendar</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {!open && (
        <div className="mt-3">
          <div className="font-display text-3xl leading-none text-foreground">
            {week}
            <span className="text-lg text-muted-foreground"> / {total}</span>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">weeks</div>

          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {[-2, -1, 0].map((offset) => {
              const key = addDays(today, offset);
              const status = app.days[key]?.status;
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
                  {status && (
                    <span
                      className={cn(
                        "mt-1 rounded-full px-1.5 py-[1px] text-[9px] font-semibold",
                        STATUS_STYLES[status],
                      )}
                    >
                      {STATUS_LABEL[status]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {open && <ExpandedCalendar />}
    </div>
  );
}

function ExpandedCalendar() {
  const app = useApp();
  const today = toKey(new Date());
  const [selected, setSelected] = useState(today);
  const [showAddRotation, setShowAddRotation] = useState(false);

  const selectedEntry = app.days[selected];

  const days = last30Days();

  const rotations = [...app.rotations].sort((a, b) => a.start.localeCompare(b.start));

  return (
    <div className="mt-4 space-y-4">
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
                <MoonStar className="absolute right-0.5 top-0.5 h-2.5 w-2.5 text-foreground/70" />
              )}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl bg-secondary/50 p-3">
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
            onChange={(e) => setDay(selected, { night: e.target.checked })}
          />
          <MoonStar className="h-3.5 w-3.5" /> Night shift
        </label>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-medium text-foreground">Postings</div>
          <button
            onClick={() => setShowAddRotation((v) => !v)}
            className="flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-1 text-[11px] text-primary"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
        {showAddRotation && (
          <AddRotationForm onDone={() => setShowAddRotation(false)} />
        )}
        <div className="mt-2 space-y-1.5">
          {rotations.length === 0 && (
            <p className="text-[11px] text-muted-foreground">No postings yet.</p>
          )}
          {rotations.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-xl bg-secondary/40 px-3 py-2 text-xs"
            >
              <div>
                <div className="font-medium text-foreground">{r.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {fmtShort(r.start, app.country)} – {fmtShort(r.end, app.country)}
                  {r.checkIn && ` · ${r.checkIn}–${r.checkOut}`}
                </div>
              </div>
              <button
                onClick={() => removeRotation(r.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AddRotationForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [start, setStart] = useState(toKey(new Date()));
  const [end, setEnd] = useState(toKey(new Date()));
  const [checkIn, setCheckIn] = useState("09:00");
  const [checkOut, setCheckOut] = useState("17:00");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        addRotation({ name: name.trim(), start, end, checkIn, checkOut });
        onDone();
      }}
      className="space-y-2 rounded-2xl bg-secondary/40 p-3"
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

function last30Days(): string[] {
  const arr: string[] = [];
  const today = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    arr.push(toKey(d));
  }
  return arr;
}
