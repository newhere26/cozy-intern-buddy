import { useState, useCallback } from "react";
import { COMPANIONS } from "@/lib/data";
import { useApp, type CompanionId } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Companion({
  id,
  className,
  size = "lg",
  night = false,
  animationsEnabled,
  onTap,
}: {
  id: CompanionId;
  className?: string;
  size?: "sm" | "md" | "lg";
  night?: boolean;
  animationsEnabled?: boolean;
  onTap?: () => void;
}) {
  const app = useApp();
  const enabled = animationsEnabled !== undefined ? animationsEnabled : app.animationsEnabled !== false;

  const [tapped, setTapped] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);

  const handleClick = useCallback(() => {
    if (enabled) {
      setTapped(true);
      const newHeart = { id: Date.now(), x: 40 + Math.random() * 20 };
      setHearts((prev) => [...prev.slice(-3), newHeart]);
      setTimeout(() => setTapped(false), 550);
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
      }, 1000);
    }
    onTap?.();
  }, [enabled, onTap]);

  const c = COMPANIONS.find((x) => x.id === id) ?? COMPANIONS[0];
  const dims =
    size === "lg" ? "h-full w-full" : size === "md" ? "h-24 w-24" : "h-12 w-12";

  return (
    <div
      onClick={handleClick}
      className={cn(
        "relative",
        dims,
        className,
        enabled && (tapped ? "companion-tap" : "companion-breathe"),
      )}
      style={{ containerType: "inline-size" }}
    >
      {/* Night lamp glow behind companion */}
      {night && (
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
          <div className="h-24 w-24 rounded-full bg-amber-300/25 blur-2xl animate-pulse" />
          <div className="absolute left-1/2 top-2 -translate-x-1/2 text-2xl">💡</div>
        </div>
      )}

      {/* Tap Heart Rise particle */}
      {enabled &&
        hearts.map((h) => (
          <span
            key={h.id}
            className="pointer-events-none absolute z-30 select-none text-xl heart-rise"
            style={{ left: `${h.x}%`, top: "20%" }}
          >
            💖
          </span>
        ))}

      <img
        src={c.img}
        alt={c.name}
        className={cn(
          "relative z-10 h-full w-full select-none object-contain drop-shadow-2xl",
          !enabled && "float-slow",
        )}
        draggable={false}
      />
    </div>
  );
}
