import { useState } from "react";
import { setRotationReview, useApp } from "@/lib/store";
import type { Rotation } from "@/lib/store";
import { cn } from "@/lib/utils";

export const FELT_EMOJI = ["😞", "😕", "😐", "🙂", "😄"];

const FELT_LABEL = ["rough", "heavy", "okay", "good", "great"];

/** Drawn 5-point smiley scale: mouth curve and colour shift with the score. */
export function SmileyFace({ score, className }: { score: number; className?: string }) {
  const n = Math.min(5, Math.max(1, score));
  // -6 (frown) .. +6 (smile)
  const curve = (n - 3) * 3;
  const tone = [
    "text-rose-300",
    "text-orange-300",
    "text-amber-200",
    "text-lime-300",
    "text-emerald-300",
  ][n - 1];
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-6 w-6", tone, className)}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9" cy="10" r="1.15" fill="currentColor" />
      <circle cx="15" cy="10" r="1.15" fill="currentColor" />
      <path
        d={`M8 ${15 - curve / 6} Q12 ${15 + curve} 16 ${15 - curve / 6}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function reviewSummary(r: { felt: number; learned: number; pgInterest: number }) {
  return `${FELT_LABEL[r.felt - 1] ?? "okay"} · learned ${r.learned}/5 · PG ${r.pgInterest}/5`;
}

export function isFinished(rot: Rotation, today: string) {
  return rot.end < today;
}

function Scale({
  label,
  value,
  onChange,
  smiley,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  smiley?: boolean;
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
              "flex min-h-11 items-center justify-center rounded-xl border text-sm transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              value === n
                ? "border-primary bg-primary/25 text-foreground"
                : "border-border bg-secondary/40 text-muted-foreground",
            )}
            aria-label={`${label}: ${n} of 5`}
          >
            {smiley ? <SmileyFace score={n} /> : n}
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
        {existing ? (
          <span className="flex items-center justify-center gap-1.5">
            <SmileyFace score={existing.felt} className="h-4 w-4" />
            {reviewSummary(existing)} · edit
          </span>
        ) : (
          "How was this posting?"
        )}
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-2.5 rounded-2xl bg-background/50 p-3">
      <Scale label="How did it feel?" value={felt} onChange={setFelt} smiley />
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
