import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/relaxation")({
  head: () => ({
    meta: [
      { title: "Relaxation — Serenity" },
      { name: "description", content: "Guided breathing for a quiet minute." },
    ],
  }),
  component: RelaxationPage,
});

type Phase = "in" | "hold" | "out" | "restHold";
const PATTERNS = {
  box: { in: 4, hold: 4, out: 4, restHold: 4, label: "Box breathing (4·4·4·4)" },
  "4-7-8": { in: 4, hold: 7, out: 8, restHold: 0, label: "4·7·8 breathing" },
} as const;

function RelaxationPage() {
  const [pattern, setPattern] = useState<keyof typeof PATTERNS>("box");
  const [phase, setPhase] = useState<Phase>("in");
  const [count, setCount] = useState<number>(PATTERNS.box.in);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    if (count > 0) {
      const t = setTimeout(() => setCount((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
    const p = PATTERNS[pattern];
    const nextPhase: Phase =
      phase === "in" ? "hold" : phase === "hold" ? "out" : phase === "out" ? "restHold" : "in";
    const nextCount = p[nextPhase];
    if (nextPhase === "restHold" && nextCount === 0) {
      setPhase("in");
      setCount(p.in);
    } else {
      setPhase(nextPhase);
      setCount(nextCount);
    }
  }, [count, phase, pattern, running]);

  const label =
    phase === "in" ? "Breathe in" : phase === "out" ? "Breathe out" : "Hold";
  const scale = phase === "in" ? 1 : phase === "out" ? 0.5 : phase === "hold" ? 1 : 0.5;

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col px-6 py-6">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1 text-xs text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Home
        </Link>
        <select
          value={pattern}
          onChange={(e) => {
            const p = e.target.value as keyof typeof PATTERNS;
            setPattern(p);
            setPhase("in");
            setCount(PATTERNS[p].in);
          }}
          className="rounded-full border border-border bg-card px-3 py-1 text-xs"
        >
          {Object.entries(PATTERNS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="relative flex h-64 w-64 items-center justify-center">
          <div
            className={cn(
              "h-full w-full rounded-full bg-primary/30 transition-transform ease-in-out",
            )}
            style={{
              transform: `scale(${scale})`,
              transitionDuration:
                phase === "in"
                  ? `${PATTERNS[pattern].in}s`
                  : phase === "out"
                    ? `${PATTERNS[pattern].out}s`
                    : "0.4s",
            }}
          />
          <div className="absolute text-center">
            <div className="font-display text-3xl text-foreground">{label}</div>
            <div className="mt-1 text-5xl font-light text-primary">{count}</div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setRunning((r) => !r)}
        className="mx-auto mb-6 rounded-full border border-border px-6 py-2.5 text-sm text-foreground"
      >
        {running ? "Pause" : "Resume"}
      </button>
    </div>
  );
}
