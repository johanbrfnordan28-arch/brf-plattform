import Link from "next/link";
import { ABK_09_KORT } from "@/lib/abk-09";
import { OFFERT_EPOST, offertMailto } from "@/lib/offert-mejl";

const TJANSTER = [
  {
    titel: "Teknisk förvaltning",
    text: "Löpande driftstöd, uppföljning och hjälp med tekniska beslut, anpassat efter er fastighet.",
  },
  {
    titel: "Projektledning",
    text: "Vi styr projektet från planering till genomförande, så att styrelsen har kontroll utan att behöva sköta detaljerna.",
  },
  {
    titel: "Skadeutredning",
    text: "Analys, dokumentation och förslag på åtgärder när en skada har uppstått, med underlag för försäkringsbolaget och styrelsens beslut.",
  },
  {
    titel: "Besiktning",
    text: "Genomgång av fastighetens skick inför underhåll, entreprenad eller överlåtelse, med tydlig dokumentation.",
  },
  {
    titel: "Upphandling",
    text: "Förfrågningsunderlag, anbudshantering och avtal för allt från mindre jobb till stora entreprenader.",
  },
] as const;

/**
 * Erbjudande om teknisk förvaltning och övriga tjänster på startsidan.
 */
export function TekniskForvaltningErbjudande() {
  return (
    <section
      id="teknisk-forvaltning"
      className="scroll-mt-24 border-b border-border bg-gradient-to-b from-[#e8f3ec] to-[#f7fbf8]"
    >
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-primary-dark">
            Konsulttjänster
          </p>
          <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Teknisk förvaltning och annan hjälp för föreningen
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            Utöver plattformen erbjuder vi teknisk förvaltning till ett bra
            pris. Vi hjälper också till med projektledning, skadeutredning,
            besiktning och upphandling.
          </p>
        </div>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TJANSTER.map((tjanst) => (
            <li key={tjanst.titel} className="border-l-2 border-primary/50 pl-4">
              <h3 className="font-semibold text-foreground">{tjanst.titel}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {tjanst.text}
              </p>
            </li>
          ))}
          <li className="border-l-2 border-primary/50 pl-4 sm:col-span-2 lg:col-span-1">
            <h3 className="font-semibold text-foreground">Pris &amp; upplägg</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Priset anpassas efter fastigheten och hur mycket stöd ni behöver.
              Ni väljer fast pris enligt offert eller löpande räkning, och vet
              alltid vad det kostar innan ni bestämmer er.
            </p>
          </li>
        </ul>

        <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-primary/25 bg-white/90 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-8">
          <div className="max-w-xl">
            <h3 className="text-lg font-semibold text-foreground sm:text-xl">
              Behöver ni hjälp utöver plattformen?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Begär en offert med fast pris eller fråga om löpande teknisk
              förvaltning. Vi anpassar uppdraget efter er förening.{" "}
              {ABK_09_KORT}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/offert"
              className="brf-knapp-gron px-6 py-3 text-sm sm:text-base"
            >
              Begär offert
            </Link>
            <a
              href={offertMailto(
                "Styrelse-Navet — offertförfrågan",
                "Hej!\n\nFörening:\nAntal lägenheter:\nVi vill ha offert på:\n\n",
              )}
              className="rounded-lg border border-primary bg-white px-6 py-3 text-sm font-semibold text-primary-dark transition-colors hover:bg-[#eef6f0] sm:text-base"
            >
              Mejla {OFFERT_EPOST}
            </a>
            <Link
              href="#skapa-forening"
              className="rounded-lg border border-border bg-white px-6 py-3 text-sm font-semibold text-muted transition-colors hover:border-primary/50 hover:text-primary-dark sm:text-base"
            >
              Prova plattformen
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
