"use client";

type KostnadPrisVarningProps = {
  kompakt?: boolean;
  visaPrislistaLank?: boolean;
};

/** Gemensam text om osäkerhet i kostnadsuppskattningar. */
export function KostnadPrisVarning({
  kompakt = false,
}: KostnadPrisVarningProps) {
  return (
    <div
      className={`rounded-lg border border-amber-200/90 bg-amber-50/90 text-amber-950 ${
        kompakt ? "px-3 py-2 text-[11px] leading-relaxed" : "px-3 py-2.5 text-xs leading-relaxed"
      }`}
    >
      <p className="font-semibold">Priser är uppskattningar</p>
      <p className={kompakt ? "mt-0.5" : "mt-1"}>
        Riktvärden och beräkningar (yta × pris eller antal × pris) ger en rimlig
        nivå i planen — inte ett bindande anbud. Kostnader kan variera kraftigt
        beroende på fastighetens skick, tillgänglighet, materialval och lokala
        priser. Ny entreprenör eller materialleverantör, ändrade branschregler
        och myndighetsbeslut kan höja eller sänka kostnadsbilden.
      </p>
      {!kompakt && (
        <p className="mt-1.5">
          Lägg in egna priser manuellt här när ni har offert eller
          entreprenörsunderlag — justera enhetspris per åtgärd.
        </p>
      )}
    </div>
  );
}
