import { useMemo, useState } from "react";
import { ChevronDown, Stethoscope, Search, Plus } from "lucide-react";
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

const CUSTOM = "__custom__";

export function ProcedureTile({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  const app = useApp();
  const [name, setName] = useState<string>(PROCEDURES[0]);
  const [custom, setCustom] = useState("");
  const [q, setQ] = useState("");
  const [ease, setEase] = useState(3);
  const [confidence, setConfidence] = useState(3);
  const [sup, setSup] = useState<Supervision>("assisted");
  const [notes, setNotes] = useState("");

  const list = useMemo(
    () => PROCEDURES.filter((p) => !q || p.toLowerCase().includes(q.toLowerCase())),
    [q],
  );

  const recent = app.procedures.slice(0, 3);

  const submit = () => {
    const finalName = name === CUSTOM ? custom.trim() : name;
    if (!finalName) return;
    addProcedure({
      date: toKey(new Date()),
      name: finalName,
      ease,
      confidence,
      supervision: sup,
      notes: notes.trim() || undefined,
    });
    setNotes("");
    setCustom("");
    setName(PROCEDURES[0]);
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
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search procedure…"
              className="w-full rounded-full border border-border bg-background pl-8 pr-3 py-1.5 text-xs"
            />
          </div>

          <div className="max-h-56 space-y-1 overflow-y-auto rounded-2xl border border-border/60 bg-background/50 p-1.5">
            {list.map((p) => (
              <button
                key={p}
                onClick={() => setName(p)}
                className={cn(
                  "flex w-full items-center rounded-xl px-3 py-1.5 text-left text-xs",
                  name === p
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary/40",
                )}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setName(CUSTOM)}
              className={cn(
                "flex w-full items-center gap-1.5 rounded-xl px-3 py-1.5 text-left text-xs italic",
                name === CUSTOM
                  ? "bg-primary text-primary-foreground"
                  : "text-accent hover:bg-secondary/40",
              )}
            >
              <Plus className="h-3 w-3" /> Add custom procedure…
            </button>
          </div>

          {name === CUSTOM && (
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Type procedure name"
              className="w-full rounded-full border border-border bg-background px-3 py-1.5 text-xs"
            />
          )}

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
