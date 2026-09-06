import Link from "next/link";
import {
  UNDERHALLSPLAN_AVTAL_FRAN_PRIS_KR,
  UNDERHALLSPLAN_AVTAL_RABATT_PROCENT,
  UNDERHALLSPLAN_ORDINARIE_FRAN_PRIS_KR,
} from "@/lib/underhallsplan-kampanj";
import {
  formatKr,
  PLATTFORM_FRAN_ARSPRIS_KR,
} from "@/lib/prislista";

type Props = {
  /** Publikt Styrelse-Navet eller inloggad föreningssida */
  lage: "public" | "forening";
  /** Utan fullbreddssektion — för modulsidor */
  kompakt?: boolean;
};

/**
 * Reklam för underhållsplanen som tilläggstjänst.
 * Plattformsabonnemanget (från 6 000 kr/år) är separat.
 */
export function UnderhallsplanReklam({ lage, kompakt = false }: Props) {
  const ctaHref =
    lage === "forening" ? "/forening/underhallsplan" : "/offert";
  const ctaText =
    lage === "forening" ? "Öppna underhållsplanen" : "Begär offert";

  const innehall = (
    <>
      <div className="max-w-3xl">
        <p className="text-sm font-semibold text-primary-dark">
          Underhållsplan · tilläggstjänst
        </p>
        <h2
          className={
            kompakt
              ? "mt-2 text-xl font-bold text-foreground sm:text-2xl"
              : "mt-2 text-2xl font-bold text-foreground sm:text-3xl"
          }
        >
          Vi tar fram underhållsplanen — styrelsen lämnar underlaget
        </h2>
        <p className="mt-3 text-muted">
          Professionell framtagning utifrån underlag från styrelsen. Därefter blir
          planen ett levande dokument där styrelse eller förvaltare lägger till
          och tar bort komponenter. Ordinarie pris{" "}
          <strong className="text-foreground">
            {formatKr(UNDERHALLSPLAN_ORDINARIE_FRAN_PRIS_KR)}
          </strong>{" "}
          exkl. moms. För er som även tecknar avtal på plattformen:{" "}
          {UNDERHALLSPLAN_AVTAL_RABATT_PROCENT}&nbsp;% rabatt →{" "}
          <strong className="text-foreground">
            {formatKr(UNDERHALLSPLAN_AVTAL_FRAN_PRIS_KR)}
          </strong>{" "}
          exkl. moms. Underhållsplanen kan också köpas senare.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-primary/25 bg-white/90 px-4 py-4">
        <p className="text-sm font-semibold text-foreground">
          Exempel: plattformsavtal + underhållsplan
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Plattform från{" "}
          <strong className="text-foreground">
            {formatKr(PLATTFORM_FRAN_ARSPRIS_KR)}
          </strong>
          /år + underhållsplan från{" "}
          <strong className="text-foreground">
            {formatKr(UNDERHALLSPLAN_AVTAL_FRAN_PRIS_KR)}
          </strong>{" "}
          exkl. moms. För exakt pris — begär offert. (Utan plattformsavtal är
          underhållsplanen{" "}
          {formatKr(UNDERHALLSPLAN_ORDINARIE_FRAN_PRIS_KR)}.)
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Vad styrelsen behöver lämna
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li className="flex gap-2">
              <span className="text-primary" aria-hidden>
                •
              </span>
              <span>
                <strong className="text-foreground">Grunduppgifter</strong> om
                fastigheten — bland annat lägenheter, ytor, adresser och tekniska
                system.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary" aria-hidden>
                •
              </span>
              <span>
                <strong className="text-foreground">
                  Senaste utförda renoveringar
                </strong>{" "}
                och underhållsåtgärder — så planen utgår från verkligt skick och
                historik.
              </span>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Offert och när ni kan köpa
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Priset är alltid <strong className="text-foreground">från</strong>{" "}
            och beror på fastighetens omfattning. Ni får en tydlig offert —
            tecknas samtidigt med plattformen eller senare när ni är redo. Detta
            är inte samma sak som månads-/årspriset för plattformen.
          </p>
          {!kompakt && (
            <Link
              href={ctaHref}
              className="brf-knapp-gron mt-6 inline-flex px-5 py-2.5 text-sm"
            >
              {ctaText}
            </Link>
          )}
        </div>
      </div>
    </>
  );

  if (kompakt) {
    return (
      <div
        id="underhallsplan-erbjudande"
        className="scroll-mt-24 rounded-2xl border border-primary/30 bg-[#eef6f0] p-5 sm:p-6"
      >
        {innehall}
      </div>
    );
  }

  return (
    <section
      id="underhallsplan-erbjudande"
      className="scroll-mt-24 border-y border-border bg-[#eef6f0]/70"
    >
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        {innehall}
      </div>
    </section>
  );
}
