"use client";

import { useMemo, useState } from "react";
import {
  DOKUMENT_STATUS_ETIKETTER,
  type DokumentStatus,
  type ForeningsDokument,
} from "@/components/dokumentbank/forening-dokumenter-lager";
import {
  allaAktuellaKontrollerBesvarade,
  allaKontrollanterMedAttestHarBankId,
  allaSignerareHarSignatur,
  byggEgenkontrollText,
  EGENKONTROLL_ROLL_ETIKETTER,
  hamtaKontrollantForInitialer,
  harEnkelBankIdSignatur,
  hamtaEllerSkapaEgenkontrollForDokument,
  harEntreprenorTilldelad,
  normaliseraInitialer,
  skapaEgenkontrollPunktId,
  skapaKontrollantId,
  skapaSignerareId,
  synkaAvvikelseNummer,
  tomAvvikelseDetalj,
  avvikelseDetaljerKomplett,
  EGENKONTROLL_PLATS_ETIKETTER,
  fleraKontrollAdresser,
  formateraIsoSomDatumTid,
  franDatetimeLocal,
  tillDatetimeLocalValue,
  type EgenkontrollPlatsTyp,
  type EgenkontrollPunkt,
  type EgenkontrollSignerare,
  type EgenkontrollSignerareRoll,
  type EgenkontrollState,
} from "@/components/dokumentbank/forening-dokument-egenkontroll";
import { lasProjektLista } from "@/components/dokumentbank/dokument-projekt-koppling";
import { hamtaForeningsDokumentInnehall } from "@/components/dokumentbank/forening-dokument-innehall";
import type { ProjektEtapp } from "@/components/projekt/projekt";
import { oppnaForeningsDokumentPreview } from "@/components/dokumentbank/forening-dokument-visning";
import { BankIdEnkelSignering } from "@/components/bankid/BankIdEnkelSignering";
import {
  laggTillBankIdSignatur,
  type BankIdSignatur,
} from "@/lib/bankid-signering";

type Props = {
  dokument: ForeningsDokument;
  onSpara: (patch: Partial<ForeningsDokument>) => void;
  onStang: () => void;
  projektKontext?: {
    projektId: string;
    projektTitel: string;
    etapper?: ProjektEtapp[];
  };
};

function initEgenkontroll(dok: ForeningsDokument): EgenkontrollState {
  return hamtaEllerSkapaEgenkontrollForDokument(dok);
}

function idagIso(): string {
  return new Date().toISOString().slice(0, 10);
}

type PlatsFaltProps = {
  prefix: string;
  platsTyp: EgenkontrollPlatsTyp;
  lagenhetNr: string;
  ytaBenamning: string;
  kontrollAdress: string;
  visaAdress: boolean;
  tillatHela?: boolean;
  onChange: (patch: {
    platsTyp?: EgenkontrollPlatsTyp;
    lagenhetNr?: string;
    ytaBenamning?: string;
    kontrollAdress?: string;
  }) => void;
};

function PlatsFalt({
  prefix,
  platsTyp,
  lagenhetNr,
  ytaBenamning,
  kontrollAdress,
  visaAdress,
  tillatHela = true,
  onChange,
}: PlatsFaltProps) {
  const typer = (
    Object.keys(EGENKONTROLL_PLATS_ETIKETTER) as EgenkontrollPlatsTyp[]
  ).filter((t) => tillatHela || t !== "hela");

  return (
    <div className="mt-2 space-y-2 rounded-lg border border-border/70 bg-[#fafcfb] p-2">
      <p className="text-xs font-medium text-muted">{prefix}</p>
      <label className="block text-xs text-muted">
        Typ
        <select
          value={platsTyp}
          onChange={(e) =>
            onChange({ platsTyp: e.target.value as EgenkontrollPlatsTyp })
          }
          className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
        >
          {typer.map((t) => (
            <option key={t} value={t}>
              {EGENKONTROLL_PLATS_ETIKETTER[t]}
            </option>
          ))}
        </select>
      </label>
      {platsTyp === "lagenhet" && (
        <label className="block text-xs text-muted">
          Lägenhetsnummer
          <input
            value={lagenhetNr}
            onChange={(e) => onChange({ lagenhetNr: e.target.value })}
            placeholder="t.ex. 1201"
            className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
          />
        </label>
      )}
      {platsTyp === "gemensam_yta" && (
        <label className="block text-xs text-muted">
          Yta
          <input
            value={ytaBenamning}
            onChange={(e) => onChange({ ytaBenamning: e.target.value })}
            placeholder="t.ex. Tvättstuga, Trapphus B"
            className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
          />
        </label>
      )}
      {visaAdress && platsTyp !== "hela" && (
        <label className="block text-xs text-muted">
          Adress för denna kontroll
          <input
            value={kontrollAdress}
            onChange={(e) => onChange({ kontrollAdress: e.target.value })}
            placeholder="Ange vilken adress som avses"
            className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
          />
        </label>
      )}
    </div>
  );
}

export function ForeningsDokumentEgenkontrollPanel({
  dokument,
  onSpara,
  onStang,
  projektKontext,
}: Props) {
  const [titel, setTitel] = useState(dokument.titel);
  const [status, setStatus] = useState<DokumentStatus>(dokument.status);
  const [notering, setNotering] = useState(dokument.notering);
  const [ek, setEk] = useState<EgenkontrollState>(() => initEgenkontroll(dokument));
  const [meddelande, setMeddelande] = useState<string | null>(() => {
    const sparade = dokument.egenkontroll?.punkter?.filter(
      (p) => p.aktuell !== false && p.rubrik?.trim(),
    );
    if (!sparade?.length) {
      return "Standardkontroller har laddats. Klicka Spara för att behålla dem i dokumentet.";
    }
    return null;
  });
  const [nyPunktRubrik, setNyPunktRubrik] = useState("");
  const [nyPunktBeskrivning, setNyPunktBeskrivning] = useState("");
  const [nySignerareNamn, setNySignerareNamn] = useState("");
  const [nySignerareRoll, setNySignerareRoll] =
    useState<EgenkontrollSignerareRoll>("ovrig");
  const [nySignerareRollEtikett, setNySignerareRollEtikett] = useState("");

  const entreprenorTilldelad = harEntreprenorTilldelad(ek);
  const fleraAdresser = useMemo(() => fleraKontrollAdresser(ek), [ek]);
  const valbaraEtapper = useMemo(() => {
    if (projektKontext?.etapper?.length) return projektKontext.etapper;
    const ids = dokument.koppladeProjektId ?? [];
    for (const pid of ids) {
      const p = lasProjektLista().find((x) => x.id === pid);
      if (p?.etapper?.length) return p.etapper;
    }
    return [] as ProjektEtapp[];
  }, [projektKontext, dokument.koppladeProjektId]);
  const kontrollerKlara = useMemo(
    () => allaAktuellaKontrollerBesvarade(ek),
    [ek],
  );

  function egenkontrollHeltKlar(state: EgenkontrollState): boolean {
    return (
      allaAktuellaKontrollerBesvarade(state) &&
      allaKontrollanterMedAttestHarBankId(state) &&
      allaSignerareHarSignatur(state)
    );
  }

  function medSynkadePunkter(
    punkter: EgenkontrollState["punkter"],
  ): EgenkontrollState["punkter"] {
    return synkaAvvikelseNummer(punkter);
  }

  function spara(patchEk?: EgenkontrollState, extra?: Partial<ForeningsDokument>) {
    const nextEk = patchEk ?? ek;
    const innehall = byggEgenkontrollText(
      { ...dokument, titel: titel.trim() || dokument.titel },
      nextEk,
    );
    onSpara({
      titel: titel.trim() || dokument.titel,
      status: egenkontrollHeltKlar(nextEk) ? "klar" : status,
      notering,
      egenkontroll: nextEk,
      innehall,
      ...extra,
    });
    setMeddelande("Sparat.");
  }

  function uppdateraPunkt(id: string, patch: Partial<EgenkontrollPunkt>) {
    setEk((prev) => ({
      ...prev,
      punkter: medSynkadePunkter(
        prev.punkter.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      ),
    }));
  }

  function sattStatus(
    id: string,
    status: "utfort" | "avvikelse" | "opåbörjad",
  ) {
    setEk((prev) => ({
      ...prev,
      punkter: medSynkadePunkter(
        prev.punkter.map((p) => {
          if (p.id !== id) return p;
          if (status === "avvikelse") {
            const bas = p.avvikelse ?? tomAvvikelseDetalj();
            return {
              ...p,
              status: "avvikelse",
              avvikelse: {
                ...bas,
                platsTyp:
                  p.platsTyp === "gemensam_yta" ? "gemensam_yta" : "lagenhet",
                lagenhetNr: bas.lagenhetNr || p.lagenhetNr,
                ytaBenamning: bas.ytaBenamning || p.ytaBenamning,
                kontrollAdress: bas.kontrollAdress || p.kontrollAdress,
              },
              kontrollDatum: p.kontrollDatum || idagIso(),
            };
          }
          if (status === "utfort") {
            return {
              ...p,
              status: "utfort",
              avvikelse: undefined,
              kontrollDatum: p.kontrollDatum || idagIso(),
            };
          }
          return {
            ...p,
            status: "opåbörjad",
            avvikelse: undefined,
            avvikelseNr: null,
            kontrollDatum: "",
          };
        }),
      ),
    }));
  }

  function taBortPunkt(id: string) {
    setEk((prev) => ({
      ...prev,
      punkter: medSynkadePunkter(
        prev.punkter.map((p) =>
          p.id === id ? { ...p, aktuell: false } : p,
        ),
      ),
    }));
  }

  function laggTillPunkt() {
    const rubrik = nyPunktRubrik.trim();
    if (!rubrik) return;
    setEk((prev) => ({
      ...prev,
      punkter: medSynkadePunkter([
        ...prev.punkter,
        {
          id: skapaEgenkontrollPunktId(),
          rubrik,
          beskrivning: nyPunktBeskrivning.trim(),
          aktuell: true,
          status: "opåbörjad",
          kontrollDatum: "",
          kommentar: "",
          attestInitialer: "",
          avvikelseNr: null,
          platsTyp: "hela",
          lagenhetNr: "",
          ytaBenamning: "",
          kontrollAdress: "",
        },
      ]),
    }));
    setNyPunktRubrik("");
    setNyPunktBeskrivning("");
  }

  function laggTillKontrollant() {
    setEk((prev) => ({
      ...prev,
      kontrollanter: [
        ...prev.kontrollanter,
        {
          id: skapaKontrollantId(),
          namn: "",
          initialer: "",
          signaturer: [],
        },
      ],
    }));
  }

  function uppdateraKontrollant(
    id: string,
    patch: Partial<EgenkontrollState["kontrollanter"][number]>,
  ) {
    setEk((prev) => ({
      ...prev,
      kontrollanter: prev.kontrollanter.map((k) =>
        k.id === id
          ? {
              ...k,
              ...patch,
              initialer:
                patch.initialer !== undefined
                  ? normaliseraInitialer(patch.initialer)
                  : k.initialer,
            }
          : k,
      ),
    }));
  }

  function taBortKontrollant(id: string) {
    setEk((prev) => ({
      ...prev,
      kontrollanter: prev.kontrollanter.filter((k) => k.id !== id),
    }));
  }

  function signeraKontrollant(kontrollantId: string, signatur: BankIdSignatur) {
    const target = ek.kontrollanter.find((k) => k.id === kontrollantId);
    if (!target) return;
    const result = laggTillBankIdSignatur(
      target.signaturer,
      { ...signatur, part: "foretag" },
      1,
    );
    if (!result.ok) {
      setMeddelande(result.fel);
      return;
    }
    const next: EgenkontrollState = {
      ...ek,
      kontrollanter: ek.kontrollanter.map((k) =>
        k.id === kontrollantId ? { ...k, signaturer: result.signaturer } : k,
      ),
    };
    setEk(next);
    spara(next);
    setMeddelande("Signatur registrerad.");
  }

  function uppdateraAvvikelse(
    punktId: string,
    patch: Partial<EgenkontrollPunkt["avvikelse"]>,
  ) {
    setEk((prev) => ({
      ...prev,
      punkter: prev.punkter.map((p) => {
        if (p.id !== punktId) return p;
        return {
          ...p,
          avvikelse: { ...(p.avvikelse ?? tomAvvikelseDetalj()), ...patch },
        };
      }),
    }));
  }

  function signeraSignerare(signerareId: string, signatur: BankIdSignatur) {
    const target = ek.signerare.find((s) => s.id === signerareId);
    if (!target) return;
    const result = laggTillBankIdSignatur(
      target.signaturer,
      { ...signatur, part: "foretag" },
      1,
    );
    if (!result.ok) {
      setMeddelande(result.fel);
      return;
    }
    const next: EgenkontrollState = {
      ...ek,
      signerare: ek.signerare.map((s) =>
        s.id === signerareId ? { ...s, signaturer: result.signaturer } : s,
      ),
    };
    setEk(next);
    spara(next);
    setMeddelande("Signatur registrerad.");
  }

  function laggTillSignerare() {
    const namn = nySignerareNamn.trim();
    if (!namn) return;
    setEk((prev) => ({
      ...prev,
      signerare: [
        ...prev.signerare,
        {
          id: skapaSignerareId(),
          roll: nySignerareRoll,
          rollEtikett: nySignerareRollEtikett.trim(),
          namn,
          signaturer: [],
        },
      ],
    }));
    setNySignerareNamn("");
    setNySignerareRollEtikett("");
  }

  function taBortSignerare(id: string) {
    setEk((prev) => ({
      ...prev,
      signerare: prev.signerare.filter((s) => s.id !== id),
    }));
  }

  const aktuellaPunkter = ek.punkter.filter((p) => p.aktuell);
  const avvikelsePunkter = aktuellaPunkter.filter((p) => p.status === "avvikelse");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {projektKontext && (
          <p className="rounded-lg border border-primary/30 bg-[#eef6f0] px-3 py-2 text-xs text-primary-dark">
            Sparas i projektet{" "}
            <strong>{projektKontext.projektTitel}</strong> — klicka{" "}
            <strong>Spara</strong> efter varje redigering så att kontrollerna
            ligger kvar i projektet.
          </p>
        )}
        <div className="rounded-lg border border-primary/25 bg-[#eef6f0]/70 p-3 text-xs leading-relaxed text-primary-dark">
          <strong>Förhandsgranska</strong> visar endast läsning. Här under{" "}
          <strong>Granska och redigera</strong> fyller ni i kontrollerna.
          <strong className="mt-2 block">För föreningen:</strong> granska och
          anpassa kontrollplanen — även innan entreprenör finns.
          <strong className="mt-2 block">Huvudentreprenörens huvudansvar:</strong>{" "}
          att egenkontrollen är fullständig, att avvikelser är kommunicerade och
          återkopplade med spårbar tid mot beställare och projektledare, samt
          att BankID-signering är klar innan underlaget lämnas in.
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-xs font-medium text-muted sm:col-span-1">
          Dokument / projekt
          <input
            type="text"
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-muted">
          Etapp
          {valbaraEtapper.length > 0 ? (
            <select
              value={ek.etappId}
              onChange={(e) => {
                const id = e.target.value;
                const namn =
                  valbaraEtapper.find((x) => x.id === id)?.namn ?? "";
                setEk((prev) => ({ ...prev, etappId: id, etappNamn: namn }));
              }}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            >
              <option value="">— Välj etapp —</option>
              {valbaraEtapper.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.namn}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={ek.etappNamn}
              onChange={(e) =>
                setEk((prev) => ({
                  ...prev,
                  etappNamn: e.target.value,
                  etappId: "",
                }))
              }
              placeholder="Anges i projektet vid start, eller fritt här"
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            />
          )}
        </label>
        <label className="block text-xs font-medium text-muted">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as DokumentStatus)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          >
            {(Object.keys(DOKUMENT_STATUS_ETIKETTER) as DokumentStatus[]).map(
              (s) => (
                <option key={s} value={s}>
                  {DOKUMENT_STATUS_ETIKETTER[s]}
                </option>
              ),
            )}
          </select>
        </label>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-surface/60 p-4">
        <p className="text-sm font-semibold text-foreground">
          Omfattning — adresser, lägenheter och ytor
        </p>
        <p className="text-xs text-muted">
          Etapp väljs ovan. Här anges adresser, lägenheter och gemensamma ytor
          som dokumentet omfattar. Vid avvikelse avgränsas platsen ytterligare
          i avvikelsesektionen.
        </p>
        <label className="block text-xs text-muted">
          Adress(er) — en rad per adress om flera gäller
          <textarea
            value={ek.kontrollAdresser}
            onChange={(e) =>
              setEk((prev) => ({ ...prev, kontrollAdresser: e.target.value }))
            }
            rows={2}
            placeholder={"Storgatan 1\nStorgatan 3"}
            className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs text-muted">
            Lägenheter som ingår (nummer, en per rad)
            <textarea
              value={ek.omfattningLagenheter}
              onChange={(e) =>
                setEk((prev) => ({
                  ...prev,
                  omfattningLagenheter: e.target.value,
                }))
              }
              rows={3}
              placeholder={"1101\n1102\n1201"}
              className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
            />
          </label>
          <label className="block text-xs text-muted">
            Gemensamma ytor (en per rad)
            <textarea
              value={ek.omfattningGemensammaYtor}
              onChange={(e) =>
                setEk((prev) => ({
                  ...prev,
                  omfattningGemensammaYtor: e.target.value,
                }))
              }
              rows={3}
              placeholder={"Tvättstuga\nTeknikrum källare"}
              className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
            />
          </label>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border-2 border-primary/20 bg-white p-4">
        <p className="text-sm font-semibold text-foreground">
          Kontrollplan — granskning och redigering (föreningen)
        </p>
        <p className="text-xs text-muted">
          {aktuellaPunkter.length} punkter i utförandeordning. Ändringar syns i
          förhandsgranskning och i underlaget till entreprenören.
        </p>
        {aktuellaPunkter.map((p, index) => (
          <div
            key={p.id}
            className="rounded-xl border border-border bg-[#fafcfb] p-3 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <span className="text-xs font-semibold text-primary-dark">
                Punkt {index + 1}
              </span>
              <button
                type="button"
                onClick={() => taBortPunkt(p.id)}
                className="text-xs text-muted hover:text-red-600"
              >
                Ta bort
              </button>
            </div>
            <label className="mt-2 block text-xs text-muted">
              Rubrik
              <input
                value={p.rubrik}
                onChange={(e) =>
                  uppdateraPunkt(p.id, { rubrik: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm font-medium"
              />
            </label>
            <label className="mt-2 block text-xs text-muted">
              Krav / kontroll (vad föreningen vill att entreprenören ska attestera)
              <textarea
                value={p.beskrivning}
                onChange={(e) =>
                  uppdateraPunkt(p.id, { beskrivning: e.target.value })
                }
                rows={3}
                className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
              />
            </label>
            {p.amaNot && (
              <p className="mt-1 text-xs text-primary-dark">AMA: {p.amaNot}</p>
            )}
            <div className="mt-3 rounded-lg border border-dashed border-border/80 bg-white p-2">
              <p className="text-xs font-medium text-muted">
                Entreprenörens attest (ifylls på plats)
              </p>
              <div className="mt-2 flex flex-wrap items-end gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={p.status === "utfort"}
                  onChange={(e) =>
                    sattStatus(p.id, e.target.checked ? "utfort" : "opåbörjad")
                  }
                />
                Utfört
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={p.status === "avvikelse"}
                  onChange={(e) =>
                    sattStatus(p.id, e.target.checked ? "avvikelse" : "opåbörjad")
                  }
                />
                Avvikelse
              </label>
              {p.status === "avvikelse" && p.avvikelseNr && (
                <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-bold text-amber-950">
                  Nr {p.avvikelseNr}
                </span>
              )}
              <label className="text-xs text-muted">
                Sign
                <input
                  type="text"
                  maxLength={2}
                  value={p.attestInitialer}
                  onChange={(e) =>
                    uppdateraPunkt(p.id, {
                      attestInitialer: normaliseraInitialer(e.target.value),
                    })
                  }
                  placeholder="AB"
                  className="ml-1 w-12 rounded-lg border border-border px-2 py-1 text-center text-sm font-semibold uppercase tracking-widest"
                />
              </label>
              {p.attestInitialer && !hamtaKontrollantForInitialer(ek, p.attestInitialer) && (
                <span className="text-xs text-red-700">
                  Saknas i kontrollpersonal
                </span>
              )}
              <label className="text-xs text-muted">
                Datum
                <input
                  type="date"
                  value={p.kontrollDatum}
                  onChange={(e) =>
                    uppdateraPunkt(p.id, { kontrollDatum: e.target.value })
                  }
                  className="ml-2 rounded-lg border border-border px-2 py-1 text-sm"
                />
              </label>
            </div>
            <label className="mt-2 block text-xs text-muted">
              Kort kommentar (valfritt)
              <input
                value={p.kommentar}
                onChange={(e) =>
                  uppdateraPunkt(p.id, { kommentar: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
            </label>
            </div>
          </div>
        ))}

        <div className="space-y-2 rounded-lg border border-dashed border-primary/40 p-3">
          <p className="text-xs font-medium text-muted">Ny kontrollpunkt</p>
          <input
            type="text"
            value={nyPunktRubrik}
            onChange={(e) => setNyPunktRubrik(e.target.value)}
            placeholder="Rubrik"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
          <textarea
            value={nyPunktBeskrivning}
            onChange={(e) => setNyPunktBeskrivning(e.target.value)}
            placeholder="Krav / kontrolltext"
            rows={2}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={laggTillPunkt}
            className="rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary-dark"
          >
            Lägg till punkt
          </button>
        </div>
      </div>

      <details
        className="rounded-xl border border-border bg-surface/50 p-4"
        open={entreprenorTilldelad}
      >
        <summary className="cursor-pointer text-sm font-semibold text-foreground">
          Entreprenör, utförare och BankID (entreprenörens ansvar)
        </summary>
        <p className="mt-2 text-xs text-muted">
          Ange vilka i personalen som utför kontroller. Varje person får två
          bokstäver (initialer) som skrivs vid varje punkt och kopplas till
          personens BankID-signatur nedan.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <label className="text-xs text-muted">
            Huvudentreprenör (företag)
            <input
              value={ek.huvudentreprenorNamn}
              onChange={(e) =>
                setEk((p) => ({ ...p, huvudentreprenorNamn: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs text-muted">
            Underentreprenör (företag)
            <input
              value={ek.underentreprenorNamn}
              onChange={(e) =>
                setEk((p) => ({ ...p, underentreprenorNamn: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
            />
          </label>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-foreground">Kontrollpersonal</p>
          {ek.kontrollanter.map((k) => (
            <div
              key={k.id}
              className="rounded-lg border border-border bg-white p-3"
            >
              <div className="flex flex-wrap gap-2">
                <label className="text-xs text-muted">
                  Sign
                  <input
                    maxLength={2}
                    value={k.initialer}
                    onChange={(e) =>
                      uppdateraKontrollant(k.id, {
                        initialer: e.target.value,
                      })
                    }
                    className="ml-1 w-12 rounded-lg border border-border px-2 py-1.5 text-center text-sm font-bold uppercase"
                  />
                </label>
                <label className="min-w-[160px] flex-1 text-xs text-muted">
                  Namn
                  <input
                    value={k.namn}
                    onChange={(e) =>
                      uppdateraKontrollant(k.id, { namn: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => taBortKontrollant(k.id)}
                  className="self-end text-xs text-muted hover:text-red-600"
                >
                  Ta bort
                </button>
              </div>
              <div className="mt-3">
                <BankIdEnkelSignering
                  part="foretag"
                  partEtikett={`${k.initialer || "??"} — ${k.namn || "kontrollpersonal"}`}
                  forvaltNamn={k.namn}
                  signaturer={k.signaturer}
                  disabled={!k.namn.trim() || k.initialer.length < 2}
                  disabledOrsak="Ange namn och två initialer först."
                  onSignera={async (sig) => signeraKontrollant(k.id, sig)}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={laggTillKontrollant}
            className="rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary-dark"
          >
            Lägg till kontrollpersonal
          </button>
        </div>
      </details>

      {avvikelsePunkter.length > 0 && (
        <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-sm font-semibold text-amber-950">
            Avvikelser och reservationer
          </p>
          <p className="text-xs text-amber-950">
            Huvudentreprenören ska dokumentera orsak och reservation, tidpunkt
            för kommunikation med beställare/ombud och projektledare, samt
            skriftlig återkoppling från båda — med datum och tid för spårbarhet.
          </p>
          {avvikelsePunkter.map((p) => {
            const a = p.avvikelse ?? tomAvvikelseDetalj(p.avvikelseNr ?? 0);
            const komplett = avvikelseDetaljerKomplett(p, ek);
            const aPlatsTyp = a.platsTyp ?? "lagenhet";
            return (
              <div
                key={p.id}
                className="rounded-lg border border-amber-200 bg-white p-3"
              >
                <p className="text-sm font-semibold text-foreground">
                  Avvikelse {p.avvikelseNr ?? a.nr} — {p.rubrik}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Samma nummer som vid kontrollpunkten ovan (beställaren ser vad
                  avvikelsen avser).
                </p>
                <PlatsFalt
                  prefix="Avvikelsen avser (minsta omfattning)"
                  platsTyp={aPlatsTyp}
                  lagenhetNr={a.lagenhetNr}
                  ytaBenamning={a.ytaBenamning}
                  kontrollAdress={a.kontrollAdress}
                  visaAdress={fleraAdresser}
                  tillatHela={false}
                  onChange={(patch) => uppdateraAvvikelse(p.id, patch)}
                />
                <label className="mt-2 block text-xs text-muted">
                  Orsak
                  <textarea
                    value={a.orsak}
                    onChange={(e) =>
                      uppdateraAvvikelse(p.id, { orsak: e.target.value })
                    }
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="mt-2 block text-xs text-muted">
                  Reservation
                  <textarea
                    value={a.reservation}
                    onChange={(e) =>
                      uppdateraAvvikelse(p.id, { reservation: e.target.value })
                    }
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
                  />
                </label>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs text-muted">
                    Tid — kommunicerat med beställare/ombud
                    <input
                      type="datetime-local"
                      value={tillDatetimeLocalValue(
                        a.tidBeställareKommunikation,
                      )}
                      onChange={(e) =>
                        uppdateraAvvikelse(p.id, {
                          tidBeställareKommunikation: franDatetimeLocal(
                            e.target.value,
                          ),
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
                    />
                  </label>
                  <label className="block text-xs text-muted">
                    Tid — kommunicerat med projektledare
                    <input
                      type="datetime-local"
                      value={tillDatetimeLocalValue(
                        a.tidProjektledareKommunikation,
                      )}
                      onChange={(e) =>
                        uppdateraAvvikelse(p.id, {
                          tidProjektledareKommunikation: franDatetimeLocal(
                            e.target.value,
                          ),
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
                    />
                  </label>
                </div>
                <label className="mt-2 block text-xs text-muted">
                  Återkoppling från beställare/ombud
                  <textarea
                    value={a.beställareÅterkoppling}
                    onChange={(e) =>
                      uppdateraAvvikelse(p.id, {
                        beställareÅterkoppling: e.target.value,
                      })
                    }
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="mt-2 block text-xs text-muted">
                  Tid — återkoppling mottagen från beställare/ombud
                  <input
                    type="datetime-local"
                    value={tillDatetimeLocalValue(a.tidBeställareÅterkoppling)}
                    onChange={(e) =>
                      uppdateraAvvikelse(p.id, {
                        tidBeställareÅterkoppling: franDatetimeLocal(
                          e.target.value,
                        ),
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
                  />
                  {a.tidBeställareÅterkoppling && (
                    <span className="mt-0.5 block text-[11px] text-muted">
                      Registrerat:{" "}
                      {formateraIsoSomDatumTid(a.tidBeställareÅterkoppling)}
                    </span>
                  )}
                </label>
                <label className="mt-2 block text-xs text-muted">
                  Återkoppling från projektledare
                  <textarea
                    value={a.projektledareÅterkoppling}
                    onChange={(e) =>
                      uppdateraAvvikelse(p.id, {
                        projektledareÅterkoppling: e.target.value,
                      })
                    }
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="mt-2 block text-xs text-muted">
                  Tid — återkoppling mottagen från projektledare
                  <input
                    type="datetime-local"
                    value={tillDatetimeLocalValue(
                      a.tidProjektledareÅterkoppling,
                    )}
                    onChange={(e) =>
                      uppdateraAvvikelse(p.id, {
                        tidProjektledareÅterkoppling: franDatetimeLocal(
                          e.target.value,
                        ),
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
                  />
                </label>
                {!komplett && (
                  <p className="mt-2 text-xs font-medium text-red-800">
                    Alla fält ovan krävs innan egenkontrollen kan signeras och
                    anses komplett (huvudentreprenörens ansvar).
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-3 rounded-xl border border-border bg-surface/80 p-4">
        <p className="text-sm font-semibold text-foreground">
          Arbetsledare — BankID (utöver kontrollpersonal ovan)
        </p>
        <p className="text-xs text-muted">
          Underentreprenör och huvudentreprenör signerar här. Kontrollpersonal
          signerar med sina initialer i sektionen ovan.
        </p>
        <ul className="space-y-1 text-sm">
          {ek.signerare.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 py-2"
            >
              <span>
                {s.namn} ·{" "}
                {s.roll === "ovrig"
                  ? s.rollEtikett || EGENKONTROLL_ROLL_ETIKETTER.ovrig
                  : EGENKONTROLL_ROLL_ETIKETTER[s.roll]}
                {harEnkelBankIdSignatur(s.signaturer) && (
                  <span className="ml-2 text-xs text-primary-dark">
                    (signerad{" "}
                    {new Date(s.signaturer[0].tidpunkt).toLocaleString("sv-SE")})
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => taBortSignerare(s.id)}
                className="text-xs text-muted hover:text-red-600"
              >
                Ta bort
              </button>
            </li>
          ))}
        </ul>
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            value={nySignerareNamn}
            onChange={(e) => setNySignerareNamn(e.target.value)}
            placeholder="Namn"
            className="rounded-lg border border-border px-2 py-1.5 text-sm"
          />
          <select
            value={nySignerareRoll}
            onChange={(e) =>
              setNySignerareRoll(e.target.value as EgenkontrollSignerareRoll)
            }
            className="rounded-lg border border-border px-2 py-1.5 text-sm"
          >
            {(Object.keys(EGENKONTROLL_ROLL_ETIKETTER) as EgenkontrollSignerareRoll[]).map(
              (r) => (
                <option key={r} value={r}>
                  {EGENKONTROLL_ROLL_ETIKETTER[r]}
                </option>
              ),
            )}
          </select>
          {nySignerareRoll === "ovrig" ? (
            <input
              value={nySignerareRollEtikett}
              onChange={(e) => setNySignerareRollEtikett(e.target.value)}
              placeholder="Roll / titel"
              className="rounded-lg border border-border px-2 py-1.5 text-sm"
            />
          ) : (
            <button
              type="button"
              onClick={laggTillSignerare}
              className="rounded-lg border border-primary px-2 py-1.5 text-sm text-primary-dark"
            >
              Lägg till person
            </button>
          )}
        </div>
        {nySignerareRoll === "ovrig" && (
          <button
            type="button"
            onClick={laggTillSignerare}
            className="rounded-lg border border-primary px-3 py-1.5 text-sm text-primary-dark"
          >
            Lägg till person
          </button>
        )}

        <p className="text-sm font-semibold text-foreground pt-2">
          Signering med BankID
        </p>
        {ek.signerare.length === 0 && (
          <p className="text-xs text-muted">
            Inga undertecknare ännu — normalt om entreprenör inte tilldelats.
          </p>
        )}
        {!kontrollerKlara && ek.signerare.length > 0 && (
          <p className="text-xs text-amber-950">
            Entreprenören måste bocka i alla punkter, ange initialer och fylla i
            numrerade avvikelser innan BankID-signering.
          </p>
        )}
        {!allaKontrollanterMedAttestHarBankId(ek) && kontrollerKlara && (
          <p className="text-xs text-amber-950">
            All kontrollpersonal som använt sina initialer måste signera med
            BankID.
          </p>
        )}
        {ek.signerare.map((s) => {
          const roll =
            s.roll === "ovrig"
              ? s.rollEtikett || EGENKONTROLL_ROLL_ETIKETTER.ovrig
              : EGENKONTROLL_ROLL_ETIKETTER[s.roll];
          return (
            <BankIdEnkelSignering
              key={s.id}
              part="foretag"
              partEtikett={`${s.namn} — ${roll}`}
              forvaltNamn={s.namn}
              signaturer={s.signaturer}
              disabled={!kontrollerKlara}
              disabledOrsak="Kontrollpunkterna måste vara klara först."
              onSignera={async (sig) => signeraSignerare(s.id, sig)}
            />
          );
        })}
      </div>

      <label className="block text-xs font-medium text-muted">
        Notering
        <input
          value={notering}
          onChange={(e) => setNotering(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      </label>

      {meddelande && (
        <p className="text-xs text-primary-dark" role="status">
          {meddelande}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => spara()}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white"
        >
          Spara
        </button>
        <button
          type="button"
          onClick={() => {
            spara();
            oppnaForeningsDokumentPreview({
              ...dokument,
              titel,
              egenkontroll: ek,
              innehall: hamtaForeningsDokumentInnehall({
                ...dokument,
                titel,
                egenkontroll: ek,
              }),
            });
          }}
          className="rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary-dark"
        >
          Granska (förhandsgranska)
        </button>
        <button
          type="button"
          onClick={onStang}
          className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted"
        >
          Stäng
        </button>
      </div>
    </div>
  );
}
