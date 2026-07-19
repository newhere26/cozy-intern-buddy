import { useState } from "react";
import { ChevronDown, Stethoscope } from "lucide-react";
import { addProcedure, useApp } from "@/lib/store";
import type { Supervision } from "@/lib/store";
import { PROCEDURES } from "@/lib/data";
import { toKey } from "@/lib/date";
import { cn } from "@/lib/utils";

const SUPS: { id: Supervision; label: string }[] = [
  { id: "observed", label: "Observed" },
  { id: "assisted", label: "Assisted" },
  { id: "independent", label: "Independent" },
];

export function ProcedureTile({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  const app = useApp();
  const [name, setName] = useState<string>(PROCEDURES[0]);
  const [ease, setEase] = useState(3);
  const [confidence, setConfidence] = useState(3);
  const [sup, setSup] = useState<Supervision>("assisted");
  const [notes, setNotes] = useState("");

  const recent = app.procedures.slice(0, 3);

  const submit = () => {
    addProcedure({
      date: toKey(new Date()),
      name,
      ease,
      confidence,
      supervision: sup,
      notes: notes.trim() || undefined,
    });
    setNotes("");
    setEase(3);
    setConfidence(3);
  };

  return (
    <div className="rounded-3xl bg-card p-4 shadow-sm">
      <button onClick={onToggle} className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Log a procedure</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">{app.procedures.length} total</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </div>
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          <select
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-full border border-border bg-background px-3 py-2 text-xs"
          >
            {PROCEDURES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <Dots label="Ease" value={ease} onChange={setEase} />
          <Dots label="Confidence" value={confidence} onChange={setConfidence} />

          <div>
            <div className="mb-1 text-[11px] text-muted-foreground">Supervision</div>
            <div className="flex gap-1.5">
              {SUPS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSup(s.id)}
                  className={cn(
                    "flex-1 rounded-full py-1.5 text-[11px]",
                    sup === s.id
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="notes (optional)"
            className="w-full rounded-full border border-border bg-background px-3 py-1.5 text-xs"
          />

          <button
            onClick={submit}
            className="w-full rounded-full bg-primary py-2 text-xs font-medium text-primary-foreground"
          >
            Save
          </button>

          {recent.length > 0 && (
            <div className="pt-1">
              <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                Recent
              </div>
              <div className="space-y-1">
                {recent.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl bg-secondary/40 px-3 py-1.5 text-[11px]"
                  >
                    <span className="text-foreground">{p.name}</span>
                    <span className="capitalize text-muted-foreground">{p.supervision}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Dots({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={cn(
              "h-4 w-4 rounded-full border border-border",
              n <= value ? "bg-primary" : "bg-transparent",
            )}
            aria-label={`${label} ${n}`}
          />
        ))}
      </div>
    </div>
  );
}
