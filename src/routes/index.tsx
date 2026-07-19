import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { Companion } from "@/components/Companion";
import { CalendarTile } from "@/components/home/CalendarTile";
import { WellnessTile } from "@/components/home/WellnessTile";
import { ProcedureTile } from "@/components/home/ProcedureTile";
import { Link } from "@tanstack/react-router";
import { Sparkles, Wind } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const app = useApp();
  const nav = useNavigate();
  const [openTile, setOpenTile] = useState<"cal" | "well" | "proc" | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !app.onboarded) {
      nav({ to: "/onboarding" });
    }
  }, [app.onboarded, nav]);

  const greeting = pickGreeting();

  return (
    <AppShell>
      <div className="px-4 pt-6">
        {/* Companion — free floating, ~40% viewport */}
        <div className="flex h-[38svh] flex-col items-center justify-end">
          <div className="h-full w-full max-w-[280px]">
            <Companion id={app.companion} />
          </div>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            {greeting}
            {app.name ? `, ${app.name}` : ""}.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <CalendarTile
            open={openTile === "cal"}
            onToggle={() => setOpenTile(openTile === "cal" ? null : "cal")}
          />
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
  if (typeof window === "undefined") return "Hello";
  const h = new Date().getHours();
  if (h < 5) return "Late again";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}
