import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { claimCredits, purchaseArt, setActiveArt, setAnimationsEnabled, useApp } from "@/lib/store";
import { fmtDate, fullyCompletedWeeks, daysSince } from "@/lib/date";
import { postingColor, rotationForDate } from "@/lib/postings";
import { artImageUrl, galleryFromCache, loadGallery, type ArtPiece } from "@/lib/artic";
import { PostingReview } from "@/components/PostingReview";
import { buildAchievements } from "@/lib/achievements";
import { generateAnnualReport } from "@/lib/reports";
import {
  Award,
  Bell,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  Clock,
  Coins,
  Download,
  ExternalLink,
  Eye,
  Footprints,
  Heart,
  MoonStar,
  Sparkles,
  Stethoscope,
  TrendingUp,
  X,
} from "lucide-react";
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

  const [open, setOpen] = useState<
    "leaves" | "proc" | "post" | "ach" | "store" | "roundup" | null
  >("leaves");

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
          title="Roundup & Year in Review"
          open={open === "roundup"}
          onToggle={() => setOpen(open === "roundup" ? null : "roundup")}
          right={
            <span className="flex items-center gap-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Roundup
            </span>
          }
        >
          <AnnualRoundupPanel />
        </Collapsible>

        <Collapsible
          title="Achievements"
          open={open === "ach"}
          onToggle={() => setOpen(open === "ach" ? null : "ach")}
        >
          <AchievementsPanel />
        </Collapsible>

        <Collapsible
          title="Art Gallery · Credits"
          open={open === "store"}
          onToggle={() => setOpen(open === "store" ? null : "store")}
          right={<span className="flex items-center gap-1 text-xs text-accent"><Coins className="h-3.5 w-3.5" /> {app.credits}</span>}
        >
          <GalleryPanel />
        </Collapsible>

        <Link
          to="/attendance-review"
          className="flex items-center justify-between rounded-3xl bg-card p-4"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            Attendance review
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        <Link
          to="/notifications"
          className="flex items-center justify-between rounded-3xl bg-card p-4"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Bell className="h-4 w-4 text-muted-foreground" />
            Reminder settings
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        {/* Settings tile: Companion animations toggle */}
        <div className="flex items-center justify-between rounded-3xl bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Companion animations</div>
              <div className="text-[11px] text-muted-foreground">Breathing & tap bounce effects</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAnimationsEnabled(app.animationsEnabled === false)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
              app.animationsEnabled !== false ? "bg-primary" : "bg-muted",
            )}
            role="switch"
            aria-checked={app.animationsEnabled !== false}
            aria-label="Toggle companion animations"
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-md ring-0 transition duration-200 ease-in-out",
                app.animationsEnabled !== false ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
        </div>
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
            {r.end < today && <PostingReview rotation={r} />}
          </div>
        );
      })}
    </div>
  );
}

function AchievementsPanel() {
  const app = useApp();
  const earned = buildAchievements(app);

  return (
    <div className="space-y-3">
      <div className="text-[11px] text-muted-foreground">
        {earned.length} collected — no rush.
      </div>
      <div className="space-y-1.5">
        {earned.map((a) => (
          <div
            key={a.id}
            className="flex items-start gap-2.5 rounded-2xl bg-secondary/40 px-3 py-2"
          >
            <span className="text-lg leading-none">{a.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-foreground">{a.title}</div>
              <div className="text-[10px] text-muted-foreground">{a.line}</div>
            </div>
            {a.meta && (
              <span className="shrink-0 text-[10px] text-muted-foreground">
                {fmtDate(a.meta, app.country)}
              </span>
            )}
          </div>
        ))}
        {earned.length === 0 && (
          <p className="text-[11px] text-muted-foreground">
            Nothing yet — the first ones come quietly.
          </p>
        )}
      </div>
    </div>
  );
}

function GalleryPanel() {
  const app = useApp();
  const earnedCredits = daysSince(app.startDate);
  const canClaim = Math.max(0, earnedCredits - app.claimedDays);

  const [pieces, setPieces] = useState<ArtPiece[]>(() => galleryFromCache());
  const [status, setStatus] = useState<"idle" | "loading" | "error">(
    galleryFromCache().length ? "idle" : "loading",
  );

  useEffect(() => {
    if (pieces.length) return;
    const ac = new AbortController();
    setStatus("loading");
    loadGallery(ac.signal)
      .then((g) => {
        setPieces(g);
        setStatus("idle");
      })
      .catch(() => setStatus("error"));
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedArt, setSelectedArt] = useState<ArtPiece | null>(null);

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
          onClick={() => claimCredits(earnedCredits)}
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

      <p className="text-[11px] text-muted-foreground">
        Masterpieces from art history. Collect and unlock artworks to view in high definition or download as serene wallpapers for your device.
      </p>

      {status === "loading" && (
        <p className="py-6 text-center text-[11px] text-muted-foreground">
          Walking to the gallery…
        </p>
      )}
      {status === "error" && (
        <p className="py-6 text-center text-[11px] text-muted-foreground">
          Couldn't reach the gallery today. It'll be here next time.
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        {pieces.map((art) => {
          const owned = app.ownedArt.includes(art.id);
          const imgUrl = artImageUrl(art.imageId, 843);
          return (
            <div
              key={art.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-background/50 transition-all hover:border-primary/40"
            >
              <button
                type="button"
                onClick={() => owned && setSelectedArt(art)}
                className={cn(
                  "relative aspect-[4/3] w-full text-left overflow-hidden bg-muted/20",
                  !owned && "cursor-default",
                )}
              >
                <img
                  src={artImageUrl(art.imageId, 400)}
                  alt={art.title}
                  loading="lazy"
                  className={cn(
                    "h-full w-full object-cover transition-transform duration-300",
                    owned && "hover:scale-105",
                    !owned && "opacity-60 saturate-50",
                  )}
                />
                {owned && (
                  <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/60 p-1 text-white backdrop-blur-xs">
                    <Eye className="h-3 w-3" />
                  </span>
                )}
              </button>
              <div className="flex flex-1 flex-col p-2.5">
                <div className="line-clamp-2 text-[11px] font-medium text-foreground">
                  {art.title}
                </div>
                <div className="line-clamp-1 text-[10px] text-muted-foreground">
                  {art.artist}
                  {art.date ? ` · ${art.date}` : ""}
                </div>
                {owned ? (
                  <button
                    type="button"
                    onClick={() => setSelectedArt(art)}
                    className="mt-2 flex items-center justify-center gap-1 rounded-full bg-secondary/80 py-1 text-[10px] font-medium text-foreground hover:bg-secondary"
                  >
                    <Eye className="h-3 w-3" /> View & Save
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={app.credits < art.cost}
                    onClick={() => purchaseArt(art.id, art.cost)}
                    className={cn(
                      "mt-2 w-full rounded-full py-1 text-[10px] font-medium",
                      app.credits >= art.cost
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {app.credits >= art.cost ? `Unlock · ${art.cost}c` : `${art.cost}c`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full-resolution Art Lightbox & Wallpaper Modal */}
      {selectedArt && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedArt(null)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/20 bg-card p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2 pb-3">
              <div>
                <h3 className="font-display text-base text-foreground leading-snug">
                  {selectedArt.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedArt.artist}
                  {selectedArt.date ? ` · ${selectedArt.date}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArt(null)}
                className="rounded-full bg-secondary/60 p-1.5 text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative my-auto overflow-hidden rounded-2xl border border-border/50 bg-black/40 shadow-inner">
              <img
                src={artImageUrl(selectedArt.imageId, 843)}
                alt={selectedArt.title}
                className="max-h-[55vh] w-full object-contain"
              />
            </div>

            <div className="mt-4 flex gap-2 pt-2">
              <a
                href={artImageUrl(selectedArt.imageId, 843)}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-secondary/60 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open Full HD
              </a>
              <a
                href={artImageUrl(selectedArt.imageId, 843)}
                download={`${selectedArt.title.toLowerCase().replace(/\s+/g, "-")}.jpg`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:opacity-90"
              >
                <Download className="h-3.5 w-3.5" />
                Save as Wallpaper
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnnualRoundupPanel() {
  const app = useApp();
  const report = useMemo(() => generateAnnualReport(app), [app]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const activeMonthData = useMemo(() => {
    if (!selectedMonth) return null;
    return report.monthlyBreakdown.find((m) => m.monthKey === selectedMonth);
  }, [report, selectedMonth]);

  return (
    <div className="space-y-4">
      {/* Overview Banner */}
      <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-lg text-foreground">
              Dr. {report.internName}'s Roundup
            </div>
            <div className="text-[11px] text-muted-foreground">
              {[report.college, report.city].filter(Boolean).join(" · ") || "Internship Haven"}
            </div>
          </div>
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl bg-secondary/50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" /> Total Hours on Duty
          </div>
          <div className="mt-1 font-display text-2xl text-foreground">
            {report.totalWorkHours.toLocaleString()}
            <span className="text-xs font-normal text-muted-foreground"> hrs</span>
          </div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">
            Avg {report.avgShiftHours}h/shift · Longest {report.longestShiftHours}h
          </div>
        </div>

        <div className="rounded-2xl bg-secondary/50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Footprints className="h-3.5 w-3.5 text-primary" /> Ward Footsteps
          </div>
          <div className="mt-1 font-display text-2xl text-foreground">
            {report.totalStepsWalked >= 1000
              ? `${(report.totalStepsWalked / 1000).toFixed(1)}k`
              : report.totalStepsWalked}
            <span className="text-xs font-normal text-muted-foreground"> steps</span>
          </div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">
            ~{report.estimatedKmWalked} km walked through wards
          </div>
        </div>

        <div className="rounded-2xl bg-secondary/50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarCheck className="h-3.5 w-3.5 text-primary" /> Shifts Completed
          </div>
          <div className="mt-1 font-display text-2xl text-foreground">
            {report.totalDaysPresent}
            <span className="text-xs font-normal text-muted-foreground"> days</span>
          </div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">
            Including {report.totalNightShifts} night duties
          </div>
        </div>

        <div className="rounded-2xl bg-secondary/50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Stethoscope className="h-3.5 w-3.5 text-primary" /> Procedures
          </div>
          <div className="mt-1 font-display text-2xl text-foreground">
            {report.totalProcedures}
            <span className="text-xs font-normal text-muted-foreground"> logged</span>
          </div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">
            {report.independentProcedures} performed independently
          </div>
        </div>
      </div>

      {/* Posting Ratings Highlights */}
      {(report.topPostingFelt || report.topPostingLearned || report.topPostingPG) && (
        <div className="rounded-2xl border border-border bg-background/60 p-3.5">
          <div className="mb-2 text-xs font-semibold text-foreground">
            Rotation Reviews & Favorites
          </div>
          <div className="space-y-2">
            {report.topPostingFelt && (
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span>😊</span> Happiest Posting:
                </span>
                <span className="font-medium text-foreground">
                  {report.topPostingFelt.name} ({report.topPostingFelt.score}/5)
                </span>
              </div>
            )}
            {report.topPostingLearned && (
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span>📚</span> Most Educational:
                </span>
                <span className="font-medium text-foreground">
                  {report.topPostingLearned.name} ({report.topPostingLearned.score}/5)
                </span>
              </div>
            )}
            {report.topPostingPG && (
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span>🎯</span> Top PG Choice:
                </span>
                <span className="font-medium text-foreground">
                  {report.topPostingPG.name} ({report.topPostingPG.score}/5)
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Monthly Breakdown */}
      {report.monthlyBreakdown.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-foreground">Monthly Milestones</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {report.monthlyBreakdown.map((m) => (
              <button
                key={m.monthKey}
                type="button"
                onClick={() =>
                  setSelectedMonth(selectedMonth === m.monthKey ? null : m.monthKey)
                }
                className={cn(
                  "flex flex-col items-start rounded-2xl border p-2.5 text-left transition-all",
                  selectedMonth === m.monthKey
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background/50",
                )}
              >
                <div className="font-display text-xs text-foreground">{m.label}</div>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {m.totalHours} hrs · {m.daysPresent} shifts
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {m.totalSteps.toLocaleString()} steps
                </div>
              </button>
            ))}
          </div>

          {activeMonthData && (
            <div className="animate-in fade-in rounded-2xl border border-primary/20 bg-secondary/40 p-3 text-xs">
              <div className="font-semibold text-foreground">
                {activeMonthData.label} Detail Summary
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                <div>• Duty Hours: {activeMonthData.totalHours} hrs</div>
                <div>• Night Duties: {activeMonthData.nightShifts}</div>
                <div>• Ward Steps: {activeMonthData.totalSteps.toLocaleString()}</div>
                <div>• Procedures: {activeMonthData.proceduresLogged}</div>
                <div>• Diary Notes: {activeMonthData.journalEntries}</div>
                <div>• Meals Logged: {activeMonthData.mealsLogged}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
