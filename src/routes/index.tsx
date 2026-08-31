import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { setNightShiftUntil, useApp } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { Companion } from "@/components/Companion";
import { CalendarTile } from "@/components/home/CalendarTile";
import { WellnessTile } from "@/components/home/WellnessTile";
import { ProcedureTile } from "@/components/home/ProcedureTile";
import { fullyCompletedWeeks } from "@/lib/date";
import { pickCompanionLine } from "@/lib/companion-lines";
import { ArrowDown, Sparkles, Wind } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const app = useApp();
  const nav = useNavigate();
  const [openTile, setOpenTile] = useState<"well" | "proc" | null>(null);
  const [mounted, setMounted] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);

  // night shift auto-off check
  useEffect(() => {
    if (!app.nightShiftUntil) return;
    const check = () => {
      if (app.nightShiftUntil && new Date(app.nightShiftUntil).getTime() < Date.now()) {
        setNightShiftUntil(undefined);
      }
    };
    check();
    const t = setInterval(check, 60_000);
    return () => clearInterval(t);
  }, [app.nightShiftUntil]);

  useEffect(() => {
    setMounted(true);
    if (!app.onboarded) nav({ to: "/onboarding" });
  }, [app.onboarded, nav]);

  const isNight = !!app.nightShiftUntil && new Date(app.nightShiftUntil).getTime() > Date.now();
  const completed = fullyCompletedWeeks(app.startDate);

  const tapCompanion = () => {
    const line = pickCompanionLine(isNight ? "night" : "day");
    setBubble(line);
  };

  // A question or reflective prompt deserves an answer — offer to carry it into Writing.
  const bubbleIsQuestion =
    !!bubble &&
    (bubble.includes("?") ||
      bubble.startsWith("Tell me") ||
      bubble.startsWith("What") ||
      bubble.startsWith("How") ||
      bubble.startsWith("Is there") ||
      bubble.startsWith("Did you"));

  const greeting = !mounted
    ? ""
    : isNight
      ? `Good evening, Dr. ${app.name || "friend"}. I'm here, with you through the night and beyond.`
      : `${pickGreeting()}${app.name ? `, ${app.name}` : ""}.`;

  if (!mounted || !app.onboarded) {
    return <div className="min-h-svh bg-background" />;
  }

  // Companion size grows a little at each milestone (up to +20%)
  const sizeBoost = Math.min(1.2, 1 + Math.floor(completed / 13) * 0.05);
  const heightSvh = 32 * sizeBoost;

  const todayKeyStr = new Date().toISOString().slice(0, 10);
  const currentPosting = app.rotations.find(
    (r) => todayKeyStr >= r.start && todayKeyStr <= r.end,
  );

  return (
    <AppShell>
      <div className="px-4 pt-4">
        <div className="mb-3 rounded-2xl bg-card/70 px-4 py-2.5">
          <div className="font-display text-base leading-tight text-foreground">
            Hello, Dr. {app.name || "friend"}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {[app.city, currentPosting?.name].filter(Boolean).join("  |  ") || "Somewhere in the wards"}
          </div>
        </div>
        {/* Reserved slot so what the companion says is clearly visible and readable */}
        <div className="mb-2 min-h-[76px] px-1">
          {bubble && (
            <div className="mx-auto max-w-[340px] animate-in fade-in slide-in-from-top-2">
              <button
                type="button"
                onClick={() => setBubble(null)}
                className="relative w-full rounded-2xl border border-border/60 bg-card px-4 py-3 text-left text-[13px] font-medium leading-relaxed text-foreground shadow-md transition-transform active:scale-98"
              >
                {bubble}
                <span className="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b border-r border-border/60 bg-card" />
              </button>
              {bubbleIsQuestion && (
                <Link
                  to="/journal"
                  search={{ prompt: bubble }}
                  className="mx-auto mt-2.5 flex items-center justify-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary shadow-xs transition-all hover:bg-primary/20 active:scale-95"
                  aria-label="Write about this in your diary"
                >
                  <ArrowDown className="h-3.5 w-3.5 shrink-0" />
                  <span>Write about this in your diary →</span>
                </Link>
              )}
            </div>
          )}
        </div>

        <div
          className="flex flex-col items-center justify-end"
          style={{ height: `${heightSvh}svh` }}
        >
          <div className="relative h-full w-full max-w-[280px]">
            <button
              onClick={tapCompanion}
              className="h-full w-full"
              aria-label="Talk to your companion"
            >
              <Companion
                id={app.companion}
                overlays
                night={isNight}
                completedWeeks={completed}
              />
            </button>
          </div>
          <p className="mt-1 text-center text-sm text-muted-foreground">{greeting}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {openTile !== "well" && <CalendarTile />}
          <WellnessTile
            className={openTile === "well" ? "col-span-2" : undefined}
            open={openTile === "well"}
            onToggle={() => setOpenTile(openTile === "well" ? null : "well")}
          />
          {openTile === "well" && <CalendarTile />}
        </div>


        <div className="mt-3">
          <ProcedureTile
            open={openTile === "proc"}
            onToggle={() => setOpenTile(openTile === "proc" ? null : "proc")}
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <Link
            to="/affirmations"
            className="flex aspect-square flex-col items-start justify-between rounded-3xl bg-card p-4 shadow-sm"
          >
            <Sparkles className="h-5 w-5 text-accent" />
            <div>
              <div className="font-display text-lg text-foreground">Affirmations</div>
              <div className="text-[11px] text-muted-foreground">a soft word for now</div>
            </div>
          </Link>
          <Link
            to="/relaxation"
            className="flex aspect-square flex-col items-start justify-between rounded-3xl bg-card p-4 shadow-sm"
          >
            <Wind className="h-5 w-5 text-accent" />
            <div>
              <div className="font-display text-lg text-foreground">Relaxation</div>
              <div className="text-[11px] text-muted-foreground">breathe with me</div>
            </div>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function pickGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Late again";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}
