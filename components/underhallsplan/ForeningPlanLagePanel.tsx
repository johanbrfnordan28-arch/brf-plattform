"use client";

export type ForeningPlanLage = "forening" | "grundmall";

type ForeningPlanLagePanelProps = {
  lage: ForeningPlanLage;
  onVisaForeningsplan: () => void;
  onVisaGrundmall: () => void;
  onGotoSlutsida: () => void;
};

/**
 * Två lägen för styrelsen: egen underhållsplan (redigerbar) och
 * central grundmall (skrivskyddad förhandsvisning).
 */
export function ForeningPlanLagePanel({
  lage,
  onVisaForeningsplan,
  onVisaGrundmall,
  onGotoSlutsida,
}: ForeningPlanLagePanelProps) {
  const visarGrundmall = lage === "grundmall";

  return (
    <div className="rounded-2xl border border-dashed border-primary/50 bg-[#eef6f0] p-5 sm:p-6">
      <p className="text-sm font-semibold text-primary-dark">
        Föreningens underhållsplan
      </p>
      <p className="mt-2 text-sm leading-relaxed text-foreground">
        Styrelsen bygger och ändrar <strong>er egen</strong> plan här. Öppna
        grundmallen när ni vill se den centrala mallen — den kan ni inte ändra,
        bara titta på och importera saknade delar från (steg 3).
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onVisaForeningsplan}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            !visarGrundmall
              ? "bg-primary text-white"
              : "border border-primary bg-white text-primary-dark hover:bg-[#e2f0e6]"
          }`}
        >
          Föreningens underhållsplan
        </button>
        <button
          type="button"
          onClick={onVisaGrundmall}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            visarGrundmall
              ? "bg-primary text-white"
              : "border border-primary bg-white text-primary-dark hover:bg-[#e2f0e6]"
          }`}
        >
          Grundmallen
        </button>
        {!visarGrundmall && (
          <button
            type="button"
            onClick={onGotoSlutsida}
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:border-primary/50"
          >
            Gå till slutsida ↓
          </button>
        )}
      </div>

      {visarGrundmall ? (
        <div className="mt-4 rounded-xl border border-amber-300/70 bg-amber-50/80 px-4 py-3">
          <p className="text-sm font-semibold text-amber-950">
            Ni tittar på grundmallen (skrivskyddad)
          </p>
          <p className="mt-1 text-sm text-amber-950/90">
            Ändringar i grundmallen görs bara centralt. Bläddra i stegen för att
            se innehållet — stäng sedan för att återgå till den plan ni byggt.
          </p>
          <button
            type="button"
            onClick={onVisaForeningsplan}
            className="mt-3 rounded-lg bg-amber-900 px-3 py-2 text-sm font-medium text-white hover:bg-amber-950"
          >
            Stäng grundmallen — tillbaka till er plan
          </button>
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted">
          Aktiv: er förenings underhållsplan. «Gå till slutsida» öppnar den
          summering styrelsen byggt — inte grundmallen.
        </p>
      )}
    </div>
  );
}
