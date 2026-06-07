"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DemoFilSparningNotis } from "@/components/DemoFilSparningNotis";
import { lasUnderhallsplanState } from "@/components/underhallsplan/underhallsplan-lager";
import { localStorageFelMeddelande } from "@/lib/localStorage";
import { hamtaStyrelseKontakt } from "@/lib/styrelse-kontakt";
import {
  beraknaEffektivFramsteg,
  type ChecklistaAnpassning,
} from "@/components/rondering/checklist-effektiv";
import type { RonderingChecklistaTyp } from "@/components/rondering/checklist-mallar";
import {
  RonderingChecklista,
  RonderingChecklistaVal,
} from "@/components/rondering/RonderingChecklista";
import { RonderingChecklistaAnpassa } from "@/components/rondering/RonderingChecklistaAnpassa";
import {
  RonderingChecklistaUtskrift,
  skrivUtChecklista,
} from "@/components/rondering/RonderingChecklistaUtskrift";
import { RonderingForeningEgenskaper } from "@/components/rondering/RonderingForeningEgenskaper";
import { RonderingAvvikelser } from "@/components/rondering/RonderingAvvikelser";
import { hittaEffektivPunktText } from "@/components/rondering/checklist-effektiv";
import { hamtaForeslaEgenskaperFranLager } from "@/components/rondering/forening-egenskaper";
import {
  lasRonderingState,
  sparaRonderingState,
  type AvvikelseKategori,
  type RonderingAvvikelse,
  type RonderingState,
} from "@/components/rondering/rondering-lager";

const UTSKRIFT_ID = "rondering-checklista-utskrift";

type PendingAvvikelse = {
  kategori: AvvikelseKategori;
  punktNyckel: string;
  rubrik: string;
};

export function RonderingModul() {
  const [state, setState] = useState<RonderingState>(() => lasRonderingState());
  const [hydrated, setHydrated] = useState(false);
  const [sparFel, setSparFel] = useState<string | null>(null);
  const [aktivChecklista, setAktivChecklista] =
    useState<RonderingChecklistaTyp>("rondering-utvandig");
  const [pendingAvvikelse, setPendingAvvikelse] = useState<PendingAvvikelse | null>(
    null,
  );
  const [utskriftTyp, setUtskriftTyp] = useState<"aktiv" | "alla">("aktiv");

  useEffect(() => {
    const sparad = lasRonderingState();
    const franPlan = hamtaForeslaEgenskaperFranLager();
    if (franPlan && sparad.egenskaper.tvattstuga === false && !sparad.klaraPunkter.length) {
      sparad.egenskaper = franPlan;
    }
    setState(sparad);
    setHydrated(true);
  }, []);

  const anpassning: ChecklistaAnpassning = useMemo(
    () => ({
      doldaPunkter: state.doldaPunkter,
      egnaPunkter: state.egnaPunkter,
    }),
    [state.doldaPunkter, state.egnaPunkter],
  );

  const persist = useCallback((next: RonderingState) => {
    setState(next);
    const ok = sparaRonderingState(next);
    setSparFel(ok ? null : localStorageFelMeddelande("unavailable"));
  }, []);

  const framstegPerTyp = useMemo(
    () => ({
      "rondering-utvandig": beraknaEffektivFramsteg(
        "rondering-utvandig",
        state.klaraPunkter,
        state.egenskaper,
        anpassning,
      ),
      "rondering-invandig": beraknaEffektivFramsteg(
        "rondering-invandig",
        state.klaraPunkter,
        state.egenskaper,
        anpassning,
      ),
      stadning: beraknaEffektivFramsteg(
        "stadning",
        state.klaraPunkter,
        state.egenskaper,
        anpassning,
      ),
    }),
    [state.klaraPunkter, state.egenskaper, anpassning],
  );

  const plan = lasUnderhallsplanState();
  const kontakt = hamtaStyrelseKontakt();
  const foreningNamn =
    kontakt?.foreningsnamn ??
    plan?.planNamn ??
    plan?.grund.adresser?.[0] ??
    undefined;

  const utskriftsTyper: RonderingChecklistaTyp[] =
    utskriftTyp === "alla"
      ? ["rondering-utvandig", "rondering-invandig", "stadning"]
      : [aktivChecklista];

  function togglePunkt(nyckel: string) {
    const set = new Set(state.klaraPunkter);
    if (set.has(nyckel)) set.delete(nyckel);
    else set.add(nyckel);
    persist({ ...state, klaraPunkter: [...set] });
  }

  function rapporteraFranChecklista(
    typ: RonderingChecklistaTyp,
    nyckel: string,
    punktText: string,
  ) {
    setPendingAvvikelse({
      kategori: typ,
      punktNyckel: nyckel,
      rubrik: punktText.slice(0, 120),
    });
    setTimeout(() => {
      document.getElementById("rondering-avvikelser")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 80);
  }

  function laggTillAvvikelse(avvikelse: RonderingAvvikelse) {
    persist({
      ...state,
      avvikelser: [avvikelse, ...state.avvikelser],
    });
    setPendingAvvikelse(null);
  }

  function uppdateraAvvikelse(avvikelse: RonderingAvvikelse) {
    persist({
      ...state,
      avvikelser: state.avvikelser.map((a) =>
        a.id === avvikelse.id ? avvikelse : a,
      ),
    });
  }

  function taBortAvvikelse(id: string) {
    persist({
      ...state,
      avvikelser: state.avvikelser.filter((a) => a.id !== id),
    });
  }

  function hamtaPunktText(kategori: AvvikelseKategori, nyckel: string) {
    return hittaEffektivPunktText(
      kategori,
      nyckel,
      state.egenskaper,
      anpassning,
    );
  }

  if (!hydrated) {
    return (
      <p className="text-sm text-muted">Laddar checklistor och avvikelser …</p>
    );
  }

  return (
    <div className="space-y-8 print:hidden">
      <DemoFilSparningNotis />
      {sparFel && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {sparFel}
        </p>
      )}

      <RonderingForeningEgenskaper
        egenskaper={state.egenskaper}
        onChange={(egenskaper) => persist({ ...state, egenskaper })}
      />

      <section className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Checklistor</h3>
            <p className="mt-1 text-sm text-muted">
              Anpassade efter egenskaper ovan. Skriv ut till entreprenör eller
              intern genomgång.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={utskriftTyp}
              onChange={(e) =>
                setUtskriftTyp(e.target.value as "aktiv" | "alla")
              }
              className="rounded-lg border border-border px-3 py-2 text-sm"
              aria-label="Vad som ska skrivas ut"
            >
              <option value="aktiv">Skriv ut aktiv lista</option>
              <option value="alla">Skriv ut alla tre listor</option>
            </select>
            <button
              type="button"
              onClick={() => skrivUtChecklista(UTSKRIFT_ID)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Skriv ut / PDF
            </button>
          </div>
        </div>

        <RonderingChecklistaVal
          aktivTyp={aktivChecklista}
          onTypChange={setAktivChecklista}
          framstegPerTyp={framstegPerTyp}
        />

        <RonderingChecklistaAnpassa
          typ={aktivChecklista}
          egenskaper={state.egenskaper}
          doldaPunkter={state.doldaPunkter}
          egnaPunkter={state.egnaPunkter}
          onDoldaChange={(doldaPunkter) => persist({ ...state, doldaPunkter })}
          onEgnaChange={(egnaPunkter) => persist({ ...state, egnaPunkter })}
        />

        <RonderingChecklista
          typ={aktivChecklista}
          egenskaper={state.egenskaper}
          anpassning={anpassning}
          klaraPunkter={state.klaraPunkter}
          onTogglePunkt={togglePunkt}
          onRapporteraAvvikelse={(nyckel, text) =>
            rapporteraFranChecklista(aktivChecklista, nyckel, text)
          }
        />
      </section>

      <section id="rondering-avvikelser" className="scroll-mt-24">
        <h3 className="text-lg font-semibold text-foreground">
          Avvikelserapporter — rondering och städning
        </h3>
        <RonderingAvvikelser
          avvikelser={state.avvikelser}
          onLaggTill={laggTillAvvikelse}
          onUppdatera={uppdateraAvvikelse}
          onTaBort={taBortAvvikelse}
          forvaldKategori={pendingAvvikelse?.kategori}
          forvaldPunktNyckel={pendingAvvikelse?.punktNyckel}
          forvaldRubrik={pendingAvvikelse?.rubrik}
          onRensaForval={() => setPendingAvvikelse(null)}
          hamtaPunktText={hamtaPunktText}
        />
      </section>

      <RonderingChecklistaUtskrift
        utskriftsId={UTSKRIFT_ID}
        typer={utskriftsTyper}
        egenskaper={state.egenskaper}
        anpassning={anpassning}
        klaraPunkter={state.klaraPunkter}
        foreningNamn={foreningNamn}
      />
    </div>
  );
}
