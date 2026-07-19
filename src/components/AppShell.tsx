import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background">
      <main className="flex-1 pb-28">{children}</main>
      <BottomNav />
    </div>
  );
}
