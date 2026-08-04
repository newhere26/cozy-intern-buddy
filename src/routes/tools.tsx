import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PHRASEBOOK, PHRASE_SYSTEMS, HELPER_WORDS } from "@/lib/phrasebook";
import { DRUGS, DRUG_CLASSES } from "@/lib/drugs";
import { cn } from "@/lib/utils";
import {
  Activity,
  Brain,
  ArrowLeftRight,
  ChevronLeft,
  ClipboardList,
  Compass,
  Droplets,
  Eye,
  Flame,
  Heart,
  Pill,
  Search,
  TriangleAlert,
} from "lucide-react";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Clinical Bedside Tools — Serenity" },
      { name: "description", content: "Offline calculators, Bengali phrasebook, and a common drugs reference." },
      { property: "og:title", content: "Clinical Bedside Tools — Serenity" },
      { property: "og:description", content: "Quiet, offline-first tools for the ward." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ToolsPage,
});

type ToolId =
  | "iv" | "gcs" | "apgar" | "qsofa" | "parkland" | "bmi"
  | "curb65" | "wells" | "hasbled" | "peds" | "phrasebook" | "drugs"
  | "chadsvasc" | "abcd2" | "nihss";

interface ToolMeta {
  id: ToolId;
  title: string;
  blurb: string;
  Icon: typeof Droplets;
  tint: string;
}

const TOOLS: ToolMeta[] = [
  // Scores first — quickest one-tap needs on the ward
  { id: "gcs", title: "Glasgow Coma Scale", blurb: "Consciousness level", Icon: Eye, tint: "text-amber-300 bg-amber-400/10" },
  { id: "nihss", title: "NIHSS Stroke Scale", blurb: "15-item stroke severity", Icon: Brain, tint: "text-indigo-300 bg-indigo-400/10" },
  { id: "qsofa", title: "qSOFA Sepsis Risk", blurb: "Infection triage", Icon: TriangleAlert, tint: "text-orange-300 bg-orange-400/10" },
  { id: "curb65", title: "CURB-65 Pneumonia", blurb: "Severity & mortality", Icon: ClipboardList, tint: "text-violet-300 bg-violet-400/10" },
  { id: "chadsvasc", title: "CHA₂DS₂-VASc", blurb: "Stroke risk in AF", Icon: Heart, tint: "text-pink-300 bg-pink-400/10" },
  { id: "abcd2", title: "ABCD² after TIA", blurb: "Early stroke risk", Icon: Brain, tint: "text-blue-300 bg-blue-400/10" },
  { id: "wells", title: "Wells' PE Criteria", blurb: "Embolism risk", Icon: Activity, tint: "text-cyan-300 bg-cyan-400/10" },
  { id: "hasbled", title: "HAS-BLED Bleeding", blurb: "Anticoagulation bleed", Icon: TriangleAlert, tint: "text-red-300 bg-red-400/10" },
  // Bedside maths
  { id: "iv", title: "IV Fluid Drip Speed", blurb: "Volume & drop factors", Icon: Droplets, tint: "text-sky-300 bg-sky-400/10" },
  { id: "bmi", title: "BMI Calculator", blurb: "Mass / height category", Icon: Activity, tint: "text-emerald-300 bg-emerald-400/10" },
  { id: "parkland", title: "Parkland Burn Fluid", blurb: "24 h resuscitation", Icon: Flame, tint: "text-yellow-300 bg-yellow-400/10" },
  { id: "apgar", title: "APGAR Assessment", blurb: "Newborn vitality", Icon: Heart, tint: "text-rose-300 bg-rose-400/10" },
  { id: "peds", title: "Paediatric Doses", blurb: "Weight-based dosing", Icon: Compass, tint: "text-teal-300 bg-teal-400/10" },
  // Wide references
  { id: "phrasebook", title: "Bengali Patient Phrasebook", blurb: "Ask your patient, system by system", Icon: ArrowLeftRight, tint: "text-fuchsia-300 bg-fuchsia-400/10" },
  { id: "drugs", title: "Common Drugs", blurb: "Generic names, doses, Indian brands", Icon: Pill, tint: "text-amber-300 bg-amber-400/10" },
];

function ToolsPage() {
  const [open, setOpen] = useState<ToolId | null>(null);

  if (open) {
    const meta = TOOLS.find((t) => t.id === open)!;
    return (
      <AppShell>
        <div className="px-4 pt-6">
          <button
            onClick={() => setOpen(null)}
            className="flex items-center gap-1 text-xs text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> All tools
          </button>
          <div className="mt-3 flex items-start gap-3">
            <div className={cn("grid h-11 w-11 place-items-center rounded-xl", meta.tint)}>
              <meta.Icon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-xl text-foreground leading-tight">{meta.title}</h1>
              <p className="text-[11px] text-muted-foreground">{meta.blurb}</p>
            </div>
          </div>
          <div className="mt-5">
            <ToolBody id={open} />
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-4 pt-6">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-xl text-foreground leading-tight">Clinical Bedside Tools</h1>
            <p className="text-[11px] text-muted-foreground">Tidy 2-column tiles that expand into interactive calculators.</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {TOOLS.filter((t) => t.id !== "phrasebook" && t.id !== "drugs").map((t) => (
            <BentoTile key={t.id} tool={t} onOpen={() => setOpen(t.id)} />
          ))}
        </div>
        <div className="mt-3 space-y-3">
          {TOOLS.filter((t) => t.id === "phrasebook" || t.id === "drugs").map((t) => (
            <BentoTile key={t.id} tool={t} onOpen={() => setOpen(t.id)} wide />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function BentoTile({ tool, onOpen, wide }: { tool: ToolMeta; onOpen: () => void; wide?: boolean }) {
  const { Icon } = tool;
  return (
    <button
      onClick={onOpen}
      className={cn(
        "flex flex-col items-start rounded-3xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40",
        wide && "w-full",
      )}
    >
      <div className={cn("grid h-10 w-10 place-items-center rounded-xl", tool.tint)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 font-display text-sm text-foreground leading-tight">{tool.title}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{tool.blurb}</div>
      <div className="mt-3 flex w-full items-center justify-end text-[10px] uppercase tracking-wider text-muted-foreground">
        <span className="text-primary">Tap to open →</span>
      </div>

    </button>
  );
}

function ToolBody({ id }: { id: ToolId }) {
  if (id === "iv") return <IVFluid />;
  if (id === "gcs") return <GCS />;
  if (id === "apgar") return <APGAR />;
  if (id === "qsofa") return <QSOFA />;
  if (id === "parkland") return <Parkland />;
  if (id === "bmi") return <BMI />;
  if (id === "curb65") return <CURB65 />;
  if (id === "wells") return <Wells />;
  if (id === "hasbled") return <HASBLED />;
  if (id === "peds") return <PedsDoses />;
  if (id === "phrasebook") return <Phrasebook />;
  if (id === "drugs") return <DrugsRef />;
  return null;
}

// ---------- Shared bits ----------
function ScoreCard({ value, label, sub }: { value: string | number; label: string; sub?: string }) {
  return (
    <div className="rounded-3xl bg-secondary/40 p-4 text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-display text-4xl text-foreground">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function NumberField({ label, value, onChange, suffix }: { label: string; value: number; onChange: (n: number) => void; suffix?: string }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}{suffix ? ` (${suffix})` : ""}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-full border border-border bg-card px-3 py-2 text-sm"
      />
    </div>
  );
}

function Choice<T extends string | number>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="rounded-2xl bg-card p-3">
      <div className="text-xs font-medium text-foreground">{label}</div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map(([n, t]) => (
          <button
            key={String(n)}
            onClick={() => onChange(n)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px]",
              value === n ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground",
            )}
          >
            {n} · {t}
          </button>
        ))}
      </div>
    </div>
  );
}

function YesNoRow({ label, value, onChange, points = 1 }: { label: string; value: boolean; onChange: (v: boolean) => void; points?: number }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        "flex w-full items-center justify-between rounded-2xl border p-3 text-left",
        value ? "border-primary bg-primary/10" : "border-border bg-card",
      )}
    >
      <span className="text-sm text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground">
        {value ? `+${points}` : "—"}
      </span>
    </button>
  );
}

// ---------- Tools ----------
function GCS() {
  const [e, setE] = useState(4);
  const [v, setV] = useState(5);
  const [m, setM] = useState(6);
  return (
    <div className="space-y-2">
      <ScoreCard value={`${e + v + m}/15`} label="Total" sub={`E${e} V${v} M${m}`} />
      <Choice label="Eye" value={e} onChange={setE} options={[[4, "Spontaneous"], [3, "To voice"], [2, "To pain"], [1, "None"]]} />
      <Choice label="Verbal" value={v} onChange={setV} options={[[5, "Oriented"], [4, "Confused"], [3, "Words"], [2, "Sounds"], [1, "None"]]} />
      <Choice label="Motor" value={m} onChange={setM} options={[[6, "Obeys"], [5, "Localises"], [4, "Withdraws"], [3, "Flexion"], [2, "Extension"], [1, "None"]]} />
    </div>
  );
}

function BMI() {
  const [h, setH] = useState(170);
  const [w, setW] = useState(65);
  const bmi = w / Math.pow(h / 100, 2);
  const cat = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
  return (
    <div className="space-y-2">
      <ScoreCard value={bmi.toFixed(1)} label="BMI" sub={cat} />
      <NumberField label="Height" suffix="cm" value={h} onChange={setH} />
      <NumberField label="Weight" suffix="kg" value={w} onChange={setW} />
    </div>
  );
}

function IVFluid() {
  const [wt, setWt] = useState(60);
  const holliday = wt <= 10 ? wt * 100 : wt <= 20 ? 1000 + (wt - 10) * 50 : 1500 + (wt - 20) * 20;
  const perHour = holliday / 24;
  return (
    <div className="space-y-2">
      <ScoreCard value={`${Math.round(holliday)} mL`} label="Maintenance / day (Holliday-Segar)" sub={`≈ ${perHour.toFixed(1)} mL/hr`} />
      <NumberField label="Weight" suffix="kg" value={wt} onChange={setWt} />
    </div>
  );
}

function APGAR() {
  const [a, setA] = useState(2);
  const [p, setP] = useState(2);
  const [g, setG] = useState(2);
  const [ac, setAc] = useState(2);
  const [r, setR] = useState(2);
  const total = a + p + g + ac + r;
  return (
    <div className="space-y-2">
      <ScoreCard value={`${total}/10`} label="APGAR" sub={total >= 7 ? "Reassuring" : total >= 4 ? "Moderate distress" : "Severe distress"} />
      <Choice label="Appearance (color)" value={a} onChange={setA} options={[[2, "All pink"], [1, "Extremities blue"], [0, "Blue/pale"]]} />
      <Choice label="Pulse" value={p} onChange={setP} options={[[2, ">100"], [1, "<100"], [0, "Absent"]]} />
      <Choice label="Grimace" value={g} onChange={setG} options={[[2, "Cries/pulls away"], [1, "Grimace"], [0, "None"]]} />
      <Choice label="Activity (tone)" value={ac} onChange={setAc} options={[[2, "Active"], [1, "Some flexion"], [0, "Limp"]]} />
      <Choice label="Respiration" value={r} onChange={setR} options={[[2, "Strong cry"], [1, "Weak/irregular"], [0, "Absent"]]} />
    </div>
  );
}

function QSOFA() {
  const [rr, setRR] = useState(false);
  const [gcs, setGCS] = useState(false);
  const [sbp, setSBP] = useState(false);
  const s = (rr ? 1 : 0) + (gcs ? 1 : 0) + (sbp ? 1 : 0);
  return (
    <div className="space-y-2">
      <ScoreCard value={`${s}/3`} label="qSOFA" sub={s >= 2 ? "High risk — escalate" : "Low risk"} />
      <YesNoRow label="Respiratory rate ≥ 22/min" value={rr} onChange={setRR} />
      <YesNoRow label="Altered mentation (GCS < 15)" value={gcs} onChange={setGCS} />
      <YesNoRow label="Systolic BP ≤ 100 mmHg" value={sbp} onChange={setSBP} />
    </div>
  );
}

function Parkland() {
  const [wt, setWt] = useState(70);
  const [tbsa, setTbsa] = useState(20);
  const vol = 4 * wt * tbsa;
  const first8 = vol / 2;
  return (
    <div className="space-y-2">
      <ScoreCard value={`${Math.round(vol)} mL`} label="24 h Ringer's Lactate" sub={`${Math.round(first8)} mL in first 8 h, then ${Math.round(first8)} mL over 16 h`} />
      <NumberField label="Weight" suffix="kg" value={wt} onChange={setWt} />
      <NumberField label="TBSA burned" suffix="%" value={tbsa} onChange={setTbsa} />
    </div>
  );
}

function CURB65() {
  const [c, setC] = useState(false);
  const [u, setU] = useState(false);
  const [r, setR] = useState(false);
  const [b, setB] = useState(false);
  const [age, setAge] = useState(false);
  const s = [c, u, r, b, age].filter(Boolean).length;
  const risk = s <= 1 ? "Low — outpatient" : s === 2 ? "Moderate — consider admit" : "High — admit / ICU";
  return (
    <div className="space-y-2">
      <ScoreCard value={`${s}/5`} label="CURB-65" sub={risk} />
      <YesNoRow label="Confusion (AMT ≤ 8)" value={c} onChange={setC} />
      <YesNoRow label="Urea > 7 mmol/L" value={u} onChange={setU} />
      <YesNoRow label="Respiratory rate ≥ 30/min" value={r} onChange={setR} />
      <YesNoRow label="BP: SBP < 90 or DBP ≤ 60" value={b} onChange={setB} />
      <YesNoRow label="Age ≥ 65" value={age} onChange={setAge} />
    </div>
  );
}

function Wells() {
  const [dvt, setDvt] = useState(false);
  const [alt, setAlt] = useState(false);
  const [hr, setHr] = useState(false);
  const [immob, setImmob] = useState(false);
  const [prev, setPrev] = useState(false);
  const [hem, setHem] = useState(false);
  const [malig, setMalig] = useState(false);
  const s =
    (dvt ? 3 : 0) + (alt ? 3 : 0) + (hr ? 1.5 : 0) + (immob ? 1.5 : 0) +
    (prev ? 1.5 : 0) + (hem ? 1 : 0) + (malig ? 1 : 0);
  const risk = s > 6 ? "High" : s >= 2 ? "Moderate" : "Low";
  return (
    <div className="space-y-2">
      <ScoreCard value={s.toString()} label="Wells' Score" sub={`${risk} probability of PE`} />
      <YesNoRow label="Clinical signs of DVT" value={dvt} onChange={setDvt} points={3} />
      <YesNoRow label="PE more likely than alternative dx" value={alt} onChange={setAlt} points={3} />
      <YesNoRow label="Heart rate > 100" value={hr} onChange={setHr} points={1.5} />
      <YesNoRow label="Immobilisation / surgery in 4 wk" value={immob} onChange={setImmob} points={1.5} />
      <YesNoRow label="Previous DVT/PE" value={prev} onChange={setPrev} points={1.5} />
      <YesNoRow label="Haemoptysis" value={hem} onChange={setHem} />
      <YesNoRow label="Malignancy (active/recent)" value={malig} onChange={setMalig} />
    </div>
  );
}

function HASBLED() {
  const flags = ["Hypertension (uncontrolled)", "Abnormal renal/liver function", "Stroke", "Bleeding history", "Labile INR", "Elderly (>65)", "Drugs / alcohol"];
  const [state, setState] = useState<boolean[]>(Array(flags.length).fill(false));
  const s = state.filter(Boolean).length;
  const risk = s >= 3 ? "High bleed risk" : "Acceptable risk";
  return (
    <div className="space-y-2">
      <ScoreCard value={`${s}/7`} label="HAS-BLED" sub={risk} />
      {flags.map((f, i) => (
        <YesNoRow key={f} label={f} value={state[i]} onChange={(v) => setState((prev) => prev.map((p, j) => (j === i ? v : p)))} />
      ))}
    </div>
  );
}

function PedsDoses() {
  const [wt, setWt] = useState(15);
  const rows: [string, string, string][] = [
    ["Paracetamol", "15 mg/kg q6h", `${(wt * 15).toFixed(0)} mg`],
    ["Ibuprofen", "10 mg/kg q8h", `${(wt * 10).toFixed(0)} mg`],
    ["Amoxicillin", "25 mg/kg q12h", `${(wt * 25).toFixed(0)} mg`],
    ["Ceftriaxone", "50 mg/kg/day", `${(wt * 50).toFixed(0)} mg`],
    ["ORS (mild dehyd.)", "50 mL/kg over 4h", `${(wt * 50).toFixed(0)} mL`],
    ["Adrenaline IM", "0.01 mg/kg", `${(wt * 0.01).toFixed(2)} mg`],
    ["Dextrose 10% bolus", "2 mL/kg", `${(wt * 2).toFixed(0)} mL`],
  ];
  return (
    <div className="space-y-2">
      <NumberField label="Weight" suffix="kg" value={wt} onChange={setWt} />
      {rows.map(([d, rule, val]) => (
        <div key={d} className="flex items-center justify-between rounded-2xl bg-card p-3">
          <div>
            <div className="text-sm text-foreground">{d}</div>
            <div className="text-[10px] text-muted-foreground">{rule}</div>
          </div>
          <div className="text-sm font-medium text-accent">{val}</div>
        </div>
      ))}
    </div>
  );
}

function Phrasebook() {
  const [q, setQ] = useState("");
  const list = useMemo(
    () => PHRASEBOOK.filter((p) => !q || p.en.toLowerCase().includes(q.toLowerCase()) || p.roman.toLowerCase().includes(q.toLowerCase()) || p.bn.includes(q)),
    [q],
  );
  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search English or Bengali"
          className="w-full rounded-full border border-border bg-card pl-8 pr-3 py-2 text-xs"
        />
      </div>
      <div className="mt-3 space-y-1.5">
        {list.map((p, i) => (
          <div key={i} className="rounded-2xl bg-card p-3">
            <div className="text-sm text-foreground">{p.bn}</div>
            <div className="mt-0.5 text-[11px] italic text-muted-foreground">{p.roman}</div>
            <div className="mt-1 text-xs text-accent">{p.en}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DrugsRef() {
  const [q, setQ] = useState("");
  const [cls, setCls] = useState<string>("All");
  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return DRUGS.filter((d) => {
      if (cls !== "All" && d.cls !== cls) return false;
      if (!query) return true;
      return (
        d.name.toLowerCase().includes(query) ||
        d.cls.toLowerCase().includes(query) ||
        d.brands.join(" ").toLowerCase().includes(query)
      );
    });
  }, [q, cls]);

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search generic name, brand or class…"
          className="w-full rounded-full border border-border bg-card pl-8 pr-3 py-2 text-xs"
        />
      </div>

      <div className="-mx-4 mt-3 flex snap-x gap-2 overflow-x-auto px-4 pb-1">
        {["All", ...DRUG_CLASSES].map((c) => (
          <button
            key={c}
            onClick={() => setCls(c)}
            className={cn(
              "shrink-0 snap-start rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
              cls === c
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        {list.map((d) => (
          <div key={d.name} className="rounded-2xl border border-border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="font-display text-sm text-foreground">{d.name}</div>
              <span className="shrink-0 rounded-full bg-secondary/60 px-2 py-0.5 text-[9px] text-muted-foreground">
                {d.cls}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-foreground">{d.dose}</div>
            <div className="mt-0.5 text-[10px] text-muted-foreground">Route: {d.route}</div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {d.brands.map((b) => (
                <span key={b} className="rounded-lg bg-secondary/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {b}
                </span>
              ))}
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <p className="text-[11px] text-muted-foreground">Nothing matched that search.</p>
        )}
      </div>
      <p className="mt-3 text-[10px] italic text-muted-foreground">
        Quick bedside reference only — always confirm with your unit protocol before prescribing.
      </p>
    </div>
  );
}
