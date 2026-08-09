# Companion bubble, achievements, art-piece store, attendance review, notification settings

## 1. Companion speech bubble readable
Move the companion down slightly and reserve space above it so the bubble never clips at the top of the screen: the bubble renders in a fixed slot above the companion (below the greeting card), with the companion pushed down by that slot's height. Bubble text wraps fully, stays up longer (about 8s) and can be dismissed by tapping it.

## 2. "Write about this" arrow
When the tapped line is a question (ends with "?"), a small down-arrow button appears under the bubble. Tapping it opens Writing with that line pre-filled as the entry's prompt, and the cursor in the text area ready to go.

## 3. Achievements: earned only, and ties
- Only earned achievements render; pending/"still ahead" cards are dropped entirely.
- "Most performed procedure" lists every procedure tied at the top count, not just one.

## 4. Store becomes an art gallery (Art Institute of Chicago)
Replace the emoji accessory store with framed artwork backdrops that sit behind the companion.
- A curated set of ~16 public-domain artworks (calm landscapes, night scenes, soft still lifes) fetched from the Art Institute of Chicago public API — no key required.
- Each piece shows a thumbnail, title, artist, and credit cost. Buying unlocks it; tapping an owned piece sets it as the companion's backdrop (one at a time, plus "None").
- Backdrop renders softly blurred/dimmed behind the companion so the animal stays the focus, and appears on the home screen only.
- Artwork list and images are cached locally so the gallery works offline after the first load; if the API is unreachable, the gallery shows a gentle "couldn't reach the gallery today" message instead of breaking.
- Milestone gear (stethoscope, gown, cap, diploma) stays as-is; only the purchasable accessories are retired. Previously bought accessories are refunded as credits so nothing is lost.

## 5. Attendance review
A new section in Calendar (and linked from Journey) listing every day that was auto-marked Present by the two-week backfill, grouped by month, with a per-day control to change it to CL, PL, Absent, or clear it. Auto-marked days are flagged in state so they can be listed and are visually marked in the month grid with a faint dot.

## 6. Notification settings screen
A settings screen (from Journey) with:
- Toggles for hydration, nourishment, and attendance nudges, independently.
- Quiet hours (start/end) — nothing fires inside that window.
- Frequency for hydration (gentle / normal / often).
- Permission status and a button to enable notifications.
Settings are respected by the scheduler on every reschedule.

## 7. Cozier notification copy
Rewrite the reminder lines to be warmer and more personal: use the intern's name and a nod to their companion, reference the current posting where known, and name the specific item where applicable ("You had dal-rice at lunch — dinner too?", "That's 5 glasses today, one more?"), varying so the same line doesn't repeat two days running.

## 8. Snooze
Every hydration, nourishment, and attendance notification carries snooze actions (30 min / 1 hr). Because plain web notifications only fire actions through a service worker, a small service worker handles the action click and reschedules; where the browser doesn't support actions, tapping the notification opens the app on a snooze prompt with the same two choices.

## Technical notes
- `src/routes/index.tsx`: bubble slot layout, question detection, arrow → `navigate({ to: "/journal", search: { prompt } })`; `src/routes/journal.tsx` reads the search param into its prompt state.
- `src/lib/achievements.ts`: filter to `earned`, return an array for most-performed ties.
- New `src/lib/artic.ts` (fetch + cache of Art Institute artworks via `https://api.artic.edu/api/v1/artworks/search`, IIIF image URLs), `src/lib/store-items.ts` trimmed to milestones, `AppState` gains `ownedArt`/`activeArt`, `Companion.tsx` renders the backdrop layer, `journey.tsx` gallery UI with refund migration.
- `src/lib/store.ts`: `backfillPresentDays` marks `auto: true` on generated entries; new `autoMarkedDays` selector.
- New `src/routes/settings.notifications.tsx`; `AppState.notifPrefs` (per-kind enabled, quiet hours, hydration frequency).
- `src/lib/notify.ts`: prefs-aware scheduling, richer copy builder, snooze helpers; new `public/notif-sw.js` service worker registered on permission grant.
