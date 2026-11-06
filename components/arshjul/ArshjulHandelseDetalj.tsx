"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ArshjulHandelse } from "@/components/arshjul/arshjul";
import {
  arshjulArEnergideklaration,
  arshjulArOvk,
  arshjulArRadon,
  arshjulArSotning,
  arshjulKräverTioarsIntervall,
  arshjulNastaBesiktningAr,
  arshjulVisaForenkladBesiktning,
  entreprenorFaltEtikett,
  entreprenorFaltPlaceholder,
  SOTNING_ENTREPRENOR_INFO,
} from "@/components/arshjul/arshjul-handelse-falt";
import { ENERGI_RADON_LAGKRAV_INTERVALL_AR } from "@/components/underhallsplan/besiktningar";
import { ArshjulSkapaUpphandlingKnapp } from "@/components/arshjul/ArshjulSkapaUpphandlingKnapp";
import { ArshjulSigneringPanel } from "@/components/arshjul/ArshjulSigneringPanel";
import { ArshjulBilagor } from "@/components/arshjul/ArshjulBilagor";

type Props = {
  handelse: ArshjulHandelse;
  onSpara: (patch: Partial<ArshjulHandelse>) => void;
};

export function ArshjulHandelseDetalj({ handelse, onSpara }: Props) {
  const forenkladBesiktning = arshjulVisaForenkladBesiktning(handelse);
  const [leverantor, setLeverantor] = useState(handelse.leverantor ?? "");
  const [senastDatum, setSenastDatum] = useState(
    handelse.besiktningSenastDatum ?? "",
  );
  const [attHanteraText, setAttHanteraText] = useState(
    (handelse.attHantera ?? []).join("\n"),
  );

  const nastaAr = useMemo(() => {
    return arshjulNastaBesiktningAr({
      ...handelse,
      besiktningSenastDatum: senastDatum || handelse.besiktningSenastDatum,
    });
  }, [handelse, senastDatum]);

  function sparaSenast(patch: Partial<ArshjulHandelse>) {
    onSpara(patch);
  }

  if (forenkladBesiktning) {
    const arOvk = arshjulArOvk(handelse);
    const arEnergi = arshjulArEnergideklaration(handelse);
    const arRadon = arshjulArRadon(handelse);
    const intervallVisning = arshjulKräverTioarsIntervall(handelse)
      ? ENERGI_RADON_LAGKRAV_INTERVALL_AR
      : (handelse.intervallAr ?? "?");
    const intro = arOvk
      ? "OVK i årshjulet: vem som utförde senast, när det gjordes och när nästa kontroll planeras."
      : arEnergi
        ? "Energideklaration: ange vem som utförde senast och datum. Intervall är 10 år enligt lag."
        : arRadon
          ? "Radonmätning: ange vem som utförde senast och datum. Rekommenderat intervall är 10 år."
          : "Ange senaste utförare och datum.";
    const utförareEtikett = arOvk
      ? "Senast utförd av (besiktningsföretag)"
      : arEnergi
        ? "Senast utförd av (energiexpert)"
        : "Senast utförd av (mätentreprenör / laboratorium)";
    const utförarePlaceholder = arOvk
      ? "Certifierat OVK-företag"
      : arEnergi
        ? "Ackrediterad energiexpert"
        : "Företag som utförde mätningen";
    const datumEtikett = arOvk
      ? "Datum då senaste OVK utfördes"
      : arEnergi
        ? "Datum då senaste energideklaration utfördes"
        : "Datum då senaste radonmätning utfördes";
    const nastaRubrik = arOvk
      ? "Nästa OVK planeras"
      : arEnergi
        ? "Nästa energideklaration planeras"
        : "Nästa radonmätning planeras";

    return (
      <div className="mt-3 space-y-4 border-t border-border/70 pt-3">
        <p className="text-xs leading-relaxed text-muted">
          {intro} Bifoga protokollet nedan — det kan samtidigt visas i Styrning
          och Dokument och i dokumentbanken.
        </p>
        <label className="block text-sm">
          <span className="font-medium text-foreground">{utförareEtikett}</span>
          <input
            value={leverantor}
            onChange={(e) => setLeverantor(e.target.value)}
            onBlur={() => sparaSenast({ leverantor })}
            placeholder={utförarePlaceholder}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-foreground">{datumEtikett}</span>
          <input
            type="date"
            value={senastDatum}
            onChange={(e) => setSenastDatum(e.target.value)}
            onBlur={() => {
              const d = senastDatum.trim();
              const ar = d ? Number(d.slice(0, 4)) : undefined;
              sparaSenast({
                besiktningSenastDatum: d || undefined,
                senastKlarAr: Number.isFinite(ar) ? ar : undefined,
              });
            }}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
        <div className="rounded-lg border border-border bg-[#f7f9f8] px-3 py-2 text-sm">
          <span className="font-medium text-foreground">{nastaRubrik}</span>
          <p className="mt-0.5 text-muted">
            {nastaAr
              ? `År ${nastaAr} (intervall ${intervallVisning} år från senaste).`
              : "Ange senaste datum — intervall följer lag/rekommendation."}
            {handelse.startAr && !nastaAr
              ? ` Planerat startår i årshjulet: ${handelse.startAr}.`
              : ""}
          </p>
        </div>
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

  return (
    <div className="mt-3 space-y-4 border-t border-border/70 pt-3">
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
