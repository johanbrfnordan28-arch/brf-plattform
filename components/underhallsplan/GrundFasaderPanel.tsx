"use client";

import {
  fasadSidorForHus,
  hamtaAktivaFasaderForHus,
  MAX_ANTAL_FASADER,
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
        Högst {MAX_ANTAL_FASADER} fasader. Gata och gård räcker ofta. Lägg till
        norr, söder, väster eller öster om sidan finns.
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {fasadSidorForHus(hus).map((l) => {
          const full = !l.aktiv && aktiva.length >= MAX_ANTAL_FASADER;
          return (
            <button
              key={l.id}
              type="button"
              disabled={full}
              title={full ? `Högst ${MAX_ANTAL_FASADER} fasader` : undefined}
              onClick={() =>
                onYtorChange(uppdateraHusAktivFasad(data, hus.id, l.id, !l.aktiv))
              }
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                l.aktiv
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
  const harHus = data.hus.length > 0;

  function uppdateraYtor(next: FastighetsYtorData) {
    onChange({ ...grund, fastighetsYtor: next });
  }

  // Innan adresser/byggnader finns: diskret plats längre ner — ingen framträdande ruta.
  if (!harHus) {
    return (
      <div
        id={FASADER_ANCHOR_ID}
        className="mt-6 scroll-mt-28 rounded-lg border border-dashed border-border bg-background/50 px-3 py-3"
      >
        <p className="text-sm font-medium text-muted">Fasader per byggnad</p>
        <p className="mt-1 text-xs text-muted">
          Lägg in antal byggnader och adress ovan först — då öppnas fasadvalet
          (gata, gård, väderstreck) här.
        </p>
      </div>
    );
  }

  return (
    <div
      id={FASADER_ANCHOR_ID}
      className="mt-6 scroll-mt-28 rounded-xl border border-border bg-background p-4 sm:p-5"
    >
      <p className="text-sm font-semibold text-foreground">
        Fasader per byggnad
      </p>
      <p className="mt-1 text-xs text-muted">
        När adresserna är på plats: välj vilka fasader varje byggnad har. Ett hus
        har högst fyra. Ofta räcker{" "}
        <strong className="font-medium text-foreground">Gata och Gård</strong>.
        Lägg till väderstreck (norr, söder, väster, öster) om sidan finns. Ytan
        i m² fyller du i
        nedan, och samma sidor syns i fastighetens delar.
      </p>

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
    </div>
  );
}
