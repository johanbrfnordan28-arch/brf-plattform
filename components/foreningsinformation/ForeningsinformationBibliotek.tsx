"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { OppnaStangIkon } from "@/components/OppnaStangKnapp";
import { oppnaTextSomPdf } from "@/components/forening/avtal-pdf";
import {
  KUNDAVTAL_EVENT,
  lasSparatKundavtal,
  type SparatKundavtal,
} from "@/components/foreningsinformation/kundavtal-lager";
import { NyckelKvittenserPanel } from "@/components/foreningsinformation/NyckelKvittenserPanel";
import {
  antalUtlamnadeNycklar,
  lasNyckelKvittenser,
} from "@/components/foreningsinformation/nyckel-kvittenser";
import { UtlamnadeNycklarOversikt } from "@/components/foreningsinformation/UtlamnadeNycklarOversikt";
import { SotningProtokollMappar } from "@/components/foreningsinformation/SotningProtokollMappar";
import { BesiktningUpphandlingPanel } from "@/components/foreningsinformation/BesiktningUpphandlingPanel";
import { HissUpphandlingPanel } from "@/components/foreningsinformation/HissUpphandlingPanel";
import {
  HissBesiktningPanel,
  HissReparationerPanel,
  HissServicePanel,
} from "@/components/foreningsinformation/HissMappPaneler";
import {
  antalHissHandlingar,
  HISS_UPPHANDLING_EVENT,
} from "@/components/foreningsinformation/hiss-upphandling";
import {
  antalSparadeBesiktningHandlingar,
  BESIKTNING_UPPHANDLING_EVENT,
  besiktningTjanstForMapp,
} from "@/components/foreningsinformation/besiktning-upphandling";
import {
  allaUndermappNycklar,
  antalForeningsHuvudmappar,
  foreningsHuvudmappar,
  skapaForeningsDokumentId,
  undermappNyckel,
  undermappNoderForHuvud,
  type ForeningsHuvudmapp,
  type ForeningsUndermapp,
} from "@/components/foreningsinformation/mappar";
import {
  BIBLIOTEK_EVENT,
  bekraftaOmDubblett,
  bibliotekStorageKey,
  hamtaBibliotekFilUrl,
  lasBibliotekState,
  laddaUppBibliotekFil,
  sparaBibliotekState,
  taBortBibliotekFil,
  type BibliotekUppladdatDokument,
} from "@/components/foreningsinformation/foreningsinformation-bibliotek-lager";
import { oppnaFilIFlik } from "@/lib/forening-fil-lagring";
import {
  FilUppladdningsRuta,
  type FilUppladdningsResultat,
} from "@/components/FilUppladdningsRuta";
import { slappDeladFil } from "@/lib/forening-dokument-platser";

type UppladdatDokument = BibliotekUppladdatDokument;

type UppladdningsHandler = (
  underPath: string,
  fil: File,
  onProgress?: (procent: number) => void,
) => Promise<FilUppladdningsResultat>;

type UndermappState = {
  öppen: boolean;
  dokument: UppladdatDokument[];
};

function antalDokumentIUnderträd(
  underPath: string,
  undermapparState: Record<string, UndermappState>,
): number {
  const prefix = `${underPath}/`;
  return Object.entries(undermapparState).reduce(
    (sum, [path, state]) =>
      path.startsWith(prefix) ? sum + state.dokument.length : sum,
    0,
  );
}

type HuvudmappState = {
  öppen: boolean;
  undermappar: Record<string, UndermappState>;
};

function initialState(): Record<string, HuvudmappState> {
  return Object.fromEntries(
    foreningsHuvudmappar.map((huvud) => [
      huvud.id,
      {
        öppen: false,
        undermappar: Object.fromEntries(
          undermappNoderForHuvud(huvud).map((nod) => [
            nod.path,
            { öppen: false, dokument: [] },
          ]),
        ),
      },
    ]),
  );
}

function slåIhopBibliotekState(
  sparad: ReturnType<typeof lasBibliotekState>,
): Record<string, HuvudmappState> {
  const bas = initialState();
  if (!sparad) return bas;
  for (const huvudId of Object.keys(bas)) {
    const sparadHuvud = sparad[huvudId];
    if (!sparadHuvud) continue;
    bas[huvudId] = {
      öppen: sparadHuvud.öppen ?? bas[huvudId].öppen,
      undermappar: { ...bas[huvudId].undermappar },
    };
    for (const path of Object.keys(bas[huvudId].undermappar)) {
      const sparadUnder = sparadHuvud.undermappar[path];
      if (!sparadUnder) continue;
      bas[huvudId].undermappar[path] = {
        öppen: sparadUnder.öppen ?? false,
        dokument: sparadUnder.dokument ?? [],
      };
    }
  }
  return bas;
}

export function ForeningsinformationBibliotek() {
  const [huvudmappar, setHuvudmappar] = useState(initialState);
  const [hydrated, setHydrated] = useState(false);
  const skipFirstSave = useRef(true);
  const senastSparat = useRef<string | null>(null);
  const [pågåendeUppladdning, setPågåendeUppladdning] = useState<string | null>(
    null,
  );
  const [sotningProtokollAntal, setSotningProtokollAntal] = useState(0);
  const [nyckelKvittenserAntal, setNyckelKvittenserAntal] = useState(0);
  const [utlamnadeNycklarAntal, setUtlamnadeNycklarAntal] = useState(0);
  const [kundavtalAntal, setKundavtalAntal] = useState(0);
  const [besiktningPerMapp, setBesiktningPerMapp] = useState({
    ovk: 0,
    energideklaration: 0,
    radon: 0,
  });
  const [hissAntal, setHissAntal] = useState(0);

  const onSotningProtokollAntal = useCallback((antal: number) => {
    setSotningProtokollAntal(antal);
  }, []);

  useEffect(() => {
    function uppdateraNyckelStatistik() {
      const kvittenser = lasNyckelKvittenser();
      setNyckelKvittenserAntal(kvittenser.length);
      setUtlamnadeNycklarAntal(antalUtlamnadeNycklar(kvittenser));
    }
    uppdateraNyckelStatistik();
    function onCustom() {
      uppdateraNyckelStatistik();
    }
    window.addEventListener("nyckel-kvittenser-uppdaterad", onCustom);
    return () => window.removeEventListener("nyckel-kvittenser-uppdaterad", onCustom);
  }, []);

  useEffect(() => {
    function lasAvtal() {
      setKundavtalAntal(lasSparatKundavtal() ? 1 : 0);
    }
    lasAvtal();
    window.addEventListener(KUNDAVTAL_EVENT, lasAvtal);
    return () => window.removeEventListener(KUNDAVTAL_EVENT, lasAvtal);
  }, []);

  useEffect(() => {
    function lasBesiktning() {
      setBesiktningPerMapp({
        ovk: antalSparadeBesiktningHandlingar("ovk"),
        energideklaration: antalSparadeBesiktningHandlingar("energideklaration"),
        radon: antalSparadeBesiktningHandlingar("radon"),
      });
    }
    lasBesiktning();
    window.addEventListener(BESIKTNING_UPPHANDLING_EVENT, lasBesiktning);
    return () =>
      window.removeEventListener(BESIKTNING_UPPHANDLING_EVENT, lasBesiktning);
  }, []);

  useEffect(() => {
    function lasHiss() {
      setHissAntal(antalHissHandlingar());
    }
    lasHiss();
    window.addEventListener(HISS_UPPHANDLING_EVENT, lasHiss);
    return () => window.removeEventListener(HISS_UPPHANDLING_EVENT, lasHiss);
  }, []);

  useEffect(() => {
    setHuvudmappar(slåIhopBibliotekState(lasBibliotekState()));
    skipFirstSave.current = true;
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    senastSparat.current = JSON.stringify(huvudmappar);
    sparaBibliotekState(huvudmappar);
  }, [huvudmappar, hydrated]);

  useEffect(() => {
    // Hisspanelerna lägger till och tar bort filer direkt i lagringen.
    function lasOmAndradUtifran() {
      if (localStorage.getItem(bibliotekStorageKey()) === senastSparat.current) return;
      setHuvudmappar((current) => {
        const sparad = slåIhopBibliotekState(lasBibliotekState());
        for (const [huvudId, huvud] of Object.entries(current)) {
          if (!sparad[huvudId]) continue;
          sparad[huvudId].öppen = huvud.öppen;
          for (const [path, under] of Object.entries(huvud.undermappar)) {
            if (sparad[huvudId].undermappar[path]) {
              sparad[huvudId].undermappar[path].öppen = under.öppen;
            }
          }
        }
        return sparad;
      });
    }
    window.addEventListener(BIBLIOTEK_EVENT, lasOmAndradUtifran);
    return () => window.removeEventListener(BIBLIOTEK_EVENT, lasOmAndradUtifran);
  }, []);

  const totaltDokument = useMemo(
    () =>
      allaUndermappNycklar().reduce((sum, key) => {
        const slash = key.indexOf("/");
        const huvudId = key.slice(0, slash);
        const underPath = key.slice(slash + 1);
        return (
          sum + (huvudmappar[huvudId]?.undermappar[underPath]?.dokument.length ?? 0)
        );
      }, 0) +
      sotningProtokollAntal +
      kundavtalAntal +
      besiktningPerMapp.ovk +
      besiktningPerMapp.energideklaration +
      besiktningPerMapp.radon +
      hissAntal,
    [huvudmappar, sotningProtokollAntal, kundavtalAntal, besiktningPerMapp, hissAntal],
  );

  function toggleHuvudmapp(huvudId: string) {
    setHuvudmappar((current) => ({
      ...current,
      [huvudId]: { ...current[huvudId], öppen: !current[huvudId].öppen },
    }));
  }

  function toggleUndermapp(huvudId: string, underPath: string) {
    setHuvudmappar((current) => {
      const huvud = current[huvudId];
      const under = huvud.undermappar[underPath];
      return {
        ...current,
        [huvudId]: {
          ...huvud,
          undermappar: {
            ...huvud.undermappar,
            [underPath]: { ...under, öppen: !under.öppen },
          },
        },
      };
    });
  }

  async function läggTillDokument(
    huvudId: string,
    underPath: string,
    fil: File,
    onProgress?: (procent: number) => void,
  ): Promise<FilUppladdningsResultat> {
    const befintliga = huvudmappar[huvudId]?.undermappar[underPath]?.dokument ?? [];
    if (!bekraftaOmDubblett(befintliga, fil.name)) {
      setPågåendeUppladdning(null);
      return { ok: false, fel: `${fil.name} finns redan i mappen och laddades inte upp igen.` };
    }
    const sparat = await laddaUppBibliotekFil(fil, onProgress);
    if (!sparat.ok) return sparat;
    const delad = sparat.fil;
    const idag = new Date().toLocaleDateString("sv-SE");
    setHuvudmappar((current) => {
      const huvud = current[huvudId];
      const under = huvud?.undermappar[underPath];
      if (!huvud || !under) return current;
      return {
        ...current,
        [huvudId]: {
          ...huvud,
          undermappar: {
            ...huvud.undermappar,
            [underPath]: {
              ...under,
              dokument: [
                ...under.dokument,
                { id: skapaForeningsDokumentId(), filnamn: fil.name, uppladdad: idag, fil: delad },
              ],
            },
          },
        },
      };
    });
    setPågåendeUppladdning(null);
    window.dispatchEvent(new CustomEvent(BESIKTNING_UPPHANDLING_EVENT));
    return { ok: true };
  }

  function taBortDokument(
    huvudId: string,
    underPath: string,
    dokument: UppladdatDokument,
  ) {
    if (!window.confirm(`Ta bort ${dokument.filnamn}?`)) return;
    const dokumentId = dokument.id;
    taBortBibliotekFil(dokument);
    if (dokument.fil) slappDeladFil(dokument.fil, dokumentId);
    setHuvudmappar((current) => {
      const huvud = current[huvudId];
      const under = huvud.undermappar[underPath];
      return {
        ...current,
        [huvudId]: {
          ...huvud,
          undermappar: {
            ...huvud.undermappar,
            [underPath]: {
              ...under,
              dokument: under.dokument.filter((d) => d.id !== dokumentId),
            },
          },
        },
      };
    });
    window.dispatchEvent(new CustomEvent(BESIKTNING_UPPHANDLING_EVENT));
  }

  function antalDokumentHuvud(huvudId: string, huvud: HuvudmappState): number {
    const summa = Object.values(huvud.undermappar).reduce(
      (sum, u) => sum + u.dokument.length,
      0,
    );
    const medKundavtal =
      huvudId === "styrelse-stadgar" ? summa + kundavtalAntal : summa;
    const medSotning =
      huvudId === "ventilation" ? medKundavtal + sotningProtokollAntal : medKundavtal;
    if (huvudId === "ventilation") {
      return medSotning + besiktningPerMapp.ovk;
    }
    if (huvudId === "tioarskontroller") {
      return (
        medSotning +
        besiktningPerMapp.energideklaration +
        besiktningPerMapp.radon
      );
    }
    if (huvudId === "hiss") return medSotning + hissAntal;
    return medSotning;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted">
        {antalForeningsHuvudmappar} huvudmappar med undermappar där dokument laddas upp.
        Börja med{" "}
        <strong className="font-medium text-foreground">Styrelse Arkiv</strong>{" "}
        — övriga huvudmappar fylls på när strukturen är godkänd.
      </p>
      <p className="text-xs text-muted">
        Totalt {totaltDokument} dokument i biblioteket.
      </p>

      <UtlamnadeNycklarOversikt variant="kompakt" />

      <ul className="space-y-4">
        {foreningsHuvudmappar.map((huvud) => (
          <HuvudmappRad
            key={huvud.id}
            huvud={huvud}
            state={huvudmappar[huvud.id]}
            antalDokument={antalDokumentHuvud(huvud.id, huvudmappar[huvud.id])}
            pågåendeUppladdning={pågåendeUppladdning}
            onToggleHuvud={() => toggleHuvudmapp(huvud.id)}
            onToggleUnder={(underPath) => toggleUndermapp(huvud.id, underPath)}
            onVisaUppladdning={(underPath) =>
              setPågåendeUppladdning(undermappNyckel(huvud.id, underPath))
            }
            onAvbrytUppladdning={() => setPågåendeUppladdning(null)}
            onUpload={(underPath, fil, onProgress) =>
              läggTillDokument(huvud.id, underPath, fil, onProgress)
            }
            onOppnaFil={(dok) => void oppnaFilIFlik(() => hamtaBibliotekFilUrl(dok))}
            onTaBort={(underPath, dok) =>
              taBortDokument(huvud.id, underPath, dok)
            }
            sotningProtokollAntal={sotningProtokollAntal}
            onSotningProtokollAntal={onSotningProtokollAntal}
            nyckelKvittenserAntal={nyckelKvittenserAntal}
            utlamnadeNycklarAntal={utlamnadeNycklarAntal}
          />
        ))}
      </ul>
    </div>
  );
}

type HuvudmappRadProps = {
  huvud: ForeningsHuvudmapp;
  state: HuvudmappState;
  antalDokument: number;
  pågåendeUppladdning: string | null;
  onToggleHuvud: () => void;
  onToggleUnder: (underPath: string) => void;
  onVisaUppladdning: (underPath: string) => void;
  onAvbrytUppladdning: () => void;
  onUpload: UppladdningsHandler;
  onTaBort: (underPath: string, dokument: UppladdatDokument) => void;
  onOppnaFil: (dokument: UppladdatDokument) => void;
  sotningProtokollAntal: number;
  onSotningProtokollAntal: (antal: number) => void;
  nyckelKvittenserAntal: number;
  utlamnadeNycklarAntal: number;
};

function HuvudmappRad({
  huvud,
  state,
  antalDokument,
  pågåendeUppladdning,
  onToggleHuvud,
  onToggleUnder,
  onVisaUppladdning,
  onAvbrytUppladdning,
  onUpload,
  onTaBort,
  onOppnaFil,
  sotningProtokollAntal,
  onSotningProtokollAntal,
  nyckelKvittenserAntal,
  utlamnadeNycklarAntal,
}: HuvudmappRadProps) {
  const antalUndermappar = huvud.undermappar.length;

  return (
    <li className="rounded-2xl border border-border bg-surface shadow-sm">
      <button
        type="button"
        onClick={onToggleHuvud}
        className="flex w-full items-start gap-3 px-4 py-4 text-left sm:px-6"
        aria-expanded={state.öppen}
      >
        <span
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white"
          aria-hidden
        >
          <OppnaStangIkon oppen={state.öppen} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold text-foreground">
            {huvud.titel}
          </span>
          <span className="mt-1 block text-sm text-muted">{huvud.beskrivning}</span>
          <span className="mt-2 block text-xs text-muted">
            {antalUndermappar} undermappar
            {antalDokument > 0 && (
              <span className="ml-2 rounded-full bg-[#eef6f0] px-2 py-0.5 font-medium text-primary-dark">
                {antalDokument} dokument
              </span>
            )}
            {huvud.id === "styrelse-stadgar" && nyckelKvittenserAntal > 0 && (
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary-dark">
                {nyckelKvittenserAntal} kvittenser
              </span>
            )}
            {huvud.id === "styrelse-stadgar" && utlamnadeNycklarAntal > 0 && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-950">
                {utlamnadeNycklarAntal} nycklar ute
              </span>
            )}
          </span>
        </span>
      </button>

      {state.öppen && huvud.id === "hiss" ? (
        <div className="border-t border-border px-3 pt-1 sm:px-5">
          <HissUpphandlingPanel />
        </div>
      ) : null}

      {state.öppen && (
        <ul
          className={`space-y-2 px-3 py-4 sm:px-5 ${huvud.id === "hiss" ? "" : "border-t border-border"}`}
        >
          {huvud.undermappar.map((under) => (
            <UndermappRad
              key={under.id}
              huvudId={huvud.id}
              under={under}
              underPath={under.id}
              state={state.undermappar[under.id] ?? { öppen: false, dokument: [] }}
              nested={0}
              undermapparState={state.undermappar}
              visarUppladdning={
                pågåendeUppladdning === undermappNyckel(huvud.id, under.id)
              }
              pågåendeUppladdning={pågåendeUppladdning}
              onToggle={(path) => onToggleUnder(path)}
              onVisaUppladdning={(path) => onVisaUppladdning(path)}
              onAvbrytUppladdning={onAvbrytUppladdning}
              onUpload={onUpload}
              onTaBort={onTaBort}
              onOppnaFil={onOppnaFil}
              sotningProtokollAntal={sotningProtokollAntal}
              onSotningProtokollAntal={onSotningProtokollAntal}
              nyckelKvittenserAntal={nyckelKvittenserAntal}
              utlamnadeNycklarAntal={utlamnadeNycklarAntal}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

type UndermappRadProps = {
  huvudId: string;
  under: ForeningsUndermapp;
  underPath: string;
  state: UndermappState;
  nested: number;
  undermapparState: Record<string, UndermappState>;
  visarUppladdning: boolean;
  pågåendeUppladdning: string | null;
  onToggle: (underPath: string) => void;
  onVisaUppladdning: (underPath: string) => void;
  onAvbrytUppladdning: () => void;
  onUpload: UppladdningsHandler;
  onTaBort: (underPath: string, dokument: UppladdatDokument) => void;
  onOppnaFil: (dokument: UppladdatDokument) => void;
  sotningProtokollAntal: number;
  onSotningProtokollAntal: (antal: number) => void;
  nyckelKvittenserAntal: number;
  utlamnadeNycklarAntal: number;
};

function UndermappRad({
  huvudId,
  under,
  underPath,
  state,
  nested,
  undermapparState,
  visarUppladdning,
  pågåendeUppladdning,
  onToggle,
  onVisaUppladdning,
  onAvbrytUppladdning,
  onUpload,
  onTaBort,
  onOppnaFil,
  sotningProtokollAntal,
  onSotningProtokollAntal,
  nyckelKvittenserAntal,
  utlamnadeNycklarAntal,
}: UndermappRadProps) {
  const barn = under.barn ?? [];
  const ärGrupp = barn.length > 0;
  const ärDynamisk = Boolean(under.dynamiskaUndermappar);
  const ärNyckelKvittenser = Boolean(under.nyckelKvittenser);
  const besiktning = besiktningTjanstForMapp(under.id);
  const visarDokumentLista =
    !ärNyckelKvittenser && !ärDynamisk && !ärGrupp;
  const [besiktningHandlingar, setBesiktningHandlingar] = useState(0);
  const [kundavtal, setKundavtal] = useState<SparatKundavtal | null>(null);

  useEffect(() => {
    if (!besiktning) return;
    const id = besiktning.id;
    function las() {
      setBesiktningHandlingar(antalSparadeBesiktningHandlingar(id));
    }
    las();
    window.addEventListener(BESIKTNING_UPPHANDLING_EVENT, las);
    return () => window.removeEventListener(BESIKTNING_UPPHANDLING_EVENT, las);
  }, [besiktning]);

  useEffect(() => {
    if (under.id !== "avtal") return;
    function las() {
      setKundavtal(lasSparatKundavtal());
    }
    las();
    window.addEventListener(KUNDAVTAL_EVENT, las);
    return () => window.removeEventListener(KUNDAVTAL_EVENT, las);
  }, [under.id]);

  const antalDokumentGrupp = ärNyckelKvittenser
    ? nyckelKvittenserAntal
    : ärDynamisk
      ? sotningProtokollAntal
      : ärGrupp
        ? antalDokumentIUnderträd(underPath, undermapparState) +
          barn.reduce(
            (sum, child) =>
              child.dynamiskaUndermappar ? sum + sotningProtokollAntal : sum,
            0,
          )
        : state.dokument.length +
          (under.id === "avtal" && kundavtal ? 1 : 0) +
          (besiktning ? besiktningHandlingar : 0);

  const paddingVänster = nested > 0 ? { paddingLeft: `${nested * 0.75 + 0.5}rem` } : undefined;

  return (
    <li
      className={`rounded-xl border border-border bg-background/80 ${nested > 0 ? "ml-2 sm:ml-4" : ""}`}
      style={paddingVänster}
    >
      <button
        type="button"
        onClick={() => onToggle(underPath)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left"
        aria-expanded={state.öppen}
      >
        <span
          className={`mt-0.5 flex shrink-0 items-center justify-center rounded-md text-xs ${
            ärGrupp
              ? "h-7 w-7 bg-primary/15 font-semibold text-primary-dark"
              : "h-7 w-7 bg-[#e2f0e6] text-primary-dark"
          }`}
          aria-hidden
        >
          <OppnaStangIkon oppen={state.öppen} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">
            {under.titel}
          </span>
          <span className="mt-0.5 block text-xs text-muted">{under.beskrivning}</span>
          {(antalDokumentGrupp > 0 ||
            (ärNyckelKvittenser && utlamnadeNycklarAntal > 0)) && (
            <span className="mt-1 flex flex-wrap gap-2">
              {ärNyckelKvittenser && antalDokumentGrupp > 0 && (
                <span className="text-xs font-medium text-primary-dark">
                  {antalDokumentGrupp} kvittenser
                </span>
              )}
              {ärNyckelKvittenser && utlamnadeNycklarAntal > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-950">
                  {utlamnadeNycklarAntal} ute
                </span>
              )}
              {!ärNyckelKvittenser && antalDokumentGrupp > 0 && (
                <span className="text-xs font-medium text-primary-dark">
                  {antalDokumentGrupp} dokument
                </span>
              )}
            </span>
          )}
        </span>
      </button>

      {state.öppen && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <p className="text-xs leading-relaxed text-muted">{under.vägledning}</p>

          {besiktning && (
            <BesiktningUpphandlingPanel
              tjanstId={besiktning.id}
              uppladdadeFilnamn={state.dokument.map((dokument) => dokument.filnamn)}
              onLaddaUppProtokollFil={(fil) => onUpload(underPath, fil)}
              onOppnaProtokoll={(filnamn) => {
                const dok = state.dokument.find((d) => d.filnamn === filnamn);
                if (dok) onOppnaFil(dok);
              }}
            />
          )}


          {huvudId === "hiss" && under.id === "besiktning" ? <HissBesiktningPanel /> : null}
          {huvudId === "hiss" && under.id === "service-rapport" ? <HissServicePanel /> : null}
          {huvudId === "hiss" && under.id === "reparationer" ? <HissReparationerPanel /> : null}

          {ärNyckelKvittenser ? (
            <NyckelKvittenserPanel />
          ) : ärDynamisk ? (
            <SotningProtokollMappar onAntalÄndrat={onSotningProtokollAntal} />
          ) : ärGrupp ? (
            <ul className="mt-3 space-y-2">
              {barn.map((child) => {
                const childPath = `${underPath}/${child.id}`;
                return (
                  <UndermappRad
                    key={childPath}
                    huvudId={huvudId}
                    under={child}
                    underPath={childPath}
                    state={
                      undermapparState[childPath] ?? { öppen: false, dokument: [] }
                    }
                    nested={nested + 1}
                    undermapparState={undermapparState}
                    visarUppladdning={
                      pågåendeUppladdning === undermappNyckel(huvudId, childPath)
                    }
                    pågåendeUppladdning={pågåendeUppladdning}
                    onToggle={onToggle}
                    onVisaUppladdning={onVisaUppladdning}
                    onAvbrytUppladdning={onAvbrytUppladdning}
                    onUpload={onUpload}
                    onTaBort={onTaBort}
                    onOppnaFil={onOppnaFil}
                    sotningProtokollAntal={sotningProtokollAntal}
                    onSotningProtokollAntal={onSotningProtokollAntal}
                    nyckelKvittenserAntal={nyckelKvittenserAntal}
                    utlamnadeNycklarAntal={utlamnadeNycklarAntal}
                  />
                );
              })}
            </ul>
          ) : null}

          {visarDokumentLista ? (
            <>
              <p className="mt-3 text-xs font-medium text-foreground">
                Dokument i mappen
              </p>
              {state.dokument.length > 0 || (under.id === "avtal" && kundavtal) ? (
                <ul className="mt-2 space-y-2">
                  {under.id === "avtal" && kundavtal ? (
                    <KundavtalRad avtal={kundavtal} />
                  ) : null}
                  {state.dokument.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {doc.filnamn}
                        </p>
                        <p className="text-xs text-muted">
                          Uppladdad {doc.uppladdad}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onOppnaFil(doc)}
                          className="rounded-lg border border-primary/40 px-3 py-1 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
                        >
                          Öppna
                        </button>
                        <button
                          type="button"
                          onClick={() => onTaBort(underPath, doc)}
                          className="rounded-lg border border-border px-3 py-1 text-xs text-muted"
                        >
                          Ta bort
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-muted">Inga dokument ännu.</p>
              )}

              <div className="mt-3">
                {!visarUppladdning ? (
                  <button
                    type="button"
                    onClick={() => onVisaUppladdning(underPath)}
                    className="rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
                  >
                    Ladda upp dokument
                  </button>
                ) : (
                  <FilUppladdningsRuta
                    onSpara={(fil, onProgress) => onUpload(underPath, fil, onProgress)}
                    onAvbryt={onAvbrytUppladdning}
                  />
                )}
              </div>
            </>
          ) : null}
        </div>
      )}
    </li>
  );
}

function KundavtalRad({ avtal }: { avtal: SparatKundavtal }) {
  const datum = avtal.uppdaterad
    ? new Date(avtal.uppdaterad).toLocaleDateString("sv-SE")
    : "";
  const mejl = avtal.undertecknare
    .map((p) => p.epost)
    .filter(Boolean)
    .join(" och ");

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/30 bg-[#f7fbf8] px-3 py-2">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">
          Kundavtal {avtal.foreningsNamn}
        </p>
        <p className="text-xs text-muted">
          {avtal.status === "signerat" ? "Signerat med BankID" : "Utkast"}
          {datum ? ` · ${datum}` : ""}
          {mejl ? ` · mejlat till ${mejl}` : ""}
        </p>
      </div>
      <button
        type="button"
        onClick={() =>
          oppnaTextSomPdf(`Kundavtal ${avtal.foreningsNamn}`, avtal.text)
        }
        className="rounded-lg bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary-dark"
      >
        Öppna som PDF
      </button>
    </li>
  );
}
