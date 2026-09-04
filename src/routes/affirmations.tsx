import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AFFIRMATIONS } from "@/lib/data";
import { ArrowLeft, RefreshCcw } from "lucide-react";

export const Route = createFileRoute("/affirmations")({
  head: () => ({
    meta: [
      { title: "Affirmations — WithYou" },
      { name: "description", content: "Gentle, medicine-flavoured affirmations for interns." },
    ],
  }),
  component: AffirmationsPage,
});

function AffirmationsPage() {
  const [i, setI] = useState(() => Math.floor(Math.random() * AFFIRMATIONS.length));
  const line = AFFIRMATIONS[i];
  const next = useMemo(
    () => () => setI((p) => (p + 1 + Math.floor(Math.random() * (AFFIRMATIONS.length - 1))) % AFFIRMATIONS.length),
    [],
  );

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col px-6 py-6">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-1 text-xs text-muted-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Home
        </Link>
        <span className="text-xs text-muted-foreground">
          {i + 1} / {AFFIRMATIONS.length}
        </span>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <p className="font-display text-3xl leading-snug text-foreground text-balance">
          {line}
        </p>
      </div>
      <button
        onClick={next}
        className="mx-auto mb-6 flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
      >
        <RefreshCcw className="h-4 w-4" /> Another one
      </button>
    </div>
  );
}
