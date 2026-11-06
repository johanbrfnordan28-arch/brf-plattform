"use client";

import Link from "next/link";
import { useState } from "react";
import type { ArshjulHandelse } from "@/components/arshjul/arshjul";
import {
  arshjulArAterkommandeBesiktning,
  arshjulArEnergideklaration,
  arshjulArOvk,
  arshjulArRadon,
  arshjulArSotning,
  arshjulVisaForenkladBesiktning,
  entreprenorFaltEtikett,
  entreprenorFaltPlaceholder,
  SOTNING_ENTREPRENOR_INFO,
} from "@/components/arshjul/arshjul-handelse-falt";
import { ArshjulSkapaUpphandlingKnapp } from "@/components/arshjul/ArshjulSkapaUpphandlingKnapp";
import { ArshjulSigneringPanel } from "@/components/arshjul/ArshjulSigneringPanel";
import { ArshjulBilagor } from "@/components/arshjul/ArshjulBilagor";
import { ArshjulBesiktningUppgifter } from "@/components/arshjul/ArshjulBesiktningUppgifter";

type Props = {
  handelse: ArshjulHandelse;
  onSpara: (patch: Partial<ArshjulHandelse>) => void;
};

export function ArshjulHandelseDetalj({ handelse, onSpara }: Props) {
  const forenkladBesiktning = arshjulVisaForenkladBesiktning(handelse);
  const [leverantor, setLeverantor] = useState(handelse.leverantor ?? "");
  const [attHanteraText, setAttHanteraText] = useState(
    (handelse.attHantera ?? []).join("\n"),
  );

  if (forenkladBesiktning) {
    const arOvk = arshjulArOvk(handelse);
    const arEnergi = arshjulArEnergideklaration(handelse);
    const arRadon = arshjulArRadon(handelse);
    const intro = arOvk
      ? "OVK: ange vem som utförde besiktningen och när den godkändes. Nästa OVK räknas ut automatiskt."
      : arEnergi
        ? "Energideklaration: ange vem som gjorde den och när den blev klar. Den gäller i 10 år."
        : arRadon
          ? "Radonmätning: ange vem som mätte och när mätningen blev klar. Rekommenderat intervall är 10 år."
          : "Ange vem som utförde besiktningen och när den godkändes.";

    return (
      <div className="mt-3 space-y-4 border-t border-border/70 pt-3">
        <p className="text-xs leading-relaxed text-muted">
          {intro} Bifoga gärna protokollet längst ned – det kan samtidigt visas
          i Styrning och Dokument och i dokumentbanken.
        </p>
        <ArshjulBesiktningUppgifter handelse={handelse} onSpara={onSpara} />
        <ArshjulBilagor
          handelse={handelse}
          onSpara={onSpara}
          rubrik="Protokoll och dokument"
          uppladdningsEtikett="Ladda upp protokoll"
        />
        <ArshjulSkapaUpphandlingKnapp handelse={handelse} />
      </div>
    );
  }

  const besiktning = arshjulArAterkommandeBesiktning(handelse);

  return (
    <div className="mt-3 space-y-4 border-t border-border/70 pt-3">
      {besiktning ? (
        <ArshjulBesiktningUppgifter handelse={handelse} onSpara={onSpara} />
      ) : (
        <label className="block text-sm">
          <span className="font-medium text-foreground">
            {entreprenorFaltEtikett(handelse.kategori)}
          </span>
          {!arshjulArSotning(handelse) && (
            <span className="mt-0.5 block text-xs text-muted">
              Här anger ni vem som utförde uppdraget senast — underlättar för
              nästa styrelse.
            </span>
          )}
          <input
            value={leverantor}
            onChange={(e) => setLeverantor(e.target.value)}
            onBlur={() => onSpara({ leverantor })}
            placeholder={entreprenorFaltPlaceholder(handelse.kategori)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
      )}

      {arshjulArSotning(handelse) && (
        <p className="rounded-lg border border-primary/25 bg-[#eef6f0]/80 px-3 py-2 text-xs leading-relaxed text-primary-dark">
          {SOTNING_ENTREPRENOR_INFO}{" "}
          <Link
            href="/forening/foreningsinformation"
            className="font-medium underline"
          >
            Protokoll sparas under Ventilation → Sotning
          </Link>
          .
        </p>
      )}

      {!arshjulArSotning(handelse) && (
        <ArshjulSkapaUpphandlingKnapp handelse={handelse} />
      )}

      <label className="block text-sm">
        <span className="font-medium text-foreground">
          Saker som ska hanteras
        </span>
        <textarea
          value={attHanteraText}
          onChange={(e) => setAttHanteraText(e.target.value)}
          onBlur={() =>
            onSpara({
              attHantera: attHanteraText
                .split("\n")
                .map((rad) => rad.trim())
                .filter(Boolean),
            })
          }
          rows={4}
          placeholder={
            handelse.id === "std-overlamning"
              ? "En punkt per rad — komplettera under året med det nästa styrelse behöver veta."
              : "En sak per rad, t.ex.\nBoka lokal\nSkicka kallelse"
          }
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
      </label>

      <ArshjulBilagor
        handelse={handelse}
        onSpara={onSpara}
        rubrik="Dagordning och bilagor"
        uppladdningsEtikett="Ladda upp dagordning eller bilaga"
      />

      <ArshjulSigneringPanel handelse={handelse} onSpara={onSpara} />
    </div>
  );
}
