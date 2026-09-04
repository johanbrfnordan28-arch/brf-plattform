"use client";

import {
  delaUppInklMoms,
  parseKrBelopp,
  STANDARD_MOMS_SATS,
} from "@/components/underhallsplan/moms";
import { formatKr } from "@/components/underhallsplan/besiktningar";

type MomsAvdragKnappProps = {
  /** Nuvarande kostnad (tolkas som inkl. moms när knappen trycks). */
  kostnadKr: string | number | undefined;
  momsAvdragenKr?: string | number | undefined;
  kostnadInklMomsKr?: string | number | undefined;
  onApply: (result: {
    kostnadExklMoms: number;
    momsAvdragen: number;
    kostnadInklMoms: number;
  }) => void;
  onAterstall?: () => void;
  /** Kort hjälptext under knappen. */
  kompakt?: boolean;
};

/**
 * Tar bort 25 % moms från ett inkl-moms-belopp och sparar momsen för särredovisning.
 * Används när föreningen är momsregistrerad men inte kan dra av all moms automatiskt —
 * styrelsen markerar aktuella poster manuellt.
 */
export function MomsAvdragKnapp({
  kostnadKr,
  momsAvdragenKr,
  kostnadInklMomsKr,
  onApply,
  onAterstall,
  kompakt = false,
}: MomsAvdragKnappProps) {
  const nuvarande = parseKrBelopp(kostnadKr);
  const redanAvdragen = parseKrBelopp(momsAvdragenKr);
  const inklSparad = parseKrBelopp(kostnadInklMomsKr);

  function taBortMoms() {
    const inkl = redanAvdragen > 0 && inklSparad > 0 ? inklSparad : nuvarande;
    if (inkl <= 0) return;
    const { exklMoms, moms, inklMoms } = delaUppInklMoms(inkl, STANDARD_MOMS_SATS);
    onApply({
      kostnadExklMoms: exklMoms,
      momsAvdragen: moms,
      kostnadInklMoms: inklMoms,
    });
  }

  if (nuvarande <= 0 && redanAvdragen <= 0) return null;

  return (
    <div className={kompakt ? "mt-2" : "mt-3"}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={taBortMoms}
          className="rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
        >
          {redanAvdragen > 0 ? "Räkna om momsavdrag" : "Ta bort moms (25 %)"}
        </button>
        {redanAvdragen > 0 && onAterstall && (
          <button
            type="button"
            onClick={onAterstall}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground"
          >
            Återställ inkl. moms
          </button>
        )}
      </div>
      {redanAvdragen > 0 ? (
        <p className="mt-1.5 text-[11px] leading-relaxed text-primary-dark">
          Moms borttagen och särredovisad: {formatKr(redanAvdragen)}
          {inklSparad > 0 ? ` (från ${formatKr(inklSparad)} inkl. moms)` : ""}.
          Plan/budget använder belopp exkl. moms.
        </p>
      ) : (
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
          Om beloppet är inkl. moms: knappen räknar om till exkl. moms och
          särredovisar momsen (momsregistrerad förening — manuellt avdrag per post).
        </p>
      )}
    </div>
  );
}
