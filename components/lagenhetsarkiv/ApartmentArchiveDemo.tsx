"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  appliceraLagenhetsnummerByte,
  bytLagenhetsnummer,
  formatLagenhetEtikett,
  hamtaNastaLagenhetsnummer,
  lagenhetsBasSidor,
  skapaLagenhetsDokumentId,
  skapaRenoveringsMapp,
  type ApartmentFolder,
  type LagenhetsDokument,
  type RenoveringsMapp,
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
  RenoveringsMappPanel,
  skapaSigneratEgenkontrollDokument,
} from "@/components/lagenhetsarkiv/RenoveringsMappPanel";
import { LagenhetInfoPanel } from "@/components/lagenhetsarkiv/LagenhetInfoPanel";
import {
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
  const [nyMappNamn, setNyMappNamn] = useState("");
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

  const activeApartment = useMemo(
    () =>
      apartments.find((apartment) => apartment.id === activeApartmentId) ??
      apartments[0],
    [activeApartmentId, apartments],
  );

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

  function skapaMappFranMall() {
    if (!activeApartment) return;
    const mapp = skapaRenoveringsMapp(valdMall, {
      namn: nyMappNamn.trim() || undefined,
    });
    uppdateraAktivLägenhet((a) => ({
      ...a,
      folders: [mapp, ...a.folders],
    }));
    setNyMappNamn("");
  }

  function taBortRenoveringsMapp(mappId: number) {
    uppdateraAktivLägenhet((a) => ({
      ...a,
      folders: a.folders.filter((m) => m.id !== mappId),
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
      <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="border-b border-border p-5 lg:border-b-0 lg:border-r sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-dark">
                Lägenheter
              </p>
              <h2 className="mt-1 text-xl font-bold text-foreground">
                Arkivet byggs ut stegvis
              </h2>
            </div>
            <button
              type="button"
              onClick={createApartment}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Skapa lägenhet
            </button>
          </div>

          <div className="mt-5 space-y-2">
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
                  {apartment.folders.length > 0 && (
                    <span className="ml-1 text-xs text-muted">
                      · {apartment.folders.length} renovering
                      {apartment.folders.length > 1 ? "ar" : ""}
                    </span>
                  )}
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
          <div className="rounded-2xl bg-[#eef6f0] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-dark">
              Aktiv mapp
            </p>
            <h3 className="mt-1 text-2xl font-bold text-foreground">
              {formatLagenhetEtikett(activeApartment.lagenhetsnummer)}
            </h3>
            <p className="mt-2 text-sm text-muted">
              Skapa renoveringsmappar från grundmallar (badrum, kök m.m.). Varje
              mapp får relevanta undermappar — t.ex. handlingar, egenkontroller
              och övrigt — så styrelsen ser vilka dokument som ska in.
            </p>
          </div>

          <LagenhetInfoPanel
            apartment={activeApartment}
            onUppdatera={(patch) => uppdateraAktivLägenhet((a) => ({ ...a, ...patch }))}
          />

          <div className="mt-5 rounded-2xl border border-border p-4">
            <h4 className="font-semibold text-foreground">Byt lägenhetsnummer</h4>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Ange aktuellt nummer och vilket nummer lägenheten ska bytas till.
              Allt uppladdat material följer med i samma mapp.
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
                <p className="mt-1 text-xs text-muted">Grundsida för dokument</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-primary/25 bg-[#fafcfa] p-4">
            <h4 className="font-semibold text-foreground">
              Skapa renoveringsmapp från mall
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Välj typ — mappen skapas med undermappar och exempel på vilka
              dokument som ska laddas upp. Egenkontroller kan signeras med
              BankID (demo).
            </p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {renoveringsMallar.map((mall) => (
                <label
                  key={mall.id}
                  className={`cursor-pointer rounded-lg border px-3 py-2.5 text-left ${
                    valdMall === mall.id
                      ? "border-primary bg-white shadow-sm"
                      : "border-border bg-white hover:border-primary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="renoverings-mall"
                    value={mall.id}
                    checked={valdMall === mall.id}
                    onChange={() => setValdMall(mall.id)}
                    className="sr-only"
                  />
                  <span className="block text-sm font-medium text-foreground">
                    {mall.etikett}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted line-clamp-2">
                    {mall.beskrivning}
                  </span>
                </label>
              ))}
            </div>

            <label className="mt-3 block text-sm">
              <span className="text-xs font-medium text-muted">
                Mappnamn (valfritt)
              </span>
              <input
                value={nyMappNamn}
                onChange={(e) => setNyMappNamn(e.target.value)}
                placeholder={`Ex. ${
                  renoveringsMallar.find((m) => m.id === valdMall)?.standardNamn
                } ${new Date().getFullYear()}`}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </label>

            <button
              type="button"
              onClick={skapaMappFranMall}
              className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Skapa undermapp
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {activeApartment.folders.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted">
                Inga renoveringsmappar ännu. Välj en mall ovan — t.ex. badrum
                eller kök — för att skapa struktur med rätt undermappar.
              </p>
            ) : (
              activeApartment.folders.map((mapp) => (
                <RenoveringsMappPanel
                  key={mapp.id}
                  mapp={mapp}
                  onTaBort={() => taBortRenoveringsMapp(mapp.id)}
                  onLäggTillDokument={(undermappId, filnamn) =>
                    läggTillDokumentIMapp(mapp.id, undermappId, filnamn)
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
