import Link from "next/link";
import {
  formatKampanjDatum,
  UNDERHALLSPLAN_FRAN_PRIS_KR,
  UNDERHALLSPLAN_KAMPANJ_GALLER_TOM,
  UNDERHALLSPLAN_KAMPANJ_RABATT_PROCENT,
  underhallsplanKampanjArAktiv,
  underhallsplanKampanjPrisFran,
} from "@/lib/underhallsplan-kampanj";
import { formatKr } from "@/lib/prislista";

type Props = {
  /** Publikt Styrelse-Navet eller inloggad föreningssida */
  lage: "public" | "forening";
  /** Utan fullbreddssektion — för modulsidor */
  kompakt?: boolean;
};

/**
 * Reklam för underhållsplanen — vad styrelsen behöver lämna in,
 * att priset beror på fastigheten, och kampanj för avtalskunder.
 */
export function UnderhallsplanReklam({ lage, kompakt = false }: Props) {
  const kampanjAktiv = underhallsplanKampanjArAktiv();
  const kampanjPris = underhallsplanKampanjPrisFran();
  const gallerTom = formatKampanjDatum(UNDERHALLSPLAN_KAMPANJ_GALLER_TOM);
  const ctaHref =
    lage === "forening" ? "/forening/underhallsplan" : "/prova-gratis";
  const ctaText =
    lage === "forening"
      ? "Öppna underhållsplanen"
      : "Skapa förening och börja";

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
          och tar bort komponenter — överskådligt för nästa styrelse. För
          föreningar med tecknat avtal. Ordinarie pris från{" "}
          <strong className="text-foreground">
            {formatKr(UNDERHALLSPLAN_FRAN_PRIS_KR)}
          </strong>{" "}
          exkl. moms. Kostnaden beror på fastighetens storlek — antal
          lägenheter, ytor och omfattning.
        </p>
      </div>

      {kampanjAktiv && (
        <div className="mt-6 inline-flex flex-col gap-1 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4">
          <p className="text-lg font-bold text-amber-950">
            {UNDERHALLSPLAN_KAMPANJ_RABATT_PROCENT}&nbsp;% rabatt
          </p>
          <p className="text-sm text-amber-900">
            Kampanjpris från <strong>{formatKr(kampanjPris)}</strong> exkl. moms
            — gäller t.o.m. <strong>{gallerTom}</strong>
          </p>
        </div>
      )}

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
            Vad som påverkar kostnaden
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Priset räknas utifrån fastighetens omfattning: antal lägenheter,
            boarea och övriga ytor, antal byggnader och hur mycket dokumentation
            som finns. Ni får en tydlig offert när underlaget är komplett.
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
