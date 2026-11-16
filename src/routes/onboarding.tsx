import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { setState, useApp } from "@/lib/store";
import type { CompanionId, ThemeId } from "@/lib/store";
import { COMPANIONS, COUNTRIES, THEMES } from "@/lib/data";
import { Companion } from "@/components/Companion";
import { cn } from "@/lib/utils";
import { isLettersOnly, sanitizeInt, sanitizeLetters } from "@/lib/validate";
import { isValidCity } from "@/lib/cities";
import { CityCombobox } from "@/components/CityCombobox";
import {
  backfillSteps,
  getState,
  todayKey,
} from "@/lib/store";
import { requestMotionPermission, setStepTracking } from "@/lib/pedometer";
import { ArrowRight, Footprints } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome — WithYou" },
      { name: "description", content: "Set up your cozy companion for internship." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OnboardingPage,
});

const STEPS = [
  "welcome",
  "profile",
  "place",
  "internship",
  "leaves",
  "shift",
  "companion",
  "steps",
  "theme",
  "done",
] as const;
type Step = (typeof STEPS)[number];

function OnboardingPage() {
  const app = useApp();
  const nav = useNavigate();
  const [step, setStep] = useState<Step>("welcome");
  const idx = STEPS.indexOf(step);

  const canAdvance = (() => {
    if (step === "profile") return isLettersOnly(app.name);
    if (step === "place") return isValidCity(app.country, app.city);
    if (step === "leaves") return app.clAllotted > 0;
    return true;
  })();

  const next = () => {
    if (!canAdvance) return;
    setStep(STEPS[Math.min(STEPS.length - 1, idx + 1)]);
  };
  const back = () => setStep(STEPS[Math.max(0, idx - 1)]);

  const finish = () => {
    setState({ onboarded: true });
    nav({ to: "/" });
  };

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col px-6 py-8">
      <div className="mb-6 flex gap-1">
        {STEPS.slice(1, -1).map((s, i) => (
          <div
            key={s}
            className={cn("h-1 flex-1 rounded-full", i < idx ? "bg-primary" : "bg-muted")}
          />
        ))}
      </div>

      <div className="flex-1">
        {step === "welcome" && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="h-48 w-48">
              <Companion id={app.companion} />
            </div>
            <h1 className="mt-6 font-display text-3xl text-foreground">WithYou</h1>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              A quiet companion for your internship. No streaks. No shame. Just soft company for hard days.
            </p>
          </div>
        )}

        {step === "profile" && (
          <Field label="What should we call you?" hint="Letters only please.">
            <input
              autoFocus
              value={app.name}
              onChange={(e) => setState({ name: sanitizeLetters(e.target.value) })}
              placeholder="your name"
              className="w-full rounded-full border border-border bg-card px-4 py-3 text-base"
            />
            {!isLettersOnly(app.name) && app.name.length > 0 && (
              <p className="mt-2 text-[11px] text-destructive">
                Only letters, spaces, apostrophes and hyphens.
              </p>
            )}
          </Field>
        )}

        {step === "place" && (
          <Field label="Where are you doing your internship?" hint="Sets your date format.">
            <label className="text-[11px] text-muted-foreground">Country</label>
            <select
              value={app.country}
              onChange={(e) => {
                const country = e.target.value;
                // a city from the old country is not valid in the new one
                setState({ country, city: isValidCity(country, app.city) ? app.city : "" });
              }}
              className="mt-1 mb-3 w-full rounded-full border border-border bg-card px-4 py-3 text-base"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <label className="text-[11px] text-muted-foreground">City (required)</label>
            <div className="mb-3">
              <CityCombobox
                country={app.country}
                value={app.city}
                onChange={(city) => setState({ city })}
              />
            </div>
            <label className="text-[11px] text-muted-foreground">Medical college (optional)</label>
            <input
              value={app.college}
              onChange={(e) => setState({ college: e.target.value })}
              placeholder="e.g. City Medical College"
              className="mt-1 w-full rounded-full border border-border bg-card px-4 py-3 text-base"
            />
          </Field>
        )}

        {step === "internship" && (
          <Field label="When did your internship start?" hint="You can change this later.">
            <input
              type="date"
              value={app.startDate}
              onChange={(e) => setState({ startDate: e.target.value })}
              className="w-full rounded-full border border-border bg-card px-4 py-3 text-base"
            />
            <label className="mt-3 block text-xs text-muted-foreground">Total length (weeks)</label>
            <input
              inputMode="numeric"
              value={String(app.durationWeeks)}
              onChange={(e) => setState({ durationWeeks: Number(sanitizeInt(e.target.value)) || 54 })}
              className="mt-1 w-full rounded-full border border-border bg-card px-4 py-3 text-base"
            />
          </Field>
        )}

        {step === "leaves" && (
          <Field label="Leaves & extensions" hint="Numbers only. CL is required.">
            <label className="text-xs text-muted-foreground">Casual leave (CL) — required</label>
            <input
              inputMode="numeric"
              value={String(app.clAllotted)}
              onChange={(e) => setState({ clAllotted: Number(sanitizeInt(e.target.value)) || 0 })}
              className="mt-1 mb-3 w-full rounded-full border border-border bg-card px-4 py-3 text-base"
            />
            <label className="text-xs text-muted-foreground">Privilege leave (PL) — optional</label>
            <input
              inputMode="numeric"
              value={String(app.plAllotted)}
              onChange={(e) => setState({ plAllotted: Number(sanitizeInt(e.target.value)) || 0 })}
              className="mt-1 mb-3 w-full rounded-full border border-border bg-card px-4 py-3 text-base"
            />
            <label className="text-xs text-muted-foreground">Extension days per 1 day of PL</label>
            <input
              inputMode="numeric"
              value={String(app.extPerPl)}
              onChange={(e) => setState({ extPerPl: Number(sanitizeInt(e.target.value)) || 0 })}
              className="mt-1 mb-3 w-full rounded-full border border-border bg-card px-4 py-3 text-base"
            />
            <label className="text-xs text-muted-foreground">Extension days per unauthorized absence</label>
            <input
              inputMode="numeric"
              value={String(app.extPerAbsent)}
              onChange={(e) => setState({ extPerAbsent: Number(sanitizeInt(e.target.value)) || 0 })}
              className="mt-1 w-full rounded-full border border-border bg-card px-4 py-3 text-base"
            />
          </Field>
        )}

        {step === "shift" && (
          <Field label="Your usual shift" hint="Night shift usually continues from day shift.">
            <div className="text-xs font-medium text-foreground">Day shift</div>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <TimeField label="Starts" value={app.checkIn} onChange={(v) => setState({ checkIn: v })} />
              <TimeField label="Ends" value={app.checkOut} onChange={(v) => setState({ checkOut: v })} />
            </div>
            <div className="mt-4 text-xs font-medium text-foreground">Night shift</div>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <TimeField label="Starts" value={app.nightStart} onChange={(v) => setState({ nightStart: v })} />
              <TimeField label="Ends next day" value={app.nightEnd} onChange={(v) => setState({ nightEnd: v })} />
            </div>
            <label className="mt-4 flex items-center gap-2 text-xs text-foreground">
              <input
                type="checkbox"
                className="accent-primary"
                checked={app.postDutyOff}
                onChange={(e) => setState({ postDutyOff: e.target.checked })}
              />
              I get a post-duty off after a night shift
            </label>
          </Field>
        )}

        {step === "companion" && (
          <Field label="Pick your companion" hint="They'll be there on every screen.">
            <div className="grid grid-cols-2 gap-3">
              {COMPANIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setState({ companion: c.id as CompanionId })}
                  className={cn(
                    "flex flex-col items-center rounded-3xl border-2 p-3",
                    app.companion === c.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card",
                  )}
                >
                  <img src={c.img} alt={c.name} className="h-24 w-24 object-contain" />
                  <div className="mt-1 text-xs font-medium text-foreground">{c.name}</div>
                  <div className="text-[10px] text-muted-foreground">{c.blurb}</div>
                </button>
              ))}
            </div>
          </Field>
        )}

        {step === "steps" && <StepsStep onNext={next} />}

        {step === "theme" && (
          <Field label="Pick a mood" hint="You can change this any time.">
            <div className="grid grid-cols-2 gap-3">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setState({ theme: t.id as ThemeId })}
                  className={cn(
                    "flex flex-col items-start rounded-2xl border-2 p-3",
                    app.theme === t.id ? "border-primary" : "border-border",
                  )}
                  style={{ background: t.swatch[0] }}
                >
                  <div className="flex gap-1">
                    {t.swatch.map((c) => (
                      <span key={c} className="h-5 w-5 rounded-full" style={{ background: c }} />
                    ))}
                  </div>
                  <div className="mt-2 text-xs font-medium text-white/90">{t.name}</div>
                </button>
              ))}
            </div>
          </Field>
        )}

        {step === "done" && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="h-40 w-40">
              <Companion id={app.companion} />
            </div>
            <h2 className="mt-6 font-display text-2xl text-foreground">
              Hello, {app.name || "friend"}.
            </h2>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Go softly. I will be here for every shift.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-2">
        {idx > 0 && step !== "done" && (
          <button
            onClick={back}
            className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground"
          >
            Back
          </button>
        )}
        <button
          onClick={step === "done" ? finish : next}
          disabled={!canAdvance && step !== "welcome"}
          className={cn(
            "ml-auto flex items-center gap-1.5 rounded-full px-6 py-2.5 text-sm font-medium",
            canAdvance || step === "welcome"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {step === "done" ? "Enter" : step === "welcome" ? "Begin" : "Next"}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

type SyncStatus = "idle" | "asking" | "granted" | "denied" | "unsupported";

function StepsStep({ onNext }: { onNext: () => void }) {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [avg, setAvg] = useState("");
  const [filled, setFilled] = useState<number | null>(null);
  const startDate = useApp().startDate;
  const today = todayKey();
  const alreadyStarted = startDate < today;

  const connect = async () => {
    setStatus("asking");
    // Called straight from the tap, so the phone is allowed to show its permission prompt.
    const result = await requestMotionPermission();
    if (result === "granted") {
      setStepTracking(true);
      setState({ stepGoal: getState().stepGoal || 6000 });
    }
    setStatus(result);
  };

  const applyBackfill = () => {
    const n = backfillSteps(Number(sanitizeInt(avg)) || 0);
    setFilled(n);
  };

  return (
    <Field
      label="Ward Footsteps & Movement"
      hint="Hospital duty involves miles of walking between casualty, OT, and wards. We track this for your monthly and annual roundup."
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-primary/25 bg-secondary/40 p-4">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
            <Footprints className="h-5 w-5 text-primary" />
            <span>Sync Device Step Counter</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Allow WithYou to connect to your device's step counter so we can celebrate your walking
            milestones in your duty roundups.
          </p>

          <div className="mt-4 flex flex-col gap-2.5">
            {status !== "granted" && (
              <button
                type="button"
                disabled={status === "asking"}
                onClick={connect}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-xs transition-transform active:scale-95 disabled:opacity-60"
              >
                <Footprints className="h-4 w-4" />
                <span>{status === "asking" ? "Waiting for your phone…" : "Connect Phone Step Tracker"}</span>
              </button>
            )}

            {status === "granted" && (
              <p className="rounded-xl bg-primary/10 px-3 py-2 text-xs text-foreground">
                Connected. WithYou now counts your steps from your phone's motion sensor while the app is open.
              </p>
            )}
            {status === "denied" && (
              <p className="text-[11px] text-destructive">
                Permission was declined. You can allow motion access in your browser or phone settings and try again, or log steps manually.
              </p>
            )}
            {status === "unsupported" && (
              <p className="text-[11px] text-muted-foreground">
                This device or browser doesn't share its step sensor with web apps. You can log steps manually any time.
              </p>
            )}

            <button
              type="button"
              onClick={onNext}
              className={
                status === "granted"
                  ? "w-full rounded-full bg-primary py-2.5 text-xs font-semibold text-primary-foreground active:scale-95"
                  : "w-full rounded-full border border-border bg-background py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground active:scale-95"
              }
            >
              {status === "granted" ? "Continue" : "Skip · I'll log steps manually"}
            </button>
          </div>
        </div>

        {alreadyStarted && (
          <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
            <div className="text-xs font-semibold text-foreground">Already started your internship?</div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Phones don't let web apps read past step history, so tell us roughly how many steps you walk on a
              typical day and we'll fill in the days since you started. Any day you've already logged is left alone.
            </p>
            <div className="mt-3 flex gap-2">
              <input
                inputMode="numeric"
                value={avg}
                onChange={(e) => setAvg(sanitizeInt(e.target.value))}
                placeholder="avg steps per day"
                className="min-w-0 flex-1 rounded-full border border-border bg-card px-4 py-2 text-sm"
              />
              <button
                type="button"
                disabled={!Number(avg)}
                onClick={applyBackfill}
                className="rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground disabled:opacity-50"
              >
                Fill in
              </button>
            </div>
            {filled !== null && (
              <p className="mt-2 text-[11px] text-primary">
                {filled > 0 ? `Added an estimate for ${filled} days.` : "Nothing to add. Those days already have steps."}
              </p>
            )}
          </div>
        )}

        <div className="rounded-2xl border border-border/40 bg-card/60 p-3.5 text-[11px] leading-relaxed text-muted-foreground">
          🔒 <strong className="text-foreground">Privacy Note:</strong> Your activity data is stored in your
          personal, encrypted account strictly to generate your private reflections and roundups. It is never
          shared with third parties or advertisers.
        </div>
      </div>
    </Field>
  );
}

function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-full border border-border bg-card px-3 py-3 text-base"
      />
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="pt-4">
      <h2 className="font-display text-2xl text-foreground">{label}</h2>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}
