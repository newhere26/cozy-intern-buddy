import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PHRASEBOOK } from "@/lib/data";
import { Search } from "lucide-react";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Tools — Serenity" },
      { name: "description", content: "Quiet reference tools and a Bengali phrasebook." },
    ],
  }),
  component: ToolsPage,
});

type Tool = "phrasebook" | "gcs" | "bmi" | "iv" | "shorthand" | "peds";

function ToolsPage() {
  const [tool, setTool] = useState<Tool>("phrasebook");
  return (
    <AppShell>
      <div className="px-4 pt-6">
        <h1 className="font-display text-2xl text-foreground">Tools</h1>
        <p className="text-xs text-muted-foreground">
          Small helpers that work offline.
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {(
            [
              ["phrasebook", "Bengali phrasebook"],
              ["gcs", "GCS"],
              ["bmi", "BMI"],
              ["iv", "IV fluid"],
              ["peds", "Paed doses"],
              ["shorthand", "Shorthand"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTool(id)}
              className={`rounded-full px-3 py-1.5 text-[11px] ${
                tool === id
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {tool === "phrasebook" && <Phrasebook />}
          {tool === "gcs" && <GCS />}
          {tool === "bmi" && <BMI />}
          {tool === "iv" && <IVFluid />}
          {tool === "peds" && <PedsDoses />}
          {tool === "shorthand" && <Shorthand />}
        </div>
      </div>
    </AppShell>
  );
}

function Phrasebook() {
  const [q, setQ] = useState("");
  const list = useMemo(
    () =>
      PHRASEBOOK.filter(
        (p) =>
          !q ||
          p.en.toLowerCase().includes(q.toLowerCase()) ||
          p.roman.toLowerCase().includes(q.toLowerCase()) ||
          p.bn.includes(q),
      ),
    [q],
  );
  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="search English or Bengali"
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

function GCS() {
  const [e, setE] = useState(4);
  const [v, setV] = useState(5);
  const [m, setM] = useState(6);
  const total = e + v + m;
  const opt = (label: string, val: number, setter: (n: number) => void, opts: [number, string][]) => (
    <div className="rounded-2xl bg-card p-3">
      <div className="text-xs font-medium text-foreground">{label}</div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {opts.map(([n, t]) => (
          <button
            key={n}
            onClick={() => setter(n)}
            className={`rounded-full px-2.5 py-1 text-[11px] ${val === n ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}
          >
            {n} · {t}
          </button>
        ))}
      </div>
    </div>
  );
  return (
    <div className="space-y-2">
      <div className="rounded-3xl bg-secondary/40 p-4 text-center">
        <div className="text-xs text-muted-foreground">Total</div>
        <div className="font-display text-4xl text-foreground">{total}/15</div>
        <div className="text-[11px] text-muted-foreground">E{e} V{v} M{m}</div>
      </div>
      {opt("Eye", e, setE, [[4, "Spontaneous"], [3, "To voice"], [2, "To pain"], [1, "None"]])}
      {opt("Verbal", v, setV, [[5, "Oriented"], [4, "Confused"], [3, "Words"], [2, "Sounds"], [1, "None"]])}
      {opt("Motor", m, setM, [[6, "Obeys"], [5, "Localises"], [4, "Withdraws"], [3, "Flexion"], [2, "Extension"], [1, "None"]])}
    </div>
  );
}

function BMI() {
  const [h, setH] = useState(170);
  const [w, setW] = useState(65);
  const bmi = w / Math.pow(h / 100, 2);
  const cat =
    bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
  return (
    <div className="space-y-2">
      <div className="rounded-3xl bg-secondary/40 p-4 text-center">
        <div className="font-display text-4xl text-foreground">{bmi.toFixed(1)}</div>
        <div className="text-xs text-muted-foreground">{cat}</div>
      </div>
      <label className="text-xs text-muted-foreground">Height (cm)</label>
      <input type="number" value={h} onChange={(e) => setH(Number(e.target.value))} className="w-full rounded-full border border-border bg-card px-3 py-2 text-sm" />
      <label className="text-xs text-muted-foreground">Weight (kg)</label>
      <input type="number" value={w} onChange={(e) => setW(Number(e.target.value))} className="w-full rounded-full border border-border bg-card px-3 py-2 text-sm" />
    </div>
  );
}

function IVFluid() {
  const [wt, setWt] = useState(60);
  const holliday =
    wt <= 10 ? wt * 100 : wt <= 20 ? 1000 + (wt - 10) * 50 : 1500 + (wt - 20) * 20;
  const perHour = holliday / 24;
  return (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground">Weight (kg)</label>
      <input type="number" value={wt} onChange={(e) => setWt(Number(e.target.value))} className="w-full rounded-full border border-border bg-card px-3 py-2 text-sm" />
      <div className="rounded-3xl bg-secondary/40 p-4">
        <div className="text-xs text-muted-foreground">Maintenance (Holliday-Segar)</div>
        <div className="font-display text-3xl text-foreground">{Math.round(holliday)} mL/day</div>
        <div className="text-[11px] text-muted-foreground">≈ {perHour.toFixed(1)} mL/hr</div>
      </div>
    </div>
  );
}

function PedsDoses() {
  const [wt, setWt] = useState(15);
  const rows: [string, string, string][] = [
    ["Paracetamol", "15 mg/kg/dose q6h", `${(wt * 15).toFixed(0)} mg`],
    ["Ibuprofen", "10 mg/kg/dose q8h", `${(wt * 10).toFixed(0)} mg`],
    ["Amoxicillin", "25 mg/kg/dose q12h", `${(wt * 25).toFixed(0)} mg`],
    ["Ceftriaxone", "50 mg/kg/day", `${(wt * 50).toFixed(0)} mg`],
    ["ORS (mild dehyd.)", "50 mL/kg over 4h", `${(wt * 50).toFixed(0)} mL`],
    ["Adrenaline (0.01 mg/kg)", "IM anaphylaxis", `${(wt * 0.01).toFixed(2)} mg`],
    ["Dextrose 10% bolus", "2 mL/kg", `${(wt * 2).toFixed(0)} mL`],
  ];
  return (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground">Weight (kg)</label>
      <input type="number" value={wt} onChange={(e) => setWt(Number(e.target.value))} className="w-full rounded-full border border-border bg-card px-3 py-2 text-sm" />
      <div className="space-y-1.5">
        {rows.map(([d, rule, val]) => (
          <div key={d} className="rounded-2xl bg-card p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-foreground">{d}</div>
              <div className="text-sm font-medium text-accent">{val}</div>
            </div>
            <div className="text-[10px] text-muted-foreground">{rule}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Shorthand() {
  const list: [string, string][] = [
    ["c/o", "complaining of"],
    ["k/c/o", "known case of"],
    ["h/o", "history of"],
    ["p/o", "per orally"],
    ["s/l", "sublingual"],
    ["stat", "immediately"],
    ["bd", "twice a day"],
    ["tds", "three times a day"],
    ["qid", "four times a day"],
    ["hs", "at bedtime"],
    ["prn", "as needed"],
    ["npo", "nil per mouth"],
    ["sob", "shortness of breath"],
    ["loc", "loss of consciousness"],
    ["r/o", "rule out"],
    ["b/l", "bilateral"],
    ["u/l", "unilateral"],
    ["a/w", "along with"],
    ["a/e", "air entry"],
    ["ns", "normal saline"],
    ["rl", "Ringer's lactate"],
    ["ivf", "IV fluid"],
    ["dnr", "do not resuscitate"],
    ["dama", "discharge against medical advice"],
    ["lama", "left against medical advice"],
  ];
  return (
    <div className="space-y-1">
      {list.map(([s, m]) => (
        <div key={s} className="flex items-center justify-between rounded-xl bg-card px-3 py-2 text-xs">
          <span className="font-medium text-foreground">{s}</span>
          <span className="text-muted-foreground">{m}</span>
        </div>
      ))}
    </div>
  );
}
