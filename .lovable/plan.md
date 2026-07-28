## Fix credit refund bug + finish pending polish

### 1. Store credits — permanent spend

**Problem:** in `journey.tsx > StorePanel`, `canClaim = daysSince(startDate) - app.credits - app.ownedItems.length*0`. Because `*0` is zero, every time credits are spent, `app.credits` drops and `canClaim` grows back by the same amount — so users can immediately re-claim the credits they spent. Effectively free items.

**Fix:**

- Add `claimedDays: number` to `AppState` (default `0`) in `src/lib/store.ts`, plus a `claimCredits()` helper that adds `(earned - claimedDays)` to `credits` and sets `claimedDays = earned`.
- Rewrite `StorePanel` to compute `canClaim = daysSince(startDate) - app.claimedDays` and call `claimCredits()` — never referencing `app.credits` in the claim math. Spending is now permanent.
- Keep `purchaseItem` as-is (it already deducts and does not refund).

### 2. Milestone accessories worn on the companion

Currently 3/6/9/12-month milestones render as emoji chips stacked in the top-left corner. Instead, place them anatomically like shop items:

- `🩺` stethoscope → `neck` slot
- `🥼` gown -  → `body` slot
- `🎓` cap → `head` slot
- `📜` diploma → `hand` slot (rolled degree)

Update `Companion.tsx` so `activeMilestones()` are rendered through the same slot-positioning switch used for shop items (not the corner stack). Milestones and shop items share slots peacefully — milestones render first (below), shop items on top, so an equipped cap can layer over the graduation cap without stacking issues (or we can hide a milestone slot if a shop item occupies the same slot — pick the latter for cleanliness).

### 3. Shop item wearability

Slots already exist (`head`, `neck`, `hand`, `eyes`, `body`, `beside`) and `Companion.tsx` positions them, but the coordinates are rough. Tune the slot offsets so every item visibly sits on the companion (cap on top of head, chain on neck, mug in paw, plant beside, sunglasses on eyes, gown on body). Also ensure the equip toggle actually shows/hides the emoji at those coordinates on the home screen — already wired via `equippedItems` prop, just verifying after tuning.

### 4. Verify pending items from the prior overhaul

Quick pass to confirm still working end-to-end (no code changes unless broken):

- Onboarding validators, night-shift fields, extension inputs
- Night-shift lamp + coffee overlay + auto-off
- Calendar full-screen route with 3-visible posting scroll
- Wellness inline expand + water animation + meal companion phrases
- Procedure custom-entry option + scrollable list
- Journal full-screen + ruled lines + search/sort
- To-do scratch sound + reminder ladder
- Tools: Bengali phrasebook on top, no "bedside helper" subtitles, jargon last
- Journey tiles order and content

Run `tsgo --noEmit` and a Playwright smoke of `/`, `/onboarding`, `/journey` (buy → equip → verify credits don't come back) to confirm.

### Files touched

- `src/lib/store.ts` — add `claimedDays`, `claimCredits()`
- `src/routes/journey.tsx` — rewrite `StorePanel` claim math
- `src/components/Companion.tsx` — route milestones through slot layout, tune coordinates

Anything discovered broken during the verification pass gets fixed in the same turn.