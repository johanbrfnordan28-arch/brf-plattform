"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  lasLagenhetsarkiv,
  LAGENHETSARKIV_EVENT,
} from "@/components/lagenhetsarkiv/lagenhetsarkiv-lager";
import {
  formatLagenhetEtikett,
  type ApartmentFolder,
} from "@/components/lagenhetsarkiv/lagenhetsarkiv";
import {
  byggOmbyggnadsavtalBrodtext,
  registreraOverenskommelseMejl,
} from "@/components/lagenhetsarkiv/overenskommelse-mejl";
import {
  ombyggnadsavtalSigneringLank,
  skapaOmbyggnadsavtalSignering,
} from "@/components/lagenhetsarkiv/ombyggnadsavtal-signering-lager";
import {
  normaliseraLagenhetOmbyggnadsavtal,
  skapaUndertecknareId,
  valdaOmbyggnadsavtalPunkter,
  type OmbyggnadsavtalUndertecknare,
} from "@/components/lagenhetsarkiv/lagenhet-ombyggnadsavtal";
import { hamtaRenoveringsMall } from "@/components/lagenhetsarkiv/renoverings-mallar";
import { sparaLagenhetsarkiv } from "@/components/lagenhetsarkiv/lagenhetsarkiv-lager";
import {
  skapaRenoveringsMapparForProjekt,
} from "@/components/medlemmar/renoverings-projekt-arkiv";
import {
  lasRenoveringsGrundmall,
  RENOVERINGS_GRUNDMALL_EVENT,
  skapaGrundmallPunktId,
  sparaRenoveringsGrundmall,
  type RenoveringsGrundmallState,
} from "@/components/medlemmar/renoverings-grundmall-lager";
import {
  hamtaAktivtRenoveringsProjekt,
  RENOVERINGS_PROJEKT_EVENT,
  uppdateraRenoveringsProjekt,
  valjEllerSkapaRenoveringsProjekt,
  type RenoveringsProjekt,
} from "@/components/medlemmar/renoverings-projekt-lager";
import {
  byggChecklistaMedGrundmall,
  checklistaPunktId,
  grundkrav,
  renoveringsTyper,
} from "@/components/medlemmar/renoveringschecklistor";
import { lasAktivForeningId, lasForeningProfil } from "@/lib/forening-registry";
import {
  hashaPersonnummer,
  maskeraPersonnummer,
  personnummerFelmeddelande,
} from "@/lib/personnummer-format";

export function RenoveringsAnmalan() {
  const [lagenheter, setLagenheter] = useState<ApartmentFolder[]>([]);
  const [projekt, setProjekt] = useState<RenoveringsProjekt | null>(null);
  const [grundmall, setGrundmall] = useState<RenoveringsGrundmallState>(
    () => lasRenoveringsGrundmall(),
  );
  const [valdaTyper, setValdaTyper] = useState<string[]>([]);
  const [klaraPunkter, setKlaraPunkter] = useState<Set<string>>(new Set());
  const [planeratStart, setPlaneratStart] = useState("");
  const [planeratSlut, setPlaneratSlut] = useState("");
  const [nyGrundmallPunkt, setNyGrundmallPunkt] = useState("");
  const [visaGrundmall, setVisaGrundmall] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const [nyNamn, setNyNamn] = useState("");
  const [nyPnr, setNyPnr] = useState("");
  const [nyEpost, setNyEpost] = useState("");
  const [undertecknare, setUndertecknare] = useState<
    OmbyggnadsavtalUndertecknare[]
  >([]);
  const [skickarAvtal, setSkickarAvtal] = useState(false);

  function laddaLagenheter() {
    const state = lasLagenhetsarkiv();
    setLagenheter(
      [...(state?.apartments ?? [])].sort((a, b) =>
        a.lagenhetsnummer.localeCompare(b.lagenhetsnummer, "sv"),
      ),
    );
  }

  function synkaProjekt(p: RenoveringsProjekt) {
    setProjekt(p);
    setValdaTyper(p.valdaTyper);
    setKlaraPunkter(new Set(p.klaraPunkter));
    setPlaneratStart(p.planeratStart ?? "");
    setPlaneratSlut(p.planeratSlut ?? "");
  }

  function sparaProjektPatch(patch: Partial<RenoveringsProjekt>) {
    if (!projekt) return;
    const body: Partial<RenoveringsProjekt> = {
      valdaTyper,
      klaraPunkter: [...klaraPunkter],
      planeratStart: planeratStart || undefined,
      planeratSlut: planeratSlut || undefined,
      ...patch,
    };
    uppdateraRenoveringsProjekt(projekt.id, body);
    setProjekt((p) => (p ? { ...p, ...body } : p));
  }

  useEffect(() => {
    laddaLagenheter();
    setGrundmall(lasRenoveringsGrundmall());
    const aktiv = hamtaAktivtRenoveringsProjekt();
    if (aktiv && aktiv.apartmentId > 0) synkaProjekt(aktiv);
    setHydrated(true);

    function onUppdaterad() {
      laddaLagenheter();
    }
    window.addEventListener(LAGENHETSARKIV_EVENT, onUppdaterad);
    window.addEventListener(RENOVERINGS_PROJEKT_EVENT, onUppdaterad);
    window.addEventListener(RENOVERINGS_GRUNDMALL_EVENT, () =>
      setGrundmall(lasRenoveringsGrundmall()),
    );
    return () => {
      window.removeEventListener(LAGENHETSARKIV_EVENT, onUppdaterad);
      window.removeEventListener(RENOVERINGS_PROJEKT_EVENT, onUppdaterad);
    };
  }, []);

  const extraGrund = useMemo(
    () =>
      grundmall.extraGrundkrav.map((p) => ({
        id: p.id,
        text: p.text,
      })),
    [grundmall.extraGrundkrav],
  );

  const sektioner = useMemo(
    () => byggChecklistaMedGrundmall(valdaTyper, extraGrund),
    [valdaTyper, extraGrund],
  );

  const allaPunktIds = useMemo(
    () =>
      sektioner.flatMap(({ sektion, punkter }) =>
        punkter.map((punkt) => checklistaPunktId(sektion.id, punkt.id)),
      ),
    [sektioner],
  );

  const antalKlara = allaPunktIds.filter((id) => klaraPunkter.has(id)).length;
  const allaKlara =
    allaPunktIds.length > 0 && antalKlara === allaPunktIds.length;

  const valdLagenhet = projekt
    ? lagenheter.find((a) => a.id === projekt.apartmentId)
    : undefined;

  function valjLagenhet(apartmentId: number) {
    const apt = lagenheter.find((a) => a.id === apartmentId);
    if (!apt) return;
    const p = valjEllerSkapaRenoveringsProjekt({
      apartmentId: apt.id,
      lagenhetsnummer: apt.lagenhetsnummer,
    });
    synkaProjekt(p);
    setStatus(null);
  }

  function toggleTyp(id: string) {
    const nextTyper = valdaTyper.includes(id)
      ? valdaTyper.filter((item) => item !== id)
      : [...valdaTyper, id];
    setValdaTyper(nextTyper);
    setKlaraPunkter(new Set());
    if (projekt) {
      sparaProjektPatch({
        valdaTyper: nextTyper,
        klaraPunkter: [],
        sparad: false,
        status: nextTyper.length ? "checklist_pagar" : "utkast",
      });
    }
  }

  function togglePunkt(punktKey: string) {
    const next = new Set(klaraPunkter);
    if (next.has(punktKey)) next.delete(punktKey);
    else next.add(punktKey);
    setKlaraPunkter(next);
    if (projekt) {
      sparaProjektPatch({
        klaraPunkter: [...next],
        sparad: false,
        status: "checklist_pagar",
      });
    }
  }

  function sparaChecklista() {
    if (!projekt) return;
    sparaProjektPatch({
      sparad: true,
      status: allaKlara ? "klar_for_avtal" : "checklist_pagar",
    });
    setStatus("Checklistan är sparad och kopplad till lägenheten.");
  }

  function skapaMapparIArkiv() {
    if (!projekt) return;
    const snapshot = {
      ...projekt,
      valdaTyper,
      klaraPunkter: [...klaraPunkter],
      planeratStart: planeratStart || undefined,
      planeratSlut: planeratSlut || undefined,
    };
    const result = skapaRenoveringsMapparForProjekt(snapshot);
    if (!result.ok) {
      setStatus(result.fel);
      return;
    }
    uppdateraRenoveringsProjekt(projekt.id, {
      koppladeMappIds: [
        ...new Set([...projekt.koppladeMappIds, ...result.mappIds]),
      ],
    });
    setProjekt((p) =>
      p
        ? {
            ...p,
            koppladeMappIds: [
              ...new Set([...p.koppladeMappIds, ...result.mappIds]),
            ],
          }
        : p,
    );
    setStatus(
      `Renoveringsmappar skapade i lägenhetsarkivet för lgh ${projekt.lagenhetsnummer}.`,
    );
  }

  function laggTillGrundmallPunkt() {
    const text = nyGrundmallPunkt.trim();
    if (!text) return;
    const next = {
      ...grundmall,
      extraGrundkrav: [
        ...grundmall.extraGrundkrav,
        { id: skapaGrundmallPunktId(), text },
      ],
    };
    setGrundmall(next);
    sparaRenoveringsGrundmall(next);
    setNyGrundmallPunkt("");
  }

  function taBortGrundmallPunkt(id: string) {
    const next = {
      ...grundmall,
      extraGrundkrav: grundmall.extraGrundkrav.filter((p) => p.id !== id),
    };
    setGrundmall(next);
    sparaRenoveringsGrundmall(next);
  }

  async function laggTillUndertecknare() {
    const namn = nyNamn.trim();
    const epost = nyEpost.trim();
    if (!namn) {
      setStatus("Ange namn på medlem som ska signera ombyggnadsavtalet.");
      return;
    }
    const pnrFel = personnummerFelmeddelande(nyPnr);
    if (pnrFel) {
      setStatus(pnrFel);
      return;
    }
    if (!epost.includes("@")) {
      setStatus("Ange e-post till medlemmen i lägenheten.");
      return;
    }
    const nyckel = await hashaPersonnummer(nyPnr);
    if (!nyckel) {
      setStatus("Kunde inte läsa personnumret.");
      return;
    }
    setUndertecknare((current) => [
      ...current,
      {
        id: skapaUndertecknareId(),
        namn,
        epost,
        personnummerMaskerat: maskeraPersonnummer(nyPnr),
        personnummerNyckel: nyckel,
      },
    ]);
    setNyNamn("");
    setNyPnr("");
    setNyEpost("");
  }

  async function skickaOmbyggnadsavtal() {
    if (!projekt || !valdLagenhet) return;
    if (!allaKlara) {
      setStatus("Alla checklistpunkter måste vara godkända först.");
      return;
    }
    if (undertecknare.length === 0) {
      setStatus("Lägg till minst en undertecknare (medlem i lägenheten).");
      return;
    }
    const mappId = projekt.koppladeMappIds[0];
    if (!mappId) {
      setStatus("Skapa renoveringsmappar i lägenhetsarkivet innan avtalet skickas.");
      return;
    }

    setSkickarAvtal(true);
    try {
      const foreningId = lasAktivForeningId();
      const profil = lasForeningProfil(foreningId);
      const avtal = normaliseraLagenhetOmbyggnadsavtal(
        valdLagenhet.ombyggnadsavtal,
        "renovering",
      );
      const valda = valdaOmbyggnadsavtalPunkter(avtal);
      const mall = hamtaRenoveringsMall(avtal.mallId);

      const signering = skapaOmbyggnadsavtalSignering({
        foreningId,
        apartmentId: valdLagenhet.id,
        lagenhetsnummer: valdLagenhet.lagenhetsnummer,
        mallEtikett: mall.etikett,
        foreningsnamn: profil?.namn ?? "",
        organisationsnummer: profil?.organisationsnummer || undefined,
        postadress: valdLagenhet.adress || profil?.postadress || undefined,
        ort: profil?.ort || undefined,
        punkter: valda.map((p) => ({
          id: p.id,
          text: p.text,
          sektionEtikett: p.sektionEtikett,
        })),
        undertecknare,
        koppladMappId: mappId,
        renoveringsProjektId: projekt.id,
      });
      const lank = ombyggnadsavtalSigneringLank(signering.id, foreningId);

      const state = lasLagenhetsarkiv();
      if (state) {
        const apartments = state.apartments.map((apt) => {
          if (apt.id !== valdLagenhet.id) return apt;
          return {
            ...apt,
            ombyggnadsavtal: {
              ...avtal,
              undertecknare,
              signeringId: signering.id,
              skickadTillMedlem: new Date().toISOString().slice(0, 10),
            },
          };
        });
        sparaLagenhetsarkiv({ ...state, apartments });
      }

      for (const person of undertecknare) {
        if (!person.epost.includes("@")) continue;
        const brodtext = byggOmbyggnadsavtalBrodtext({
          lagenhetsnummer: valdLagenhet.lagenhetsnummer,
          foreningsnamn: profil?.namn,
          mottagareNamn: person.namn,
          punkter: valda.map((p) => ({
            text: p.text,
            sektionEtikett: p.sektionEtikett,
          })),
          signeringLank: lank,
        });
        await registreraOverenskommelseMejl({
          till: person.epost,
          amne: `Ombyggnadsavtal — lgh ${valdLagenhet.lagenhetsnummer}`,
          brodtext,
        });
      }

      uppdateraRenoveringsProjekt(projekt.id, { status: "avtal_skickat" });
      setStatus(
        `Ombyggnadsavtal skickat till ${undertecknare.length} mottagare. Efter BankID-signering sparas avtalet i lägenhetens renoveringsmapp.`,
      );
    } finally {
      setSkickarAvtal(false);
    }
  }

  if (!hydrated) {
    return <p className="text-sm text-muted">Laddar renoveringshantering…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-primary/25 bg-[#eef6f0]/60 p-4 text-sm text-muted">
        <strong className="text-primary-dark">Endast styrelsen.</strong> Medlemmar
        har inte tillgång till lägenhetsarkivet. När checklistan är klar och styrelsen
        enats skickas ombyggnadsavtalet till medlemmarna i lägenheten för signering med
        BankID — därefter sparas avtalet i lägenhetens renoveringsmapp.
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground">
          Lägenhet (lägenhetsnummer)
        </label>
        <p className="mt-1 text-sm text-muted">
          Alla checklistor och dokument knyts till vald lägenhet.
        </p>
        {lagenheter.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            Inga lägenheter i arkivet ännu — skapa lägenheter under{" "}
            <Link href="#lagenhetsarkiv" className="text-primary-dark underline">
              Lägenhetsarkiv
            </Link>
            .
          </p>
        ) : (
          <select
            value={projekt?.apartmentId ?? ""}
            onChange={(e) => valjLagenhet(Number(e.target.value))}
            className="mt-2 w-full max-w-md rounded-lg border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="">Välj lägenhet…</option>
            {lagenheter.map((apt) => (
              <option key={apt.id} value={apt.id}>
                {formatLagenhetEtikett(apt.lagenhetsnummer)}
                {apt.adress ? ` · ${apt.adress}` : ""}
              </option>
            ))}
          </select>
        )}
        {projekt && projekt.apartmentId > 0 && (
          <p className="mt-2 text-xs text-muted">
            Projekt skapat {new Date(projekt.skapad).toLocaleDateString("sv-SE")}
            {projekt.koppladeMappIds.length > 0 &&
              ` · ${projekt.koppladeMappIds.length} mapp(ar) i arkivet`}
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-muted">
            Planerat startdatum
          </label>
          <input
            type="date"
            value={planeratStart}
            onChange={(e) => {
              setPlaneratStart(e.target.value);
              if (projekt) {
                sparaProjektPatch({ planeratStart: e.target.value || undefined });
              }
            }}
            disabled={!projekt?.apartmentId}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted">
            Planerat slutdatum
          </label>
          <input
            type="date"
            value={planeratSlut}
            onChange={(e) => {
              setPlaneratSlut(e.target.value);
              if (projekt) {
                sparaProjektPatch({ planeratSlut: e.target.value || undefined });
              }
            }}
            disabled={!projekt?.apartmentId}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background/80 p-4">
        <button
          type="button"
          onClick={() => setVisaGrundmall((v) => !v)}
          className="text-sm font-semibold text-primary-dark"
        >
          {visaGrundmall ? "Dölj" : "Visa"} föreningens grundmall (återanvänds)
        </button>
        {visaGrundmall && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted">
              Egna grundkrav läggs till i alla renoveringar utöver standardlistan.
            </p>
            <ul className="space-y-1">
              {grundmall.extraGrundkrav.map((p) => (
                <li
                  key={p.id}
                  className="flex items-start justify-between gap-2 rounded border border-border px-2 py-1 text-sm"
                >
                  <span>{p.text}</span>
                  <button
                    type="button"
                    onClick={() => taBortGrundmallPunkt(p.id)}
                    className="text-xs text-muted hover:text-red-600"
                  >
                    Ta bort
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input
                type="text"
                value={nyGrundmallPunkt}
                onChange={(e) => setNyGrundmallPunkt(e.target.value)}
                placeholder="Nytt grundkrav för föreningen…"
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={laggTillGrundmallPunkt}
                className="rounded-lg border border-primary px-3 py-2 text-sm text-primary-dark"
              >
                Lägg till
              </button>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Välj renoveringstyp
        </h3>
        <p className="mt-2 text-sm text-muted">
          Checklistan byggs för lägenhet{" "}
          {projekt?.lagenhetsnummer ? (
            <strong>lgh {projekt.lagenhetsnummer}</strong>
          ) : (
            "(välj lägenhet ovan)"
          )}
          . {grundkrav.etikett} ingår när minst en typ är vald.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {renoveringsTyper.map((typ) => {
          const vald = valdaTyper.includes(typ.id);
          return (
            <div
              key={typ.id}
              className={`rounded-xl border p-4 ${
                vald ? "border-primary bg-[#eef6f0]" : "border-border bg-background"
              }`}
            >
              <label className="flex cursor-pointer gap-3">
                <input
                  type="checkbox"
                  checked={vald}
                  disabled={!projekt?.apartmentId}
                  onChange={() => toggleTyp(typ.id)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{typ.etikett}</span>
                  <span className="mt-1 block text-xs text-muted">
                    {typ.beskrivning}
                  </span>
                </span>
              </label>
            </div>
          );
        })}
      </div>

      {sektioner.length > 0 && (
        <div className="rounded-2xl border border-border bg-background/80 p-4 sm:p-6">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-primary-dark">Checklista</p>
              <p className="mt-1 text-sm text-muted">
                Bocka av i takt med inkommande underlag. Datum ovan syns i
                lägenhetsarkivet för framtida uppföljning.
              </p>
            </div>
            <p className="rounded-full bg-[#e2f0e6] px-3 py-1 text-sm font-medium text-primary-dark">
              {antalKlara} av {allaPunktIds.length} klara
            </p>
          </div>

          <div className="mt-6 space-y-6">
            {sektioner.map(({ sektion, punkter }) => (
              <section key={sektion.id}>
                <h4 className="text-base font-semibold">{sektion.etikett}</h4>
                <ul className="mt-3 space-y-2">
                  {punkter.map((punkt) => {
                    const key = checklistaPunktId(sektion.id, punkt.id);
                    const klar = klaraPunkter.has(key);
                    return (
                      <li key={key}>
                        <label
                          className={`flex cursor-pointer gap-3 rounded-lg border px-3 py-2.5 ${
                            klar
                              ? "border-primary/40 bg-[#eef6f0]"
                              : "border-border bg-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={klar}
                            onChange={() => togglePunkt(key)}
                            className="mt-0.5 h-4 w-4 shrink-0"
                          />
                          <span className="text-sm leading-relaxed">{punkt.text}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={sparaChecklista}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Spara checklista
            </button>
            <button
              type="button"
              onClick={skapaMapparIArkiv}
              disabled={!projekt?.apartmentId || valdaTyper.length === 0}
              className="rounded-lg border border-primary px-4 py-2.5 text-sm font-medium text-primary-dark hover:bg-[#eef6f0] disabled:opacity-50"
            >
              Skapa mappar i lägenhetsarkiv
            </button>
            <Link
              href={
                projekt?.lagenhetsnummer
                  ? `/forening/medlemmar?lgh=${encodeURIComponent(projekt.lagenhetsnummer)}#lagenhetsarkiv`
                  : "#lagenhetsarkiv"
              }
              className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted hover:bg-background"
            >
              Öppna lägenhet i arkivet
            </Link>
          </div>
        </div>
      )}

      {allaKlara && projekt?.apartmentId && (
        <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-[#eef6f0]/50 p-4 sm:p-6">
          <h4 className="text-base font-semibold text-primary-dark">
            Ombyggnadsavtal till medlemmen
          </h4>
          <p className="mt-2 text-sm text-muted">
            När styrelsen är överens — lägg till undertecknare i lägenheten och
            skicka avtalet för BankID-signering. Signerat avtal sparas automatiskt i
            renoveringsmappen.
          </p>
          <p className="mt-2 text-xs text-muted">
            Villkor redigeras under ombyggnadsavtal i lägenhetsarkivet om ni behöver
            justera punkter innan utskick.
          </p>

          <ul className="mt-3 space-y-1 text-sm">
            {undertecknare.map((u) => (
              <li key={u.id}>
                {u.namn} · {u.epost}
              </li>
            ))}
          </ul>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <input
              type="text"
              value={nyNamn}
              onChange={(e) => setNyNamn(e.target.value)}
              placeholder="Namn"
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={nyPnr}
              onChange={(e) => setNyPnr(e.target.value)}
              placeholder="Personnummer"
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
            <input
              type="email"
              value={nyEpost}
              onChange={(e) => setNyEpost(e.target.value)}
              placeholder="E-post"
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void laggTillUndertecknare()}
              className="rounded-lg border border-primary px-4 py-2 text-sm text-primary-dark"
            >
              Lägg till undertecknare
            </button>
            <button
              type="button"
              disabled={skickarAvtal}
              onClick={() => void skickaOmbyggnadsavtal()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {skickarAvtal ? "Skickar…" : "Mejla ombyggnadsavtal för signering"}
            </button>
          </div>
        </div>
      )}

      {status && (
        <p className="text-sm text-foreground" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
