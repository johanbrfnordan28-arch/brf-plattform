import Link from "next/link";

type Props = {
  /** Publikt Styrelse-Navet eller inloggad föreningssida */
  lage: "public" | "forening";
  /** Utan fullbreddssektion — för modulsidor */
  kompakt?: boolean;
};

/**
 * Information om underhållsplanen — vad styrelsen behöver lämna in.
 * Pris och offert hanteras separat (t.ex. via offertformuläret).
 */
export function UnderhallsplanReklam({ lage, kompakt = false }: Props) {
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
          Underhållsplan · tjänst
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
          föreningar med tecknat avtal. Omfattningen beror på fastighetens storlek
          — antal lägenheter, ytor och dokumentation.
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
            Så går det till
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            När underlaget är komplett tar vi fram planen utifrån fastighetens
            omfattning: antal lägenheter, ytor, byggnader och befintlig
            dokumentation.             Vill ni ha hjälp med hela upplägget —{" "}
            <Link
              href="/offert"
              className="font-medium text-primary-dark underline hover:no-underline"
            >
              begär prisuppgift via offertformuläret
            </Link>
            . Vi publicerar inga listpriser; varje fastighet bedöms separat.
          </p>
          <div className={`mt-6 flex flex-wrap gap-3 ${kompakt ? "mt-4" : ""}`}>
            <Link
              href={ctaHref}
              className="brf-knapp-gron inline-flex px-5 py-2.5 text-sm"
            >
              {ctaText}
            </Link>
            <Link
              href="/offert"
              className="brf-knapp-neutral inline-flex px-5 py-2.5 text-sm"
            >
              Begär prisuppgift
            </Link>
          </div>
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
