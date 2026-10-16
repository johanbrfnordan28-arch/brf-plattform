"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  kopieraTillUrklipp,
  laddaNedTextfil,
} from "@/components/rondering/exporteraSigneringSchema";
import {
  skapaAvtal,
  skapaAvtalLank,
  skapaOffert,
  hamtaDriftStateFranServer,
  lasDriftState,
  sattKravBankId,
  sparaDriftState,
} from "@/components/rondering/drift-avtal-lager";
import { genereraOffertunderlag } from "@/components/rondering/drift-avtal-text";
import {
  DRIFT_AVTAL_EVENT,
  type DriftAvtal,
  type DriftState,
} from "@/components/rondering/drift-avtal-typer";
import { lasHusEntreprenorerState } from "@/components/entreprenorer/hus-entreprenorer-lager";
import { hamtaAktivaSchemaPunkter } from "@/components/rondering/signering-schema";
import {
  signeringRollInfo,
  type SigneringRoll,
} from "@/components/rondering/signering";
import {
  GRUNDMALL_NAMN,
  lasAktivForeningId,
  lasForeningProfil,
} from "@/lib/forening-registry";

const roller: SigneringRoll[] = ["fastighetsskotare", "stadning"];

export function DriftOffertAvtalPanel() {
  const [roll, setRoll] = useState<SigneringRoll>("stadning");
  const [state, setState] = useState<DriftState>(lasDriftState);
  const [entreprenorNamn, setEntreprenorNamn] = useState("");
  const [entreprenorEpost, setEntreprenorEpost] = useState("");
  const [meddelande, setMeddelande] = useState("");
  const [statusText, setStatusText] = useState<string | null>(null);
  const [kopieradAvtalId, setKopieradAvtalId] = useState<string | null>(null);

  const foreningId = lasAktivForeningId();
  const foreningsNamn = lasForeningProfil(foreningId)?.namn ?? GRUNDMALL_NAMN;
  const husEntreprenorer = useMemo(() => lasHusEntreprenorerState().poster, []);
  const schemaPunkter = hamtaAktivaSchemaPunkter(roll);
  const kravBankId = state.kravBankIdStandard[roll];

  const uppdatera = useCallback(() => {
    setState(lasDriftState());
  }, []);

  useEffect(() => {
    uppdatera();
    void hamtaDriftStateFranServer().then((server) => {
      if (!server) return;
      sparaDriftState(server, undefined, { synkaServer: false });
      setState(server);
    });
    window.addEventListener(DRIFT_AVTAL_EVENT, uppdatera);
    window.addEventListener("rondering-signering-schema-uppdaterad", uppdatera);
    return () => {
      window.removeEventListener(DRIFT_AVTAL_EVENT, uppdatera);
      window.removeEventListener("rondering-signering-schema-uppdaterad", uppdatera);
    };
  }, [uppdatera]);

  const avtalForRoll = state.avtal.filter((a) => a.roll === roll);

  function offertText(): string {
    return genereraOffertunderlag({
      roll,
      foreningsNamn,
      entreprenorNamn,
      extraMeddelande: meddelande,
      schemaPunkter,
    });
  }

  async function kopieraOffert() {
    if (schemaPunkter.length === 0) {
      setStatusText("Lägg till minst ett moment i schemat först.");
      return;
    }
    skapaOffert({
      roll,
      entreprenorNamn,
      entreprenorEpost,
      meddelande,
    });
    const ok = await kopieraTillUrklipp(offertText());
    setStatusText(
      ok
        ? "Offertunderlaget är kopierat. Skicka det till entreprenörerna."
        : "Kunde inte kopiera — använd Ladda ner i stället.",
    );
    uppdatera();
  }

  function laddaNedOffert() {
    if (schemaPunkter.length === 0) {
      setStatusText("Lägg till minst ett moment i schemat först.");
      return;
    }
    skapaOffert({
      roll,
      entreprenorNamn,
      entreprenorEpost,
      meddelande,
    });
    const info = signeringRollInfo[roll];
    laddaNedTextfil(
      offertText(),
      `Offertunderlag_${info.dokument.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.txt`,
    );
    setStatusText("Offertunderlaget är nerladdat.");
    uppdatera();
  }

  function mejlaOffert() {
    if (schemaPunkter.length === 0) {
      setStatusText("Lägg till minst ett moment i schemat först.");
      return;
    }
    skapaOffert({
      roll,
      entreprenorNamn,
      entreprenorEpost,
      meddelande,
    });
    const info = signeringRollInfo[roll];
    const amne = encodeURIComponent(
      `Offertförfrågan ${info.dokument.toLowerCase()} — ${foreningsNamn}`,
    );
    const kropp = encodeURIComponent(offertText());
    const till = entreprenorEpost.trim();
    window.open(`mailto:${till}?subject=${amne}&body=${kropp}`);
    setStatusText("E-postfönstret är öppnat med underlaget.");
    uppdatera();
  }

  function skapaAvtalMedVald() {
    if (!entreprenorNamn.trim()) {
      setStatusText("Ange vilken entreprenör som får avtalet.");
      return;
    }
    if (schemaPunkter.length === 0) {
      setStatusText("Lägg till minst ett moment i schemat först.");
      return;
    }
    const avtal = skapaAvtal({
      roll,
      entreprenorNamn,
      entreprenorEpost,
      offertMeddelande: meddelande,
      kravBankIdKvittens: kravBankId,
    });
    setStatusText(
      `Avtal skapat för ${avtal.entreprenorNamn}. Kopiera länken så de kan godkänna med BankID.`,
    );
    uppdatera();
  }

  async function kopieraAvtalLank(avtal: DriftAvtal) {
    const lank = skapaAvtalLank(avtal);
    try {
      await navigator.clipboard.writeText(lank);
      setKopieradAvtalId(avtal.id);
      window.setTimeout(() => setKopieradAvtalId(null), 2000);
    } catch {
      window.prompt("Kopiera avtalslänken:", lank);
    }
  }

  return (
    <div id="drift-offert-avtal" className="scroll-mt-24 space-y-6">
      <p className="text-sm font-semibold text-foreground">
        Steg 2 — offertunderlag och avtal
      </p>
      <p className="text-sm leading-relaxed text-muted">
        Schemat ni justerat är underlaget. Skicka offert till en eller flera
        entreprenörer, välj part och skapa avtal. Entreprenören godkänner avtalet
        med BankID. Därefter kvitteras varje utfört uppdrag.
      </p>

      <div className="flex flex-wrap gap-2">
        {roller.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRoll(r)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium ${
              roll === r
                ? "border-primary bg-[#eef6f0] text-primary-dark"
                : "border-border text-muted hover:border-primary/40"
            }`}
          >
            {signeringRollInfo[r].titel}
          </button>
        ))}
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-border bg-background p-4 text-sm">
        <input
          type="checkbox"
          checked={kravBankId}
          onChange={(e) => sattKravBankId(roll, e.target.checked)}
          className="mt-0.5"
        />
        <span>
          <span className="font-medium text-foreground">
            Kräv BankID vid varje uppdragskvittens
          </span>
          <span className="mt-1 block text-xs text-muted">
            Avtalet godkänns alltid med BankID. Här väljer ni om städare och
            fastighetsskötare också måste använda BankID när de kvitterar att
            uppdraget är utfört.
          </span>
        </span>
      </label>

      {husEntreprenorer.length > 0 && (
        <label className="block max-w-lg">
          <span className="text-sm font-medium text-foreground">
            Välj från föreningens entreprenörer
          </span>
          <select
            className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            defaultValue=""
            onChange={(e) => {
              const vald = husEntreprenorer.find((p) => p.id === e.target.value);
              if (!vald) return;
              setEntreprenorNamn(vald.namn);
              setEntreprenorEpost(vald.epost);
            }}
          >
            <option value="">— eller fyll i manuellt nedan —</option>
            {husEntreprenorer.map((p) => (
              <option key={p.id} value={p.id}>
                {p.namn}
                {p.kategori ? ` (${p.kategori})` : ""}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-foreground">Entreprenör</span>
          <input
            type="text"
            value={entreprenorNamn}
            onChange={(e) => setEntreprenorNamn(e.target.value)}
            placeholder="Företagsnamn"
            className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-foreground">E-post</span>
          <input
            type="email"
            value={entreprenorEpost}
            onChange={(e) => setEntreprenorEpost(e.target.value)}
            placeholder="offert@foretag.se"
            className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-foreground">
          Meddelande i underlaget (valfritt)
        </span>
        <textarea
          value={meddelande}
          onChange={(e) => setMeddelande(e.target.value)}
          rows={3}
          placeholder="T.ex. omfattning, tider, antal trapphus…"
          className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
      </label>

      <p className="text-xs text-muted">
        {schemaPunkter.length} moment från aktuellt schema följer med i offert och
        avtal.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void kopieraOffert()}
          className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#eef6f0]"
        >
          Kopiera offertunderlag
        </button>
        <button
          type="button"
          onClick={laddaNedOffert}
          className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-surface"
        >
          Ladda ner underlag
        </button>
        <button
          type="button"
          onClick={mejlaOffert}
          className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-surface"
        >
          Mejla underlag
        </button>
        <button
          type="button"
          onClick={skapaAvtalMedVald}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Skapa avtal med vald part
        </button>
      </div>

      {statusText && (
        <p className="text-sm text-primary-dark" role="status">
          {statusText}
        </p>
      )}

      {avtalForRoll.length > 0 && (
        <ul className="space-y-3">
          {avtalForRoll.map((avtal) => {
            const lank = skapaAvtalLank(avtal);
            const godkant = avtal.status === "godkant";
            return (
              <li
                key={avtal.id}
                className="rounded-xl border border-border bg-background p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {avtal.entreprenorNamn}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {avtal.schemaPunkter.length} moment · BankID vid kvittens:{" "}
                      {avtal.kravBankIdKvittens ? "ja" : "nej"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      godkant
                        ? "bg-[#e2f0e6] text-primary-dark"
                        : "bg-amber-50 text-amber-900"
                    }`}
                  >
                    {godkant
                      ? `Godkänt med BankID${avtal.godkantNamn ? ` av ${avtal.godkantNamn}` : ""}`
                      : "Väntar på godkännande"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void kopieraAvtalLank(avtal)}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                  >
                    {kopieradAvtalId === avtal.id
                      ? "Länk kopierad"
                      : "Kopiera avtalslänk"}
                  </button>
                  <a
                    href={lank}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-primary/50"
                  >
                    Förhandsgranska
                  </a>
                </div>
                <p className="mt-2 break-all text-xs text-muted">{lank}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
