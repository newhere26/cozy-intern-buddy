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
import { Sparkles, Wind } from "lucide-react";

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
    setTimeout(() => setBubble(null), 5000);
  };

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

  return (
    <AppShell>
      <div className="px-4 pt-6">
        <div
          className="flex flex-col items-center justify-end"
          style={{ height: `${heightSvh}svh` }}
        >
          <div className="relative h-full w-full max-w-[280px]">
            {bubble && (
              <div className="absolute left-1/2 top-0 z-30 max-w-[240px] -translate-x-1/2 rounded-2xl bg-card px-3 py-2 text-xs text-foreground shadow-lg animate-in fade-in slide-in-from-top-2">
                {bubble}
                <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-card" />
              </div>
            )}
            <button
              onClick={tapCompanion}
              className="h-full w-full"
              aria-label="Talk to your companion"
            >
              <Companion
                id={app.companion}
                overlays
                night={isNight}
                equippedItems={app.equippedItems}
                completedWeeks={completed}
              />
            </button>
          </div>
          <p className="mt-1 text-center text-sm text-muted-foreground">{greeting}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <CalendarTile />
          <WellnessTile
            open={openTile === "well"}
            onToggle={() => setOpenTile(openTile === "well" ? null : "well")}
          />
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
