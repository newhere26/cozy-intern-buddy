# Calendar redesign, attendance timing rule, drug reference tool

## 1. Apple-style month calendar

Replace the current rolling 28-day grid on `/calendar` with a real month view:

- Header shows the month and year (e.g. "August 2026") with back/forward arrows to move between months.
- Weekday labels (Mon–Sun, or Sun–Sat depending on region) fixed across the top.
- The grid shows the whole current month, padded at the start and end with the neighbouring months' days so every week row is complete. Those padding days render dimmed and are not tappable for logging.
- Today keeps its highlight ring; status colours and the night-shift moon stay as they are.
- The date-detail panel and postings list below stay unchanged.

## 2. Attendance can only be logged past the halfway point of the shift

- Determine the day's expected shift window from the posting active on that date (its check-in/check-out); fall back to the profile default timings, and to the night-shift window when night mode is on for that day.
- Attendance buttons (Present / CL / PL / Absent) stay disabled for today until the device clock passes 50% of that window's duration. A short note explains when logging opens (e.g. "You can log attendance after 12:00").
- Past dates remain fully editable; future dates stay locked as they are now.

## 3. Replace the Ward Jargon Decoder with a Common Drugs reference

- Remove the jargon tile and its data from the tools page.
- Add a "Common Drugs" tile in the same bottom position, opening a reference of 40–50 frequently used ward drugs. Each entry: generic name, drug class, usual adult dose (and paediatric dose where routinely relevant), route, and 2–3 India-specific brand names.
- Search bar filters across generic name, brand name, and class.
- A horizontally sliding class selector (Antibiotics, Analgesics, Antipyretics, Antiemetics, PPIs/GI, Cardiac, Antihypertensives, Diabetes, Respiratory, Steroids, Anticoagulants, Neuro/Psych, Fluids/Electrolytes, Others) filters the list; "All" is the default chip.
- A short disclaimer line notes doses are a quick reference, not a prescribing authority.

## Technical notes

- Calendar changes are contained in `src/routes/calendar.tsx` plus small date helpers in `src/lib/date.ts` (month grid builder, weekday labels).
- Shift-window logic added as a helper (posting lookup + minutes-elapsed check) and used to gate the status buttons; night windows crossing midnight handled explicitly.
- Drug data lives in a new `src/lib/drugs.ts`; the tool UI replaces the `Jargon` component in `src/routes/tools.tsx`.
- All local-first, no backend needed for these three items.

## Feasibility: email/password login with a Firebase backend

Doable, but here is the honest picture.

- Lovable has a built-in backend (Lovable Cloud) with email/password login, per-user data isolation, and secure server-side rules already wired in. Using it means no external accounts, no API keys to manage, and it is the smooth path. Firebase is also possible, but it needs your own Firebase project, config keys, and hand-written security rules, and Lovable cannot inspect or manage that project for you — debugging becomes largely manual.
- Either way, the bigger work is not the login screen; it is migrating Serenity from device-only storage to a cloud database. Every part of the app currently reads and writes one local object: profile, attendance days, postings, procedures, meals, water, journal, to-dos, credits, and shop items. Cloud sync means a table per area, ownership rules so each intern only sees their own rows, plus a one-time import of whatever is already on the device so nothing is lost.
- Practical sizing: auth screens and profile sync is a small piece; full data migration and sync across all the features is the substantial part, best done in stages (auth + profile first, then calendar/attendance, then the rest).
- Trade-off to know: the app stops being fully offline unless we keep the local store as a cache and sync in the background — worth doing for ward use where signal is poor.

If you want this, tell me whether to use Lovable's built-in backend (recommended) or your own Firebase project, and I will plan the migration separately.

## Not included

Auth/backend work is not part of this plan — it is a separate build once you pick a direction. 

4) decrease the lag in opening screens when clicked on it

5)add a small bar on top of the homescreen in which there is "Hello, Dr  [ name ]" and below this line there should be another line " [their city ] | [department in what they are currently posted] " 

&nbsp;