# Tools polish, doctor-first phrasebook, more scores & drugs, wellness buttons

## 1. Tools page layout

The tiles lost their footer line when "Bedside helper" was removed, leaving them slightly unbalanced. Rebalance:

- Tighten tile padding so each square tile has even top/bottom breathing room with just icon, title, blurb, and the "Tap to open →" line.
- Equalise tile heights across a row so two-line and one-line titles don't stagger.
- Reorder for one-tap priority: Bengali phrasebook (wide, top), then the calculators in the 2-column grid grouped as emergency/scores first (GCS, qSOFA, CURB-65, Wells', HAS-BLED, CHA2DS2-VASc, ABCD2, NIHSS), then bedside maths (IV fluids, BMI, Parkland, APGAR, Paediatric doses), with Common Drugs as the wide tile at the bottom.

## 2. Bengali phrasebook — doctor asking the patient

- Rewrite every entry as the doctor's voice addressed to the patient ("Do you have chest pain?", "Do you have fever?"), in polite Bengali (আপনি form), with Bengali script, romanisation, and English. Patient-voice complaint lines are converted into questions.
- Expand to roughly 150 phrases covering history taking, red flags, and examination commands.
- Add a sliding system selector across the top, same style as the drug class chips: All, General/History, CVS, Respiratory, GIT, Renal/Urology, Neuro, Obs & Gynae, Paediatrics, Musculoskeletal, Skin, ENT/Eye, Examination commands, Reassurance & instructions.
- Keep the search bar; it searches English, romanised, and Bengali text across all systems.
- Add a "Helper words" group: yes/no, pain, since when, today, yesterday, days/weeks/months, more/less, here/there, better/worse, morning/night, numbers 1–10, please/thank you, sit/stand/lie down — short items rendered in a compact two-column list.

## 3. Three new scoring tools

- **CHA2DS2-VASc** — stroke risk in AF. CHF, hypertension, age ≥75 (2), diabetes, prior stroke/TIA/thromboembolism (2), vascular disease, age 65–74, female sex. Shows total plus risk band and anticoagulation guidance line.
- **ABCD2** — stroke risk after TIA. Age ≥60, BP ≥140/90, clinical features (unilateral weakness 2 / speech disturbance without weakness 1), duration (≥60 min 2 / 10–59 min 1), diabetes. Shows 2-day risk band.
- **NIHSS** — full 15-item stroke scale (LOC 1a/1b/1c, gaze, visual fields, facial palsy, motor arm L/R, motor leg L/R, ataxia, sensory, language, dysarthria, extinction) with per-item dropdowns, running total, and severity band.

## 4. More drugs, accuracy-checked

- Add roughly 30 more commonly used ward drugs (e.g. cefotaxime, cloxacillin, linezolid, colistin, ofloxacin/ornidazole, acyclovir, oseltamivir, ivermectin, albendazole, artesunate, chloroquine, rifampicin/INH/pyrazinamide/ethambutol, ORS, syrup zinc, iron/folic acid, vitamin B12, thiamine, magnesium sulphate, oxytocin, misoprostol, terbutaline, nifedipine, hydralazine, spironolactone, torsemide, sodium bicarbonate, dopamine, noradrenaline, dobutamine, naloxone, flumazenil, protamine, salbutamol syrup).
- Each entry re-checked against standard Indian references for adult (and paediatric where routine) dosing, route, and 2–3 genuine Indian brand names; existing entries get the same accuracy pass and corrections where needed.
- Extend the class list where required (e.g. Antivirals/Antiparasitics, TB, Vasopressors/Antidotes, Obstetrics).

## 5. Wellness tile buttons

- The +1 glass / −1 controls and the meal-type chips get larger touch targets, solid backgrounds, and clear borders so they read against the card on the 393px viewport.
- The meal "Add" button gets a visible label rather than icon-only, and the hydrate row is centred with proper spacing so nothing sits under the glass illustration.
- Verify visually in the preview at 393×590 after the change.

## Technical notes

- Phrasebook data moves to a typed structure in `src/lib/data.ts` with a `sys` field plus a separate helper-words list; `Phrasebook` in `src/routes/tools.tsx` gains a chip row like `DrugsRef`.
- New scores are three components in `src/routes/tools.tsx` following the existing calculator pattern, registered in `TOOLS` and `ToolBody`.
- Drug additions extend `src/lib/drugs.ts` (`DRUGS`, `DRUG_CLASSES`).
- Wellness fixes are contained in `src/components/home/WellnessTile.tsx`.
