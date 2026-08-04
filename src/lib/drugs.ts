export interface Drug {
  name: string;
  cls: string;
  dose: string;
  route: string;
  brands: string[];
}

export const DRUG_CLASSES = [
  "Antibiotics",
  "Analgesics",
  "Antipyretics",
  "Antiemetics",
  "GI / PPI",
  "Cardiac",
  "Antihypertensives",
  "Diabetes",
  "Respiratory",
  "Steroids",
  "Anticoagulants",
  "Neuro / Psych",
  "Antivirals / Antiparasitics",
  "TB Drugs",
  "Vasopressors / Antidotes",
  "Obstetrics",
  "Fluids / Electrolytes",
  "Others",
] as const;

export const DRUGS: Drug[] = [
  // Antibiotics
  { name: "Amoxicillin + Clavulanate", cls: "Antibiotics", dose: "625 mg TDS PO / 1.2 g TDS IV; peds 30 mg/kg/day", route: "PO / IV", brands: ["Augmentin", "Clavam", "Moxikind-CV"] },
  { name: "Ceftriaxone", cls: "Antibiotics", dose: "1–2 g OD–BD; peds 50–75 mg/kg/day", route: "IV / IM", brands: ["Monocef", "Intacef", "Oframax"] },
  { name: "Cefixime", cls: "Antibiotics", dose: "200 mg BD; peds 8 mg/kg/day", route: "PO", brands: ["Taxim-O", "Zifi", "Mahacef"] },
  { name: "Azithromycin", cls: "Antibiotics", dose: "500 mg OD × 3–5 days; peds 10 mg/kg/day", route: "PO / IV", brands: ["Azithral", "Azee", "Zithrox"] },
  { name: "Doxycycline", cls: "Antibiotics", dose: "100 mg BD", route: "PO", brands: ["Doxt-SL", "Minicycline", "Doxy-1"] },
  { name: "Ciprofloxacin", cls: "Antibiotics", dose: "500 mg BD PO / 400 mg BD IV", route: "PO / IV", brands: ["Ciplox", "Cifran", "Zoxan"] },
  { name: "Levofloxacin", cls: "Antibiotics", dose: "500–750 mg OD", route: "PO / IV", brands: ["Levoflox", "Loxof", "Glevo"] },
  { name: "Metronidazole", cls: "Antibiotics", dose: "400 mg TDS PO / 500 mg TDS IV", route: "PO / IV", brands: ["Flagyl", "Metrogyl", "Aristogyl"] },
  { name: "Piperacillin + Tazobactam", cls: "Antibiotics", dose: "4.5 g Q6–8H", route: "IV", brands: ["Zosyt", "Tazact", "Piptaz"] },
  { name: "Meropenem", cls: "Antibiotics", dose: "1 g Q8H (2 g Q8H in CNS infection)", route: "IV", brands: ["Meronem", "Merocrit", "Penmer"] },
  { name: "Vancomycin", cls: "Antibiotics", dose: "15–20 mg/kg Q8–12H, trough guided", route: "IV", brands: ["Vancocin", "Vancomax", "Vanlid"] },
  { name: "Amikacin", cls: "Antibiotics", dose: "15 mg/kg OD", route: "IV / IM", brands: ["Mikacin", "Amikacin Aurobindo", "Amicin"] },
  { name: "Clindamycin", cls: "Antibiotics", dose: "600 mg Q8H", route: "IV / PO", brands: ["Dalacin C", "Clindac-A", "Clinsol"] },
  { name: "Fluconazole", cls: "Antibiotics", dose: "150 mg stat (candidiasis) / 200–400 mg OD systemic", route: "PO / IV", brands: ["Forcan", "Zocon", "Fluka"] },

  // Analgesics / antipyretics
  { name: "Paracetamol (Acetaminophen)", cls: "Antipyretics", dose: "500–1000 mg Q6H (max 4 g/day); peds 15 mg/kg/dose", route: "PO / IV", brands: ["Crocin", "Dolo-650", "Calpol"] },
  { name: "Ibuprofen", cls: "Analgesics", dose: "400 mg TDS; peds 10 mg/kg/dose", route: "PO", brands: ["Brufen", "Combiflam", "Ibugesic"] },
  { name: "Diclofenac", cls: "Analgesics", dose: "50 mg BD PO / 75 mg IM", route: "PO / IM", brands: ["Voveran", "Dynapar", "Diclonac"] },
  { name: "Tramadol", cls: "Analgesics", dose: "50–100 mg Q6–8H (max 400 mg/day)", route: "PO / IV", brands: ["Ultracet", "Tramazac", "Domadol"] },
  { name: "Morphine", cls: "Analgesics", dose: "2–5 mg slow IV titrated; 10 mg IM", route: "IV / IM / PO", brands: ["Morcontin", "Morphine Sulph. Inj (Govt supply)"] },
  { name: "Ketorolac", cls: "Analgesics", dose: "30 mg Q8H (max 5 days)", route: "IV / IM", brands: ["Ketorol", "Zokem", "Torolac"] },

  // Antiemetics / GI
  { name: "Ondansetron", cls: "Antiemetics", dose: "4–8 mg Q8H; peds 0.15 mg/kg", route: "IV / PO", brands: ["Emeset", "Vomikind", "Ondem"] },
  { name: "Metoclopramide", cls: "Antiemetics", dose: "10 mg TDS", route: "IV / PO", brands: ["Perinorm", "Reglan", "Maxeron"] },
  { name: "Domperidone", cls: "Antiemetics", dose: "10 mg TDS before meals", route: "PO", brands: ["Domstal", "Vomistop", "Domcet"] },
  { name: "Pantoprazole", cls: "GI / PPI", dose: "40 mg OD (80 mg stat + infusion in UGI bleed)", route: "IV / PO", brands: ["Pan-40", "Pantocid", "Pantop"] },
  { name: "Omeprazole", cls: "GI / PPI", dose: "20–40 mg OD", route: "PO", brands: ["Omez", "Ocid", "Omecip"] },
  { name: "Ranitidine / Famotidine", cls: "GI / PPI", dose: "Famotidine 20 mg BD", route: "PO / IV", brands: ["Famocid", "Topcid", "Fadine"] },
  { name: "Lactulose", cls: "GI / PPI", dose: "15–30 mL BD–TDS (titrate to 2–3 stools/day)", route: "PO", brands: ["Duphalac", "Looz", "Livoluk"] },
  { name: "Hyoscine butylbromide", cls: "GI / PPI", dose: "20 mg Q6H", route: "IV / PO", brands: ["Buscopan", "Cyclopam (with dicyclomine)"] },

  // Cardiac / antihypertensives
  { name: "Furosemide", cls: "Cardiac", dose: "20–40 mg OD–BD IV; titrate in failure", route: "IV / PO", brands: ["Lasix", "Frusenex", "Dytor (torsemide)"] },
  { name: "Digoxin", cls: "Cardiac", dose: "0.125–0.25 mg OD", route: "PO / IV", brands: ["Lanoxin", "Digoxin Wockhardt", "Cardioxin"] },
  { name: "Aspirin", cls: "Cardiac", dose: "150–325 mg loading, 75 mg OD maintenance", route: "PO", brands: ["Ecosprin", "Disprin", "Loprin"] },
  { name: "Clopidogrel", cls: "Cardiac", dose: "300–600 mg load, 75 mg OD", route: "PO", brands: ["Clopilet", "Deplatt", "Plavix"] },
  { name: "Atorvastatin", cls: "Cardiac", dose: "10–80 mg HS", route: "PO", brands: ["Atorva", "Storvas", "Lipvas"] },
  { name: "Nitroglycerine", cls: "Cardiac", dose: "5–200 mcg/min infusion; 0.5 mg SL", route: "IV / SL", brands: ["Nitrocontin", "Angispan-TR", "NTG Samarth"] },
  { name: "Amlodipine", cls: "Antihypertensives", dose: "5–10 mg OD", route: "PO", brands: ["Amlodac", "Amlokind", "Stamlo"] },
  { name: "Telmisartan", cls: "Antihypertensives", dose: "40–80 mg OD", route: "PO", brands: ["Telma", "Telsartan", "Telvas"] },
  { name: "Enalapril / Ramipril", cls: "Antihypertensives", dose: "Ramipril 2.5–10 mg OD", route: "PO", brands: ["Cardace", "Ramistar", "Envas (enalapril)"] },
  { name: "Metoprolol", cls: "Antihypertensives", dose: "25–100 mg BD (XL OD)", route: "PO / IV", brands: ["Metolar", "Betaloc", "Met XL"] },
  { name: "Labetalol", cls: "Antihypertensives", dose: "20 mg slow IV, repeat/double Q10min (max 300 mg)", route: "IV", brands: ["Lobet", "Labebet", "Normadate"] },

  // Diabetes
  { name: "Metformin", cls: "Diabetes", dose: "500 mg BD–1 g BD with meals", route: "PO", brands: ["Glycomet", "Gluconorm", "Obimet"] },
  { name: "Glimepiride", cls: "Diabetes", dose: "1–4 mg OD before breakfast", route: "PO", brands: ["Amaryl", "Glimestar", "Zoryl"] },
  { name: "Insulin regular (Human)", cls: "Diabetes", dose: "Sliding scale / 0.1 U/kg/h infusion in DKA", route: "SC / IV", brands: ["Actrapid", "Huminsulin R", "Insugen-R"] },
  { name: "Insulin glargine", cls: "Diabetes", dose: "0.2 U/kg OD HS, titrate", route: "SC", brands: ["Lantus", "Basalog", "Glaritus"] },

  // Respiratory
  { name: "Salbutamol", cls: "Respiratory", dose: "2.5 mg nebulised Q20min in acute attack", route: "Neb / MDI", brands: ["Asthalin", "Ventorlin", "Levolin (levo-)"] },
  { name: "Ipratropium", cls: "Respiratory", dose: "500 mcg nebulised Q6–8H", route: "Neb", brands: ["Ipravent", "Duolin (with salbutamol)"] },
  { name: "Budesonide", cls: "Respiratory", dose: "0.5–1 mg nebulised BD", route: "Neb / MDI", brands: ["Budecort", "Pulmicort", "Foracort (with formoterol)"] },
  { name: "Montelukast", cls: "Respiratory", dose: "10 mg HS; peds 4–5 mg", route: "PO", brands: ["Montair", "Montek", "Odimont"] },

  // Steroids / anticoagulants
  { name: "Hydrocortisone", cls: "Steroids", dose: "100 mg Q6–8H", route: "IV", brands: ["Efcorlin", "Solu-Cortef", "Wycort"] },
  { name: "Dexamethasone", cls: "Steroids", dose: "4–8 mg Q6–8H (0.15 mg/kg peds croup)", route: "IV / PO", brands: ["Decadron", "Dexona", "Wymesone"] },
  { name: "Methylprednisolone", cls: "Steroids", dose: "40–125 mg IV; pulse 1 g OD × 3", route: "IV", brands: ["Solu-Medrol", "Neomedrol", "Zempred"] },
  { name: "Prednisolone", cls: "Steroids", dose: "0.5–1 mg/kg OD morning", route: "PO", brands: ["Omnacortil", "Wysolone", "Predmet"] },
  { name: "Enoxaparin", cls: "Anticoagulants", dose: "40 mg OD prophylaxis; 1 mg/kg BD therapeutic", route: "SC", brands: ["Clexane", "Lomoh", "Cutenox"] },
  { name: "Heparin (UFH)", cls: "Anticoagulants", dose: "5000 U SC Q8–12H; 80 U/kg bolus + infusion", route: "IV / SC", brands: ["Heparin Gland Pharma", "Beparine", "Nuparin"] },
  { name: "Warfarin", cls: "Anticoagulants", dose: "2–5 mg OD, INR guided", route: "PO", brands: ["Warf", "Uniwarfin", "Sofarin"] },

  // Neuro / Psych
  { name: "Phenytoin", cls: "Neuro / Psych", dose: "15–20 mg/kg loading (max 50 mg/min), 100 mg Q8H", route: "IV / PO", brands: ["Eptoin", "Dilantin", "Fentoin"] },
  { name: "Levetiracetam", cls: "Neuro / Psych", dose: "20 mg/kg load; 500–1500 mg BD", route: "IV / PO", brands: ["Levipil", "Keppra", "Torleva"] },
  { name: "Lorazepam", cls: "Neuro / Psych", dose: "0.1 mg/kg IV (max 4 mg) in status", route: "IV / PO", brands: ["Ativan", "Lopez", "Larpose"] },
  { name: "Haloperidol", cls: "Neuro / Psych", dose: "2.5–5 mg IM in acute agitation", route: "IM / PO", brands: ["Serenace", "Haldol", "Trancodol"] },
  { name: "Mannitol 20%", cls: "Neuro / Psych", dose: "0.25–1 g/kg IV over 20 min", route: "IV", brands: ["Mannitol Claris", "Osmitrol", "Mannitol Baxter"] },

  // Fluids / electrolytes / others
  { name: "Ringer Lactate", cls: "Fluids / Electrolytes", dose: "Resuscitation 20–30 mL/kg bolus", route: "IV", brands: ["RL Baxter", "Ringerfundin", "RL Claris"] },
  { name: "Normal Saline 0.9%", cls: "Fluids / Electrolytes", dose: "Maintenance / bolus per deficit", route: "IV", brands: ["NS Baxter", "NS Claris", "NS Fresenius"] },
  { name: "Potassium chloride", cls: "Fluids / Electrolytes", dose: "Max 10 mEq/h peripheral, 40 mEq/L dilution", route: "IV / PO", brands: ["Potklor", "KCl Neon", "Potchlor"] },
  { name: "Calcium gluconate 10%", cls: "Fluids / Electrolytes", dose: "10 mL slow IV over 10 min", route: "IV", brands: ["Calcium Gluconate Neon", "Calgluc", "Biocal"] },
  { name: "Tranexamic acid", cls: "Others", dose: "1 g over 10 min, then 1 g over 8 h", route: "IV / PO", brands: ["Trapic", "Texakind", "Pause"] },
  { name: "Vitamin K (Phytonadione)", cls: "Others", dose: "10 mg slow IV in warfarin bleed; 1 mg IM newborn", route: "IV / IM", brands: ["Kapvit", "Vitamin K1 Samarth", "Vitakey"] },
  { name: "Adrenaline", cls: "Others", dose: "1 mg IV Q3–5min in arrest; 0.5 mg IM anaphylaxis", route: "IV / IM", brands: ["Adrenaline Samarth", "Epipen", "Adrenor"] },
  { name: "Atropine", cls: "Others", dose: "0.6–1 mg IV Q3–5min (max 3 mg)", route: "IV", brands: ["Atropine Neon", "Tropine", "Atrosulf"] },
  { name: "Hydroxyzine / Pheniramine", cls: "Others", dose: "Pheniramine 22.75 mg IM/IV", route: "IV / IM / PO", brands: ["Avil", "Atarax", "Pherigan"] },

  // Additional antibiotics
  { name: "Cefotaxime", cls: "Antibiotics", dose: "1–2 g Q8H; peds 100 mg/kg/day divided Q8H", route: "IV / IM", brands: ["Taxim", "Omnatax", "Claforan"] },
  { name: "Cloxacillin", cls: "Antibiotics", dose: "500 mg Q6H PO; 1–2 g Q6H IV", route: "PO / IV", brands: ["Bioclox", "Klox", "Cloxam"] },
  { name: "Linezolid", cls: "Antibiotics", dose: "600 mg Q12H", route: "PO / IV", brands: ["Linospan", "Lizolid", "Zyvox"] },
  { name: "Colistin", cls: "Antibiotics", dose: "9 MIU loading, then 4.5 MIU Q12H (renal adjusted)", route: "IV", brands: ["Xylistin", "Walcoli", "Colistimax"] },
  { name: "Ofloxacin + Ornidazole", cls: "Antibiotics", dose: "200/500 mg BD", route: "PO", brands: ["O2", "Zanocin-OZ", "Oflox-OZ"] },
  { name: "Nitrofurantoin", cls: "Antibiotics", dose: "100 mg BD × 5–7 days (uncomplicated UTI)", route: "PO", brands: ["Niftran", "Nitrofur", "Martifur"] },
  { name: "Cotrimoxazole", cls: "Antibiotics", dose: "800/160 mg BD; PCP 15–20 mg/kg/day of TMP", route: "PO / IV", brands: ["Septran", "Bactrim", "Ciplin"] },

  // Antivirals / antiparasitics
  { name: "Acyclovir", cls: "Antivirals / Antiparasitics", dose: "800 mg 5×/day PO (zoster); 10 mg/kg Q8H IV (encephalitis)", route: "PO / IV", brands: ["Acivir", "Zovirax", "Ocuvir"] },
  { name: "Oseltamivir", cls: "Antivirals / Antiparasitics", dose: "75 mg BD × 5 days; peds by weight bands", route: "PO", brands: ["Fluvir", "Tamiflu", "Antiflu"] },
  { name: "Albendazole", cls: "Antivirals / Antiparasitics", dose: "400 mg single dose (>2 y); 15 mg/kg/day in NCC", route: "PO", brands: ["Zentel", "Bandy", "Albezole"] },
  { name: "Ivermectin", cls: "Antivirals / Antiparasitics", dose: "200 mcg/kg single dose, repeat at 1–2 weeks in scabies", route: "PO", brands: ["Ivermectol", "Ivecop", "Scabovate"] },
  { name: "Artesunate", cls: "Antivirals / Antiparasitics", dose: "2.4 mg/kg IV at 0, 12, 24 h then daily (severe malaria)", route: "IV / IM", brands: ["Falcigo", "Larinate", "Artesunate Ipca"] },
  { name: "Chloroquine", cls: "Antivirals / Antiparasitics", dose: "600 mg base stat, 300 mg at 6, 24, 48 h (vivax)", route: "PO", brands: ["Lariago", "Nivaquine", "Emquin"] },
  { name: "Primaquine", cls: "Antivirals / Antiparasitics", dose: "0.25 mg/kg/day × 14 days (vivax); check G6PD", route: "PO", brands: ["Malirid", "PMQ Ipca", "Primaquine Remedica"] },

  // TB drugs
  { name: "Rifampicin", cls: "TB Drugs", dose: "10 mg/kg OD (450–600 mg) empty stomach", route: "PO", brands: ["R-Cin", "Rifadin", "Akurit (FDC)"] },
  { name: "Isoniazid", cls: "TB Drugs", dose: "5 mg/kg OD (max 300 mg) with pyridoxine", route: "PO", brands: ["Isokin", "Solonex", "Akurit (FDC)"] },
  { name: "Pyrazinamide", cls: "TB Drugs", dose: "25 mg/kg OD", route: "PO", brands: ["Pyzina", "P-Zide", "Akurit-4 (FDC)"] },
  { name: "Ethambutol", cls: "TB Drugs", dose: "15 mg/kg OD; watch colour vision", route: "PO", brands: ["Combutol", "Mycobutol", "Akurit-4 (FDC)"] },

  // Vasopressors / antidotes
  { name: "Noradrenaline", cls: "Vasopressors / Antidotes", dose: "0.05–0.5 mcg/kg/min infusion, titrate to MAP ≥65", route: "IV infusion", brands: ["Adrenor", "Noradrenaline Neon", "Norad Samarth"] },
  { name: "Dopamine", cls: "Vasopressors / Antidotes", dose: "5–20 mcg/kg/min infusion", route: "IV infusion", brands: ["Dopamine Neon", "Intropin", "Dopacard"] },
  { name: "Dobutamine", cls: "Vasopressors / Antidotes", dose: "2.5–20 mcg/kg/min infusion", route: "IV infusion", brands: ["Dobutrex", "Cardiject", "Dobustat"] },
  { name: "Naloxone", cls: "Vasopressors / Antidotes", dose: "0.4–2 mg IV, repeat Q2–3min (max 10 mg)", route: "IV / IM", brands: ["Nalox", "Narcotan", "Naloxone Samarth"] },
  { name: "Flumazenil", cls: "Vasopressors / Antidotes", dose: "0.2 mg IV over 15 s, repeat to max 1 mg", route: "IV", brands: ["Flumazen", "Zenil", "Anexate"] },
  { name: "Protamine sulphate", cls: "Vasopressors / Antidotes", dose: "1 mg per 100 U heparin given in last hour (max 50 mg)", route: "IV", brands: ["Protamine Sulphate Samarth", "Prosulf"] },
  { name: "N-acetylcysteine", cls: "Vasopressors / Antidotes", dose: "150 mg/kg over 1 h, 50 mg/kg over 4 h, 100 mg/kg over 16 h", route: "IV / PO", brands: ["Mucomix", "Fluimucil", "Acetadote"] },

  // Obstetrics
  { name: "Oxytocin", cls: "Obstetrics", dose: "10 U IM after delivery; 20 U in 500 mL infusion for PPH", route: "IV / IM", brands: ["Syntocinon", "Pitocin", "Oxytocin Neon"] },
  { name: "Misoprostol", cls: "Obstetrics", dose: "600 mcg PO/SL for PPH; 800 mcg PR alternative", route: "PO / SL / PV / PR", brands: ["Misoprost", "Cytotec", "Zitotec"] },
  { name: "Magnesium sulphate", cls: "Obstetrics", dose: "Pritchard: 4 g IV + 10 g IM, then 5 g IM Q4H", route: "IV / IM", brands: ["MgSO4 Neon", "Magneon", "Magsulf"] },
  { name: "Labetalol (obstetric)", cls: "Obstetrics", dose: "20 mg IV, double Q10min to max 300 mg in severe hypertension", route: "IV", brands: ["Lobet", "Labebet", "Normadate"] },
  { name: "Nifedipine", cls: "Obstetrics", dose: "10 mg PO, repeat Q20–30min (max 3 doses); 20 mg BD retard", route: "PO", brands: ["Depin", "Nicardia", "Calcigard"] },
  { name: "Tranexamic acid (obstetric)", cls: "Obstetrics", dose: "1 g IV within 3 h of PPH onset, repeat once after 30 min", route: "IV", brands: ["Trapic", "Texakind", "Pause"] },

  // Cardiac / diuretics additions
  { name: "Spironolactone", cls: "Cardiac", dose: "25–50 mg OD (100 mg+ in ascites); watch K+", route: "PO", brands: ["Aldactone", "Spirono", "Lasilactone (FDC)"] },
  { name: "Torsemide", cls: "Cardiac", dose: "10–20 mg OD, titrate", route: "PO / IV", brands: ["Dytor", "Tide", "Torsinex"] },
  { name: "Ivabradine", cls: "Cardiac", dose: "5 mg BD, up to 7.5 mg BD", route: "PO", brands: ["Ivabrad", "Inapure", "Bradia"] },
  { name: "Hydralazine", cls: "Antihypertensives", dose: "5–10 mg slow IV Q20–30min (max 20 mg)", route: "IV / PO", brands: ["Hydralazine Neon", "Nepresol", "Apresoline"] },

  // Others / supportive
  { name: "ORS (WHO low osmolarity)", cls: "Fluids / Electrolytes", dose: "75 mL/kg over 4 h in some dehydration; 10 mL/kg per loose stool", route: "PO", brands: ["ORS Electral", "Walyte", "Prolyte"] },
  { name: "Zinc sulphate", cls: "Fluids / Electrolytes", dose: "20 mg OD × 14 days (10 mg if <6 months)", route: "PO", brands: ["Zinconia", "Zincovit-Z", "Z&D"] },
  { name: "Sodium bicarbonate 7.5%", cls: "Fluids / Electrolytes", dose: "1 mEq/kg slow IV in severe acidosis / hyperkalaemia", route: "IV", brands: ["Soda Bicarb Neon", "Sodabic", "NaHCO3 Claris"] },
  { name: "Iron + folic acid", cls: "Others", dose: "Elemental iron 100 mg + folic acid 500 mcg OD", route: "PO", brands: ["Autrin", "Fefol", "Livogen"] },
  { name: "Vitamin B12 (Cyanocobalamin)", cls: "Others", dose: "1000 mcg IM alternate days × 5, then monthly", route: "IM / PO", brands: ["Neurobion Forte", "Optineuron", "Methycobal"] },
  { name: "Thiamine", cls: "Others", dose: "100 mg IV OD; 500 mg TDS in Wernicke's", route: "IV / PO", brands: ["Benalgis", "Thiamine Neon", "Beplex Forte"] },
  { name: "Salbutamol syrup", cls: "Respiratory", dose: "Peds 0.1 mg/kg/dose TDS (2 mg TDS at 2–6 y)", route: "PO", brands: ["Asthalin syrup", "Ventorlin syrup", "Salbetol"] },
];
