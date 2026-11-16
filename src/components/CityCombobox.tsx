import { useEffect, useRef, useState } from "react";
import { citiesFor, isValidCity, searchCities } from "@/lib/cities";
import { sanitizeLetters } from "@/lib/validate";
import { cn } from "@/lib/utils";

/**
 * Type-to-search city picker. For countries with a list the value must be one
 * of that country's cities; for "Other" it is free text (letters only).
 */
export function CityCombobox({
  country,
  value,
  onChange,
}: {
  country: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const restricted = citiesFor(country) !== null;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const results = restricted ? searchCities(country, value) : [];

  useEffect(() => setActive(0), [value, country]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const choose = (city: string) => {
    onChange(city);
    setOpen(false);
  };

  const invalid = value.length > 0 && !isValidCity(country, value);

  return (
    <div ref={boxRef} className="relative">
      <input
        value={value}
        role={restricted ? "combobox" : undefined}
        aria-expanded={restricted ? open : undefined}
        aria-autocomplete={restricted ? "list" : undefined}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          onChange(restricted ? e.target.value.replace(/[^\p{L}\s'.()-]/gu, "") : sanitizeLetters(e.target.value));
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (!restricted) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((a) => Math.min(results.length - 1, a + 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(0, a - 1));
          } else if (e.key === "Enter" && open && results[active]) {
            e.preventDefault();
            choose(results[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder={restricted ? `Start typing a city in ${country}` : "Type your city"}
        className="mt-1 w-full rounded-full border border-border bg-card px-4 py-3 text-base"
      />
      {restricted && open && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-2xl border border-border bg-popover py-1 shadow-lg"
        >
          {results.length === 0 ? (
            <li className="px-4 py-2 text-xs text-muted-foreground">
              No match in {country}. Check the spelling, or pick another country.
            </li>
          ) : (
            results.map((c, i) => (
              <li
                key={c}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(c);
                }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "cursor-pointer px-4 py-2 text-sm text-foreground",
                  i === active && "bg-primary/15",
                )}
              >
                {c}
              </li>
            ))
          )}
        </ul>
      )}
      {invalid && (
        <p className="mt-1 text-[11px] text-destructive">
          {restricted ? `Please pick a city from the list for ${country}.` : "Only letters allowed."}
        </p>
      )}
    </div>
  );
}
