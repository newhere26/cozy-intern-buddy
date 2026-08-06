import { useState } from "react";
import { ChevronDown, Droplet, Minus, Plus, Utensils } from "lucide-react";
import { addMeal, bumpWater, useApp } from "@/lib/store";
import { toKey } from "@/lib/date";
import { pickMealLine } from "@/lib/companion-lines";
import { cn } from "@/lib/utils";

const tap =
  "active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card";

export function WellnessTile({
  open,
  onToggle,
  className,
}: {
  open: boolean;
  onToggle: () => void;
  className?: string;
}) {
  const app = useApp();
  const today = toKey(new Date());
  const water = app.water[today] ?? 0;
  const mealsToday = app.meals[today] ?? [];

  return (
    <div className={cn("rounded-3xl bg-card p-4 shadow-sm transition-all", className)}>

      <button
        onClick={onToggle}
        className={cn("flex w-full items-start justify-between", tap)}
      >
        <div className="flex min-w-0 items-center gap-2">
          <Droplet className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate text-sm font-medium text-foreground">Wellness</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {!open && (
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-3xl leading-none text-foreground">{water}</span>
            <span className="text-xs text-muted-foreground">glasses</span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            {mealsToday.length} meal{mealsToday.length === 1 ? "" : "s"} logged
          </div>
        </div>
      )}

      {open && <Expanded />}
    </div>
  );
}

function Expanded() {
  const app = useApp();
  const today = toKey(new Date());
  const water = app.water[today] ?? 0;
  const meals = app.meals[today] ?? [];
  const [tab, setTab] = useState<"hydrate" | "nourish">("hydrate");
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("lunch");
  const [note, setNote] = useState("");
  const [splash, setSplash] = useState(0);
  const [mealMsg, setMealMsg] = useState<string | null>(null);

  const addWater = () => {
    bumpWater(today, 1);
    setSplash((s) => s + 1);
  };

  const saveMeal = () => {
    addMeal(today, { type: mealType, note: note.trim() || undefined });
    setNote("");
    setMealMsg(pickMealLine());
    setTimeout(() => setMealMsg(null), 4500);
  };

  return (
    <div className="mt-4 max-h-[60svh] space-y-3 overflow-y-auto overscroll-contain pr-0.5">
      <div className="flex rounded-full bg-secondary/60 p-1">
        {(["hydrate", "nourish"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "min-h-10 flex-1 rounded-full text-xs font-medium capitalize",
              tap,
              tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "hydrate" ? (
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="relative h-28 w-24 overflow-hidden rounded-b-3xl rounded-t-lg border-2 border-border bg-secondary/30">
            {/* water body */}
            <div
              className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-sky-400/70 to-cyan-300/60 transition-[height] duration-700 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]"
              style={{ height: `${Math.min(100, water * 12.5)}%` }}
            >
              {/* surface shimmer */}
              <div className="absolute -top-1 left-0 h-2 w-[200%] rounded-full bg-cyan-200/50 water-wave" />
              {splash > 0 && (
                <>
                  <span
                    key={`b1-${splash}`}
                    className="absolute bottom-1 left-1/3 h-1.5 w-1.5 rounded-full bg-white/60 bubble-up"
                  />
                  <span
                    key={`b2-${splash}`}
                    className="absolute bottom-0 left-2/3 h-1 w-1 rounded-full bg-white/50 bubble-up [animation-delay:300ms]"
                  />
                </>
              )}
            </div>

            {/* falling droplets */}
            {splash > 0 && (
              <div key={`drops-${splash}`} className="pointer-events-none absolute inset-0">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="absolute top-3 h-2.5 w-2 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-sky-200/90 droplet-fall"
                    style={{
                      left: `${34 + i * 16}%`,
                      animationDelay: `${i * 130}ms`,
                    }}
                  />
                ))}
                <span
                  className="absolute h-4 w-4 rounded-full border border-cyan-100/70 splash-ring"
                  style={{ left: "50%", bottom: `${Math.min(100, water * 12.5)}%` }}
                />
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center font-display text-3xl text-foreground drop-shadow">
              {water}
            </div>
          </div>

          <div className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
            <button
              onClick={() => bumpWater(today, -1)}
              className={cn(
                "grid h-12 w-12 shrink-0 place-items-center rounded-full border border-border bg-secondary/60 text-foreground",
                tap,
              )}
              aria-label="One less glass"
            >
              <Minus className="h-5 w-5" />
            </button>
            <button
              onClick={addWater}
              className={cn(
                "min-h-12 w-full rounded-full bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-sm",
                tap,
              )}
            >
              +1 glass
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2 min-[360px]:grid-cols-4">
            {(["breakfast", "lunch", "dinner", "snack"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMealType(m)}
                className={cn(
                  "min-h-11 w-full truncate rounded-full px-2 text-[11px] capitalize",
                  tap,
                  mealType === m
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "border border-border bg-secondary/50 text-foreground",
                )}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="what you ate (optional)"
              className="min-h-11 w-full rounded-2xl border border-border bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <button
              onClick={saveMeal}
              className={cn(
                "flex min-h-11 w-full items-center justify-center gap-1 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground",
                tap,
              )}
            >
              <Plus className="h-4 w-4" /> Add meal
            </button>
          </div>
          {mealMsg && (
            <div className="animate-in fade-in rounded-2xl bg-primary/15 px-3 py-2 text-[11px] italic text-foreground">
              {app.companion === "capybara" ? "🦫" : "💬"} {mealMsg}
            </div>
          )}
          <div className="space-y-1">
            {meals.length === 0 && (
              <p className="text-[11px] text-muted-foreground">
                Nothing logged yet. Warm food when you can.
              </p>
            )}
            {meals.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2 rounded-xl bg-secondary/40 px-3 py-2 text-[11px]"
              >
                <Utensils className="h-3 w-3 shrink-0 text-muted-foreground" />
                <span className="shrink-0 capitalize text-foreground">{m.type}</span>
                <span className="min-w-0 flex-1 truncate text-right text-muted-foreground">
                  {m.note ?? ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
