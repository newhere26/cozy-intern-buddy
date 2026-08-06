import { useState } from "react";
import { setRotationReview, useApp } from "@/lib/store";
import type { Rotation } from "@/lib/store";
import { cn } from "@/lib/utils";

export const FELT_EMOJI = ["😞", "😕", "😐", "🙂", "😄"];

export function reviewSummary(r: { felt: number; learned: number; pgInterest: number }) {
  return `${FELT_EMOJI[r.felt - 1] ?? "🙂"} · learned ${r.learned}/5 · PG ${r.pgInterest}/5`;
}

export function isFinished(rot: Rotation, today: string) {
  return rot.end < today;
}

function Scale({
  label,
  value,
  onChange,
  emoji,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  emoji?: boolean;
}) {
  return (
    <div>
      <div className="mb-1 text-[11px] text-muted-foreground">{label}</div>
      <div className="grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              "min-h-11 rounded-xl border text-sm transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              value === n
                ? "border-primary bg-primary/25 text-foreground"
                : "border-border bg-secondary/40 text-muted-foreground",
            )}
            aria-label={`${label}: ${n} of 5`}
          >
            {emoji ? FELT_EMOJI[n - 1] : n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PostingReview({ rotation }: { rotation: Rotation }) {
  const app = useApp();
  const existing = app.rotationReviews[rotation.id];
  const [open, setOpen] = useState(false);
  const [felt, setFelt] = useState(existing?.felt ?? 3);
  const [learned, setLearned] = useState(existing?.learned ?? 3);
  const [pg, setPg] = useState(existing?.pgInterest ?? 3);
  const [note, setNote] = useState(existing?.note ?? "");

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 w-full rounded-full border border-border/70 bg-background/40 px-3 py-2 text-[11px] text-foreground transition-transform active:scale-95"
      >
        {existing ? reviewSummary(existing) + " · edit" : "How was this posting?"}
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-2.5 rounded-2xl bg-background/50 p-3">
      <Scale label="How did it feel?" value={felt} onChange={setFelt} emoji />
      <Scale label="How much did you learn?" value={learned} onChange={setLearned} />
      <Scale label="Pick this for PG?" value={pg} onChange={setPg} />
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="a line to remember it by (optional)"
        className="min-h-11 w-full rounded-2xl border border-border bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      />
      <div className="flex gap-2">
        <button
          onClick={() => {
            setRotationReview(rotation.id, {
              felt,
              learned,
              pgInterest: pg,
              note: note.trim() || undefined,
            });
            setOpen(false);
          }}
          className="min-h-10 flex-1 rounded-full bg-primary text-xs font-semibold text-primary-foreground active:scale-95"
        >
          Save
        </button>
        <button
          onClick={() => setOpen(false)}
          className="min-h-10 rounded-full border border-border px-4 text-xs text-muted-foreground active:scale-95"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
