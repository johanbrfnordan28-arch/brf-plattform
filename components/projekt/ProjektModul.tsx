"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { OppnaStangIkon, OppnaStangKnapp } from "@/components/OppnaStangKnapp";
import { DemoFilSparningNotis } from "@/components/DemoFilSparningNotis";
import { safeSetLocalStorage } from "@/lib/localStorage";
import { ProjektChecklista } from "@/components/projekt/ProjektChecklista";
import { ProjektGarantibesiktningPanel } from "@/components/projekt/ProjektGarantibesiktningPanel";
import { ProjektTidsplanPanel } from "@/components/projekt/ProjektTidsplanPanel";
import { TidsplanBibliotekPanel } from "@/components/projekt/TidsplanBibliotekPanel";
import { tidsplanMilstolparTillArshjul } from "@/components/projekt/tidsplan-arshjul";
import {
  normaliseraProjektTidsplan,
  tidsplanHarInnehall,
} from "@/components/projekt/tidsplan";
import {
  arshjulStorageKey,
  normaliseraHandelse,
  type ArshjulHandelse,
} from "@/components/arshjul/arshjul";
import {
  garantiBehöverUppmärksamhet,
  hamtaPrimarGarantiPåminnelse,
  idagIso,
  normaliseraGarantibesiktning,
} from "@/components/projekt/garantibesiktning";
import {
  beraknaChecklistaFramsteg,
  checklistaPunktId,
  hamtaChecklistaKeysForMapp,
  normaliseraKlaraChecklistaPunkter,
} from "@/components/projekt/projekt-checklistor";
import {
  normaliseraProjekt,
  projektStorageKey,
  skapaDokumentId,
  skapaProjektId,
  skapaTomtProjekt,
  sorteraProjekt,
  standardUndermappar,
  type Projekt,
  type ProjektDokument,
  type ProjektStorlek,
  type UndermappDefinition,
} from "@/components/projekt/projekt";

function lasProjekt(): Projekt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(projektStorageKey());
    return raw
      ? (JSON.parse(raw) as Projekt[]).map((p) => normaliseraProjekt(p))
      : [];
  } catch {
    return [];
  }
}

function sparaProjekt(lista: Projekt[]): boolean {
  if (typeof window === "undefined") return false;
  return safeSetLocalStorage(projektStorageKey(), JSON.stringify(lista)).ok;
}

function mappElementId(projektId: string, mappId: string): string {
  return `projekt-mapp-${projektId}-${mappId}`;
}

export function ProjektModul() {
  const [projekt, setProjekt] = useState<Projekt[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [skapaOppen, setSkapaOppen] = useState(false);
  const [nyTitel, setNyTitel] = useState("");
  const [nyAr, setNyAr] = useState(String(new Date().getFullYear()));
  const [nyBeskrivning, setNyBeskrivning] = useState("");
  const [nyStorlek, setNyStorlek] = useState<ProjektStorlek>("litet");
  const [nyKlaraChecklista, setNyKlaraChecklista] = useState<string[]>([]);
  const [pågåendeUppladdning, setPågåendeUppladdning] = useState<string | null>(null);
  const [nyMappNamn, setNyMappNamn] = useState<Record<string, string>>({});
  const [fokuseradMapp, setFokuseradMapp] = useState<string | null>(null);
  const [arshjulMeddelande, setArshjulMeddelande] = useState<string | null>(null);

  const standardMappEtiketter = useMemo(
    () =>
      Object.fromEntries(standardUndermappar.map((m) => [m.id, m.titel])),
    [],
  );

  useEffect(() => {
    setProjekt(lasProjekt());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) sparaProjekt(projekt);
  }, [projekt, hydrated]);

  const sorteradLista = useMemo(() => sorteraProjekt(projekt), [projekt]);

  const nyChecklistaFramsteg = useMemo(
    () => beraknaChecklistaFramsteg(nyStorlek, nyKlaraChecklista),
    [nyStorlek, nyKlaraChecklista],
  );

  function uppdateraProjekt(id: string, patch: Partial<Projekt>) {
    setProjekt((current) =>
      current.map((p) => {
        if (p.id !== id) return p;
        const merged = { ...p, ...patch };
        return normaliseraProjekt(merged);
      }),
    );
  }

  function läggTillKlaraPunkter(
    befintliga: string[],
    nya: string[],
  ): string[] {
    return [...new Set([...befintliga, ...nya])];
  }

  function toggleChecklistaPunkt(projektId: string, punktKey: string) {
    setProjekt((current) =>
      current.map((p) => {
        if (p.id !== projektId) return p;
        const set = new Set(p.klaraChecklistaPunkter);
        const varKlar = set.has(punktKey);
        if (varKlar) set.delete(punktKey);
        else set.add(punktKey);

        let garantibesiktning = p.garantibesiktning;
        if (
          punktKey === checklistaPunktId("avslut", "slutbesiktning") &&
          !varKlar &&
          !garantibesiktning.slutbesiktningDatum
        ) {
          garantibesiktning = {
            ...garantibesiktning,
            slutbesiktningDatum: idagIso(),
            avfärdadePåminnelser: [],
          };
        }

        return normaliseraProjekt({
          ...p,
          klaraChecklistaPunkter: [...set],
          garantibesiktning,
        });
      }),
    );
  }

  function uppdateraGarantibesiktning(
    projektId: string,
    garantibesiktning: ReturnType<typeof normaliseraGarantibesiktning>,
  ) {
    uppdateraProjekt(projektId, {
      garantibesiktning: normaliseraGarantibesiktning(garantibesiktning),
    });
  }

  function uppdateraTidsplan(
    projektId: string,
    tidsplan: ReturnType<typeof normaliseraProjektTidsplan>,
  ) {
    uppdateraProjekt(projektId, {
      tidsplan: normaliseraProjektTidsplan(tidsplan),
    });
  }

  function godkannTidsplanChecklista(projektId: string) {
    const key = checklistaPunktId("start", "tidsplan");
    setProjekt((current) =>
      current.map((p) => {
        if (p.id !== projektId) return p;
        return normaliseraProjekt({
          ...p,
          klaraChecklistaPunkter: läggTillKlaraPunkter(p.klaraChecklistaPunkter, [key]),
        });
      }),
    );
  }

  function importeraProjektTidsplanTillArshjul(projektId: string) {
    const p = projekt.find((x) => x.id === projektId);
    if (!p || typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(arshjulStorageKey());
      const befintliga = raw
        ? (JSON.parse(raw) as ArshjulHandelse[]).map(normaliseraHandelse)
        : [];
      const harId = new Set(befintliga.map((h) => h.externId).filter(Boolean));
      const nya = tidsplanMilstolparTillArshjul(p).filter(
        (h) => !harId.has(h.externId),
      );
      if (nya.length === 0) {
        setArshjulMeddelande("Inga nya milstolpar att importera — redan i årshjulet.");
        return;
      }
      localStorage.setItem(
        arshjulStorageKey(),
        JSON.stringify([...befintliga, ...nya]),
      );
      setArshjulMeddelande(
        `${nya.length} milstolpe(r) från «${p.titel}» importerades till årshjulet.`,
      );
    } catch {
      setArshjulMeddelande("Kunde inte spara till årshjulet.");
    }
  }

  function bytProjektStorlek(projektId: string, storlek: ProjektStorlek) {
    setProjekt((current) =>
      current.map((p) => {
        if (p.id !== projektId) return p;
        return normaliseraProjekt({
          ...p,
          storlek,
          klaraChecklistaPunkter: p.klaraChecklistaPunkter,
        });
      }),
    );
  }

  const öppnaMappOchBocka = useCallback(
    (projektId: string, mappId: string, punktKey: string) => {
      setFokuseradMapp(`${projektId}:${mappId}`);
      setProjekt((current) =>
        current.map((p) => {
          if (p.id !== projektId) return p;
          const mapp = p.mappar[mappId];
          if (!mapp) return { ...p, öppen: true };
          return normaliseraProjekt({
            ...p,
            öppen: true,
            klaraChecklistaPunkter: läggTillKlaraPunkter(p.klaraChecklistaPunkter, [
              punktKey,
            ]),
            mappar: {
              ...p.mappar,
              [mappId]: { ...mapp, öppen: true },
            },
          });
        }),
      );
      requestAnimationFrame(() => {
        document
          .getElementById(mappElementId(projektId, mappId))
          ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
      window.setTimeout(() => setFokuseradMapp(null), 2500);
    },
    [],
  );

  function toggleNyChecklistaPunkt(punktKey: string) {
    setNyKlaraChecklista((current) => {
      const set = new Set(current);
      if (set.has(punktKey)) set.delete(punktKey);
      else set.add(punktKey);
      return normaliseraKlaraChecklistaPunkter(nyStorlek, [...set]);
    });
  }

  function öppnaMappVidSkapa(mappId: string, punktKey: string) {
    setNyKlaraChecklista((current) =>
      normaliseraKlaraChecklistaPunkter(
        nyStorlek,
        läggTillKlaraPunkter(current, [punktKey]),
      ),
    );
  }

  function bytNyStorlek(storlek: ProjektStorlek) {
    setNyStorlek(storlek);
    setNyKlaraChecklista((current) =>
      normaliseraKlaraChecklistaPunkter(storlek, current),
    );
  }

  function skapaProjekt(event: React.FormEvent) {
    event.preventDefault();
    const ar = Number.parseInt(nyAr, 10);
    if (!nyTitel.trim() || Number.isNaN(ar)) return;

    const nytt = skapaTomtProjekt({
      titel: nyTitel,
      ar,
      beskrivning: nyBeskrivning,
      storlek: nyStorlek,
      klaraChecklistaPunkter: normaliseraKlaraChecklistaPunkter(
        nyStorlek,
        nyKlaraChecklista,
      ),
    });
    setProjekt((current) => sorteraProjekt([nytt, ...current]));
    setNyTitel("");
    setNyAr(String(new Date().getFullYear()));
    setNyBeskrivning("");
    setNyStorlek("litet");
    setNyKlaraChecklista([]);
    setSkapaOppen(false);
  }

  function taBortProjekt(id: string) {
    setProjekt((current) => current.filter((p) => p.id !== id));
  }

  function toggleProjekt(id: string) {
    setProjekt((current) =>
      current.map((p) => (p.id === id ? { ...p, öppen: !p.öppen } : p)),
    );
  }

  function toggleUndermapp(projektId: string, mappId: string) {
    setProjekt((current) =>
      current.map((p) => {
        if (p.id !== projektId) return p;
        const mapp = p.mappar[mappId];
        if (!mapp) return p;
        return {
          ...p,
          mappar: {
            ...p.mappar,
            [mappId]: { ...mapp, öppen: !mapp.öppen },
          },
        };
      }),
    );
  }

  function läggTillDokument(projektId: string, mappId: string, fil: File | null) {
    if (!fil) return;
    const dokument: ProjektDokument = {
      id: skapaDokumentId(),
      filnamn: fil.name,
      uppladdad: new Date().toLocaleDateString("sv-SE"),
    };
    setProjekt((current) =>
      current.map((p) => {
        if (p.id !== projektId) return p;
        const mapp = p.mappar[mappId];
        if (!mapp) return p;
        let checklistaKeys = hamtaChecklistaKeysForMapp(p.storlek, mappId);
        let garantibesiktning = p.garantibesiktning;
        if (mappId === "besiktningar" && !garantibesiktning.slutbesiktningDatum) {
          garantibesiktning = {
            ...garantibesiktning,
            slutbesiktningDatum: idagIso(),
            avfärdadePåminnelser: [],
          };
        }
        if (mappId === "garantibesiktning") {
          garantibesiktning = {
            ...garantibesiktning,
            utförd: true,
            utfördDatum: garantibesiktning.utfördDatum ?? idagIso(),
          };
        }
        const tidsplan = p.tidsplan;
        if (mappId === "tidsplan" && tidsplan.godkandAvStyrelsen) {
          checklistaKeys = läggTillKlaraPunkter(checklistaKeys, [
            checklistaPunktId("start", "tidsplan"),
          ]);
        }
        return normaliseraProjekt({
          ...p,
          klaraChecklistaPunkter: läggTillKlaraPunkter(
            p.klaraChecklistaPunkter,
            checklistaKeys,
          ),
          garantibesiktning,
          tidsplan,
          mappar: {
            ...p.mappar,
            [mappId]: { ...mapp, dokument: [...mapp.dokument, dokument] },
          },
        });
      }),
    );
    setPågåendeUppladdning(null);
  }

  function taBortDokument(projektId: string, mappId: string, dokumentId: string) {
    setProjekt((current) =>
      current.map((p) => {
        if (p.id !== projektId) return p;
        const mapp = p.mappar[mappId];
        if (!mapp) return p;
        return {
          ...p,
          mappar: {
            ...p.mappar,
            [mappId]: {
              ...mapp,
              dokument: mapp.dokument.filter((d) => d.id !== dokumentId),
            },
          },
        };
      }),
    );
  }

  function läggTillUndermapp(projektId: string) {
    const namn = (nyMappNamn[projektId] ?? "").trim();
    if (!namn) return;
    const id = `egen-${skapaProjektId()}`;
    const ny: UndermappDefinition = {
      id,
      titel: namn,
      beskrivning: "Egen undermapp tillagda av styrelsen.",
      ärStandard: false,
    };
    setProjekt((current) =>
      current.map((p) => {
        if (p.id !== projektId) return p;
        return {
          ...p,
          mappDefinitioner: [...p.mappDefinitioner, ny],
          mappar: { ...p.mappar, [id]: { öppen: false, dokument: [] } },
        };
      }),
    );
    setNyMappNamn((current) => ({ ...current, [projektId]: "" }));
  }

  function taBortUndermapp(projektId: string, mappId: string) {
    setProjekt((current) =>
      current.map((p) => {
        if (p.id !== projektId) return p;
        const def = p.mappDefinitioner.find((m) => m.id === mappId);
        if (!def || def.ärStandard) return p;
        const { [mappId]: _removed, ...restMappar } = p.mappar;
        return {
          ...p,
          mappDefinitioner: p.mappDefinitioner.filter((m) => m.id !== mappId),
          mappar: restMappar,
        };
      }),
    );
  }

  function mappEtiketterForProjekt(p: Projekt): Record<string, string> {
    return {
      ...standardMappEtiketter,
      ...Object.fromEntries(p.mappDefinitioner.map((m) => [m.id, m.titel])),
    };
  }

  if (!hydrated) {
    return <p className="text-sm text-muted">Laddar projekt…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="max-w-2xl space-y-2">
        <p className="text-sm leading-relaxed text-muted">
          Skapa projekt via rullgardinen nedan. Checklistan kopplar varje krav till en
          undermapp — länken öppnar mappen och bockar av punkten. Uppladdade dokument
          bockar också av automatiskt.
        </p>
        <DemoFilSparningNotis />
      </div>

      {arshjulMeddelande && (
        <p className="rounded-lg border border-primary/30 bg-[#eef6f0] px-3 py-2 text-sm text-primary-dark">
          {arshjulMeddelande}
        </p>
      )}

      <TidsplanBibliotekPanel />

      <details
        className="rounded-2xl border border-primary/40 bg-[#eef6f0] shadow-sm"
        open={skapaOppen || undefined}
        onToggle={(e) => setSkapaOppen((e.target as HTMLDetailsElement).open)}
      >
        <summary className="cursor-pointer list-none px-5 py-4 [&::-webkit-details-marker]:hidden">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-base font-semibold text-primary-dark">
              + Skapa nytt projekt
            </span>
            <span className="text-sm text-muted">
              {skapaOppen ? "Dölj ▲" : "Visa checklista och formulär ▼"}
            </span>
          </div>
        </summary>

        <div className="space-y-5 border-t border-primary/20 px-5 pb-5 pt-2">
          <ProjektChecklista
            storlek={nyStorlek}
            klaraPunkter={nyKlaraChecklista}
            onTogglePunkt={toggleNyChecklistaPunkt}
            onStorlekChange={bytNyStorlek}
            visaStorlekVal
            defaultÖppen
            inbäddad
            mappEtiketter={standardMappEtiketter}
            onÖppnaMapp={öppnaMappVidSkapa}
          />

          <form onSubmit={skapaProjekt} className="rounded-xl border border-border bg-white p-5">
            <p className="text-sm font-semibold text-foreground">Projektuppgifter</p>
            <p className="mt-1 text-xs text-muted">
              Bockade punkter i checklistan ovan följer med när du skapar projektet.
              ({nyChecklistaFramsteg.start.klara + nyChecklistaFramsteg.avslut.klara}{" "}
              av{" "}
              {nyChecklistaFramsteg.start.totalt + nyChecklistaFramsteg.avslut.totalt}{" "}
              förvalda)
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-foreground">Projektnamn</span>
                <input
                  required
                  value={nyTitel}
                  onChange={(e) => setNyTitel(e.target.value)}
                  placeholder="t.ex. Stambyte, Fasadrenovering"
                  className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-foreground">År</span>
                <input
                  type="number"
                  required
                  min={1950}
                  max={2100}
                  value={nyAr}
                  onChange={(e) => setNyAr(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-foreground">
                  Beskrivning av projektet
                </span>
                <textarea
                  value={nyBeskrivning}
                  onChange={(e) => setNyBeskrivning(e.target.value)}
                  rows={3}
                  placeholder="Kort beskrivning av omfattning, status och ansvariga…"
                  className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </label>
            </div>
            <button
              type="submit"
              className="mt-4 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Skapa projekt
            </button>
          </form>
        </div>
      </details>

      {sorteradLista.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
          Inga projekt ännu. Öppna rullgardinen ovan, bocka av det som redan finns och
          skapa projektet — eller skapa tomt och fyll i undermapparna efterhand.
        </p>
      ) : (
        <ul className="space-y-4">
          {sorteradLista.map((p) => {
            const checklista = beraknaChecklistaFramsteg(
              p.storlek,
              p.klaraChecklistaPunkter,
            );
            const mappEtiketter = mappEtiketterForProjekt(p);
            const garantiPåminnelse = hamtaPrimarGarantiPåminnelse(p.garantibesiktning);
            const visaGarantiVarning = garantiBehöverUppmärksamhet(p.garantibesiktning);
            return (
              <li
                key={p.id}
                className="rounded-2xl border border-border bg-surface shadow-sm"
              >
                <div className="border-b border-border px-4 py-4 sm:px-6">
                  <button
                    type="button"
                    onClick={() => toggleProjekt(p.id)}
                    className="flex w-full items-start gap-3 text-left"
                  >
                    <span
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e2f0e6] text-sm font-bold text-primary-dark"
                      aria-hidden
                    >
                      {p.ar}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-lg font-semibold text-foreground">
                        {p.titel}
                      </span>
                      <span className="mt-1 block text-sm text-muted">
                        {p.beskrivning || "Ingen beskrivning"}
                      </span>
                      <span className="mt-2 inline-flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-background px-2.5 py-0.5 text-muted">
                          Skapad {p.skapad}
                        </span>
                        <span className="rounded-full bg-background px-2.5 py-0.5 text-muted">
                          {p.storlek === "stort" ? "Större projekt" : "Mindre projekt"}
                        </span>
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-amber-950">
                          Start {checklista.start.klara}/{checklista.start.totalt}
                        </span>
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-amber-950">
                          Avslut {checklista.avslut.klara}/{checklista.avslut.totalt}
                        </span>
                      {p.avslutat && (
                        <span className="rounded-full bg-[#eef6f0] px-2.5 py-0.5 font-medium text-primary-dark">
                          Avslutat
                        </span>
                      )}
                      {visaGarantiVarning && garantiPåminnelse && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-medium text-amber-950">
                          {garantiPåminnelse.rubrik}
                        </span>
                      )}
                      {p.garantibesiktning.utförd && (
                        <span className="rounded-full bg-[#eef6f0] px-2.5 py-0.5 text-primary-dark">
                          Garantibesiktning klar
                        </span>
                      )}
                      {tidsplanHarInnehall(p.tidsplan) && (
                        <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-sky-950">
                          Tidsplan {p.tidsplan.milstolpar.length} st
                        </span>
                      )}
                      </span>
                    </span>
                    <OppnaStangIkon oppen={p.öppen} />
                  </button>
                  {p.öppen && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={p.avslutat}
                          onChange={(e) =>
                            uppdateraProjekt(p.id, { avslutat: e.target.checked })
                          }
                          className="h-4 w-4 rounded border-border text-primary"
                        />
                        Markera som avslutat
                      </label>
                      <button
                        type="button"
                        onClick={() => taBortProjekt(p.id)}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:border-red-300 hover:text-red-700"
                      >
                        Ta bort projekt
                      </button>
                    </div>
                  )}
                </div>

                {p.öppen && (
                  <div className="space-y-3 px-4 py-4 sm:px-6">
                    <ProjektChecklista
                      storlek={p.storlek}
                      klaraPunkter={p.klaraChecklistaPunkter}
                      onTogglePunkt={(key) => toggleChecklistaPunkt(p.id, key)}
                      onStorlekChange={(storlek) => bytProjektStorlek(p.id, storlek)}
                      mappEtiketter={mappEtiketter}
                      onÖppnaMapp={(mappId, punktKey) =>
                        öppnaMappOchBocka(p.id, mappId, punktKey)
                      }
                    />

                    <ProjektTidsplanPanel
                      projekt={p}
                      tidsplan={p.tidsplan}
                      onChange={(tidsplan) => uppdateraTidsplan(p.id, tidsplan)}
                      onGodkand={() => godkannTidsplanChecklista(p.id)}
                      onImporteraArshjul={() => importeraProjektTidsplanTillArshjul(p.id)}
                      onÖppnaMapp={() =>
                        öppnaMappOchBocka(
                          p.id,
                          "tidsplan",
                          checklistaPunktId("start", "tidsplan"),
                        )
                      }
                    />

                    <ProjektGarantibesiktningPanel
                      status={p.garantibesiktning}
                      onChange={(garantibesiktning) =>
                        uppdateraGarantibesiktning(p.id, garantibesiktning)
                      }
                      onÖppnaMapp={(mappId) => {
                        const punktKey =
                          mappId === "garantibesiktning"
                            ? ""
                            : checklistaPunktId("avslut", "slutbesiktning");
                        if (punktKey) öppnaMappOchBocka(p.id, mappId, punktKey);
                        else {
                          setFokuseradMapp(`${p.id}:${mappId}`);
                          setProjekt((current) =>
                            current.map((proj) => {
                              if (proj.id !== p.id) return proj;
                              const mapp = proj.mappar[mappId];
                              if (!mapp) return { ...proj, öppen: true };
                              return {
                                ...proj,
                                öppen: true,
                                mappar: {
                                  ...proj.mappar,
                                  [mappId]: { ...mapp, öppen: true },
                                },
                              };
                            }),
                          );
                          requestAnimationFrame(() => {
                            document
                              .getElementById(mappElementId(p.id, mappId))
                              ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                          });
                        }
                      }}
                    />

                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Undermappar
                    </p>
                    <ul className="space-y-2">
                      {p.mappDefinitioner.map((mapp) => {
                        const state = p.mappar[mapp.id] ?? {
                          öppen: false,
                          dokument: [],
                        };
                        const uploadKey = `${p.id}:${mapp.id}`;
                        const ärFokuserad = fokuseradMapp === `${p.id}:${mapp.id}`;
                        const harChecklistaKoppling =
                          hamtaChecklistaKeysForMapp(p.storlek, mapp.id).length > 0;
                        return (
                          <li
                            key={mapp.id}
                            id={mappElementId(p.id, mapp.id)}
                            className={`rounded-xl border bg-background/60 transition-shadow ${
                              ärFokuserad
                                ? "border-primary ring-2 ring-primary/30"
                                : "border-border"
                            }`}
                          >
                            <div className="flex items-start gap-2 px-3 py-3 sm:px-4">
                              <button
                                type="button"
                                onClick={() => toggleUndermapp(p.id, mapp.id)}
                                className="min-w-0 flex-1 text-left"
                              >
                                <span className="font-medium text-foreground">
                                  {mapp.titel}
                                </span>
                                {harChecklistaKoppling && (
                                  <span className="ml-2 rounded bg-[#eef6f0] px-1.5 py-0.5 text-[10px] font-medium text-primary-dark">
                                    Checklista
                                  </span>
                                )}
                                <span className="mt-0.5 block text-xs text-muted">
                                  {mapp.beskrivning}
                                </span>
                                {state.dokument.length > 0 && (
                                  <span className="mt-1 inline-block rounded-full bg-[#eef6f0] px-2 py-0.5 text-xs text-primary-dark">
                                    {state.dokument.length} dokument
                                  </span>
                                )}
                              </button>
                              {!mapp.ärStandard && (
                                <button
                                  type="button"
                                  onClick={() => taBortUndermapp(p.id, mapp.id)}
                                  className="shrink-0 text-xs text-muted hover:text-red-700"
                                  title="Ta bort undermapp"
                                >
                                  Ta bort mapp
                                </button>
                              )}
                              <OppnaStangKnapp
                                oppen={state.öppen}
                                onClick={() => toggleUndermapp(p.id, mapp.id)}
                                storlek="sm"
                                ariaLabel={
                                  state.öppen
                                    ? `Stäng mappen ${mapp.titel}`
                                    : `Öppna mappen ${mapp.titel}`
                                }
                              />
                            </div>

                            {state.öppen && (
                              <div className="border-t border-border px-3 pb-4 pt-3 sm:px-4">
                                {state.dokument.length > 0 ? (
                                  <ul className="space-y-2">
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
                                            {doc.uppladdad}
                                          </p>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            taBortDokument(p.id, mapp.id, doc.id)
                                          }
                                          className="rounded-lg border border-border px-3 py-1 text-xs text-muted"
                                        >
                                          Ta bort
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-muted">
                                    Inga dokument i denna mapp.
                                  </p>
                                )}
                                <div className="mt-3">
                                  {pågåendeUppladdning !== uploadKey ? (
                                    <button
                                      type="button"
                                      onClick={() => setPågåendeUppladdning(uploadKey)}
                                      className="rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
                                    >
                                      Ladda upp dokument
                                    </button>
                                  ) : (
                                    <label className="inline-flex cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
                                      Välj fil
                                      <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,image/*"
                                        className="sr-only"
                                        onChange={(e) =>
                                          läggTillDokument(
                                            p.id,
                                            mapp.id,
                                            e.target.files?.[0] ?? null,
                                          )
                                        }
                                      />
                                    </label>
                                  )}
                                </div>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>

                    <div className="flex flex-col gap-2 border-t border-dashed border-border pt-4 sm:flex-row sm:items-end">
                      <label className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-foreground">
                          Lägg till undermapp
                        </span>
                        <input
                          value={nyMappNamn[p.id] ?? ""}
                          onChange={(e) =>
                            setNyMappNamn((current) => ({
                              ...current,
                              [p.id]: e.target.value,
                            }))
                          }
                          placeholder="t.ex. Offerter, Myndighetsbesked"
                          className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => läggTillUndermapp(p.id)}
                        className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
                      >
                        + Undermapp
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
