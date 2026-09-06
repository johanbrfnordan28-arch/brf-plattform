/**
 * Upplysning: planen bör tas fram professionellt, sedan bli ett levande
 * arbetsdokument för styrelse och förvaltare — överskådligt för nästa styrelse.
 */
export function UnderhallsplanProffsUpplysning() {
  return (
    <aside
      className="scroll-mt-24 rounded-2xl border border-primary/30 bg-gradient-to-b from-[#eef6f0] to-white p-5 sm:p-6"
      aria-labelledby="underhallsplan-proffs-rubrik"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-dark">
        Viktigt för föreningen
      </p>
      <h2
        id="underhallsplan-proffs-rubrik"
        className="mt-2 text-lg font-bold text-foreground sm:text-xl"
      >
        Låt en professionell part ta fram planen — sedan blir den levande
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
        <p>
          Det är viktigt att underhållsplanen{" "}
          <strong className="font-medium text-foreground">
            tas fram av en professionell part
          </strong>{" "}
          med erfarenhet av fastigheter och bostadsrättsföreningar. Då bygger
          ni på rätt omfattning, rimliga intervall och kostnader som håller för
          beslut och årsbudget.
        </p>
        <p>
          När grunden är lagd blir planen ett{" "}
          <strong className="font-medium text-foreground">
            levande dokument
          </strong>
          . Styrelsen eller förvaltaren arbetar vidare i den: lägger till och
          tar bort komponenter och delar, justerar år och tillfällen, och håller
          registret aktuellt för just er fastighet.
        </p>
        <p>
          Styrelser byts ut med jämna mellanrum. Därför ska den färdiga planen
          vara{" "}
          <strong className="font-medium text-foreground">
            överskådlig och enkel att jobba i
          </strong>{" "}
          — så nästa styrelse snabbt förstår vad som gäller, vad som är gjort och
          vad som kommer.
        </p>
      </div>
      <ul className="mt-4 grid gap-2 text-sm text-foreground sm:grid-cols-3">
        <li className="rounded-lg border border-border bg-white/90 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
            1. Professionell grund
          </p>
          <p className="mt-1 text-xs text-muted">
            Rätt komponenter, intervall och kostnadsläge från start.
          </p>
        </li>
        <li className="rounded-lg border border-border bg-white/90 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
            2. Levande arbete
          </p>
          <p className="mt-1 text-xs text-muted">
            Lägg till och ta bort delar när fastigheten förändras.
          </p>
        </li>
        <li className="rounded-lg border border-border bg-white/90 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
            3. Nästa styrelse
          </p>
          <p className="mt-1 text-xs text-muted">
            Tydlig slutprodukt som följer med mandatperioden.
          </p>
        </li>
      </ul>
    </aside>
  );
}
