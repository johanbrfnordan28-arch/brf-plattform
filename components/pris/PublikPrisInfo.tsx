/**
 * Publik pris-/avtalsinfo för plattformen.
 * Underhållsplan (tillägg) hanteras separat i UnderhallsplanReklam.
 */
import {
  ARSAVTAL_RABATT_PROCENT,
  avtalsVillkorKort,
  formatKr,
  PLATTFORM_FRAN_ARSPRIS_KR,
} from "@/lib/prislista";

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
            Plattform · ettårsavtal
          </p>
          <h3 className="mt-2 text-xl font-bold text-foreground">
            Från {formatKr(PLATTFORM_FRAN_ARSPRIS_KR)}
            <span className="text-base font-semibold text-muted">
              {" "}
              / år exkl. moms
            </span>
          </h3>
          <p className="mt-1 text-sm text-primary-dark">
            {ARSAVTAL_RABATT_PROCENT}&nbsp;% rabatt mot månadsdebitering
          </p>
        </>
      )}
      <ul className="mt-4 space-y-2 text-sm text-muted">
        {avtalsVillkorKort().map((rad) => (
          <li key={rad}>{rad}</li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted">
        Priset beror på antal lägenheter. Exakt kostnad får ni i offert — eller
        ser ni inne på föreningssidan när antalet lägenheter är ifyllt.
        Professionell underhållsplan är en tilläggstjänst och kan tecknas
        samtidigt eller senare.
      </p>
    </div>
  );
}
