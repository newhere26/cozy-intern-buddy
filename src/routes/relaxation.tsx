import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import { Disclaimer } from "@/components/Disclaimer";
import { bumpBreathSeconds, todayKey, useStore } from "@/lib/store";

export const Route = createFileRoute("/relaxation")({
  head: () => ({
    meta: [
      { title: "Mindful Breathing Space — WithYou" },
      { name: "description", content: "Guided breathing techniques for a quiet minute." },
    ],
  }),
  component: RelaxationPage,
});

type Phase = "in" | "hold" | "out" | "restHold";
const PATTERNS = {
  box: {
    in: 4, hold: 4, out: 4, restHold: 4,
    label: "4-4-4-4 Box Breathing",
    blurb: "Even, steady breathing. A simple way to pause and settle.",
  },
  "4-7-8": {
    in: 4, hold: 7, out: 8, restHold: 0,
    label: "4-7-8 Calming Breath",
    blurb: "A slow, calming rhythm with a long exhale.",
  },
  "5-5": {
    in: 5, hold: 0, out: 5, restHold: 0,
    label: "5-5 Resonance Breathing",
    blurb: "Smooth, even breaths at a gentle pace.",
  },
  "4-4": {
    in: 4, hold: 0, out: 4, restHold: 0,
    label: "4-4 Equal Breathing",
    blurb: "Equal in and out, to help you focus.",
  },
} as const;
type PatternKey = keyof typeof PATTERNS;

function RelaxationPage() {
  const [pattern, setPattern] = useState<PatternKey>("box");
  const [phase, setPhase] = useState<Phase>("in");
  const [count, setCount] = useState<number>(PATTERNS.box.in);
  const [running, setRunning] = useState(false);
  // Saved per day in the app store, so it survives leaving this page.
  const totalSec = useStore((s) => s.breathSeconds[todayKey()] ?? 0);
  const [expanded, setExpanded] = useState(false);

  // Start every run collapsed, then grow on the next frame so the very first
  // inhale visibly expands the circle.
  useEffect(() => {
    if (!running) {
      setExpanded(false);
      return;
    }
    setExpanded(false);
    const id = requestAnimationFrame(() => setExpanded(true));
    return () => cancelAnimationFrame(id);
  }, [running]);


  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => bumpBreathSeconds(todayKey(), 1), 1000);
    return () => clearInterval(iv);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    if (count > 0) {
      const t = setTimeout(() => setCount((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
    const p = PATTERNS[pattern];
    const order: Phase[] = ["in", "hold", "out", "restHold"];
    let idx = order.indexOf(phase);
    for (let i = 0; i < 4; i++) {
      idx = (idx + 1) % 4;
      const nxt = order[idx];
      if (p[nxt] > 0) {
        setPhase(nxt);
        setCount(p[nxt]);
        return;
      }
    }
  }, [count, phase, pattern, running]);

  const label =
    phase === "in" ? "Breathe in" : phase === "out" ? "Breathe out" : "Hold";
  const scale = !running || !expanded
    ? 0.5
    : phase === "in" || phase === "hold"
      ? 1
      : 0.5;

  const p = PATTERNS[pattern];
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col px-5 py-6">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1 text-xs text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Home
        </Link>
        <div className="rounded-full border border-border bg-card px-3 py-1 text-[11px] text-primary">
          Total Today: {mins}m {secs}s
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
          <Wind className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-xl text-foreground leading-tight">Mindful Breathing Space</h1>
          <p className="text-[11px] text-muted-foreground">Breathe deliberate cycles with your companion.</p>
        </div>
      </div>

      <div className="mt-5 text-[10px] uppercase tracking-wider text-muted-foreground">
        Select breathing technique
      </div>
      <div className="mt-2 space-y-2">
        {(Object.entries(PATTERNS) as [PatternKey, typeof PATTERNS[PatternKey]][]).map(([k, v]) => (
          <button
            key={k}
            onClick={() => {
              setPattern(k);
              setPhase("in");
              setCount(v.in);
            }}
            className={cn(
              "w-full rounded-2xl border p-3 text-left transition-colors",
              pattern === k ? "border-primary bg-primary/5" : "border-border bg-card",
            )}
          >
            <div className="flex items-center justify-between">
              <div className="font-display text-sm text-foreground">{v.label}</div>
              {pattern === k && <span className="h-2 w-2 rounded-full bg-primary" />}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">{v.blurb}</div>
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-3xl border border-dashed border-border p-5 text-center">
        <div className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
          <Wind className="h-4 w-4" />
        </div>
        <div className="mt-2 font-display text-lg text-foreground">{p.label}</div>
        <p className="mt-1 text-[11px] text-muted-foreground">{p.blurb}</p>

        <div className="mt-4 flex justify-center">
          <div className="relative flex h-40 w-40 items-center justify-center">
            <div
              className="h-full w-full rounded-full bg-primary/25 transition-transform ease-in-out"
              style={{
                transform: `scale(${scale})`,
                transitionDuration:
                  phase === "in" ? `${p.in}s` : phase === "out" ? `${p.out}s` : "0.4s",
              }}
            />
            <div className="absolute text-center">
              <div className="font-display text-lg text-foreground">{running ? label : "Ready"}</div>
              {running && <div className="text-3xl font-light text-primary">{count}</div>}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (!running) {
              setPhase("in");
              setCount(p.in);
            }
            setRunning((r) => !r);
          }}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
        >
          ▶ {running ? "Pause Exercise" : "Begin Exercise"}
        </button>
      </div>

      <Disclaimer variant="short" className="mt-5" />
    </div>
  );
}
