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

  const shopItems = STORE.filter((s) => equippedItems.includes(s.id));
  const milestones = activeMilestones(completedWeeks);

  // Map milestone → slot so it's worn anatomically
  const MILESTONE_SLOT: Record<string, "neck" | "body" | "head" | "hand"> = {
    "3-month stethoscope": "neck",
    "6-month gown": "body",
    "9-month cap": "head",
    "12-month diploma": "hand",
  };

  // Shop items win over milestones on the same slot
  const takenSlots = new Set(shopItems.map((it) => it.slot));
  const milestoneOverlays = milestones
    .map((m) => ({ ...m, slot: MILESTONE_SLOT[m.label] }))
    .filter((m) => m.slot && !takenSlots.has(m.slot));

  const slotClass = (slot: string) =>
    cn(
      "pointer-events-none absolute z-20 drop-shadow",
      slot === "head" && "left-1/2 top-[-4%] -translate-x-1/2 text-4xl",
      slot === "eyes" && "left-1/2 top-[28%] -translate-x-1/2 text-2xl",
      slot === "neck" && "left-1/2 top-[48%] -translate-x-1/2 text-3xl",
      slot === "body" && "left-1/2 top-[55%] -translate-x-1/2 text-5xl opacity-90",
      slot === "hand" && "right-[6%] bottom-[26%] text-3xl",
      slot === "beside" && "right-[-4%] bottom-2 text-3xl",
    );

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
          {/* Milestone accessories worn on the companion */}
          {milestoneOverlays.map((m) => (
            <span key={m.label} title={m.label} className={slotClass(m.slot!)}>
              {m.emoji}
            </span>
          ))}
          {/* Shop items */}
          {shopItems.map((it) => (
            <span key={it.id} title={it.name} className={slotClass(it.slot)}>
              {it.emoji}
            </span>
          ))}
          {/* Night coffee */}
          {night && !takenSlots.has("hand") && (
            <span className="pointer-events-none absolute right-[6%] bottom-[26%] z-20 text-3xl drop-shadow">
              ☕
            </span>
          )}
        </>
      )}
    </div>
  );
}
