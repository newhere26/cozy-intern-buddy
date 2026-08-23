import { COMPANIONS } from "@/lib/data";
import type { CompanionId } from "@/lib/store";
import { activeMilestones } from "@/lib/store-items";
import { cn } from "@/lib/utils";

type Slot = "head" | "eyes" | "neck" | "body" | "hand" | "beside";

interface Anchor {
  /** horizontal centre, % of container width */
  x: number;
  /** vertical centre, % of container height */
  y: number;
  /** glyph size in cqw (% of container width) */
  size: number;
  rotate?: number;
}

/**
 * Per-companion anchor points so accessories sit anatomically:
 * head on the crown, eyewear across the eyes, neck items under the chin,
 * hand items at the paw, gown over the torso, props on the ground beside.
 */
const ANCHORS: Record<CompanionId, Record<Slot, Anchor>> = {
  capybara: {
    head: { x: 50, y: 13, size: 26, rotate: -6 },
    eyes: { x: 50, y: 30, size: 20 },
    neck: { x: 50, y: 47, size: 22 },
    body: { x: 50, y: 66, size: 40 },
    hand: { x: 76, y: 71, size: 20, rotate: 8 },
    beside: { x: 96, y: 90, size: 20 },
  },
  cow: {
    head: { x: 50, y: 11, size: 24, rotate: -5 },
    eyes: { x: 50, y: 28, size: 19 },
    neck: { x: 50, y: 46, size: 22 },
    body: { x: 50, y: 65, size: 40 },
    hand: { x: 78, y: 72, size: 19, rotate: 8 },
    beside: { x: 96, y: 90, size: 20 },
  },
  owl: {
    head: { x: 50, y: 9, size: 27, rotate: -4 },
    eyes: { x: 50, y: 27, size: 21 },
    neck: { x: 50, y: 44, size: 21 },
    body: { x: 50, y: 63, size: 38 },
    hand: { x: 79, y: 70, size: 18, rotate: 10 },
    beside: { x: 96, y: 90, size: 20 },
  },
};

/** Some glyphs read visually larger/smaller than others at the same font-size. */
const GLYPH_SCALE: Record<string, number> = {
  "🩺": 1.05,
  "🥼": 1.15,
  "🎓": 1.0,
  "📜": 0.9,
  "👑": 0.85,
  "🧢": 1.0,
  "🧻": 0.8,
  "🕶️": 0.95,
  "🪙": 0.6,
  "🧣": 1.0,
  "🏅": 0.75,
  "☕": 0.9,
  "📕": 0.85,
  "🍩": 0.75,
  "🪴": 1.1,
  "🎂": 1.0,
};

export function Companion({
  id,
  className,
  size = "lg",
  overlays = false,
  night = false,
  completedWeeks = 0,
  backdropUrl,
}: {
  id: CompanionId;
  className?: string;
  size?: "sm" | "md" | "lg";
  overlays?: boolean;
  night?: boolean;
  completedWeeks?: number;
  /** Artwork shown softly behind the companion */
  backdropUrl?: string;
}) {
  const c = COMPANIONS.find((x) => x.id === id) ?? COMPANIONS[0];
  const anchors = ANCHORS[c.id] ?? ANCHORS.capybara;
  const dims =
    size === "lg" ? "h-full w-full" : size === "md" ? "h-24 w-24" : "h-12 w-12";

  const milestones = activeMilestones(completedWeeks);

  // Map milestone → slot so it's worn anatomically
  const MILESTONE_SLOT: Record<string, Slot> = {
    "3-month stethoscope": "neck",
    "6-month gown": "body",
    "9-month cap": "head",
    "12-month diploma": "hand",
  };

  const milestoneOverlays = milestones
    .map((m) => ({ ...m, slot: MILESTONE_SLOT[m.label] }))
    .filter((m) => m.slot);

  const takenSlots = new Set(milestoneOverlays.map((m) => m.slot as Slot));

  const worn = milestoneOverlays.map((m) => ({
    key: m.label,
    title: m.label,
    emoji: m.emoji,
    slot: m.slot as Slot,
  }));

  const glyphStyle = (slot: Slot, emoji: string) => {
    const a = anchors[slot] ?? anchors.head;
    const scale = GLYPH_SCALE[emoji] ?? 1;
    return {
      left: `${a.x}%`,
      top: `${a.y}%`,
      fontSize: `${a.size * scale}cqw`,
      lineHeight: 1,
      transform: `translate(-50%, -50%) rotate(${a.rotate ?? 0}deg)`,
    } as const;
  };

  return (
    <div
      className={cn("relative", dims, className)}
      style={{ containerType: "inline-size" }}
    >
      {/* Collected artwork, hung on the wall behind the companion */}
      {backdropUrl && (
        <div className="pointer-events-none absolute inset-x-3 top-1 bottom-4 z-0 flex flex-col items-center">
          {/* Wall Hanging Hook & Wire */}
          <div className="z-10 -mb-1 flex flex-col items-center">
            <div className="h-2 w-2 rounded-full bg-amber-700/80 shadow-xs ring-1 ring-amber-900/30" />
            <div className="h-2 w-0.5 bg-amber-900/40" />
          </div>
          {/* Cozy Framed Painting */}
          <div className="relative h-full w-full overflow-hidden rounded-2xl border-[3px] border-amber-900/25 bg-card/90 p-1 shadow-md ring-1 ring-border/50 dark:border-amber-700/40">
            <div className="relative h-full w-full overflow-hidden rounded-xl bg-muted/30">
              <img
                src={backdropUrl}
                alt="Hanging artwork"
                className="h-full w-full object-cover opacity-90 transition-opacity duration-300"
                draggable={false}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/5 via-transparent to-white/10" />
            </div>
          </div>
        </div>
      )}

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
          {worn.map((w) => (
            <span
              key={w.key}
              title={w.title}
              className="pointer-events-none absolute z-20 select-none drop-shadow"
              style={glyphStyle(w.slot, w.emoji)}
            >
              {w.emoji}
            </span>
          ))}
          {/* Night coffee */}
          {night && !takenSlots.has("hand") && (
            <span
              className="pointer-events-none absolute z-20 select-none drop-shadow"
              style={glyphStyle("hand", "☕")}
            >
              ☕
            </span>
          )}
        </>
      )}
    </div>
  );
}
