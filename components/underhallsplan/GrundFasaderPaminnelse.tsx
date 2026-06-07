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

export function GrundFasaderPaminnelse({ grund: rawGrund }: GrundFasaderPaminnelseProps) {
  const grund = synkaGrundByggnaderOchAdresser(rawGrund);
  const antalByggnader = hamtaAntalByggnader(grund);
  const ytor = normaliseraFastighetsYtor(grund.fastighetsYtor);
  const harHus = ytor.hus.length > 0;
  const antalFasaderTotalt = ytor.hus.reduce(
    (sum, h) => sum + hamtaAktivaFasaderForHus(h).length,
    0,
  );

  return (
    <div
      role="note"
      className="rounded-xl border-2 border-primary bg-[#e2f0e6] p-4 sm:p-5 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary-dark">
            Fasader (gata, gård, väderstreck)
          </p>
          <p className="mt-1 text-xs leading-relaxed text-foreground">
            Här i steg 1 väljer du vilka fasader varje byggnad har — innan fönster
            och fasad i steg 3. Scrolla till blocket{" "}
            <strong className="font-medium">Fasader per byggnad</strong> (efter
            adresserna) eller använd knappen.
          </p>
          <p className="mt-2 text-xs text-muted">
            {harHus
              ? `${ytor.hus.length} byggnad${ytor.hus.length === 1 ? "" : "er"} · ${antalFasaderTotalt} fasadval totalt`
              : `Ange antal byggnader (${antalByggnader}) och adress — fasaderna visas direkt under.`}
          </p>
        </div>
        <button
          type="button"
          onClick={scrollTillGrundFasader}
          className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Gå till fasader ↓
        </button>
      </div>
    </div>
  );
}
