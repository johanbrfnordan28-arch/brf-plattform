import Link from "next/link";

const TJANSTER = [
  {
    titel: "Teknisk förvaltning",
    text: "Löpande driftstöd, uppföljning och tekniska beslut — till fördelaktigt pris anpassat efter er fastighet.",
  },
  {
    titel: "Projektledning",
    text: "Styrning från planering till genomförande, så styrelsen behåller kontroll utan att drunkna i detaljer.",
  },
  {
    titel: "Skadeutredning",
    text: "Analys, dokumentation och rätt åtgärder när skadan är framme — underlag som håller inför försäkring och beslut.",
  },
  {
    titel: "Besiktning",
    text: "Status och underlag inför underhåll, entreprenad eller överlåtelse — tydligt och spårbart.",
  },
  {
    titel: "Upphandling",
    text: "Förfrågningsunderlag, anbudshantering och avtal — från mindre jobb till större entreprenader.",
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
            Tjänster · fördelaktiga villkor
          </p>
          <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Teknisk förvaltning — och allt annat föreningen kan behöva
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            Vi erbjuder teknisk förvaltning till fördelaktigt pris. Kostnaden
            beror på fastigheten och omfattningen. Ni kan också ta hjälp med
            projektledning, skadeutredning, besiktning och upphandling — fasta
            priser på offert eller löpande debitering.
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
              Anpassat efter er fastighet och hur mycket stöd ni behöver.
              Välj fast pris via offert eller löpande debitering — alltid
              transparent innan ni går vidare.
            </p>
          </li>
        </ul>

        <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-primary/25 bg-white/90 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-8">
          <div className="max-w-xl">
            <h3 className="text-lg font-semibold text-foreground sm:text-xl">
              Behöver ni hjälp utöver plattformen?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Begär en offert med fast pris, eller fråga om löpande teknisk
              förvaltning. Vi anpassar omfattningen efter er förening.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/offert"
              className="brf-knapp-gron px-6 py-3 text-sm sm:text-base"
            >
              Begär offert
            </Link>
            <Link
              href="#skapa-forening"
              className="rounded-lg border border-primary bg-white px-6 py-3 text-sm font-semibold text-primary-dark transition-colors hover:bg-[#eef6f0] sm:text-base"
            >
              Prova plattformen
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
