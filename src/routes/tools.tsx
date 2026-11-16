import { Disclaimer } from "@/components/Disclaimer";
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
      { title: "Clinical Bedside Tools — WithYou" },
      { name: "description", content: "Offline calculators, Bengali phrasebook, and a common drugs reference." },
      { property: "og:title", content: "Clinical Bedside Tools — WithYou" },
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
            <Disclaimer className="mt-6" />
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
            <p className="text-[11px] text-muted-foreground">Quiet, offline calculators and references for the ward.</p>
          </div>
        </div>

        <div className="mt-4">
          <BentoTile
            tool={TOOLS.find((t) => t.id === "phrasebook")!}
            onOpen={() => setOpen("phrasebook")}
            wide
          />
        </div>

        <div className="mt-3 grid grid-cols-2 items-stretch gap-3">
          {TOOLS.filter((t) => t.id !== "phrasebook" && t.id !== "drugs").map((t) => (
            <BentoTile key={t.id} tool={t} onOpen={() => setOpen(t.id)} />
          ))}
        </div>

        <div className="mt-3">
          <BentoTile
            tool={TOOLS.find((t) => t.id === "drugs")!}
            onOpen={() => setOpen("drugs")}
            wide
          />
        </div>

        <Disclaimer className="mt-5" />
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
        "flex h-full flex-col items-start rounded-3xl border border-border bg-card px-4 py-3.5 text-left transition-colors hover:border-primary/40",
        wide ? "w-full flex-row items-center gap-3" : "",
      )}
    >
      <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", tool.tint)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className={cn("flex flex-col", wide ? "flex-1" : "mt-2.5 w-full flex-1")}>
        <div className="font-display text-sm text-foreground leading-tight">{tool.title}</div>
        <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{tool.blurb}</div>
      </div>
      <div className={cn("text-[10px] text-primary", wide ? "shrink-0" : "mt-2.5 w-full text-right")}>
        {wide ? "→" : "Tap to open →"}
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
  if (id === "chadsvasc") return <ChadsVasc />;
  if (id === "abcd2") return <ABCD2 />;
  if (id === "nihss") return <NIHSS />;
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
  const rows = [
    {
      drug: "Paracetamol",
      rule: "10–15 mg/kg q4–6h",
      range: `${(wt * 10).toFixed(0)}–${(wt * 15).toFixed(0)} mg / dose`,
      max: "Max 75 mg/kg/day (≤1 g/dose, ≤4 g/day)",
      val: `${(wt * 15).toFixed(0)} mg`,
    },
    {
      drug: "Ibuprofen",
      rule: "5–10 mg/kg q6–8h (>3 mo)",
      range: `${(wt * 5).toFixed(0)}–${(wt * 10).toFixed(0)} mg / dose`,
      max: "Max 40 mg/kg/day (≤400 mg/dose, ≤2.4 g/day)",
      val: `${(wt * 10).toFixed(0)} mg`,
    },
    {
      drug: "Amoxicillin + Clav.",
      rule: "25–45 mg/kg/day divided BD–TDS",
      range: `${(wt * 25).toFixed(0)}–${(wt * 45).toFixed(0)} mg/day`,
      max: "Max 90 mg/kg/day (otitis / severe)",
      val: `${(wt * 30).toFixed(0)} mg/day`,
    },
    {
      drug: "Ceftriaxone",
      rule: "50–75 mg/kg/day OD–BD",
      range: `${(wt * 50).toFixed(0)}–${(wt * 75).toFixed(0)} mg/day`,
      max: "Max 100 mg/kg/day in meningitis (≤4 g/day)",
      val: `${(wt * 50).toFixed(0)} mg/day`,
    },
    {
      drug: "Ondansetron",
      rule: "0.15 mg/kg/dose q8h",
      range: `${(wt * 0.15).toFixed(1)} mg / dose`,
      max: "Max 4–8 mg/dose (≤32 mg/day)",
      val: `${(wt * 0.15).toFixed(1)} mg`,
    },
    {
      drug: "Adrenaline IM (1:1000)",
      rule: "0.01 mg/kg (0.01 mL/kg) stat",
      range: `${(wt * 0.01).toFixed(2)} mg (${(wt * 0.01).toFixed(2)} mL)`,
      max: "Max 0.3 mg (child) / 0.5 mg (adult)",
      val: `${(wt * 0.01).toFixed(2)} mg`,
    },
    {
      drug: "ORS (mild dehyd.)",
      rule: "50–75 mL/kg over 4h",
      range: `${(wt * 50).toFixed(0)}–${(wt * 75).toFixed(0)} mL total`,
      max: "+ 10 mL/kg per loose stool",
      val: `${(wt * 50).toFixed(0)} mL`,
    },
    {
      drug: "Dextrose 10% bolus",
      rule: "2 mL/kg (0.2 g/kg) slow IV",
      range: `${(wt * 2).toFixed(0)} mL stat`,
      max: "Recheck blood sugar in 15 min",
      val: `${(wt * 2).toFixed(0)} mL`,
    },
  ];
  return (
    <div className="space-y-2.5">
      <NumberField label="Weight" suffix="kg" value={wt} onChange={setWt} />
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.drug} className="rounded-2xl border border-border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-display text-sm font-medium text-foreground">{r.drug}</div>
                <div className="text-[11px] text-muted-foreground">{r.rule}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-accent">{r.val}</div>
                <div className="text-[10px] text-muted-foreground">std calc</div>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/50 pt-2 text-[10px]">
              <div className="text-primary font-medium">
                Range: <span className="text-foreground">{r.range}</span>
              </div>
              <div className="text-amber-600 dark:text-amber-400">
                Safe cap: <span className="text-muted-foreground">{r.max}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChadsVasc() {
  const [v, setV] = useState({ chf: false, htn: false, age75: false, dm: false, stroke: false, vasc: false, age65: false, female: false });
  const t = (k: keyof typeof v) => setV((s) => ({ ...s, [k]: !s[k] }));
  const score =
    (v.chf ? 1 : 0) + (v.htn ? 1 : 0) + (v.age75 ? 2 : 0) + (v.dm ? 1 : 0) +
    (v.stroke ? 2 : 0) + (v.vasc ? 1 : 0) + (v.age65 && !v.age75 ? 1 : 0) + (v.female ? 1 : 0);
  const advice =
    score === 0 ? "Low risk — no antithrombotic usually needed"
      : score === 1 ? "Consider oral anticoagulation (esp. if male)"
        : "Oral anticoagulation recommended";
  return (
    <div className="space-y-2">
      <ScoreCard value={score} label="CHA₂DS₂-VASc" sub={advice} />
      <YesNoRow label="Congestive heart failure / LV dysfunction" value={v.chf} onChange={() => t("chf")} />
      <YesNoRow label="Hypertension" value={v.htn} onChange={() => t("htn")} />
      <YesNoRow label="Age ≥ 75 years" value={v.age75} onChange={() => t("age75")} points={2} />
      <YesNoRow label="Diabetes mellitus" value={v.dm} onChange={() => t("dm")} />
      <YesNoRow label="Prior stroke / TIA / thromboembolism" value={v.stroke} onChange={() => t("stroke")} points={2} />
      <YesNoRow label="Vascular disease (MI, PAD, aortic plaque)" value={v.vasc} onChange={() => t("vasc")} />
      <YesNoRow label="Age 65–74 years" value={v.age65} onChange={() => t("age65")} />
      <YesNoRow label="Female sex" value={v.female} onChange={() => t("female")} />
      <p className="text-[10px] italic text-muted-foreground">Age ≥75 supersedes the 65–74 point.</p>
    </div>
  );
}

function ABCD2() {
  const [age, setAge] = useState(false);
  const [bp, setBp] = useState(false);
  const [clin, setClin] = useState(0);
  const [dur, setDur] = useState(0);
  const [dm, setDm] = useState(false);
  const score = (age ? 1 : 0) + (bp ? 1 : 0) + clin + dur + (dm ? 1 : 0);
  const band = score <= 3 ? "Low — 2-day stroke risk ~1%" : score <= 5 ? "Moderate — ~4%" : "High — ~8%";
  return (
    <div className="space-y-2">
      <ScoreCard value={`${score}/7`} label="ABCD² after TIA" sub={band} />
      <YesNoRow label="Age ≥ 60 years" value={age} onChange={setAge} />
      <YesNoRow label="BP ≥ 140/90 mmHg at assessment" value={bp} onChange={setBp} />
      <Choice label="Clinical features" value={clin} onChange={setClin} options={[[2, "Unilateral weakness"], [1, "Speech disturbance, no weakness"], [0, "Neither"]]} />
      <Choice label="Duration of symptoms" value={dur} onChange={setDur} options={[[2, "≥ 60 min"], [1, "10–59 min"], [0, "< 10 min"]]} />
      <YesNoRow label="Diabetes mellitus" value={dm} onChange={setDm} />
    </div>
  );
}

const NIHSS_ITEMS: { key: string; label: string; options: [number, string][] }[] = [
  { key: "1a", label: "1a. Level of consciousness", options: [[0, "Alert"], [1, "Rouses to minor stimulation"], [2, "Requires repeated stimulation"], [3, "Unresponsive / reflex only"]] },
  { key: "1b", label: "1b. LOC questions (month, age)", options: [[0, "Both correct"], [1, "One correct"], [2, "Neither correct"]] },
  { key: "1c", label: "1c. LOC commands (eyes, grip)", options: [[0, "Both correct"], [1, "One correct"], [2, "Neither correct"]] },
  { key: "2", label: "2. Best gaze", options: [[0, "Normal"], [1, "Partial gaze palsy"], [2, "Forced deviation"]] },
  { key: "3", label: "3. Visual fields", options: [[0, "No loss"], [1, "Partial hemianopia"], [2, "Complete hemianopia"], [3, "Bilateral hemianopia"]] },
  { key: "4", label: "4. Facial palsy", options: [[0, "Normal"], [1, "Minor"], [2, "Partial"], [3, "Complete"]] },
  { key: "5a", label: "5a. Motor arm — left", options: [[0, "No drift"], [1, "Drift"], [2, "Some effort against gravity"], [3, "No effort against gravity"], [4, "No movement"]] },
  { key: "5b", label: "5b. Motor arm — right", options: [[0, "No drift"], [1, "Drift"], [2, "Some effort against gravity"], [3, "No effort against gravity"], [4, "No movement"]] },
  { key: "6a", label: "6a. Motor leg — left", options: [[0, "No drift"], [1, "Drift"], [2, "Some effort against gravity"], [3, "No effort against gravity"], [4, "No movement"]] },
  { key: "6b", label: "6b. Motor leg — right", options: [[0, "No drift"], [1, "Drift"], [2, "Some effort against gravity"], [3, "No effort against gravity"], [4, "No movement"]] },
  { key: "7", label: "7. Limb ataxia", options: [[0, "Absent"], [1, "One limb"], [2, "Two limbs"]] },
  { key: "8", label: "8. Sensory", options: [[0, "Normal"], [1, "Mild–moderate loss"], [2, "Severe / total loss"]] },
  { key: "9", label: "9. Best language", options: [[0, "Normal"], [1, "Mild–moderate aphasia"], [2, "Severe aphasia"], [3, "Mute / global aphasia"]] },
  { key: "10", label: "10. Dysarthria", options: [[0, "Normal"], [1, "Mild–moderate"], [2, "Severe / anarthric"]] },
  { key: "11", label: "11. Extinction / inattention", options: [[0, "None"], [1, "One modality"], [2, "Profound hemi-inattention"]] },
];

function NIHSS() {
  const [vals, setVals] = useState<Record<string, number>>(() =>
    Object.fromEntries(NIHSS_ITEMS.map((i) => [i.key, 0])),
  );
  const total = Object.values(vals).reduce((a, b) => a + b, 0);
  const band =
    total === 0 ? "No stroke symptoms"
      : total <= 4 ? "Minor stroke"
        : total <= 15 ? "Moderate stroke"
          : total <= 20 ? "Moderate to severe"
            : "Severe stroke";
  return (
    <div className="space-y-2">
      <ScoreCard value={`${total}/42`} label="NIHSS total" sub={band} />
      {NIHSS_ITEMS.map((item) => (
        <Choice
          key={item.key}
          label={item.label}
          value={vals[item.key] ?? 0}
          onChange={(n) => setVals((s) => ({ ...s, [item.key]: n }))}
          options={item.options}
        />
      ))}
      <button
        onClick={() => setVals(Object.fromEntries(NIHSS_ITEMS.map((i) => [i.key, 0])))}
        className="w-full rounded-full border border-border bg-card py-2 text-xs text-muted-foreground"
      >
        Reset all items
      </button>
    </div>
  );
}

function Phrasebook() {
  const [q, setQ] = useState("");
  const [sys, setSys] = useState<string>("All");
  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return PHRASEBOOK.filter((p) => {
      if (sys !== "All" && sys !== "Helper words" && p.sys !== sys) return false;
      if (!query) return true;
      return (
        p.en.toLowerCase().includes(query) ||
        p.roman.toLowerCase().includes(query) ||
        p.bn.includes(q.trim())
      );
    });
  }, [q, sys]);

  const helpers = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return HELPER_WORDS;
    return HELPER_WORDS.filter(
      (h) => h.en.toLowerCase().includes(query) || h.roman.toLowerCase().includes(query) || h.bn.includes(q.trim()),
    );
  }, [q]);

  const showHelpers = sys === "All" || sys === "Helper words";

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search English, Bengali or romanised…"
          className="w-full rounded-full border border-border bg-card pl-8 pr-3 py-2 text-xs"
        />
      </div>

      <div className="-mx-4 mt-3 flex snap-x gap-2 overflow-x-auto px-4 pb-1">
        {["All", ...PHRASE_SYSTEMS, "Helper words"].map((s) => (
          <button
            key={s}
            onClick={() => setSys(s)}
            className={cn(
              "shrink-0 snap-start rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
              sys === s
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {sys !== "Helper words" && (
        <div className="mt-3 space-y-1.5">
          {list.map((p, i) => (
            <div key={i} className="rounded-2xl bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm text-foreground">{p.bn}</div>
                {sys === "All" && (
                  <span className="shrink-0 rounded-full bg-secondary/60 px-2 py-0.5 text-[9px] text-muted-foreground">
                    {p.sys}
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-[11px] italic text-muted-foreground">{p.roman}</div>
              <div className="mt-1 text-xs text-accent">{p.en}</div>
            </div>
          ))}
          {list.length === 0 && (
            <p className="text-[11px] text-muted-foreground">Nothing matched that search.</p>
          )}
        </div>
      )}

      {showHelpers && (
        <div className="mt-4">
          <div className="text-[11px] font-medium text-foreground">Helper words</div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {helpers.map((h) => (
              <div key={h.en + h.bn} className="rounded-xl bg-card px-2.5 py-1.5">
                <div className="text-xs text-foreground">{h.bn}</div>
                <div className="text-[10px] italic text-muted-foreground">{h.roman}</div>
                <div className="text-[10px] text-accent">{h.en}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="mt-3 text-[10px] italic text-muted-foreground">
        Phrases are written as you asking the patient, in polite (আপনি) Bengali.
      </p>
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
            {d.doseRange && (
              <div className="mt-1 flex items-start gap-1 text-[10px] text-primary">
                <span className="font-semibold shrink-0">Range:</span>
                <span>{d.doseRange}</span>
              </div>
            )}
            {d.maxDose && (
              <div className="mt-0.5 flex items-start gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                <span className="font-semibold shrink-0">Max safe:</span>
                <span>{d.maxDose}</span>
              </div>
            )}
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
