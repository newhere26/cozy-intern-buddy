import { useState } from "react";
import { ChevronDown, Droplet, Minus, Plus, Utensils } from "lucide-react";
import { addMeal, bumpWater, useApp } from "@/lib/store";
import { toKey } from "@/lib/date";
import { pickMealLine } from "@/lib/companion-lines";
import { cn } from "@/lib/utils";

export function WellnessTile({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  const app = useApp();
  const today = toKey(new Date());
  const water = app.water[today] ?? 0;
  const mealsToday = app.meals[today] ?? [];

  return (
    <div className="rounded-3xl bg-card p-4 shadow-sm transition-all">
      <button onClick={onToggle} className="flex w-full items-start justify-between">
        <div className="flex items-center gap-2">
          <Droplet className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Wellness</span>
        </div>
        <ChevronDown
          className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
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
    <div className="mt-4 space-y-3">
      <div className="flex rounded-full bg-secondary/60 p-0.5">
        {(["hydrate", "nourish"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-full py-1 text-xs font-medium capitalize",
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
            <div
              key={splash}
              className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-sky-400/70 to-cyan-300/60 transition-all duration-500 ease-out water-wave"
              style={{ height: `${Math.min(100, water * 12.5)}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center font-display text-3xl text-foreground drop-shadow">
              {water}
            </div>
            {splash > 0 && (
              <span
                key={`drop-${splash}`}
                className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 text-2xl droplet-fall"
              >
                💧
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => bumpWater(today, -1)}
              className="rounded-full border border-border p-2"
              aria-label="One less"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={addWater}
              className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground active:scale-95 transition-transform"
            >
              +1 glass
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {(["breakfast", "lunch", "dinner", "snack"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMealType(m)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] capitalize",
                  mealType === m
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground",
                )}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="what you ate (optional)"
              className="flex-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs"
            />
            <button
              onClick={saveMeal}
              className="rounded-full bg-primary p-2 text-primary-foreground"
              aria-label="Add meal"
            >
              <Plus className="h-3.5 w-3.5" />
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
                className="flex items-center justify-between rounded-xl bg-secondary/40 px-3 py-1.5 text-[11px]"
              >
                <Utensils className="h-3 w-3 text-muted-foreground" />
                <span className="flex-1 pl-2 capitalize text-foreground">{m.type}</span>
                <span className="text-muted-foreground">{m.note ?? ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
