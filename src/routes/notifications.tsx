import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { setNotifPrefs, useApp } from "@/lib/store";
import type { NotifPrefs } from "@/lib/store";
import { requestNotifPermission } from "@/lib/notify";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Reminders — Serenity" },
      {
        name: "description",
        content: "Choose which gentle nudges you get for water, meals and attendance, and set quiet hours.",
      },
      { property: "og:title", content: "Reminders — Serenity" },
      {
        property: "og:description",
        content: "Choose which gentle nudges you get for water, meals and attendance, and set quiet hours.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotificationsPage,
});

function Row({
  title,
  sub,
  on,
  onToggle,
}: {
  title: string;
  sub: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 rounded-2xl bg-secondary/30 p-3 text-left"
    >
      <span>
        <span className="block text-sm text-foreground">{title}</span>
        <span className="block text-[11px] text-muted-foreground">{sub}</span>
      </span>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          on ? "bg-primary" : "bg-border",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-background transition-all",
            on ? "left-[22px]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}

const FREQ: { value: NotifPrefs["hydrationFrequency"]; label: string; sub: string }[] = [
  { value: "gentle", label: "Gentle", sub: "twice a day" },
  { value: "normal", label: "Steady", sub: "every 3 hours" },
  { value: "often", label: "Often", sub: "every 2 hours" },
];

function NotificationsPage() {
  const app = useApp();
  const p = app.notifPrefs;

  return (
    <AppShell>
      <div className="space-y-4 px-4 pt-6">
        <Link to="/journey" className="flex items-center gap-1 text-xs text-muted-foreground">
          <ChevronLeft className="h-3.5 w-3.5" /> Journey
        </Link>

        <div>
          <h1 className="font-display text-2xl text-foreground">Reminders</h1>
          <p className="text-xs text-muted-foreground">
            Only the nudges you want, only when you want them.
          </p>
        </div>

        <section className="space-y-2 rounded-3xl bg-card p-4">
          <Row
            title="Hydration"
            sub="Little water nudges through the day"
            on={p.hydration}
            onToggle={() => setNotifPrefs({ hydration: !p.hydration })}
          />
          {p.hydration && (
            <div className="flex gap-1.5 px-1">
              {FREQ.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setNotifPrefs({ hydrationFrequency: f.value })}
                  className={cn(
                    "flex-1 rounded-2xl px-2 py-2 text-center",
                    p.hydrationFrequency === f.value
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground",
                  )}
                >
                  <span className="block text-[11px]">{f.label}</span>
                  <span className="block text-[9px] opacity-70">{f.sub}</span>
                </button>
              ))}
            </div>
          )}
          <Row
            title="Nourishment"
            sub="Breakfast, lunch and dinner check-ins"
            on={p.nourishment}
            onToggle={() => setNotifPrefs({ nourishment: !p.nourishment })}
          />
          <Row
            title="Attendance"
            sub="A reminder to mark the day in your calendar"
            on={p.attendance}
            onToggle={() => setNotifPrefs({ attendance: !p.attendance })}
          />
        </section>

        <section className="rounded-3xl bg-card p-4">
          <h2 className="text-sm text-foreground">Quiet hours</h2>
          <p className="mb-3 text-[11px] text-muted-foreground">
            Nothing will buzz between these times. Sleep is medicine too.
          </p>
          <div className="flex items-center gap-3">
            <label className="flex-1 text-[11px] text-muted-foreground">
              From
              <input
                type="time"
                value={p.quietStart}
                onChange={(e) => setNotifPrefs({ quietStart: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="flex-1 text-[11px] text-muted-foreground">
              Until
              <input
                type="time"
                value={p.quietEnd}
                onChange={(e) => setNotifPrefs({ quietEnd: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
          </div>
        </section>

        <button
          onClick={() => void requestNotifPermission()}
          className="w-full rounded-2xl bg-primary py-3 text-sm text-primary-foreground"
        >
          Allow notifications on this device
        </button>
        <p className="pb-4 text-center text-[10px] text-muted-foreground">
          Reminders come with Snooze 30 min and 1 hour buttons.
        </p>
      </div>
    </AppShell>
  );
}
