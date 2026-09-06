/**
 * Publik pris-/avtalsinfo utan att visa belopp per nivå.
 * Konkreta kronor visas först inne på föreningssidan när lägenheter är ifyllda.
 */
import { ARSAVTAL_RABATT_PROCENT, avtalsVillkorKort } from "@/lib/prislista";

type Props = {
  /** Visa rubrik «Ettårsavtal» m.m. */
  visaRubrik?: boolean;
};

export function PublikPrisInfo({ visaRubrik = true }: Props) {
  return (
    <div>
      {visaRubrik && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Ettårsavtal
          </p>
          <h3 className="mt-2 text-xl font-bold text-foreground">
            Spara {ARSAVTAL_RABATT_PROCENT}&nbsp;%
          </h3>
          <p className="mt-1 text-sm text-primary-dark">
            mot månadsdebitering
          </p>
        </>
      )}
      <ul className="mt-4 space-y-2 text-sm text-muted">
        {avtalsVillkorKort().map((rad) => (
          <li key={rad}>{rad}</li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted">
        Priset beror på antal lägenheter. Er exakta kostnad visas först när
        styrelsen fyllt i antalet i underhållsplanen.
      </p>
    </div>
  );
}
