"use client";

import { useMemo, useState } from "react";
import {
  DOKUMENT_STATUS_ETIKETTER,
  type DokumentStatus,
  type ForeningsDokument,
} from "@/components/dokumentbank/forening-dokumenter-lager";
import {
  allaAktuellaKontrollerBesvarade,
  byggEgenkontrollText,
  harEnkelBankIdSignatur,
  normaliseraEgenkontroll,
  skapaEgenkontrollPunktId,
  skapaVvsEgenkontroll,
  type EgenkontrollPunkt,
  type EgenkontrollPunktStatus,
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
    utforareNamn: [],
  });
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

  const kontrollerKlara = useMemo(
    () => allaAktuellaKontrollerBesvarade(ek.punkter),
    [ek.punkter],
  );

  const sign = ek.slutSignering;
  const utforare1Klar = harEnkelBankIdSignatur(sign.utforare1);
  const utforare2Behovs = ek.utforare.length > 1;
  const utforare2Klar =
    !utforare2Behovs || harEnkelBankIdSignatur(sign.utforare2);
  const utforareKlara = utforare1Klar && utforare2Klar;
  const underBehovs = Boolean(ek.underentreprenorNamn.trim());
  const underKlar =
    !underBehovs || harEnkelBankIdSignatur(sign.underentreprenor);
  const huvudKlar = harEnkelBankIdSignatur(sign.huvudentreprenor);

  function egenkontrollHeltSignerad(state: EgenkontrollState): boolean {
    const s = state.slutSignering;
    const u1 = harEnkelBankIdSignatur(s.utforare1);
    const u2 =
      state.utforare.length <= 1 || harEnkelBankIdSignatur(s.utforare2);
    const under =
      !state.underentreprenorNamn.trim() ||
      harEnkelBankIdSignatur(s.underentreprenor);
    return (
      allaAktuellaKontrollerBesvarade(state.punkter) &&
      u1 &&
      u2 &&
      under &&
      harEnkelBankIdSignatur(s.huvudentreprenor)
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
      status: egenkontrollHeltSignerad(nextEk) ? "klar" : status,
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
          status: "opåbörjad" as EgenkontrollPunktStatus,
          kontrollDatum: "",
          kommentar: "",
          utförareNamn: "",
        },
      ],
    }));
    setNyPunktRubrik("");
  }

  function signeraSlot(
    slot: keyof EgenkontrollState["slutSignering"],
    signatur: BankIdSignatur,
  ) {
    const befintliga = ek.slutSignering[slot];
    const result = laggTillBankIdSignatur(
      befintliga,
      { ...signatur, part: "foretag" },
      1,
    );
    if (!result.ok) {
      setMeddelande(result.fel);
      return;
    }
    const next: EgenkontrollState = {
      ...ek,
      slutSignering: {
        ...ek.slutSignering,
        [slot]: result.signaturer,
      },
    };
    setEk(next);
    spara(next);
    setMeddelande("Signatur registrerad.");
  }

  const aktuellaPunkter = ek.punkter.filter((p) => p.aktuell);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-primary/25 bg-[#eef6f0]/70 p-3 text-xs leading-relaxed text-primary-dark">
        Egenkontroll VVS styrs av entreprenadhandlingar och AMA VVS &amp; AF där
        handlingarna är tysta. Markera varje punkt med status och datum innan
        slutsignering. Signeringsordning: utförare → eventuell underentreprenör
        → huvudentreprenörens arbetsledare.
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
          Huvudentreprenör
          <input
            value={ek.huvudentreprenorNamn}
            onChange={(e) =>
              setEk((p) => ({ ...p, huvudentreprenorNamn: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs text-muted">
          Underentreprenör (valfritt)
          <input
            value={ek.underentreprenorNamn}
            onChange={(e) =>
              setEk((p) => ({ ...p, underentreprenorNamn: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
          />
        </label>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted">Utförare (vid skapande)</p>
        <ul className="mt-1 space-y-1 text-sm text-foreground">
          {ek.utforare.length === 0 ? (
            <li className="text-muted">Inga namn angivna — fyll i vid skapande av kopia.</li>
          ) : (
            ek.utforare.map((u, i) => (
              <li key={u.id}>
                {i + 1}. {u.namn}
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Kontrollpunkter</p>
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
            <div className="mt-3 grid gap-2 sm:grid-cols-4">
              <label className="text-xs text-muted sm:col-span-1">
                Status
                <select
                  value={p.status}
                  onChange={(e) =>
                    uppdateraPunkt(p.id, {
                      status: e.target.value as EgenkontrollPunktStatus,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
                >
                  <option value="opåbörjad">Ej markerad</option>
                  <option value="ok">OK</option>
                  <option value="avvikelse">Avvikelse</option>
                </select>
              </label>
              <label className="text-xs text-muted sm:col-span-1">
                Datum
                <input
                  type="date"
                  value={p.kontrollDatum}
                  onChange={(e) =>
                    uppdateraPunkt(p.id, { kontrollDatum: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
                />
              </label>
              <label className="text-xs text-muted sm:col-span-2">
                Kontrollerad av (namn)
                <input
                  value={p.utförareNamn}
                  onChange={(e) =>
                    uppdateraPunkt(p.id, { utförareNamn: e.target.value })
                  }
                  placeholder="Utförare / kontrollant"
                  className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
                />
              </label>
            </div>
            <label className="mt-2 block text-xs text-muted">
              Kommentar
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

      <div className="space-y-3 rounded-xl border border-border bg-surface/80 p-4">
        <p className="text-sm font-semibold text-foreground">
          Slutsignering med BankID
        </p>
        {!kontrollerKlara && (
          <p className="text-xs text-amber-950">
            Alla aktuella kontrollpunkter måste ha status och datum innan
            signering öppnas.
          </p>
        )}

        {ek.utforare[0] && (
          <BankIdEnkelSignering
            part="foretag"
            partEtikett={`Utförare 1 — ${ek.utforare[0].namn}`}
            forvaltNamn={ek.utforare[0].namn}
            signaturer={sign.utforare1}
            disabled={!kontrollerKlara}
            disabledOrsak="Markera alla kontrollpunkter först."
            onSignera={async (s) => signeraSlot("utforare1", s)}
          />
        )}
        {ek.utforare[1] && (
          <BankIdEnkelSignering
            part="foretag"
            partEtikett={`Utförare 2 — ${ek.utforare[1].namn}`}
            forvaltNamn={ek.utforare[1].namn}
            signaturer={sign.utforare2}
            disabled={!kontrollerKlara || !utforare1Klar}
            disabledOrsak="Utförare 1 måste signera först."
            onSignera={async (s) => signeraSlot("utforare2", s)}
          />
        )}
        {underBehovs && (
          <BankIdEnkelSignering
            part="foretag"
            partEtikett={`Underentreprenör — ${ek.underentreprenorNamn}`}
            signaturer={sign.underentreprenor}
            disabled={!kontrollerKlara || !utforareKlara}
            disabledOrsak="Utförarna måste signera först."
            onSignera={async (s) => signeraSlot("underentreprenor", s)}
          />
        )}
        <BankIdEnkelSignering
          part="foretag"
          partEtikett={`Huvudentreprenör — ${ek.huvudentreprenorNamn || "arbetsledare"}`}
          signaturer={sign.huvudentreprenor}
          disabled={
            !kontrollerKlara ||
            !utforareKlara ||
            (underBehovs && !underKlar)
          }
          disabledOrsak={
            underBehovs
              ? "Underentreprenören måste signera före huvudentreprenören."
              : "Utförarna måste signera först."
          }
          onSignera={async (s) => signeraSlot("huvudentreprenor", s)}
        />
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
