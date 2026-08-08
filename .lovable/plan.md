# Companion cleanup, cozy reminders, smiley scale, auto-present

## 1. Fewer companions
Remove Turtle and Red Panda everywhere: companion list, type union, and onboarding picker. Anyone whose saved companion is one of those falls back to Capybara so the app never renders a missing character. Remaining: Capybara, Cow, Owl.

## 2. Accessories that actually fit
Rework how store items and milestone gear sit on the companion so scale and placement look anatomically right on each of the three animals:
- Per-companion anchor points (head, eyes, neck, hands, body, beside) with tuned x/y offsets and per-slot sizes, instead of one shared set of coordinates.
- Head items (cap, bandana, crown, grad cap) sit on the crown, sized to head width; eyewear sits across the eyes; neck items (stethoscope, chain, scarf, medal) curve just under the chin; hand items (mug, book, donut, diploma) sit at the paw; gown covers the torso; plants/cake sit on the ground beside.
- Slight rotation/scale per companion so nothing floats or overlaps the face.

## 3. Medical college example
Change the college placeholder to a neutral example (e.g. "e.g. City Medical College") — no real named institution.

## 4. Push reminders
Extend the existing reminder scheduler with daily, cozy-worded nudges:
- Hydration: a few spaced reminders through the waking day, skipped if water was already logged recently.
- Nourishment: around breakfast/lunch/dinner windows derived from their shift timings.
- Attendance: a nudge shortly after the shift midpoint (when logging unlocks) and one in the evening if the day is still unmarked.
All rescheduled on app open, cancelled once the matching thing is logged, with warm language ("a few sips for me?", "did you eat something, Dr. ___?").

## 5. Smiley scale instead of emoji
Replace the emoji characters in posting reviews with a drawn 5-point smiley face scale (SVG circles with varying mouth curves and colour), used both in the rating control and the saved-review summary.

## 6. Auto-mark past days present
Once a day is more than 2 weeks in the past and still has no entry — and isn't a CL/PL/absent day — mark it Present automatically. Runs on app open, only for dates on/after internship start and up to today, and never overwrites an existing entry. Leaves/absences and their extension maths are untouched.

## Technical notes
- `src/lib/data.ts`, `src/lib/store.ts` (CompanionId union + migration on load), `src/routes/onboarding.tsx`.
- `src/components/Companion.tsx`: per-companion anchor map keyed by companion id and slot.
- `src/lib/notify.ts`: new hydration/meal/attendance schedulers; init from the app shell.
- `src/components/PostingReview.tsx`: new `SmileyFace` component.
- New backfill helper in `src/lib/store.ts` (or `src/lib/date.ts`) invoked once per session.
