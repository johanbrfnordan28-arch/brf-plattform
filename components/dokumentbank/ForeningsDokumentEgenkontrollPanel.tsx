"use client";

import { useMemo, useState } from "react";
import {
  DOKUMENT_STATUS_ETIKETTER,
  type DokumentStatus,
  type ForeningsDokument,
} from "@/components/dokumentbank/forening-dokumenter-lager";
import {
  allaAktuellaKontrollerBesvarade,
  allaSignerareHarSignatur,
  byggEgenkontrollText,
  EGENKONTROLL_ROLL_ETIKETTER,
  harEnkelBankIdSignatur,
  normaliseraEgenkontroll,
  skapaEgenkontrollPunktId,
  skapaSignerareId,
  skapaVvsEgenkontroll,
  tomAvvikelseDetalj,
  type EgenkontrollPunkt,
  type EgenkontrollSignerare,
  type EgenkontrollSignerareRoll,
  type EgenkontrollState,
} from "@/components/dokumentbank/forening-dokument-egenkontroll";
import { hamtaForeningsDokumentInnehall } from "@/components/dokumentbank/forening-dokument-innehall";
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
};

function initEgenkontroll(dok: ForeningsDokument): EgenkontrollState {
  const befintlig = normaliseraEgenkontroll(dok.egenkontroll);
  if (befintlig) return befintlig;
  return skapaVvsEgenkontroll({
    huvudentreprenorNamn: dok.entreprenor?.namn ?? "",
    huvudArbetsledareNamn: "",
    utforareNamn: [],
  });
}

function idagIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ForeningsDokumentEgenkontrollPanel({
  dokument,
  onSpara,
  onStang,
}: Props) {
  const [titel, setTitel] = useState(dokument.titel);
  const [status, setStatus] = useState<DokumentStatus>(dokument.status);
  const [notering, setNotering] = useState(dokument.notering);
  const [ek, setEk] = useState<EgenkontrollState>(() => initEgenkontroll(dokument));
  const [meddelande, setMeddelande] = useState<string | null>(null);
  const [nyPunktRubrik, setNyPunktRubrik] = useState("");
  const [nySignerareNamn, setNySignerareNamn] = useState("");
  const [nySignerareRoll, setNySignerareRoll] =
    useState<EgenkontrollSignerareRoll>("ovrig");
  const [nySignerareRollEtikett, setNySignerareRollEtikett] = useState("");

  const primarUtforare = ek.utforare[0]?.namn ?? "Utförare";

  const kontrollerKlara = useMemo(
    () => allaAktuellaKontrollerBesvarade(ek.punkter),
    [ek.punkter],
  );

  function egenkontrollHeltKlar(state: EgenkontrollState): boolean {
    return (
      allaAktuellaKontrollerBesvarade(state.punkter) &&
      allaSignerareHarSignatur(state)
    );
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
      punkter: prev.punkter.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }

  function sattStatus(
    id: string,
    status: "utfort" | "avvikelse" | "opåbörjad",
  ) {
    setEk((prev) => ({
      ...prev,
      punkter: prev.punkter.map((p) => {
        if (p.id !== id) return p;
        if (status === "avvikelse") {
          return {
            ...p,
            status: "avvikelse",
            avvikelse: p.avvikelse ?? tomAvvikelseDetalj(),
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
          kontrollDatum: "",
        };
      }),
    }));
  }

  function taBortPunkt(id: string) {
    setEk((prev) => ({
      ...prev,
      punkter: prev.punkter.map((p) =>
        p.id === id ? { ...p, aktuell: false } : p,
      ),
    }));
  }

  function laggTillPunkt() {
    const rubrik = nyPunktRubrik.trim();
    if (!rubrik) return;
    setEk((prev) => ({
      ...prev,
      punkter: [
        ...prev.punkter,
        {
          id: skapaEgenkontrollPunktId(),
          rubrik,
          beskrivning: "",
          aktuell: true,
          status: "opåbörjad",
          kontrollDatum: "",
          kommentar: "",
        },
      ],
    }));
    setNyPunktRubrik("");
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
      <div className="rounded-lg border border-primary/25 bg-[#eef6f0]/70 p-3 text-xs leading-relaxed text-primary-dark">
        Kontrollerna visas i normal utförandeordning. Endast{" "}
        <strong>{primarUtforare}</strong> (utföraren) bockar i Utfört eller
        Avvikelse. Avvikelser beskrivs längre ner. Alla angivna personer
        signerar längst ned med BankID (datum och tid).
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-medium text-muted">
          Dokument / projekt
          <input
            type="text"
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
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

      <div className="grid gap-2 sm:grid-cols-2">
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
          Underentreprenör (företag, valfritt)
          <input
            value={ek.underentreprenorNamn}
            onChange={(e) =>
              setEk((p) => ({ ...p, underentreprenorNamn: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
          />
        </label>
      </div>

      <p className="text-xs text-muted">
        Utförare:{" "}
        {ek.utforare.length
          ? ek.utforare.map((u) => u.namn).join(", ")
          : "— (ange vid skapande av kopia)"}
      </p>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">
          Kontrollpunkter (utförandeordning)
        </p>
        {aktuellaPunkter.map((p, index) => (
          <div
            key={p.id}
            className="rounded-xl border border-border bg-white p-3 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">
                {index + 1}. {p.rubrik}
              </p>
              <button
                type="button"
                onClick={() => taBortPunkt(p.id)}
                className="text-xs text-muted hover:text-red-600"
              >
                Ta bort (ej aktuell)
              </button>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted">{p.beskrivning}</p>
            {p.amaNot && (
              <p className="mt-1 text-xs text-primary-dark">AMA: {p.amaNot}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-4">
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
        ))}

        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={nyPunktRubrik}
            onChange={(e) => setNyPunktRubrik(e.target.value)}
            placeholder="Ny kontrollpunkt — rubrik"
            className="min-w-[200px] flex-1 rounded-lg border border-border px-3 py-2 text-sm"
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

      {avvikelsePunkter.length > 0 && (
        <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-sm font-semibold text-amber-950">
            Avvikelser och reservationer
          </p>
          <p className="text-xs text-amber-950">
            Beskriv varför fullt utförande inte kunnat ske, vilken reservation
            som gäller och när projektledare eller ansvarig chef informerades.
          </p>
          {avvikelsePunkter.map((p) => {
            const a = p.avvikelse ?? tomAvvikelseDetalj();
            return (
              <div
                key={p.id}
                className="rounded-lg border border-amber-200 bg-white p-3"
              >
                <p className="text-sm font-semibold text-foreground">{p.rubrik}</p>
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
                <label className="mt-2 block text-xs text-muted">
                  Datum — projektledare / ansvarig chef informerad
                  <input
                    type="date"
                    value={a.datumChefInformed}
                    onChange={(e) =>
                      uppdateraAvvikelse(p.id, {
                        datumChefInformed: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
                  />
                </label>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-3 rounded-xl border border-border bg-surface/80 p-4">
        <p className="text-sm font-semibold text-foreground">
          Personer som ska signera
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
        {!kontrollerKlara && (
          <p className="text-xs text-amber-950">
            Utföraren måste bocka i alla punkter (Utfört eller Avvikelse), ange
            datum och fylla i avvikelsedetaljer innan signering.
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
          Förhandsgranska
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
