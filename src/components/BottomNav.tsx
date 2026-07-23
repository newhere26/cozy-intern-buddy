import { Link, useLocation } from "@tanstack/react-router";
import { Home, BookHeart, Wrench, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/journal", label: "Writing", icon: BookHeart },
  { to: "/tools", label: "Tools", icon: Wrench },
  { to: "/journey", label: "Journey", icon: Compass },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 -translate-x-1/2 w-full max-w-md px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2"
      aria-label="Primary"
    >
      <div className="flex items-center justify-around rounded-full border border-border/60 bg-card/80 px-2 py-2 backdrop-blur-md shadow-lg shadow-black/20">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-full px-4 py-1.5 transition-colors",
                active
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
