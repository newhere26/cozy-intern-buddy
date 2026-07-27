import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { setState, useApp } from "@/lib/store";
import type { CompanionId, ThemeId } from "@/lib/store";
import { COMPANIONS, COUNTRIES, THEMES } from "@/lib/data";
import { Companion } from "@/components/Companion";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome — Serenity" },
      { name: "description", content: "Set up your cozy companion for internship." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OnboardingPage,
});

const STEPS = [
  "welcome",
  "name",
  "country",
  "internship",
  "leaves",
  "shift",
  "companion",
  "theme",
  "done",
] as const;
type Step = (typeof STEPS)[number];

function OnboardingPage() {
  const app = useApp();
  const nav = useNavigate();
  const [step, setStep] = useState<Step>("welcome");
  const idx = STEPS.indexOf(step);

  const next = () => setStep(STEPS[Math.min(STEPS.length - 1, idx + 1)]);
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
            className={cn(
              "h-1 flex-1 rounded-full",
              i < idx ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </div>

      <div className="flex-1">
        {step === "welcome" && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="h-48 w-48">
              <Companion id={app.companion} />
            </div>
            <h1 className="mt-6 font-display text-3xl text-foreground">Serenity</h1>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              A quiet companion for your internship. No streaks. No shame. Just soft company for hard days.
            </p>
          </div>
        )}

        {step === "name" && (
          <Field label="What should we call you?">
            <input
              autoFocus
              value={app.name}
              onChange={(e) => setState({ name: e.target.value })}
              placeholder="your name"
              className="w-full rounded-full border border-border bg-card px-4 py-3 text-base"
            />
          </Field>
        )}

        {step === "country" && (
          <Field
            label="Where are you doing your internship?"
            hint="This sets your date format."
          >
            <select
              value={app.country}
              onChange={(e) => setState({ country: e.target.value })}
              className="w-full rounded-full border border-border bg-card px-4 py-3 text-base"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              value={app.city}
              onChange={(e) => setState({ city: e.target.value })}
              placeholder="hospital or city (optional)"
              className="mt-3 w-full rounded-full border border-border bg-card px-4 py-3 text-base"
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
              type="number"
              value={app.durationWeeks}
              onChange={(e) => setState({ durationWeeks: Number(e.target.value) || 54 })}
              className="mt-1 w-full rounded-full border border-border bg-card px-4 py-3 text-base"
            />
          </Field>
        )}

        {step === "leaves" && (
          <Field label="How many leaves do you get?" hint="Yearly allotment.">
            <label className="text-xs text-muted-foreground">Casual leave (CL)</label>
            <input
              type="number"
              value={app.clAllotted}
              onChange={(e) => setState({ clAllotted: Number(e.target.value) || 0 })}
              className="mt-1 mb-3 w-full rounded-full border border-border bg-card px-4 py-3 text-base"
            />
            <label className="text-xs text-muted-foreground">Privilege leave (PL)</label>
            <input
              type="number"
              value={app.plAllotted}
              onChange={(e) => setState({ plAllotted: Number(e.target.value) || 0 })}
              className="mt-1 w-full rounded-full border border-border bg-card px-4 py-3 text-base"
            />
          </Field>
        )}

        {step === "shift" && (
          <Field
            label="Your usual shift"
            hint="We'll nudge you gently after check-out to rate your day."
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Check-in</label>
                <input
                  type="time"
                  value={app.checkIn}
                  onChange={(e) => setState({ checkIn: e.target.value })}
                  className="mt-1 w-full rounded-full border border-border bg-card px-3 py-3 text-base"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Check-out</label>
                <input
                  type="time"
                  value={app.checkOut}
                  onChange={(e) => setState({ checkOut: e.target.value })}
                  className="mt-1 w-full rounded-full border border-border bg-card px-3 py-3 text-base"
                />
              </div>
            </div>
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
          className="ml-auto flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground"
        >
          {step === "done" ? "Enter" : step === "welcome" ? "Begin" : "Next"}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pt-4">
      <h2 className="font-display text-2xl text-foreground">{label}</h2>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}
