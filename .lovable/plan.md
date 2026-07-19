# Serenity — A Cozy Companion for Medical Interns

A calming, low-pressure companion app for MBBS/medical interns to track rotations, log procedures, journal, and gently care for themselves. No streaks, no deadlines, no shame — just a soft animal friend on the home screen and quiet tools that stay out of the way.

## Design language

- **Palette**: 5–6 dark, muted pastel themes selected during onboarding (e.g. Midnight Sage, Dusk Lavender, Twilight Rose, Deep Ocean, Warm Cocoa, Charcoal Mist). All themes lean darker with soft pastel accents — not bright, not clinical.
- **Typography**: Rounded, gentle sans (e.g. Quicksand or Nunito for body; a softer display like Fraunces Soft or DM Serif rounded for headings). No sharp corners anywhere.
- **Motion**: Slow, breathing-like transitions. Companion has subtle idle animation (blink, sway).
- **Layout**: Generous negative space, single-thumb reach, mobile-first (390×844 target). Bottom nav for one-touch navigation.

## Companion

- 5 options chosen at onboarding: **Capybara, Red Panda, Cow, Turtle, Owl**.
- Rendered as illustrated but anatomically-recognizable animals (soft, painterly — not flat cartoon, not photoreal). Warm, textured, hand-illustrated feel.
- On the home screen the companion floats freely on the background (no tile, no card, no border) and occupies ~35–45% of the screen vertically at the top.
- Idle animation and a soft greeting line underneath ("Good evening, Aditi.").

## Onboarding flow

Kept short and gentle — one question per screen, skippable where possible.

1. Name / preferred name
2. Country + region (drives date format: `dd/mm/yyyy` for India & subcontinent; `mm/dd/yyyy` otherwise)
3. City / hospital (free text, optional)
4. Internship start date + total duration (default 54 weeks, editable)
5. Casual Leave (CL) allotment and Privilege Leave (PL) allotment for the year
6. Typical shift check-in / check-out times (used for the daily rate-your-day nudge)
7. Choose a companion (Capybara / Red Panda / Cow / Turtle / Owl)
8. Choose a color theme (5–6 dark pastel swatches)

## Bottom navigation (4 tabs)

- **Home**
- **Journal**
- **Tools**
- **Journey** (chosen name — feels warmer than "Stats"; also considered *Path*, *Milestones*)

## Home screen layout

Top to bottom:

1. **Companion** — free-floating on background, ~35–45% of screen, no tile.
2. **Two square tiles side by side**, both collapsible, soft rounded corners:
  - **Calendar** (left) — label is simply "Calendar", no subtitle.
  - **Wellness** (right)
3. **Procedure Log** — full-width horizontal tile, collapsible.
4. **Affirmations** and **Relaxation** — two small square tiles side by side, below the procedure log.

### Calendar tile

**Collapsed view:**

- Large "Week X / 54" progress readout (bigger font).
- A tiny 3-day strip: day-before-yesterday, yesterday, today — each color-coded:
  - green = Present
  - amber = CL
  - lilac = PL
  - (a fourth muted tone for Absent-no-leave)
- Today is the active day by default.

**Expanded view:**

- Month calendar, today highlighted, past dates editable.
- Per-day: mark Present / Absent → if Absent, pick CL or PL.
- Toggle: **Night shift** on/off for a date.
- When logging a new posting/rotation, set expected check-in & check-out times for that posting.
- No leaves counter here (that lives in Journey).
- Rotations shown in **chronological order**, not entry order.

### Wellness tile

**Collapsed view:** just the label and a soft icon.

**Expanded view — two tabs only:**

- **Hydrate** — tap to add a glass of water; simple day count with a soft filling animation.
- **Nourish** — log meals (breakfast / lunch / dinner / snack); a note field.

No mood tracker, no "how are you feeling" — that data isn't stored.

### Procedure log tile

- Collapsible full-width tile.
- Dropdown of procedures (searchable, standard MBBS intern list — IV cannulation, ABG, Foley, suturing, LP, intubation, NG tube, etc.).
- For each logged procedure, 4 fields:
  - **Ease** (soft 1–5 dots)
  - **Confidence** (soft 1–5 dots)
  - **Supervision** — 3 options: *Observed*, *Assisted*, *Independent*
  - **Notes** (optional short text)

### Affirmations & Relaxation tiles

- Two square tiles below the procedure log.
- **Affirmations** — opens a full-screen calm view; large rotating library of medicine-flavored, human-sounding affirmations ("It's okay that you didn't know that yet. You're learning.", "Rest is part of the work."). Curated wording, not AI-generated feel. Aim for 150+ at launch.
- **Relaxation** — guided breathing (box breathing, 4-7-8) with a slow expanding circle.

## Notifications (gentle, cozy tone)

- 3–4/day meal check-ins ("Have you eaten something warm today?").
- One nudge after the user's set check-out time asking them to rate their day (routes into Wellness → day rating stored for Journey trends).
- No streak/loss language, ever.

## Journal tab

- Free-form daily entries with soft prompts given by the companion - a smaller version of it- sitting at the top right and prompts can be trigger by clicking on it  ("What surprised you today?", "One kind thing you saw.").
- Entries tied to the current rotation for later reflection.
- Optional attach: procedures logged that day.

## Tools tab

- Quick reference the intern actually reaches for during shifts: common drug doses, pediatric dosing of only standard drug's, IV fluid calculator, GCS, APGAR, unit converters, BMI, corrected calcium, anion gap, medical shorthand and its actual things and feel free to add more Kept minimal and offline-friendly.
- Also add a phrase book - which will run offline - this is a phrasebook that will have 50 - 80 most common phrases and words of patients complaints that the interns can use to translate and in V1 of the app only language available will be Bengali to English 

## Journey tab (stats / progress)

- Weeks of internship completed (X / 54).
- Rotations timeline (chronological).
- Procedure counts by type + supervision level trend (subtle, no graphs that feel like grading).
- **Leaves counter lives here**: CL used / allotted, PL used / allotted.
- Day-rating trend from the evening nudge (soft area chart in theme color).

## Locale & formatting

- If country is India / Pakistan / Bangladesh / Sri Lanka / Nepal / Bhutan / Maldives → all dates render `dd/mm/yyyy`.
- Otherwise `mm/dd/yyyy` (or locale-appropriate).

## Technical notes

- TanStack Start + Tailwind v4 already set up.
- Local-first for now: settings, companion, theme, calendar entries, procedures, meals, water, journal, affirmations progress all persist in `localStorage` (no backend in v1). Notification prompts use the Web Notifications API where available.
- Design tokens for each of the 5–6 themes defined in `src/styles.css` under `@theme inline` with a `data-theme="..."` attribute on `<html>`; theme is applied from stored onboarding choice.
- Routes:
  - `/` — onboarding gate → home
  - `/onboarding` — multi-step flow
  - `/journal`
  - `/tools`
  - `/journey`
- Companion illustrations generated as 5 individual PNG assets (soft painterly style, transparent background) into `src/assets/companions/`.
- Rounded typography loaded via `<link>` in `__root.tsx` head (Google Fonts: Quicksand + Fraunces).

## Open questions I'll assume defaults for unless you say otherwise

- Fifth companion: **Owl** (as you suggested).
- Journey vs Stats: going with **Journey**.
- Default internship length: **54 weeks**.
- No account / cloud sync in v1 (fully local). We can add Lovable Cloud later for multi-device sync.