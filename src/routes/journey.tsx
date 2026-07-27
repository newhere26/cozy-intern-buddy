import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { addCredits, purchaseItem, toggleEquip, useApp } from "@/lib/store";
import { fmtDate, fullyCompletedWeeks, daysSince } from "@/lib/date";
import { postingColor, rotationForDate } from "@/lib/postings";
import { STORE } from "@/lib/store-items";
import { ChevronDown, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "Journey — Serenity" },
      { name: "description", content: "A quiet view of how far you've come." },
    ],
  }),
  component: JourneyPage,
});

function JourneyPage() {
  const app = useApp();
  const done = fullyCompletedWeeks(app.startDate);
  const pct = Math.min(100, (done / app.durationWeeks) * 100);

  const [open, setOpen] = useState<"leaves" | "proc" | "post" | "store" | null>("leaves");

  return (
    <AppShell>
      <div className="space-y-4 px-4 pt-6">
        <div>
          <h1 className="font-display text-2xl text-foreground">Journey</h1>
          <p className="text-xs text-muted-foreground">
            No streaks. Just a quiet view of how far you've come.
          </p>
        </div>

        <div className="rounded-3xl bg-card p-5">
          <div className="text-xs text-muted-foreground">Internship</div>
          <div className="font-display text-6xl leading-none text-foreground">
            {done}
            <span className="text-3xl text-muted-foreground"> / {app.durationWeeks}</span>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">fully completed weeks</div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary/60">
            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <Collapsible
          title="Leaves & Extensions"
          open={open === "leaves"}
          onToggle={() => setOpen(open === "leaves" ? null : "leaves")}
        >
          <LeavesPanel />
        </Collapsible>

        <Collapsible
          title="Procedures"
          open={open === "proc"}
          onToggle={() => setOpen(open === "proc" ? null : "proc")}
        >
          <ProceduresPanel />
        </Collapsible>

        <Collapsible
          title="Postings"
          open={open === "post"}
          onToggle={() => setOpen(open === "post" ? null : "post")}
        >
          <PostingsPanel expanded={open === "post"} />
        </Collapsible>

        <Collapsible
          title="Store · Credits"
          open={open === "store"}
          onToggle={() => setOpen(open === "store" ? null : "store")}
          right={<span className="flex items-center gap-1 text-xs text-accent"><Coins className="h-3.5 w-3.5" /> {app.credits}</span>}
        >
          <StorePanel />
        </Collapsible>
      </div>
    </AppShell>
  );
}

function Collapsible({
  title,
  open,
  onToggle,
  right,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-card p-4">
      <button onClick={onToggle} className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {right}
          <ChevronDown
            className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
          />
        </div>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </section>
  );
}

function LeavesPanel() {
  const app = useApp();

  const dayEntries = Object.entries(app.days);

  const cl = dayEntries
    .filter(([, e]) => e.status === "cl")
    .map(([date]) => ({ date, rot: rotationForDate(app.rotations, date) }));
  const pl = dayEntries
    .filter(([, e]) => e.status === "pl")
    .map(([date]) => ({ date, rot: rotationForDate(app.rotations, date) }));
  const absent = dayEntries
    .filter(([, e]) => e.status === "absent")
    .map(([date]) => ({ date, rot: rotationForDate(app.rotations, date) }));

  const extensionByDept = new Map<string, number>();
  pl.forEach((x) => {
    const key = x.rot?.name ?? "Unassigned";
    extensionByDept.set(key, (extensionByDept.get(key) ?? 0) + app.extPerPl);
  });
  absent.forEach((x) => {
    const key = x.rot?.name ?? "Unassigned";
    extensionByDept.set(key, (extensionByDept.get(key) ?? 0) + app.extPerAbsent);
  });
  const totalExt = [...extensionByDept.values()].reduce((s, n) => s + n, 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Stat label={`CL · ${app.clAllotted}`} value={cl.length} tone="cl" />
        <Stat label={`PL · ${app.plAllotted}`} value={pl.length} tone="pl" />
        <Stat label="Extension" value={totalExt} tone="ext" />
      </div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        CL remaining · {Math.max(0, app.clAllotted - cl.length)} · PL remaining · {Math.max(0, app.plAllotted - pl.length)}
      </div>

      <Group title={`CL taken (${cl.length})`}>
        {cl.map((x) => (
          <Row key={x.date} left={fmtDate(x.date, app.country)} right={x.rot?.name ?? "—"} />
        ))}
      </Group>
      <Group title={`PL taken (${pl.length})`}>
        {pl.map((x) => (
          <Row key={x.date} left={fmtDate(x.date, app.country)} right={x.rot?.name ?? "—"} />
        ))}
      </Group>
      <Group title={`Extension days owed (${totalExt})`}>
        {[...extensionByDept.entries()].map(([dept, n]) => (
          <Row key={dept} left={dept} right={`${n} days`} />
        ))}
      </Group>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-secondary/30 p-2.5">
      <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
function Row({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-foreground">{left}</span>
      <span className="text-muted-foreground">{right}</span>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "cl" | "pl" | "ext" }) {
  const bg =
    tone === "cl" ? "bg-cl/25" : tone === "pl" ? "bg-pl/25" : "bg-destructive/20";
  return (
    <div className={`rounded-2xl ${bg} p-3 text-center`}>
      <div className="font-display text-2xl text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

function ProceduresPanel() {
  const app = useApp();
  const [sort, setSort] = useState<"posting" | "date" | "time">("date");

  const byName = new Map<string, number>();
  app.procedures.forEach((p) => byName.set(p.name, (byName.get(p.name) ?? 0) + 1));

  const byDay = new Map<string, number>();
  app.procedures.forEach((p) => byDay.set(p.date, (byDay.get(p.date) ?? 0) + 1));
  const bestDay = [...byDay.entries()].sort((a, b) => b[1] - a[1])[0];

  const sorted = useMemo(() => {
    const arr = [...app.procedures];
    if (sort === "date") arr.sort((a, b) => b.date.localeCompare(a.date));
    if (sort === "time") arr.sort((a, b) => a.id.localeCompare(b.id));
    if (sort === "posting")
      arr.sort((a, b) => {
        const ra = rotationForDate(app.rotations, a.date)?.name ?? "";
        const rb = rotationForDate(app.rotations, b.date)?.name ?? "";
        return ra.localeCompare(rb);
      });
    return arr;
  }, [app.procedures, app.rotations, sort]);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-secondary/30 p-3 text-xs text-foreground">
        <div className="font-medium">Best day</div>
        <div className="text-muted-foreground">
          {bestDay
            ? `${fmtDate(bestDay[0], app.country)} · ${bestDay[1]} procedures`
            : "No procedures yet."}
        </div>
      </div>
      <Group title="By procedure">
        {[...byName.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([n, c]) => (
            <Row key={n} left={n} right={String(c)} />
          ))}
      </Group>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-muted-foreground">Sort:</span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "posting" | "date" | "time")}
          className="rounded-full border border-border bg-background px-2 py-1 text-[11px]"
        >
          <option value="date">Date</option>
          <option value="time">Time logged</option>
          <option value="posting">Posting</option>
        </select>
      </div>
      <div className="space-y-1.5">
        {sorted.map((p) => {
          const rot = rotationForDate(app.rotations, p.date);
          return (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl bg-secondary/30 px-3 py-1.5 text-xs"
            >
              <div>
                <div className="text-foreground">{p.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {fmtDate(p.date, app.country)}
                  {rot && ` · ${rot.name}`}
                </div>
              </div>
              <span className="capitalize text-muted-foreground">{p.supervision}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PostingsPanel({ expanded }: { expanded: boolean }) {
  const app = useApp();
  const today = new Date().toISOString().slice(0, 10);
  const rotations = [...app.rotations].sort((a, b) => a.start.localeCompare(b.start));
  const curIdx = rotations.findIndex((r) => today >= r.start && today <= r.end);
  const anchor = curIdx >= 0 ? curIdx : 0;
  const visible = expanded
    ? rotations
    : rotations.slice(Math.max(0, anchor - 1), Math.max(3, anchor + 2));

  if (rotations.length === 0)
    return <p className="text-[11px] text-muted-foreground">Add postings in the Calendar.</p>;

  return (
    <div className="space-y-2">
      {visible.map((r) => {
        const i = rotations.indexOf(r);
        const c = postingColor(i);
        return (
          <div
            key={r.id}
            className={cn("rounded-2xl p-3 ring-1", c.bg, c.ring)}
          >
            <div className={cn("text-sm font-medium", c.text)}>{r.name}</div>
            <div className="text-[10px] text-muted-foreground">
              {fmtDate(r.start, app.country)} – {fmtDate(r.end, app.country)}
              {i === anchor && " · current"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StorePanel() {
  const app = useApp();
  const earned = daysSince(app.startDate);
  const canClaim = Math.max(0, earned - app.credits - app.ownedItems.length * 0);
  // simple: keep credits synced to earned - spent; if user hasn't claimed, offer button
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-2xl bg-secondary/30 p-3 text-xs">
        <div>
          <div className="text-foreground">
            {app.credits} credit{app.credits === 1 ? "" : "s"}
          </div>
          <div className="text-[10px] text-muted-foreground">
            1 credit per completed day · {canClaim} unclaimed
          </div>
        </div>
        <button
          disabled={canClaim <= 0}
          onClick={() => addCredits(canClaim)}
          className={cn(
            "rounded-full px-3 py-1.5 text-[11px] font-medium",
            canClaim > 0
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          Claim
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {STORE.map((it) => {
          const owned = app.ownedItems.includes(it.id);
          const equipped = app.equippedItems.includes(it.id);
          return (
            <div
              key={it.id}
              className="flex flex-col items-start rounded-2xl border border-border bg-background/50 p-3"
            >
              <div className="flex w-full items-start justify-between">
                <div className="text-3xl">{it.emoji}</div>
                <div className="text-[10px] text-accent">{it.cost}c</div>
              </div>
              <div className="mt-1 text-xs font-medium text-foreground">{it.name}</div>
              <div className="text-[10px] text-muted-foreground">{it.desc}</div>
              {owned ? (
                <button
                  onClick={() => toggleEquip(it.id)}
                  className={cn(
                    "mt-2 w-full rounded-full py-1 text-[10px]",
                    equipped
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground",
                  )}
                >
                  {equipped ? "Equipped" : "Equip"}
                </button>
              ) : (
                <button
                  disabled={app.credits < it.cost}
                  onClick={() => purchaseItem(it.id, it.cost)}
                  className={cn(
                    "mt-2 w-full rounded-full py-1 text-[10px]",
                    app.credits >= it.cost
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {app.credits >= it.cost ? "Buy" : "Locked"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
