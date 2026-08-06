# Wellness polish, breathing fix, posting reviews, achievements

## 1. Wellness tile — everything visible, everywhere

- Hydrate and Nourish panels get a consistent layout that fits 320px-wide phones: buttons never clip, minimum 44px tap height, visible border + focus ring, and a clear pressed state.
- Meal section: the four meal chips move to a 2x2 grid on very narrow screens (4-across only when there's room), the note input and Add button stack so the Add button is always fully on screen, and the logged-meal rows truncate long notes instead of pushing the layout.
- The whole expanded panel scrolls internally if it ever exceeds the available height, so no control is ever cut off.

## 2. Cuter water animation

Replace the single emoji drop with a cozy sequence on each "+1 glass":
- two or three small droplets fall from the top of the glass with slight stagger and wobble,
- a soft splash ring where they land,
- the water level rises with a gentle spring, with a slow wave shimmer on the surface,
- a tiny bubble or two drifting up after filling.
All done with CSS keyframes in the stylesheet (no new libraries), and disabled for users who prefer reduced motion.

## 3. Breathing circle expands on the first inhale

Currently the circle already sits at full size before the exercise begins, so the first inhale looks static. The circle will rest small when idle and grow on every inhale, including the first one, by starting the run collapsed and then animating outward on the next frame.

## 4. End-of-posting review

A short review attached to each rotation, with three 5-point rows:
- How did it feel? (emoji scale)
- How much did you learn?
- Would you want this as your PG? (compressed wording)
- Optional one-line note.

Where it appears:
- In the Calendar's postings list and the Journey Postings panel, a finished posting with no review shows a gentle "How was it?" prompt; tapping opens the review sheet.
- Reviews can be edited later; reviewed postings show their emoji and star counts inline.

## 5. Achievements tile in Journey

A new collapsible "Achievements" tile listing earned and locked milestones, derived from existing logged data:
- First night duty, first procedure of each type, first journal entry, first posting review.
- Most-performed procedure, busiest procedure day, total procedures, procedure independence (first independent log).
- Posting ranking by how they felt, and by procedures done in each posting.
- Time milestones (first week, first month, 3/6/9/12 months), hydration and meal consistency, quiet perfect-attendance stretches.
Each entry shows its name, a short warm line, and the date earned; locked ones stay dimmed with a hint.

## Technical notes

- `src/lib/store.ts`: add `rotationReviews: Record<rotationId, { felt: number; learned: number; pgInterest: number; note?: string; at: string }>` plus a `setRotationReview` helper; defaults merge keeps existing saved data safe.
- `src/components/home/WellnessTile.tsx`: layout/tap-target rework and new droplet animation markup.
- `src/styles.css`: droplet, splash, wave and bubble keyframes with a `prefers-reduced-motion` guard.
- `src/routes/relaxation.tsx`: idle scale collapsed; kick the inhale transition on the frame after start.
- New `src/components/PostingReview.tsx` used by `src/routes/calendar.tsx` and the Journey Postings panel.
- New `src/lib/achievements.ts` computing the list from store state, rendered by a new Achievements collapsible in `src/routes/journey.tsx`.
- All local-first; no backend changes.
