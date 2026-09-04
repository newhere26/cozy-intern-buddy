# Attendance bulk actions, quiet-hours-aware snooze, test notifications

## 1. Bulk actions in Attendance review

On `/attendance-review`:
- Add a selection mode: each auto-marked day row gets a checkbox, plus "Select all" per month and a global "Select all".
- A sticky action bar appears when anything is selected: **Mark Present**, **Leave blank**, and **Clear selection**, with a count ("6 days selected").
- Actions loop the selected dates through the existing `setDay` / `clearDay` store helpers, then clear the selection and show a small confirmation line.
- Per-day override buttons (Present / CL / PL / Absent / Leave it blank) stay exactly as they are today.

## 2. Snooze respects quiet hours and reports the next time

In `src/lib/notify.ts`:
- Export a helper that, given a target time and the user's prefs, pushes the time forward to the end of quiet hours if it lands inside them (handles ranges that wrap midnight).
- `snooze()` reads the saved notification prefs, applies that helper, and returns the final scheduled timestamp.
- The service worker snooze path (and the in-app handler that receives its message) uses the same adjusted time, so a 30/60 min snooze during quiet hours lands at the moment quiet hours end instead of buzzing.
- After a snooze, the app shows a toast: "Okay — I'll nudge you again at 7:30 AM." When the app is not open, the delayed notification body carries the same "next nudge" phrasing.

## 3. "Send test notification" on the Reminders screen

On `/notifications`, under the permission button:
- Three small buttons — Hydration, Nourishment, Attendance — each fires a sample nudge immediately using the same copy generator and snooze buttons as the real ones, so the user can also test snoozing.
- If permission isn't granted yet, tapping requests it first; if denied, an inline note explains notifications are blocked for the site.
- Test notifications bypass quiet hours (they're user-initiated) but say so in a short caption under the buttons.

## Technical notes

- Files touched: `src/routes/attendance-review.tsx`, `src/routes/notifications.tsx`, `src/lib/notify.ts`, `public/notif-sw.js` (pass the adjusted time back with the snooze message).
- Test nudges reuse the existing hydration/meal/attendance copy arrays so the preview matches real reminders.
- No backend or schema changes; everything stays local-first.
