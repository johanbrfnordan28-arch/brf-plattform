"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  appliceraLagenhetsnummerByte,
  bytLagenhetsnummer,
  bytRenoveringsMappMall,
  formatLagenhetEtikett,
  hamtaNastaLagenhetsnummer,
  lagenhetsBasSidor,
  renoveringsMappOversiktEtikett,
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
  LagenhetGrunduppgifterKort,
  LagenhetsarkivSammanstallning,
} from "@/components/lagenhetsarkiv/LagenhetGrunduppgifter";
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
  RENOVERING_MEDLEM_SIGNERING_EVENT,
} from "@/components/medlemmar/renovering-medlems-signering-lager";
import type { MedlemsKravState } from "@/components/lagenhetsarkiv/medlems-krav";
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
import { OppnaStangKnapp } from "@/components/OppnaStangKnapp";

function uppdateraRenoveringsMapp(
  mappar: RenoveringsMapp[],
  mappId: number,
  uppdatera: (mapp: RenoveringsMapp) => RenoveringsMapp,
): RenoveringsMapp[] {
  return mappar.map((m) => (m.id === mappId ? uppdatera(m) : m));
}

export function ApartmentArchiveDemo() {
  const [apartments, setApartments] = useState<ApartmentFolder[]>([]);
  const [oppenLagenhetsId, setOppenLagenhetsId] = useState<number | null>(null);
  const [nextApartmentNumber, setNextApartmentNumber] = useState(1002);
  const [hydrated, setHydrated] = useState(false);
  const skipFirstSave = useRef(true);
  const [valdMall, setValdMall] = useState<RenoveringsMallId>("badrum");
  const [parallellaMallVal, setParallellaMallVal] = useState<RenoveringsMallId[]>(
    [],
  );
  const [nyMappNamn, setNyMappNamn] = useState("");
  const [nyMappAr, setNyMappAr] = useState(String(new Date().getFullYear()));
  const [historiskMapp, setHistoriskMapp] = useState(false);
  const [valdaRenoveringstyper, setValdaRenoveringstyper] = useState<string[]>([]);
  const [skapadFeedback, setSkapadFeedback] = useState<string | null>(null);
  const [frånLagenhetsnummer, setFrånLagenhetsnummer] = useState("");
  const [tillLagenhetsnummer, setTillLagenhetsnummer] = useState("");
  const [nummerbyteMeddelande, setNummerbyteMeddelande] = useState<{
    typ: "ok" | "fel";
    text: string;
  } | null>(null);
  const [bekraftarBorttagningLagenhetId, setBekraftarBorttagningLagenhetId] =
    useState<number | null>(null);

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
    setNextApartmentNumber(state.nextApartmentNumber);
    setOppenLagenhetsId(null);
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
    });
  }, [apartments, nextApartmentNumber, hydrated]);

  useEffect(() => {
    function syncRenoveringstyper() {
      setValdaRenoveringstyper(lasRenoveringsAnmalan()?.valdaTyper ?? []);
    }
    syncRenoveringstyper();
    window.addEventListener(MEDLEMMAR_RENOVERING_EVENT, syncRenoveringstyper);
    return () =>
      window.removeEventListener(MEDLEMMAR_RENOVERING_EVENT, syncRenoveringstyper);
  }, []);

  useEffect(() => {
    function syncEfterMedlemSignering() {
      const sparad = lasLagenhetsarkiv();
      if (sparad) setApartments(sparad.apartments);
    }
    window.addEventListener(
      RENOVERING_MEDLEM_SIGNERING_EVENT,
      syncEfterMedlemSignering,
    );
    return () =>
      window.removeEventListener(
        RENOVERING_MEDLEM_SIGNERING_EVENT,
        syncEfterMedlemSignering,
      );
  }, []);

  const valdMallObj = useMemo(
    () => hamtaRenoveringsMall(valdMall),
    [valdMall],
  );

  function hamtaForeslagnaMallar(apartment: ApartmentFolder) {
    return valdaRenoveringstyper
      .filter((id) => renoveringsMallar.some((m) => m.id === id))
      .map((id) => hamtaRenoveringsMall(id as RenoveringsMallId))
      .filter((mall) => !apartment.folders.some((f) => f.mallId === mall.id));
  }

  if (!hydrated || apartments.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-surface p-8 text-center text-sm text-muted">
        Laddar lägenhetsarkiv…
      </div>
    );
  }

  function uppdateraLägenhet(
    apartmentId: number,
    uppdatera: (apartment: ApartmentFolder) => ApartmentFolder,
  ) {
    setApartments((current) =>
      current.map((a) => (a.id === apartmentId ? uppdatera(a) : a)),
    );
  }

  function vaxlaOppenLagenhet(id: number) {
    setOppenLagenhetsId((current) => {
      const stangs = current === id;
      if (stangs) setBekraftarBorttagningLagenhetId(null);
      return stangs ? null : id;
    });
    setSkapadFeedback(null);
    setNummerbyteMeddelande(null);
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
    setOppenLagenhetsId(id);
    setNextApartmentNumber((current) => current + 1);
  }

  function deleteApartment(id: number) {
    if (apartments.length === 1) return;

    const remaining = apartments.filter((apartment) => apartment.id !== id);
    setApartments(remaining);
    setNextApartmentNumber(hamtaNastaLagenhetsnummer(remaining));

    if (oppenLagenhetsId === id) {
      setOppenLagenhetsId(null);
    }
    if (bekraftarBorttagningLagenhetId === id) {
      setBekraftarBorttagningLagenhetId(null);
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
    setOppenLagenhetsId(result.apartmentId);
    setNummerbyteMeddelande({
      typ: "ok",
      text: `${formatLagenhetEtikett(result.från)} är nu ${formatLagenhetEtikett(result.till)}. Alla undermappar och dokument ligger kvar.`,
    });
    setFrånLagenhetsnummer("");
    setTillLagenhetsnummer("");
  }

  function fyllAktuelltNummer(lagenhetsnummer: string) {
    setFrånLagenhetsnummer(lagenhetsnummer);
    setNummerbyteMeddelande(null);
  }

  function skapaMappar(
    apartmentId: number,
    mallIds: RenoveringsMallId[],
    egnaNamn?: string,
  ) {
    const apartment = apartments.find((a) => a.id === apartmentId);
    if (!apartment || mallIds.length === 0) return;

    const arParsed = Number.parseInt(nyMappAr, 10);
    const ar =
      Number.isFinite(arParsed) && arParsed >= 1900 && arParsed <= 2100
        ? arParsed
        : new Date().getFullYear();

    let tempFolders = [...apartment.folders];
    const nyaMappar = mallIds.map((mallId) => {
      const namn =
        mallIds.length === 1 && egnaNamn?.trim()
          ? egnaNamn.trim()
          : foreslagetMappNamn(mallId, tempFolders, ar);
      const mapp = skapaRenoveringsMapp(mallId, {
        namn,
        ar,
        historisk: historiskMapp,
      });
      tempFolders = [mapp, ...tempFolders];
      return mapp;
    });

    uppdateraLägenhet(apartmentId, (a) => ({
      ...a,
      folders: [...nyaMappar, ...a.folders],
    }));

    const sista = nyaMappar[0];
    setValdMall(sista.mallId ?? mallIds[mallIds.length - 1]);
    setNyMappNamn("");
    setHistoriskMapp(false);
    setSkapadFeedback(
      nyaMappar.length === 1
        ? `${sista.name} skapad${historiskMapp ? " (historisk)" : ""}. Välj annan typ ovan om flera åtgärder pågår parallellt.`
        : `${nyaMappar.length} renoveringsmappar skapade (${nyaMappar.map((m) => m.name).join(", ")}).`,
    );
  }

  function skapaMappFranMall(apartmentId: number, mallId: RenoveringsMallId = valdMall) {
    skapaMappar(apartmentId, [mallId], nyMappNamn);
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

  function skapaParallellaMappar(apartmentId: number) {
    const mallIds =
      parallellaMallVal.length > 0 ? parallellaMallVal : [valdMall];
    skapaMappar(
      apartmentId,
      mallIds,
      mallIds.length === 1 ? nyMappNamn : undefined,
    );
    setParallellaMallVal([]);
  }

  function bytMappTyp(
    apartmentId: number,
    mappId: number,
    nyMallId: RenoveringsMallId,
  ) {
    uppdateraLägenhet(apartmentId, (a) => ({
      ...a,
      folders: uppdateraRenoveringsMapp(a.folders, mappId, (m) =>
        bytRenoveringsMappMall(m, nyMallId),
      ),
    }));
  }

  function taBortRenoveringsMapp(apartmentId: number, mappId: number) {
    uppdateraLägenhet(apartmentId, (a) => ({
      ...a,
      folders: a.folders.filter((m) => m.id !== mappId),
    }));
  }

  function laggTillDelIMapp(
    apartmentId: number,
    mappId: number,
    del: RenoveringsMappDel,
  ) {
    uppdateraLägenhet(apartmentId, (a) => ({
      ...a,
      folders: uppdateraRenoveringsMapp(a.folders, mappId, (m) =>
        laggaTillMappDel(m, del),
      ),
    }));
  }

  function taBortDelFranMapp(
    apartmentId: number,
    mappId: number,
    del: RenoveringsMappDel,
  ) {
    uppdateraLägenhet(apartmentId, (a) => ({
      ...a,
      folders: uppdateraRenoveringsMapp(a.folders, mappId, (m) =>
        taBortMappDel(m, del),
      ),
    }));
  }

  function uppdateraForvantadeHandlingar(
    apartmentId: number,
    mappId: number,
    handlingar: string[],
  ) {
    uppdateraLägenhet(apartmentId, (a) => ({
      ...a,
      folders: uppdateraRenoveringsMapp(a.folders, mappId, (m) => ({
        ...m,
        forvantadeHandlingar: handlingar,
      })),
    }));
  }

  function uppdateraMedlemsKrav(
    apartmentId: number,
    mappId: number,
    medlemsKrav: MedlemsKravState,
  ) {
    uppdateraLägenhet(apartmentId, (a) => ({
      ...a,
      folders: uppdateraRenoveringsMapp(a.folders, mappId, (m) => ({
        ...m,
        medlemsKrav,
      })),
    }));
  }

  function läggTillDokumentIMapp(
    apartmentId: number,
    mappId: number,
    undermappId: string,
    filnamn: string,
  ) {
    const trimmed = filnamn.trim();
    if (!trimmed) return;

    uppdateraLägenhet(apartmentId, (a) => ({
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
    apartmentId: number,
    mappId: number,
    undermappId: string,
    docId: string,
  ) {
    uppdateraLägenhet(apartmentId, (a) => ({
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
    apartmentId: number,
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

    uppdateraLägenhet(apartmentId, (a) => ({
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

  function signeraEgenkontroll(
    apartmentId: number,
    mappId: number,
    punktId: string,
  ) {
    uppdateraLägenhet(apartmentId, (a) => ({
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
              Sammanställning av alla lägenheter högst upp. Öppna en lägenhet för
              grunduppgifter, renoveringsmappar och signerade överenskommelser.
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
      </div>

      <LagenhetsarkivSammanstallning apartments={apartments} />

      <div className="space-y-4 p-5 sm:p-6">
        {apartments.map((apartment) => {
          const oppen = apartment.id === oppenLagenhetsId;
          const foreslagnaMallar = hamtaForeslagnaMallar(apartment);
          const etikett = formatLagenhetEtikett(apartment.lagenhetsnummer);
          const renoveringsOversikt = [...apartment.folders]
            .map((m) => ({
              mapp: m,
              etikett: renoveringsMappOversiktEtikett(m),
            }))
            .sort((a, b) => (b.mapp.ar ?? 0) - (a.mapp.ar ?? 0));

          return (
            <article
              key={apartment.id}
              className="rounded-2xl border-2 border-border bg-white transition-shadow hover:border-primary/20"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-foreground">{etikett}</h3>
                  <p className="mt-1 text-xs text-muted">
                    {apartment.folders.length > 0
                      ? `${apartment.folders.length} renoveringsmapp${
                          apartment.folders.length > 1 ? "ar" : ""
                        }`
                      : "Inga renoveringsmappar"}
                    {apartment.adress ? ` · ${apartment.adress}` : ""}
                  </p>
                  {renoveringsOversikt.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {renoveringsOversikt.map(({ mapp, etikett: chip }) => (
                        <span
                          key={mapp.id}
                          className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                            mapp.historisk
                              ? "border-border bg-background text-muted"
                              : "border-primary/25 bg-[#eef6f0] text-primary-dark"
                          }`}
                          title={mapp.name}
                        >
                          {chip}
                          {mapp.historisk ? " (historisk)" : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <OppnaStangKnapp
                    oppen={oppen}
                    onClick={() => vaxlaOppenLagenhet(apartment.id)}
                    ariaLabel={
                      oppen
                        ? `Stäng lägenhet ${etikett}`
                        : `Öppna lägenhet ${etikett}`
                    }
                  />
                </div>
              </div>

              {oppen && (
                <div className="space-y-6 border-t border-border px-4 pb-5 pt-4 sm:px-5">
                  <LagenhetGrunduppgifterKort apartment={apartment} />

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-dark">
                      Lägenhetsmappar
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Grundmappar för {etikett}.
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      {apartment.basePages.map((page) => (
                        <div
                          key={page}
                          className="rounded-xl border border-border bg-background p-4 shadow-sm"
                        >
                          <p className="text-sm font-semibold text-foreground">
                            {page}
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            Grundmapp för dokument
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div id="lagenhetsuppgifter" className="scroll-mt-24">
                    <LagenhetInfoPanel
                      apartment={apartment}
                      lagenhetsEtikett={etikett}
                      onUppdatera={(patch) =>
                        uppdateraLägenhet(apartment.id, (a) => ({ ...a, ...patch }))
                      }
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-dark">
                      Renoveringsarkiv
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      Mappar och dokument för {etikett}.
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
                          onClick={() => fyllAktuelltNummer(apartment.lagenhetsnummer)}
                          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#eef6f0]/60"
                        >
                          Använd denna lägenhet ({apartment.lagenhetsnummer})
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

          <div className="mt-6 rounded-2xl border border-primary/25 bg-[#fafcfa] p-4">
            <h4 className="font-semibold text-foreground">
              Ny renoveringsmapp
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Flera mappar kan läggas till per lägenhet — även historiska
              renoveringar i efterhand. Ange år och typ så syns det i översikten
              ovan.
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
                      onClick={() => skapaMappFranMall(apartment.id, mall.id)}
                      className="rounded-lg border border-primary bg-[#eef6f0] px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
                    >
                      + {mall.etikett}
                    </button>
                  ))}
                  {foreslagnaMallar.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        skapaMappar(
                          apartment.id,
                          foreslagnaMallar.map((m) => m.id),
                        )
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

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-xs font-medium text-muted">År</span>
                <input
                  type="number"
                  min={1900}
                  max={2100}
                  value={nyMappAr}
                  onChange={(e) => setNyMappAr(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="flex items-end gap-2 pb-2 text-sm">
                <input
                  type="checkbox"
                  checked={historiskMapp}
                  onChange={(e) => setHistoriskMapp(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary"
                />
                <span className="text-xs leading-snug text-muted">
                  Historisk renovering (lägg till i efterhand)
                </span>
              </label>
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
                  apartment.folders,
                  Number.parseInt(nyMappAr, 10) || undefined,
                )}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </label>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              {parallellaMallVal.length > 1 ? (
                <button
                  type="button"
                  onClick={() => skapaParallellaMappar(apartment.id)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  Skapa {parallellaMallVal.length} mappar parallellt
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => skapaParallellaMappar(apartment.id)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  Skapa {valdMallObj.etikett.toLowerCase()}-mapp
                </button>
              )}
              {apartment.folders.length > 0 && (
                <span className="text-xs text-muted">
                  {apartment.folders.length} mapp
                  {apartment.folders.length > 1 ? "ar" : ""} i denna lägenhet
                </span>
              )}
            </div>

            {skapadFeedback && oppenLagenhetsId === apartment.id && (
              <p className="mt-3 text-sm font-medium text-primary-dark" role="status">
                {skapadFeedback}
              </p>
            )}
          </div>

          <div className="mt-5 space-y-4">
            {apartment.folders.length > 0 && (
              <p className="text-sm font-semibold text-foreground">
                Renoveringsmappar ({apartment.folders.length})
              </p>
            )}
            {apartment.folders.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted">
                Inga renoveringsmappar ännu. Skapa en mapp ovan och lägg till
                delar steg för steg.
              </p>
            ) : (
              apartment.folders.map((mapp) => (
                <RenoveringsMappPanel
                  key={mapp.id}
                  mapp={mapp}
                  apartmentId={apartment.id}
                  lagenhetsnummer={apartment.lagenhetsnummer}
                  onTaBort={() => taBortRenoveringsMapp(apartment.id, mapp.id)}
                  onBytTyp={(nyMallId) =>
                    bytMappTyp(apartment.id, mapp.id, nyMallId)
                  }
                  onLäggTillDel={(del) =>
                    laggTillDelIMapp(apartment.id, mapp.id, del)
                  }
                  onTaBortDel={(del) =>
                    taBortDelFranMapp(apartment.id, mapp.id, del)
                  }
                  onUppdateraForvantadeHandlingar={(handlingar) =>
                    uppdateraForvantadeHandlingar(
                      apartment.id,
                      mapp.id,
                      handlingar,
                    )
                  }
                  onUppdateraMedlemsKrav={(krav) =>
                    uppdateraMedlemsKrav(apartment.id, mapp.id, krav)
                  }
                  onLäggTillDokument={(undermappId, filnamn) =>
                    läggTillDokumentIMapp(
                      apartment.id,
                      mapp.id,
                      undermappId,
                      filnamn,
                    )
                  }
                  onTaBortDokument={(undermappId, docId) =>
                    taBortDokumentFranMapp(
                      apartment.id,
                      mapp.id,
                      undermappId,
                      docId,
                    )
                  }
                  onSigneraEgenkontroll={(punktId) =>
                    signeraEgenkontroll(apartment.id, mapp.id, punktId)
                  }
                  onLaddaUpSkadebild={(punktId, filnamn) =>
                    laddaUpSkadebild(apartment.id, mapp.id, punktId, filnamn)
                  }
                />
              ))
            )}
          </div>

                  {apartments.length > 1 && (
                    <div className="border-t border-border pt-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                        Administration
                      </p>
                      {bekraftarBorttagningLagenhetId === apartment.id ? (
                        <div
                          className="mt-3 rounded-lg border border-red-200 bg-red-50/60 p-4"
                          role="alertdialog"
                          aria-labelledby={`bekrafta-borttagning-lgh-${apartment.id}`}
                        >
                          <p
                            id={`bekrafta-borttagning-lgh-${apartment.id}`}
                            className="text-sm font-semibold text-foreground"
                          >
                            Bekräfta borttagning av lägenhet
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-muted">
                            Lägenhet {etikett} tas bort från registret tillsammans
                            med alla tillhörande mappar och uppladdad dokumentation.
                            Åtgärden är permanent och kan inte ångras.
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setBekraftarBorttagningLagenhetId(null)}
                              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/5"
                            >
                              Avbryt
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteApartment(apartment.id)}
                              className="rounded-lg bg-red-800 px-4 py-2 text-sm font-medium text-white hover:bg-red-900"
                            >
                              Ja, ta bort lägenheten
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setBekraftarBorttagningLagenhetId(apartment.id)
                          }
                          className="mt-3 text-sm font-medium text-red-800 hover:text-red-900"
                        >
                          Ta bort lägenhet ur registret…
                        </button>
                      )}
                    </div>
                  )}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
