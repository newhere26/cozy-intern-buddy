# Serenity — Feature & Polish Overhaul

A large batch of changes across onboarding, home, calendar, wellness, procedures, writing, tools, journey, and companion behavior. Grouped so each area is self-contained.

---

## 1. Onboarding — stricter validation & new fields

**Step 1 (Profile)**

- Name: required, **letters + spaces only** (regex `/^[A-Za-z\s]+$/`), no digits/symbols.
- Country: keep as-is.
- **City**: new field, required, letters + spaces only.
- **Medical college**: new field, optional, free text.
- Inline error messages, "Next" disabled until valid.

**Step 2 (Shift timings) — expanded**

- Day shift start / end (existing).
- **Night shift start / end** (default: night starts at day-end, ends at next day-start).
- **Post-duty off?** yes/no toggle. When no (default for most Indian interns), we know a night shift continues into the next day's day shift.

**Step 3 (Leaves)**

- CL: **required**, numbers only.
- PL: **optional**, numbers only.
- **Extension per PL day**: numeric (e.g. 1 day PL = 2 days extension).
- **Extension per unauthorized absence**: numeric.
- These feed the Journey "Leaves & Extensions" tile.

**Step 4 (Companion & theme)** — unchanged.

---

## 2. Home screen — companion interactions & fixes

- **Fix capybara illustration**: regenerate the capybara asset with correct anatomy (4 limbs, 2 fore + 2 hind).
- **Tap companion → speak**: opens a small speech bubble with a rotating pool of ~40 friendly, human-sounding lines: encouragement, "how are you feeling?", "did you eat?", "how was rounds?", plus **at least one progress line each day** (e.g. "you're 12 weeks in, 42 to go", "you're 22% done", "one more day = 0.27% closer"). Line pool seeded so at least one progress-flavored line surfaces per day.
- **Companion size starts smaller** (~30svh instead of 38svh) so growth is visible.
- **Growth milestones** based on weeks since `startDate`:
  - 12+ wks: black stethoscope overlay
  - 26+ wks: shoes + graduation gown overlay
  - 39+ wks: graduation cap overlay
  - 52+ wks: rolled diploma in paw
  - Size scales up ~5% per milestone. Overlays are separate PNGs composited over the companion.
- **Tile expansion fix**: currently `openTile` state works, but Calendar and Wellness appear to expand together — audit `CalendarTile` / `WellnessTile` to ensure each only reads its own `open` prop and no shared class toggles both.

---

## 3. Calendar — full-screen expansion, postings redesign

- Tapping the Calendar tile **navigates to a new route `/calendar**` (full screen) instead of expanding inline.
- Full screen shows: month grid, day detail editor, night-shift toggle, and the postings list.
- **Postings list**: horizontally/vertically scrollable, shows **only 3 at a time** (previous · current · next) with snap scrolling; rest accessible by scroll.
- **20-color palette** for postings — deterministic assignment by posting index so each rotation gets a distinct pastel that persists.
- Add-posting form as today.

### Night-shift mode (big feature)

- When user toggles Night Shift on for today:
  - Companion image swaps to (or overlays) a **coffee mug + a small lamp glow above head**.
  - Home greeting changes to: *"Good evening, Dr. {Name}. I'm here, with you through the night and beyond."*
  - Companion speech pool switches to a **night-shift line set** (~20 lines about coffee, quiet corridors, dawn coming, etc.).
- Auto-off: at night-shift end time (from onboarding), a lightweight timer clears the night flag, removes lamp/coffee, resets greeting.
- Implemented with a stored `nightShiftUntil` ISO timestamp checked on mount + interval.

### Attendance reminder

- Local notification (Notification API + `setTimeout` while app open; also a scheduled service-worker note if permission granted) fires **15 min after day-shift start** asking "Did you mark attendance today?".
- Same for night shift.

---

## 4. Wellness — inline expand, fun water anim, meal phrases

- Wellness tile expands **inline (grows in height only, not full screen)** — everything visible without navigating away.
- **Water logging**: animated wave-fill glass, +1 taps trigger a droplet ripple + subtle bounce.
- **Meal logging**: on save, companion pops a **speech bubble with one of 24 rotating phrases** (seeded so no repeat for 7 days).

---

## 5. Procedure Log — scrollable + custom entry

- Procedure picker becomes a **scrollable list** (max-height + overflow).
- Add a **"+ Custom procedure"** option at bottom — user types their own name; saved with normal ease/confidence/supervision fields.

---

## 6. Writing tab — cleaner journal + real to-do

**Layout**: two horizontal collapsed tiles.

**Journal tile**

- Collapsed by default. Tap → opens **full-screen journal editor**.
- Remove tagline "notebook feel, your words stay on your phone" (keep header).
- Editor: pure **horizontal ruled lines** background (CSS repeating linear-gradient), text baseline aligned to the lines (use `line-height` matching stripe height, top padding = stripe offset).
- On save: entry stored with date, title/heading, rotation (auto-detected from date), day rating.
- **Entries list**: search by heading, sort by **date / rotation / rating** (e.g. "show all happy days").

**To-Do tile**

- Renamed to just "To-Do List".
- Complete → play a short **scratch sound** + strikethrough animation.
- Bell → schedules **push notifications** at +3m, +5m, +15m, +1h, +3h, +5h, +7h, +9h, +11h, +13h, +15h, +17h, +19h, +21h, +24h. Stops at end-of-day if the day rolls over. Uses `Notification` API + `setTimeout` chain persisted in localStorage so reminders survive reload; requests permission on first bell.

---

## 7. Tools — layout cleanup

- Move **Bengali Phrasebook** to the top (above the calculator bento grid).
- Calculators bento grid in the middle — **remove the "Bedside helper" subtitle** from every tile.
- add more calculators if you would like
- **Jargon Decoder** tile at the bottom.

---

## 8. Journey — restructured tiles

- **Internship tile**: bigger display font for the week number; show **only fully completed weeks** (floor), not the in-progress one.
- **Leaves & Extensions tile** (replaces Leaves tile): shows
  - CL taken (with department per leave), CL remaining
  - PL taken (with department), PL remaining
  - **Extension days owed** and in which department each was incurred
  - Auto-calculated from `days` (CL/PL/absent statuses) crossed with active rotation on that date and the extension multipliers from onboarding.
- **Procedures tile**: collapsed → tap opens a **full-screen procedures view**:
  - Grouped list of every procedure (no mixing), count per procedure name.
  - Sortable by posting / date / time.
  - "Best day" stat: date with most procedures.
- **Postings tile**: collapsible; shows only 3 (prev/current/next) when collapsed, all when expanded. Same 20-color palette as Calendar.
- **New: Store / Credits tile** (bottom, horizontal, collapsed):
  - Earn 1 credit per completed internship day.
  - Redeem for companion accessories: coffee mug, plant, sunglasses, chain, scarf, cap, book, bandana, etc. (~12 items).
  - cost each of them appropriately with your best assets costing more 
  - Items apply as overlays on the companion (composable with growth milestones).

---

## 9. Assets to generate

- Fixed capybara (4 limbs).
- Overlays: stethoscope, gown+shoes, grad cap, diploma, coffee mug, lamp/glow, plus store items (mug, plant, sunglasses, chain, scarf, cap, book, bandana).
- All as transparent PNGs, positioned via absolute overlay wrapper over `<Companion>`.

---

## 10. Technical notes

- **Store additions** (`src/lib/store.ts`):
  - `city`, `college`, `nightStart`, `nightEnd`, `postDutyOff`, `extPerPl`, `extPerAbsent`
  - `nightShiftUntil?: string`
  - `credits: number`, `ownedItems: string[]`, `equippedItems: string[]`
  - Journal: add `title`, keep rating linkage
- **New routes**: `/calendar`, `/journal/new`, `/journal/$id`, `/journey/procedures`
- **New utility**: `postingColor(index)` returning one of 20 tokens; add `--posting-1..20` CSS vars in `styles.css`.
- **Notifications**: helper in `src/lib/notify.ts` — permission request, schedule/cancel with persisted queue in localStorage.
- **Sound**: tiny inline base64 scratch sound (or small mp3 in `src/assets`).
- **Validation**: shared regex helpers in `src/lib/validate.ts`.

---

## Out of scope (flag before build)

- Actual iOS/Android push (uses web Notification API only — reliable while browser tab lives; best-effort otherwise).
- Server sync — everything stays local-first.

Ready to build on approval.