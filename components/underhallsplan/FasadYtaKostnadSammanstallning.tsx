"use client";

import {
  fasadAtgardEtikett,
  normaliseraFasadAtgardData,
  type FasadAtgardData,
} from "@/components/underhallsplan/fasad-atgard";
import {
  beraknaFasadKostnadPerAr,
  beraknaTillfalleSummaKr,
  summeraFasadTillfallenEngangsKr,
} from "@/components/underhallsplan/fasad-atgard-plan";
import type { FasadAtgardPrisRegister } from "@/components/underhallsplan/fasad-atgard-pris";
import {
  normaliseraFastighetsYtor,
  summeraFasadKvm,
  summeraFasadPerHus,
  summeraFasadPerVaderstreck,
} from "@/components/underhallsplan/fastighets-ytor";
import { normaliseraGrund } from "@/components/underhallsplan/grund-synk";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

type FasadYtaKostnadSammanstallningProps = {
  grund: Grunduppgifter;
  registerFasadKvm: string;
  fasadAtgard: FasadAtgardData;
  priser: FasadAtgardPrisRegister;
  planStartAr: number;
  planLangdAr: number;
  onApplyGrundSummaTillRegister?: (kvm: string) => void;
};

function parseKvm(text: string): number {
  const n = Number.parseFloat(text.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function FasadYtaKostnadSammanstallning({
  grund,
  registerFasadKvm,
  fasadAtgard,
  priser,
  planStartAr,
  planLangdAr,
  onApplyGrundSummaTillRegister,
}: FasadYtaKostnadSammanstallningProps) {
  const grundNorm = normaliseraGrund(grund);
  const ytor = grundNorm.fastighetsYtor;
  const grundKvm = summeraFasadKvm(ytor);
  const registerKvm = parseKvm(registerFasadKvm);
  const perHus = summeraFasadPerHus(ytor);
  const perVaderstreck = summeraFasadPerVaderstreck(ytor);
  const tillfallen = normaliseraFasadAtgardData(fasadAtgard).tillfallen;
  const engangsKr = summeraFasadTillfallenEngangsKr(fasadAtgard, priser);
  const perAr = beraknaFasadKostnadPerAr(
    fasadAtgard,
    priser,
    planStartAr,
    planLangdAr,
  );
  const planTotalKr = perAr.reduce((s, r) => s + r.summaKr, 0);
  const harGrundDetalj =
    !ytor.endastTotalFasad && ytor.hus.length > 0 && grundKvm > 0;
  const harGrundTotal =
    ytor.endastTotalFasad && parseKvm(ytor.totalFasadKvm) > 0;

  if (grundKvm <= 0 && registerKvm <= 0 && tillfallen.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[#d4e8da] bg-[#eef6f0]/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
        Sammanställning — yta och kostnad
      </p>
      <p className="mt-1 text-[10px] text-muted">
        Ytor från grunduppgifter (steg 1). Kostnader från planerade tillfällen
        nedan.
      </p>

      {(harGrundDetalj || harGrundTotal || grundKvm > 0) && (
        <div className="mt-3">
          <p className="text-xs font-medium text-foreground">Ytor (grund)</p>
          {harGrundDetalj && (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-muted">
                    <th className="py-1 pr-2">Hus</th>
                    <th className="py-1 pr-2 text-right">m²</th>
                  </tr>
                </thead>
                <tbody>
                  {perHus
                    .filter((r) => r.kvm > 0)
                    .map((r) => (
                      <tr key={r.husId} className="border-b border-border/50">
                        <td className="py-1 pr-2">{r.husnummer}</td>
                        <td className="py-1 pr-2 text-right tabular-nums">
                          {r.kvm.toLocaleString("sv-SE")}
                        </td>
                      </tr>
                    ))}
                </tbody>
                {perVaderstreck.length > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan={2} className="pt-2 text-muted">
                        Per vädersträck:{" "}
                        {perVaderstreck
                          .map(
                            (v) =>
                              `${v.etikett} ${v.kvm.toLocaleString("sv-SE")}`,
                          )
                          .join(" · ")}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
          <p className="mt-2 text-sm font-semibold text-primary-dark">
            Summa fasad (grund): {grundKvm.toLocaleString("sv-SE")} m²
            {registerKvm > 0 && registerKvm !== grundKvm && (
              <span className="ml-2 font-normal text-muted">
                · Register: {registerKvm.toLocaleString("sv-SE")} m²
              </span>
            )}
          </p>
          {grundKvm > 0 &&
            onApplyGrundSummaTillRegister &&
            registerKvm !== grundKvm && (
              <button
                type="button"
                onClick={() =>
                  onApplyGrundSummaTillRegister(String(Math.round(grundKvm)))
                }
                className="mt-2 rounded-lg border border-primary px-3 py-1 text-xs font-medium text-primary-dark hover:bg-[#e2f0e6]"
              >
                För över grundsumma till total fasadyta
              </button>
            )}
        </div>
      )}

      {tillfallen.length > 0 && (
        <div className="mt-4 border-t border-[#d4e8da] pt-3">
          <p className="text-xs font-medium text-foreground">
            Kostnad per tillfälle
          </p>
          <ul className="mt-2 space-y-1 text-xs">
            {tillfallen.map((t) => {
              const kr = beraknaTillfalleSummaKr(t, priser);
              return (
                <li key={t.id} className="flex justify-between gap-2">
                  <span>
                    {t.titel || "Tillfälle"} —{" "}
                    {t.atgarder.map((id) => fasadAtgardEtikett(id)).join(", ")}
                  </span>
                  <span className="shrink-0 tabular-nums font-medium">
                    {kr > 0
                      ? `${kr.toLocaleString("sv-SE")} kr`
                      : "—"}
                  </span>
                </li>
              );
            })}
          </ul>
          {engangsKr > 0 && (
            <p className="mt-2 text-sm font-semibold text-foreground">
              Summa per tillfälle: {engangsKr.toLocaleString("sv-SE")} kr
              {grundKvm > 0 && (
                <span className="ml-2 font-normal text-muted">
                  (ca{" "}
                  {Math.round(engangsKr / grundKvm).toLocaleString("sv-SE")}{" "}
                  kr/m²)
                </span>
              )}
            </p>
          )}
          {planTotalKr > 0 && (
            <p className="mt-1 text-xs text-muted">
              Utspritt i planperioden ({planStartAr}–
              {planStartAr + planLangdAr - 1}): ca{" "}
              {planTotalKr.toLocaleString("sv-SE")} kr totalt
            </p>
          )}
        </div>
      )}
    </div>
  );
}
