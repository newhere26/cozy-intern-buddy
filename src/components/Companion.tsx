import { COMPANIONS } from "@/lib/data";
import type { CompanionId } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Companion({
  id,
  className,
  size = "lg",
}: {
  id: CompanionId;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const c = COMPANIONS.find((x) => x.id === id) ?? COMPANIONS[0];
  const dims =
    size === "lg" ? "h-full w-full" : size === "md" ? "h-24 w-24" : "h-12 w-12";
  return (
    <img
      src={c.img}
      alt={c.name}
      className={cn("select-none object-contain float-slow drop-shadow-2xl", dims, className)}
      draggable={false}
    />
  );
}
