"use client";

import {
  hamtaAktivaFasaderForHus,
  normaliseraFastighetsYtor,
} from "@/components/underhallsplan/fastighets-ytor";
import {
  hamtaAntalByggnader,
  synkaGrundByggnaderOchAdresser,
} from "@/components/underhallsplan/grund-byggnad-adress";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

const FASADER_ANCHOR_ID = "grund-fasader";

export function scrollTillGrundFasader() {
  const el = document.getElementById(FASADER_ANCHOR_ID);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  el.classList.add("ring-2", "ring-primary", "ring-offset-2");
  window.setTimeout(() => {
    el.classList.remove("ring-2", "ring-primary", "ring-offset-2");
  }, 2000);
}

type GrundFasaderPaminnelseProps = {
  grund: Grunduppgifter;
};

/** Visas först när byggnader/adresser finns — annars ska fasader inte ta fokus. */
export function GrundFasaderPaminnelse({ grund: rawGrund }: GrundFasaderPaminnelseProps) {
  const grund = synkaGrundByggnaderOchAdresser(rawGrund);
  const antalByggnader = hamtaAntalByggnader(grund);
  const ytor = normaliseraFastighetsYtor(grund.fastighetsYtor);
  const harHus = ytor.hus.length > 0;
  const antalFasaderTotalt = ytor.hus.reduce(
    (sum, h) => sum + hamtaAktivaFasaderForHus(h).length,
    0,
  );

  if (!harHus) return null;

  return (
    <div
      role="note"
      className="mt-4 rounded-lg border border-border bg-background/80 px-3 py-3"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            Nästa: fasader per byggnad
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {ytor.hus.length} byggnad{ytor.hus.length === 1 ? "" : "er"} ·{" "}
            {antalFasaderTotalt} fasadval · {antalByggnader} angivna. Markera
            gata, gård och väderstreck under adresserna.
          </p>
        </div>
        <button
          type="button"
          onClick={scrollTillGrundFasader}
          className="shrink-0 rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
        >
          Gå till fasader ↓
        </button>
      </div>
    </div>
  );
}
