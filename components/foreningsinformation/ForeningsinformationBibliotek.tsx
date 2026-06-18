"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { OppnaStangIkon } from "@/components/OppnaStangKnapp";
import { DemoFilSparningNotis } from "@/components/DemoFilSparningNotis";
import { NyckelKvittenserPanel } from "@/components/foreningsinformation/NyckelKvittenserPanel";
import {
  antalUtlamnadeNycklar,
  lasNyckelKvittenser,
} from "@/components/foreningsinformation/nyckel-kvittenser";
import { UtlamnadeNycklarOversikt } from "@/components/foreningsinformation/UtlamnadeNycklarOversikt";
import { SotningProtokollMappar } from "@/components/foreningsinformation/SotningProtokollMappar";
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

type UppladdatDokument = {
  id: string;
  filnamn: string;
  uppladdad: string;
};

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
        öppen: huvud.id === "styrelse-stadgar",
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

export function ForeningsinformationBibliotek() {
  const [huvudmappar, setHuvudmappar] = useState(initialState);
  const [pågåendeUppladdning, setPågåendeUppladdning] = useState<string | null>(
    null,
  );
  const [sotningProtokollAntal, setSotningProtokollAntal] = useState(0);
  const [nyckelKvittenserAntal, setNyckelKvittenserAntal] = useState(0);
  const [utlamnadeNycklarAntal, setUtlamnadeNycklarAntal] = useState(0);

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

  const totaltDokument = useMemo(
    () =>
      allaUndermappNycklar().reduce((sum, key) => {
        const slash = key.indexOf("/");
        const huvudId = key.slice(0, slash);
        const underPath = key.slice(slash + 1);
        return (
          sum + (huvudmappar[huvudId]?.undermappar[underPath]?.dokument.length ?? 0)
        );
      }, 0) + sotningProtokollAntal,
    [huvudmappar, sotningProtokollAntal],
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

  function läggTillDokument(huvudId: string, underPath: string, fil: File | null) {
    if (!fil) return;
    const dokument: UppladdatDokument = {
      id: skapaForeningsDokumentId(),
      filnamn: fil.name,
      uppladdad: new Date().toLocaleDateString("sv-SE"),
    };
    setHuvudmappar((current) => {
      const huvud = current[huvudId];
      const under = huvud.undermappar[underPath];
      return {
        ...current,
        [huvudId]: {
          ...huvud,
          undermappar: {
            ...huvud.undermappar,
            [underPath]: { ...under, dokument: [...under.dokument, dokument] },
          },
        },
      };
    });
    setPågåendeUppladdning(null);
  }

  function taBortDokument(
    huvudId: string,
    underPath: string,
    dokumentId: string,
  ) {
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
  }

  function antalDokumentHuvud(huvudId: string, huvud: HuvudmappState): number {
    const summa = Object.values(huvud.undermappar).reduce(
      (sum, u) => sum + u.dokument.length,
      0,
    );
    return huvudId === "ventilation" ? summa + sotningProtokollAntal : summa;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted">
        {antalForeningsHuvudmappar} huvudmappar med undermappar där dokument laddas upp.
        Börja med{" "}
        <strong className="font-medium text-foreground">Styrelse och stadgar</strong>{" "}
        — övriga huvudmappar fylls på när strukturen är godkänd.
      </p>
      <p className="text-xs text-muted">
        Totalt {totaltDokument} dokument i biblioteket (demo).
      </p>
      <DemoFilSparningNotis />

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
            onUpload={(underPath, fil) =>
              läggTillDokument(huvud.id, underPath, fil)
            }
            onTaBort={(underPath, docId) =>
              taBortDokument(huvud.id, underPath, docId)
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
  onUpload: (underPath: string, fil: File | null) => void;
  onTaBort: (underPath: string, dokumentId: string) => void;
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
  onUpload,
  onTaBort,
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

      {state.öppen && (
        <ul className="space-y-2 border-t border-border px-3 py-4 sm:px-5">
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
              onUpload={(path, fil) => onUpload(path, fil)}
              onTaBort={(path, docId) => onTaBort(path, docId)}
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
  onUpload: (underPath: string, fil: File | null) => void;
  onTaBort: (underPath: string, dokumentId: string) => void;
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
  onUpload,
  onTaBort,
  sotningProtokollAntal,
  onSotningProtokollAntal,
  nyckelKvittenserAntal,
  utlamnadeNycklarAntal,
}: UndermappRadProps) {
  const barn = under.barn ?? [];
  const ärGrupp = barn.length > 0;
  const ärDynamisk = Boolean(under.dynamiskaUndermappar);
  const ärNyckelKvittenser = Boolean(under.nyckelKvittenser);

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
        : state.dokument.length;

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
                    onUpload={onUpload}
                    onTaBort={onTaBort}
                    sotningProtokollAntal={sotningProtokollAntal}
                    onSotningProtokollAntal={onSotningProtokollAntal}
                    nyckelKvittenserAntal={nyckelKvittenserAntal}
                    utlamnadeNycklarAntal={utlamnadeNycklarAntal}
                  />
                );
              })}
            </ul>
          ) : (
            <>
              {state.dokument.length > 0 ? (
                <ul className="mt-3 space-y-2">
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
                      <button
                        type="button"
                        onClick={() => onTaBort(underPath, doc.id)}
                        className="rounded-lg border border-border px-3 py-1 text-xs text-muted"
                      >
                        Ta bort
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs text-muted">Inga dokument ännu.</p>
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
                  <label className="inline-flex cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
                    Välj fil
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,image/*,application/pdf"
                      className="sr-only"
                      onChange={(e) => onUpload(underPath, e.target.files?.[0] ?? null)}
                    />
                  </label>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </li>
  );
}
