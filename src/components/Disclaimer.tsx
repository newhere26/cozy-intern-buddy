import { cn } from "@/lib/utils";

/** Shown wherever WithYou gives scores, doses, drug information or wellbeing exercises. */
export function Disclaimer({ variant = "full", className }: { variant?: "full" | "short"; className?: string }) {
  return (
    <aside
      role="note"
      className={cn(
        "rounded-2xl border border-border/50 bg-card/50 p-3.5 text-[11px] leading-relaxed text-muted-foreground",
        className,
      )}
    >
      {variant === "full" ? (
        <>
          <strong className="text-foreground">For guidance only. Not medical advice.</strong> WithYou is a personal
          wellbeing and study companion for interns. Calculators, scores, drug information and breathing exercises are
          quick references and do not replace your clinical judgement, hospital protocols, current guidelines, the
          product label, or the advice of your supervising doctor or pharmacist. Always verify doses and decisions
          against an authoritative source before acting. WithYou and its makers accept no responsibility for decisions
          made using this information. If you feel unwell or are struggling, please speak to a qualified professional.
        </>
      ) : (
        <>
          <strong className="text-foreground">For guidance only. Not medical advice.</strong> These exercises are for
          relaxation and do not replace care from a qualified professional. If you feel unwell or are struggling,
          please speak to one.
        </>
      )}
    </aside>
  );
}
