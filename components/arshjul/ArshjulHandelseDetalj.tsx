"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FORENINGS_DOK_EVENT,
} from "@/components/dokumentbank/forening-dokumenter-lager";
import {
  kopieraForeningsDokumentTillBilaga,
  listaForeningsDokumentMedFil,
} from "@/components/dokumentbank/intern-dokument-flode";
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

const MAX_FIL_BYTE = 280_000;

type Props = {
  handelse: ArshjulHandelse;
  onSpara: (patch: Partial<ArshjulHandelse>) => void;
};

export function ArshjulHandelseDetalj({ handelse, onSpara }: Props) {
  const forenkladBesiktning = arshjulVisaForenkladBesiktning(handelse);
  const [filFel, setFilFel] = useState<string | null>(null);
  const [foreningsFiler, setForeningsFiler] = useState(
    listaForeningsDokumentMedFil(),
  );

  useEffect(() => {
    function ladda() {
      setForeningsFiler(listaForeningsDokumentMedFil());
    }
    ladda();
    window.addEventListener(FORENINGS_DOK_EVENT, ladda);
    return () => window.removeEventListener(FORENINGS_DOK_EVENT, ladda);
  }, []);
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

  function laggTillFil(fil: File | null) {
    setFilFel(null);
    if (!fil) return;
    if (fil.size > MAX_FIL_BYTE) {
      setFilFel(
        "Filen är för stor för att sparas här. Håll dagordningen under 280 kB.",
      );
      return;
    }
    if ((handelse.bilagor?.length ?? 0) >= 6) {
      setFilFel("Högst sex bilagor per händelse.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl.startsWith("data:")) {
        setFilFel("Filen kunde inte läsas.");
        return;
      }
      onSpara({
        bilagor: [
          ...(handelse.bilagor ?? []),
          {
            id: `bil-${Date.now().toString(36)}`,
            filnamn: fil.name,
            dataUrl,
          },
        ],
      });
    };
    reader.readAsDataURL(fil);
  }

  function taBortBilaga(id: string) {
    onSpara({
      bilagor: (handelse.bilagor ?? []).filter((bilaga) => bilaga.id !== id),
    });
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
      ? "Senaste OVK (datum)"
      : arEnergi
        ? "Senaste energideklaration (datum)"
        : "Senaste radonmätning (datum)";
    const nastaRubrik = arOvk
      ? "Nästa OVK planeras"
      : arEnergi
        ? "Nästa energideklaration planeras"
        : "Nästa radonmätning planeras";

    return (
      <div className="mt-3 space-y-4 border-t border-border/70 pt-3">
        <p className="text-xs leading-relaxed text-muted">
          {intro} Protokoll och anbud hanteras via upphandling — inte dagordning
          eller BankID här.
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

      <div className="text-sm">
        <p className="font-medium text-foreground">Dagordning och bilagor</p>
        <p className="mt-1 text-xs text-muted">
          Filen sparas i den här webbläsaren, inte i molnet.
        </p>
        {(handelse.bilagor ?? []).length > 0 && (
          <ul className="mt-2 space-y-1">
            {(handelse.bilagor ?? []).map((bilaga) => (
              <li
                key={bilaga.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#f7f9f8] px-2.5 py-1.5"
              >
                <a
                  href={bilaga.dataUrl}
                  download={bilaga.filnamn}
                  className="text-sm font-medium text-primary-dark underline"
                >
                  {bilaga.filnamn}
                </a>
                <button
                  type="button"
                  onClick={() => taBortBilaga(bilaga.id)}
                  className="rounded-lg border border-border px-2 py-1 text-xs text-muted"
                >
                  Ta bort
                </button>
              </li>
            ))}
          </ul>
        )}
        <label className="mt-2 inline-flex cursor-pointer rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#eef6f0]">
          Ladda upp dagordning
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt,image/*,application/pdf"
            className="sr-only"
            onChange={(e) => {
              laggTillFil(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
        </label>
        {foreningsFiler.length > 0 ? (
          <div className="mt-3">
            <label className="block text-xs font-medium text-muted">
              Hämta bilaga från föreningens dokument
              <select
                className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
                defaultValue=""
                onChange={async (e) => {
                  const select = e.currentTarget;
                  const dokId = select.value;
                  if (!dokId) return;
                  const resultat = await kopieraForeningsDokumentTillBilaga(dokId);
                  select.value = "";
                  if (!resultat.ok) {
                    setFilFel(resultat.fel);
                    return;
                  }
                  setFilFel(null);
                  onSpara({
                    bilagor: [...(handelse.bilagor ?? []), resultat.bilaga],
                  });
                }}
              >
                <option value="">Välj dokument …</option>
                {foreningsFiler.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.titel}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
        {filFel && (
          <p className="mt-2 text-xs text-red-800" role="alert">
            {filFel}
          </p>
        )}
      </div>

      <ArshjulSigneringPanel handelse={handelse} onSpara={onSpara} />
    </div>
  );
}
