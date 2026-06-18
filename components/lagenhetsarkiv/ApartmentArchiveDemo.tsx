"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  appliceraLagenhetsnummerByte,
  bytLagenhetsnummer,
  bytRenoveringsMappMall,
  formatLagenhetEtikett,
  hamtaNastaLagenhetsnummer,
  lagenhetsBasSidor,
  skapaLagenhetsDokumentId,
  skapaRenoveringsMapp,
  type ApartmentFolder,
  type LagenhetsDokument,
  type RenoveringsMapp,
  type RenoveringsMappDel,
  laggaTillMappDel,
  taBortMappDel,
} from "@/components/lagenhetsarkiv/lagenhetsarkiv";
import {
  lasLagenhetsarkiv,
  skapaGrundmallDemoArkiv,
  skapaTomtLagenhetsarkiv,
  sparaLagenhetsarkiv,
  type LagenhetsarkivState,
} from "@/components/lagenhetsarkiv/lagenhetsarkiv-lager";
import { arGrundmallForening, lasAktivForeningId } from "@/lib/forening-registry";
import {
  lasRenoveringsAnmalan,
  MEDLEMMAR_RENOVERING_EVENT,
} from "@/components/medlemmar/medlemmar-lager";
import {
  RenoveringsMappPanel,
  skapaSigneratEgenkontrollDokument,
} from "@/components/lagenhetsarkiv/RenoveringsMappPanel";
import { LagenhetInfoPanel } from "@/components/lagenhetsarkiv/LagenhetInfoPanel";
import {
  foreslagetMappNamn,
  hamtaRenoveringsMall,
  renoveringsMallar,
  arStartbesiktningPunkt,
  type RenoveringsMallId,
} from "@/components/lagenhetsarkiv/renoverings-mallar";

function uppdateraRenoveringsMapp(
  mappar: RenoveringsMapp[],
  mappId: number,
  uppdatera: (mapp: RenoveringsMapp) => RenoveringsMapp,
): RenoveringsMapp[] {
  return mappar.map((m) => (m.id === mappId ? uppdatera(m) : m));
}

export function ApartmentArchiveDemo() {
  const [apartments, setApartments] = useState<ApartmentFolder[]>([]);
  const [activeApartmentId, setActiveApartmentId] = useState(1);
  const [nextApartmentNumber, setNextApartmentNumber] = useState(1002);
  const [hydrated, setHydrated] = useState(false);
  const skipFirstSave = useRef(true);
  const [valdMall, setValdMall] = useState<RenoveringsMallId>("badrum");
  const [parallellaMallVal, setParallellaMallVal] = useState<RenoveringsMallId[]>(
    [],
  );
  const [nyMappNamn, setNyMappNamn] = useState("");
  const [valdaRenoveringstyper, setValdaRenoveringstyper] = useState<string[]>([]);
  const [skapadFeedback, setSkapadFeedback] = useState<string | null>(null);
  const [frånLagenhetsnummer, setFrånLagenhetsnummer] = useState("");
  const [tillLagenhetsnummer, setTillLagenhetsnummer] = useState("");
  const [nummerbyteMeddelande, setNummerbyteMeddelande] = useState<{
    typ: "ok" | "fel";
    text: string;
  } | null>(null);

  useEffect(() => {
    const sparad = lasLagenhetsarkiv();
    let state: LagenhetsarkivState;
    if (sparad) {
      state = sparad;
    } else if (arGrundmallForening(lasAktivForeningId())) {
      state = skapaGrundmallDemoArkiv();
    } else {
      state = skapaTomtLagenhetsarkiv();
    }
    setApartments(state.apartments);
    setActiveApartmentId(state.activeApartmentId);
    setNextApartmentNumber(state.nextApartmentNumber);
    skipFirstSave.current = true;
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || apartments.length === 0) return;
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    sparaLagenhetsarkiv({
      apartments,
      nextApartmentNumber,
      activeApartmentId,
    });
  }, [apartments, nextApartmentNumber, activeApartmentId, hydrated]);

  useEffect(() => {
    function syncRenoveringstyper() {
      setValdaRenoveringstyper(lasRenoveringsAnmalan()?.valdaTyper ?? []);
    }
    syncRenoveringstyper();
    window.addEventListener(MEDLEMMAR_RENOVERING_EVENT, syncRenoveringstyper);
    return () =>
      window.removeEventListener(MEDLEMMAR_RENOVERING_EVENT, syncRenoveringstyper);
  }, []);

  const activeApartment = useMemo(
    () =>
      apartments.find((apartment) => apartment.id === activeApartmentId) ??
      apartments[0],
    [activeApartmentId, apartments],
  );

  const valdMallObj = useMemo(
    () => hamtaRenoveringsMall(valdMall),
    [valdMall],
  );

  const foreslagnaMallar = useMemo(() => {
    if (!activeApartment) return [];
    return valdaRenoveringstyper
      .filter((id) => renoveringsMallar.some((m) => m.id === id))
      .map((id) => hamtaRenoveringsMall(id as RenoveringsMallId))
      .filter(
        (mall) =>
          !activeApartment.folders.some((f) => f.mallId === mall.id),
      );
  }, [valdaRenoveringstyper, activeApartment]);

  if (!hydrated || !activeApartment) {
    return (
      <div className="rounded-3xl border border-border bg-surface p-8 text-center text-sm text-muted">
        Laddar lägenhetsarkiv…
      </div>
    );
  }

  function uppdateraAktivLägenhet(
    uppdatera: (apartment: ApartmentFolder) => ApartmentFolder,
  ) {
    if (!activeApartment) return;
    setApartments((current) =>
      current.map((a) =>
        a.id === activeApartment.id ? uppdatera(a) : a,
      ),
    );
  }

  function createApartment() {
    const id = Date.now();
    const apartment: ApartmentFolder = {
      id,
      lagenhetsnummer: String(nextApartmentNumber),
      basePages: [...lagenhetsBasSidor],
      folders: [],
    };

    setApartments((current) => [...current, apartment]);
    setActiveApartmentId(id);
    setNextApartmentNumber((current) => current + 1);
  }

  function deleteApartment(id: number) {
    if (apartments.length === 1) return;

    const remaining = apartments.filter((apartment) => apartment.id !== id);
    setApartments(remaining);
    setNextApartmentNumber(hamtaNastaLagenhetsnummer(remaining));

    if (activeApartmentId === id) {
      setActiveApartmentId(remaining[0].id);
    }
  }

  function utförLagenhetsnummerByte() {
    const result = bytLagenhetsnummer(
      apartments,
      frånLagenhetsnummer,
      tillLagenhetsnummer,
    );

    if (!result.ok) {
      setNummerbyteMeddelande({ typ: "fel", text: result.fel });
      return;
    }

    setApartments((current) =>
      appliceraLagenhetsnummerByte(
        current,
        result.apartmentId,
        result.till,
      ),
    );
    setActiveApartmentId(result.apartmentId);
    setNummerbyteMeddelande({
      typ: "ok",
      text: `${formatLagenhetEtikett(result.från)} är nu ${formatLagenhetEtikett(result.till)}. Alla undermappar och dokument ligger kvar.`,
    });
    setFrånLagenhetsnummer("");
    setTillLagenhetsnummer("");
  }

  function fyllAktuelltNummer() {
    if (!activeApartment) return;
    setFrånLagenhetsnummer(activeApartment.lagenhetsnummer);
    setNummerbyteMeddelande(null);
  }

  function skapaMappar(mallIds: RenoveringsMallId[], egnaNamn?: string) {
    if (!activeApartment || mallIds.length === 0) return;

    let tempFolders = [...activeApartment.folders];
    const nyaMappar = mallIds.map((mallId) => {
      const namn =
        mallIds.length === 1 && egnaNamn?.trim()
          ? egnaNamn.trim()
          : foreslagetMappNamn(mallId, tempFolders);
      const mapp = skapaRenoveringsMapp(mallId, { namn });
      tempFolders = [mapp, ...tempFolders];
      return mapp;
    });

    uppdateraAktivLägenhet((a) => ({
      ...a,
      folders: [...nyaMappar, ...a.folders],
    }));

    const sista = nyaMappar[0];
    setValdMall(sista.mallId ?? mallIds[mallIds.length - 1]);
    setNyMappNamn("");
    setSkapadFeedback(
      nyaMappar.length === 1
        ? `${sista.name} skapad. Välj annan typ ovan om flera åtgärder pågår parallellt.`
        : `${nyaMappar.length} renoveringsmappar skapade (${nyaMappar.map((m) => m.name).join(", ")}).`,
    );
  }

  function skapaMappFranMall(mallId: RenoveringsMallId = valdMall) {
    skapaMappar([mallId], nyMappNamn);
  }

  function vaxlaParallellMall(mallId: RenoveringsMallId) {
    setValdMall(mallId);
    setSkapadFeedback(null);
    setParallellaMallVal((prev) =>
      prev.includes(mallId)
        ? prev.filter((id) => id !== mallId)
        : [...prev, mallId],
    );
  }

  function skapaParallellaMappar() {
    const mallIds =
      parallellaMallVal.length > 0 ? parallellaMallVal : [valdMall];
    skapaMappar(
      mallIds,
      mallIds.length === 1 ? nyMappNamn : undefined,
    );
    setParallellaMallVal([]);
  }

  function bytMappTyp(mappId: number, nyMallId: RenoveringsMallId) {
    uppdateraAktivLägenhet((a) => ({
      ...a,
      folders: uppdateraRenoveringsMapp(a.folders, mappId, (m) =>
        bytRenoveringsMappMall(m, nyMallId),
      ),
    }));
  }

  function taBortRenoveringsMapp(mappId: number) {
    uppdateraAktivLägenhet((a) => ({
      ...a,
      folders: a.folders.filter((m) => m.id !== mappId),
    }));
  }

  function laggTillDelIMapp(mappId: number, del: RenoveringsMappDel) {
    uppdateraAktivLägenhet((a) => ({
      ...a,
      folders: uppdateraRenoveringsMapp(a.folders, mappId, (m) =>
        laggaTillMappDel(m, del),
      ),
    }));
  }

  function taBortDelFranMapp(mappId: number, del: RenoveringsMappDel) {
    uppdateraAktivLägenhet((a) => ({
      ...a,
      folders: uppdateraRenoveringsMapp(a.folders, mappId, (m) =>
        taBortMappDel(m, del),
      ),
    }));
  }

  function uppdateraForvantadeHandlingar(
    mappId: number,
    handlingar: string[],
  ) {
    uppdateraAktivLägenhet((a) => ({
      ...a,
      folders: uppdateraRenoveringsMapp(a.folders, mappId, (m) => ({
        ...m,
        forvantadeHandlingar: handlingar,
      })),
    }));
  }

  function läggTillDokumentIMapp(
    mappId: number,
    undermappId: string,
    filnamn: string,
  ) {
    const trimmed = filnamn.trim();
    if (!trimmed) return;

    uppdateraAktivLägenhet((a) => ({
      ...a,
      folders: uppdateraRenoveringsMapp(a.folders, mappId, (mapp) => ({
        ...mapp,
        undermappar: mapp.undermappar.map((u) =>
          u.id === undermappId
            ? {
                ...u,
                dokument: [
                  {
                    id: skapaLagenhetsDokumentId(),
                    filnamn: trimmed,
                    uppladdad: new Date().toLocaleDateString("sv-SE"),
                  },
                  ...u.dokument,
                ],
              }
            : u,
        ),
      })),
    }));
  }

  function taBortDokumentFranMapp(
    mappId: number,
    undermappId: string,
    docId: string,
  ) {
    uppdateraAktivLägenhet((a) => ({
      ...a,
      folders: uppdateraRenoveringsMapp(a.folders, mappId, (mapp) => ({
        ...mapp,
        undermappar: mapp.undermappar.map((u) =>
          u.id === undermappId
            ? { ...u, dokument: u.dokument.filter((d) => d.id !== docId) }
            : u,
        ),
      })),
    }));
  }

  function laddaUpSkadebild(
    mappId: number,
    punktId: string,
    filnamn: string,
  ) {
    const trimmed = filnamn.trim();
    if (!trimmed) return;

    const bild: LagenhetsDokument = {
      id: skapaLagenhetsDokumentId(),
      filnamn: trimmed,
      uppladdad: new Date().toLocaleDateString("sv-SE"),
    };

    uppdateraAktivLägenhet((a) => ({
      ...a,
      folders: uppdateraRenoveringsMapp(a.folders, mappId, (mapp) => ({
        ...mapp,
        egenkontroller: mapp.egenkontroller.map((p) =>
          p.id === punktId
            ? { ...p, skadebilder: [...(p.skadebilder ?? []), bild] }
            : p,
        ),
        undermappar: mapp.undermappar.map((u) =>
          u.typ === "ovrigt"
            ? { ...u, dokument: [bild, ...u.dokument] }
            : u,
        ),
      })),
    }));
  }

  function signeraEgenkontroll(mappId: number, punktId: string) {
    uppdateraAktivLägenhet((a) => ({
      ...a,
      folders: uppdateraRenoveringsMapp(a.folders, mappId, (mapp) => {
        const punkt = mapp.egenkontroller.find((p) => p.id === punktId);
        if (!punkt || punkt.signerad) return mapp;
        if (
          arStartbesiktningPunkt(punktId) &&
          (punkt.skadebilder?.length ?? 0) === 0
        ) {
          return mapp;
        }

        const signeradPunkt = {
          ...punkt,
          signerad: true,
          signeradDatum: new Date().toLocaleDateString("sv-SE"),
          signeradAv: "Demo — signerat med BankID (styrelse)",
        };
        const signeratDoc = skapaSigneratEgenkontrollDokument(
          signeradPunkt,
          mapp.name,
        );
        const skadebilder = punkt.skadebilder ?? [];

        return {
          ...mapp,
          egenkontroller: mapp.egenkontroller.map((p) =>
            p.id === punktId ? signeradPunkt : p,
          ),
          undermappar: mapp.undermappar.map((u) => {
            if (u.typ === "egenkontroller") {
              return {
                ...u,
                dokument: [signeratDoc, ...skadebilder, ...u.dokument],
              };
            }
            return u;
          }),
        };
      }),
    }));
  }

  return (
    <div className="rounded-3xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-dark">
              Lägenhetsregister
            </p>
            <p className="mt-1 text-sm text-muted">
              Välj lägenhet — status och uppgifter visas nedan.
            </p>
          </div>
          <button
            type="button"
            onClick={createApartment}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Skapa lägenhet
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {apartments.map((apartment) => (
            <button
              key={apartment.id}
              type="button"
              onClick={() => setActiveApartmentId(apartment.id)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                apartment.id === activeApartment.id
                  ? "border-primary bg-[#e2f0e6] text-primary-dark"
                  : "border-border bg-white text-foreground hover:border-primary/40"
              }`}
            >
              {formatLagenhetEtikett(apartment.lagenhetsnummer)}
              {apartment.folders.length > 0 && (
                <span className="ml-1 text-xs font-normal text-muted">
                  · {apartment.folders.length} renovering
                  {apartment.folders.length > 1 ? "ar" : ""}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div id="lagenhetsuppgifter" className="scroll-mt-24 border-b border-border p-5 sm:p-6">
        <LagenhetInfoPanel
          apartment={activeApartment}
          lagenhetsEtikett={formatLagenhetEtikett(activeApartment.lagenhetsnummer)}
          onUppdatera={(patch) => uppdateraAktivLägenhet((a) => ({ ...a, ...patch }))}
        />
      </div>

      <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="border-b border-border p-5 lg:border-b-0 lg:border-r sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-dark">
            Hantera lägenheter
          </p>
          <div className="mt-4 space-y-2">
            {apartments.map((apartment) => (
              <div
                key={apartment.id}
                className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 ${
                  apartment.id === activeApartment.id
                    ? "border-primary bg-[#e2f0e6]"
                    : "border-border bg-background"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveApartmentId(apartment.id)}
                  className="text-left text-sm font-medium text-foreground"
                >
                  {formatLagenhetEtikett(apartment.lagenhetsnummer)}
                </button>
                <button
                  type="button"
                  onClick={() => deleteApartment(apartment.id)}
                  disabled={apartments.length === 1}
                  className="text-xs text-muted hover:text-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Ta bort
                </button>
              </div>
            ))}
          </div>
        </aside>

        <section className="p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-dark">
            Renoveringsarkiv
          </p>
          <p className="mt-1 text-sm text-muted">
            Mappar och dokument för {formatLagenhetEtikett(activeApartment.lagenhetsnummer)}.
          </p>

          <div className="mt-5 rounded-2xl border border-border p-4">
            <h4 className="font-semibold text-foreground">Byt lägenhetsnummer</h4>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Byt nummer utan att förlora mappar eller dokument — allt följer med
              till det nya numret.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-xs font-medium text-muted">
                  Aktuellt nummer
                </span>
                <input
                  value={frånLagenhetsnummer}
                  onChange={(event) => {
                    setFrånLagenhetsnummer(event.target.value);
                    setNummerbyteMeddelande(null);
                  }}
                  placeholder="Ex. 1001"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs font-medium text-muted">Nytt nummer</span>
                <input
                  value={tillLagenhetsnummer}
                  onChange={(event) => {
                    setTillLagenhetsnummer(event.target.value);
                    setNummerbyteMeddelande(null);
                  }}
                  placeholder="Ex. 1202"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={utförLagenhetsnummerByte}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
              >
                Byt nummer
              </button>
              <button
                type="button"
                onClick={fyllAktuelltNummer}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#eef6f0]/60"
              >
                Använd aktiv lägenhet ({activeApartment.lagenhetsnummer})
              </button>
            </div>
            {nummerbyteMeddelande && (
              <p
                className={`mt-3 text-sm ${
                  nummerbyteMeddelande.typ === "ok"
                    ? "text-primary-dark"
                    : "text-red-700"
                }`}
                role="status"
              >
                {nummerbyteMeddelande.text}
              </p>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {activeApartment.basePages.map((page) => (
              <div
                key={page}
                className="rounded-xl border border-border bg-background p-4"
              >
                <p className="text-sm font-semibold text-foreground">{page}</p>
                <p className="mt-1 text-xs text-muted">Grundmapp för dokument</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-primary/25 bg-[#fafcfa] p-4">
            <h4 className="font-semibold text-foreground">
              Ny renoveringsmapp
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Välj en eller flera typer för parallella projekt. Skapa tomma mappar
              och lägg sedan till delar — handlingar, egenkontroller, ritning m.m.
              — steg för steg i respektive mapp.
            </p>

            {foreslagnaMallar.length > 0 && (
              <div className="mt-4 rounded-lg border border-primary/30 bg-white p-3">
                <p className="text-xs font-medium text-primary-dark">
                  Valda i renoveringsanmälan — saknar mapp
                </p>
                <p className="mt-1 text-xs text-muted">
                  Skapa mappar för de typer som redan valts i checklistan nedan
                  på sidan.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {foreslagnaMallar.map((mall) => (
                    <button
                      key={mall.id}
                      type="button"
                      onClick={() => skapaMappFranMall(mall.id)}
                      className="rounded-lg border border-primary bg-[#eef6f0] px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
                    >
                      + {mall.etikett}
                    </button>
                  ))}
                  {foreslagnaMallar.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        skapaMappar(foreslagnaMallar.map((m) => m.id))
                      }
                      className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
                    >
                      Skapa alla ({foreslagnaMallar.length})
                    </button>
                  )}
                </div>
              </div>
            )}

            <label className="mt-4 block text-sm">
              <span className="text-xs font-medium text-muted">
                Typ av renovering
              </span>
              <select
                value={valdMall}
                onChange={(e) => {
                  setValdMall(e.target.value as RenoveringsMallId);
                  setSkapadFeedback(null);
                }}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground"
              >
                {renoveringsMallar.map((mall) => (
                  <option key={mall.id} value={mall.id}>
                    {mall.etikett} — {mall.beskrivning}
                  </option>
                ))}
              </select>
            </label>

            <p className="mt-2 text-xs text-muted">{valdMallObj.beskrivning}</p>

            <p className="mt-3 text-xs text-muted">
              Klicka för att välja typ — klicka igen för att lägga till eller ta
              bort i parallell skapning.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {renoveringsMallar.map((mall) => {
                const parallellVald = parallellaMallVal.includes(mall.id);
                const aktiv = valdMall === mall.id;
                return (
                  <button
                    key={mall.id}
                    type="button"
                    onClick={() => vaxlaParallellMall(mall.id)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                      parallellVald
                        ? "border-primary bg-[#e2f0e6] text-primary-dark"
                        : aktiv
                          ? "border-primary/60 bg-white text-primary-dark"
                          : "border-border bg-white text-foreground hover:border-primary/40"
                    }`}
                  >
                    {parallellVald ? "✓ " : ""}
                    {mall.etikett}
                  </button>
                );
              })}
            </div>

            <label className="mt-4 block text-sm">
              <span className="text-xs font-medium text-muted">
                Mappnamn (valfritt)
              </span>
              <input
                value={nyMappNamn}
                onChange={(e) => setNyMappNamn(e.target.value)}
                placeholder={foreslagetMappNamn(
                  valdMall,
                  activeApartment.folders,
                )}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </label>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              {parallellaMallVal.length > 1 ? (
                <button
                  type="button"
                  onClick={skapaParallellaMappar}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  Skapa {parallellaMallVal.length} mappar parallellt
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => skapaParallellaMappar()}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  Skapa {valdMallObj.etikett.toLowerCase()}-mapp
                </button>
              )}
              {activeApartment.folders.length > 0 && (
                <span className="text-xs text-muted">
                  {activeApartment.folders.length} mapp
                  {activeApartment.folders.length > 1 ? "ar" : ""} i denna
                  lägenhet
                </span>
              )}
            </div>

            {skapadFeedback && (
              <p className="mt-3 text-sm font-medium text-primary-dark" role="status">
                {skapadFeedback}
              </p>
            )}
          </div>

          <div className="mt-5 space-y-4">
            {activeApartment.folders.length > 0 && (
              <p className="text-sm font-semibold text-foreground">
                Renoveringsmappar ({activeApartment.folders.length})
              </p>
            )}
            {activeApartment.folders.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted">
                Inga renoveringsmappar ännu. Skapa en mapp ovan och lägg till
                delar steg för steg — t.ex. handlingar och egenkontroller.
              </p>
            ) : (
              activeApartment.folders.map((mapp) => (
                <RenoveringsMappPanel
                  key={mapp.id}
                  mapp={mapp}
                  onTaBort={() => taBortRenoveringsMapp(mapp.id)}
                  onBytTyp={(nyMallId) => bytMappTyp(mapp.id, nyMallId)}
                  onLäggTillDel={(del) => laggTillDelIMapp(mapp.id, del)}
                  onTaBortDel={(del) => taBortDelFranMapp(mapp.id, del)}
                  onUppdateraForvantadeHandlingar={(handlingar) =>
                    uppdateraForvantadeHandlingar(mapp.id, handlingar)
                  }
                  onLäggTillDokument={(undermappId, filnamn) =>
                    läggTillDokumentIMapp(mapp.id, undermappId, filnamn)
                  }
                  onTaBortDokument={(undermappId, docId) =>
                    taBortDokumentFranMapp(mapp.id, undermappId, docId)
                  }
                  onSigneraEgenkontroll={(punktId) =>
                    signeraEgenkontroll(mapp.id, punktId)
                  }
                  onLaddaUpSkadebild={(punktId, filnamn) =>
                    laddaUpSkadebild(mapp.id, punktId, filnamn)
                  }
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
