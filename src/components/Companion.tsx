import { COMPANIONS } from "@/lib/data";
import type { CompanionId } from "@/lib/store";
import { STORE, activeMilestones } from "@/lib/store-items";
import { cn } from "@/lib/utils";

export function Companion({
  id,
  className,
  size = "lg",
  overlays = false,
  night = false,
  equippedItems = [],
  completedWeeks = 0,
}: {
  id: CompanionId;
  className?: string;
  size?: "sm" | "md" | "lg";
  overlays?: boolean;
  night?: boolean;
  equippedItems?: string[];
  completedWeeks?: number;
}) {
  const c = COMPANIONS.find((x) => x.id === id) ?? COMPANIONS[0];
  const dims =
    size === "lg" ? "h-full w-full" : size === "md" ? "h-24 w-24" : "h-12 w-12";

  const items = STORE.filter((s) => equippedItems.includes(s.id));
  const milestones = activeMilestones(completedWeeks);

  return (
    <div className={cn("relative", dims, className)}>
      {/* Night lamp glow behind companion */}
      {night && (
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
          <div className="h-24 w-24 rounded-full bg-amber-300/25 blur-2xl animate-pulse" />
          <div className="absolute left-1/2 top-2 -translate-x-1/2 text-2xl">💡</div>
        </div>
      )}

      <img
        src={c.img}
        alt={c.name}
        className="relative z-10 h-full w-full select-none object-contain float-slow drop-shadow-2xl"
        draggable={false}
      />

      {overlays && (
        <>
          {/* Milestone badges — top left stack */}
          <div className="pointer-events-none absolute left-0 top-2 z-20 flex flex-col gap-1">
            {milestones.map((m) => (
              <span
                key={m.label}
                title={m.label}
                className="rounded-full bg-card/80 px-1.5 py-0.5 text-lg shadow"
              >
                {m.emoji}
              </span>
            ))}
          </div>
          {/* Store item overlays */}
          {items.map((it) => (
            <span
              key={it.id}
              title={it.name}
              className={cn(
                "pointer-events-none absolute z-20 text-3xl drop-shadow",
                it.slot === "head" && "left-1/2 top-0 -translate-x-1/2 -translate-y-2",
                it.slot === "eyes" && "left-1/2 top-[26%] -translate-x-1/2",
                it.slot === "neck" && "left-1/2 top-[50%] -translate-x-1/2",
                it.slot === "hand" && "right-1 bottom-[24%]",
                it.slot === "body" && "left-1/2 top-[42%] -translate-x-1/2",
                it.slot === "beside" && "right-0 bottom-2",
              )}
            >
              {it.emoji}
            </span>
          ))}
          {/* Night coffee */}
          {night && (
            <span className="pointer-events-none absolute right-2 bottom-[26%] z-20 text-3xl drop-shadow">
              ☕
            </span>
          )}
        </>
      )}
    </div>
  );
}
