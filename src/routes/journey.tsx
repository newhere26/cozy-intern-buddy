import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { fmtShort, weeksSince } from "@/lib/date";

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
  const week = weeksSince(app.startDate);
  const pct = Math.min(100, (week / app.durationWeeks) * 100);

  const cl = Object.values(app.days).filter((d) => d.status === "cl").length;
  const pl = Object.values(app.days).filter((d) => d.status === "pl").length;
  const present = Object.values(app.days).filter((d) => d.status === "present").length;

  const procByName = new Map<string, number>();
  app.procedures.forEach((p) => procByName.set(p.name, (procByName.get(p.name) ?? 0) + 1));
  const topProcedures = [...procByName.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  const rotations = [...app.rotations].sort((a, b) => a.start.localeCompare(b.start));

  return (
    <AppShell>
      <div className="space-y-5 px-4 pt-6">
        <div>
          <h1 className="font-display text-2xl text-foreground">Journey</h1>
          <p className="text-xs text-muted-foreground">
            No streaks. Just a quiet view of how far you've come.
          </p>
        </div>

        <div className="rounded-3xl bg-card p-4">
          <div className="text-xs text-muted-foreground">Internship</div>
          <div className="font-display text-4xl text-foreground">
            {week}
            <span className="text-2xl text-muted-foreground"> / {app.durationWeeks}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary/60">
            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">weeks completed</div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat label="Present" value={present} tone="present" />
          <Stat label={`CL · ${app.clAllotted}`} value={cl} tone="cl" />
          <Stat label={`PL · ${app.plAllotted}`} value={pl} tone="pl" />
        </div>

        <div className="rounded-3xl bg-card p-4">
          <div className="mb-2 text-sm font-medium text-foreground">Procedures</div>
          {topProcedures.length === 0 ? (
            <p className="text-xs text-muted-foreground">Log a procedure on the home screen.</p>
          ) : (
            <div className="space-y-1.5">
              {topProcedures.map(([n, c]) => (
                <div key={n} className="flex items-center justify-between text-xs">
                  <span className="text-foreground">{n}</span>
                  <span className="rounded-full bg-secondary/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                    {c}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-card p-4">
          <div className="mb-2 text-sm font-medium text-foreground">Postings</div>
          {rotations.length === 0 ? (
            <p className="text-xs text-muted-foreground">Add postings from the calendar.</p>
          ) : (
            <div className="space-y-1.5">
              {rotations.map((r) => (
                <div key={r.id} className="rounded-2xl bg-secondary/40 p-2.5 text-xs">
                  <div className="font-medium text-foreground">{r.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {fmtShort(r.start, app.country)} – {fmtShort(r.end, app.country)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "present" | "cl" | "pl" }) {
  const bg = tone === "present" ? "bg-present/25" : tone === "cl" ? "bg-cl/25" : "bg-pl/25";
  return (
    <div className={`rounded-2xl ${bg} p-3 text-center`}>
      <div className="font-display text-2xl text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
