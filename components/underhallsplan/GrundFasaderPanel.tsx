"use client";

import {
  arFasadAktivForHus,
  fasadVaderstreckLista,
  hamtaAktivaFasaderForHus,
  normaliseraFastighetsYtor,
  uppdateraHusAktivFasad,
  type FastighetsHus,
  type FastighetsYtorData,
} from "@/components/underhallsplan/fastighets-ytor";
import { synkaGrundByggnaderOchAdresser } from "@/components/underhallsplan/grund-byggnad-adress";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

const FASADER_ANCHOR_ID = "grund-fasader";

type GrundFasaderPanelProps = {
  grund: Grunduppgifter;
  onChange: (grund: Grunduppgifter) => void;
};

function ByggnadFasadSidorRad({
  hus,
  data,
  onYtorChange,
}: {
  hus: FastighetsHus;
  data: FastighetsYtorData;
  onYtorChange: (data: FastighetsYtorData) => void;
}) {
  const aktiva = hamtaAktivaFasaderForHus(hus);

  return (
    <div className="rounded-lg border border-[#d4e8da] bg-white/80 p-3">
      <p className="text-xs font-medium text-foreground">
        {hus.husnummer.trim() || "Byggnad"} — {aktiva.length} fasad
        {aktiva.length === 1 ? "" : "er"} markerade
      </p>
      <p className="mt-0.5 text-[10px] text-muted">
        Klicka för att lägga till eller ta bort fasadytor (används för m², fönster
        och fasad i senare steg).
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {fasadVaderstreckLista.map((l) => {
          const aktiv = arFasadAktivForHus(hus, l.id);
          return (
            <button
              key={l.id}
              type="button"
              onClick={() =>
                onYtorChange(uppdateraHusAktivFasad(data, hus.id, l.id, !aktiv))
              }
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                aktiv
                  ? "border-primary bg-[#e2f0e6] text-primary-dark"
                  : "border-border bg-background text-muted hover:border-primary/40"
              }`}
            >
              {l.etikett}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function GrundFasaderPanel({ grund: rawGrund, onChange }: GrundFasaderPanelProps) {
  const grund = synkaGrundByggnaderOchAdresser(rawGrund);
  const data = normaliseraFastighetsYtor(grund.fastighetsYtor);

  function uppdateraYtor(next: FastighetsYtorData) {
    onChange({ ...grund, fastighetsYtor: next });
  }

  return (
    <div
      id={FASADER_ANCHOR_ID}
      className="mt-6 scroll-mt-28 rounded-xl border-2 border-primary bg-[#eef6f0] p-4 shadow-md sm:p-5"
    >
      <p className="text-sm font-semibold text-primary-dark">
        Fasader per byggnad
      </p>
      <p className="mt-1 text-xs text-muted">
        Välj vilka fasader varje byggnad har:{" "}
        <strong className="font-medium text-foreground">
          Gata, Gård och vädersträck (Norr, Söder, Öster, Väster)
        </strong>
        . Alla är valda från början — stäng av det som inte finns. Fasadyta i m²
        fyller du i i blocket nedan («Fasad- och takytor»).
      </p>

      {data.hus.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-border bg-white px-3 py-4 text-xs text-muted">
          Ange antal byggnader och minst en adress ovan — då visas fasaderna här.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {data.hus.map((h) => (
            <ByggnadFasadSidorRad
              key={h.id}
              hus={h}
              data={data}
              onYtorChange={uppdateraYtor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
