"use client";

import { useState } from "react";
import {
  demoStyrelseledamoter,
  formatDatum,
  formatTidpunkt,
  hamtaSpårbarhetForUpphandling,
  hamtaStyrelseBeslut,
  harTillrackligaGodkannanden,
  kravStyrelseGodkannanden,
  lasUpphandlingLager,
  laggTillBeslutGodkannande,
  laggTillPubliceringsGodkannande,
  registreraMejlbeslut,
  registreraProtokollfort,
  slutforStyrelsebeslut,
  sparaUpphandlingLager,
  type StyrelseBeslut,
  type StyrelseGodkannande,
  type UpphandlingsSpårbarhet,
} from "@/components/upphandling/upphandling-lager";

type StyrelseGodkannandeSektionProps = {
  rubrik: string;
  beskrivning: string;
  godkannanden: StyrelseGodkannande[];
  kategoriKey?: string;
  upphandlingId?: string;
  typ: "publicering" | "beslut";
  inaktiverad?: boolean;
  onUppdaterad: () => void;
};

export function StyrelseGodkannandeSektion({
  rubrik,
  beskrivning,
  godkannanden,
  kategoriKey,
  upphandlingId,
  typ,
  inaktiverad = false,
  onUppdaterad,
}: StyrelseGodkannandeSektionProps) {
  const [valdLedamot, setValdLedamot] = useState("");
  const [fel, setFel] = useState<string | null>(null);

  function godkann() {
    if (!valdLedamot) {
      setFel("Välj vem du är i styrelsen.");
      return;
    }

    const lager = lasUpphandlingLager();
    const result =
      typ === "publicering" && kategoriKey
        ? laggTillPubliceringsGodkannande(lager, kategoriKey, valdLedamot)
        : typ === "beslut" && upphandlingId
          ? laggTillBeslutGodkannande(lager, upphandlingId, valdLedamot)
          : { fel: "Ogiltigt läge." as const };

    if ("fel" in result) {
      setFel(result.fel);
      return;
    }

    sparaUpphandlingLager(result.lager);
    setFel(null);
    setValdLedamot("");
    onUppdaterad();
  }

  const klart = harTillrackligaGodkannanden(godkannanden);

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <h5 className="text-sm font-semibold text-foreground">{rubrik}</h5>
      <p className="mt-1 text-xs leading-relaxed text-muted">{beskrivning}</p>

      <ul className="mt-3 space-y-2">
        {godkannanden.map((g) => (
          <li
            key={`${g.ledamotId}-${g.tidpunkt}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#eef6f0]/80 px-3 py-2 text-sm"
          >
            <span>
              <span className="font-medium text-foreground">{g.namn}</span>
              <span className="text-muted"> · {g.roll}</span>
            </span>
            <span className="text-xs text-muted">{formatTidpunkt(g.tidpunkt)}</span>
          </li>
        ))}
        {godkannanden.length === 0 && (
          <li className="text-sm text-muted">Inga godkännanden ännu.</li>
        )}
      </ul>

      {!klart && !inaktiverad && (
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <label className="text-sm">
            <span className="font-medium text-foreground">Jag är</span>
            <select
              value={valdLedamot}
              onChange={(event) => setValdLedamot(event.target.value)}
              className="mt-1 block min-w-[220px] rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            >
              <option value="">Välj styrelseledamot…</option>
              {demoStyrelseledamoter.map((l) => (
                <option key={l.id} value={l.id} disabled={godkannanden.some((g) => g.ledamotId === l.id)}>
                  {l.namn} ({l.roll})
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={godkann}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Godkänn
          </button>
        </div>
      )}

      <p className="mt-3 text-xs text-muted">
        {klart
          ? `${kravStyrelseGodkannanden} godkännanden registrerade.`
          : `${godkannanden.length} av ${kravStyrelseGodkannanden} godkännanden.`}
      </p>

      {fel && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {fel}
        </p>
      )}
    </div>
  );
}

type StyrelseBeslutSektionProps = {
  upphandlingId: string;
  onUppdaterad: () => void;
};

export function StyrelseBeslutSektion({
  upphandlingId,
  onUppdaterad,
}: StyrelseBeslutSektionProps) {
  const lager = lasUpphandlingLager();
  const beslut = hamtaStyrelseBeslut(lager, upphandlingId);
  const spårbarhet = hamtaSpårbarhetForUpphandling(lager, upphandlingId);

  const [valdLedamot, setValdLedamot] = useState("");
  const [protokollDatum, setProtokollDatum] = useState(beslut.protokollDatum);
  const [protokollReferens, setProtokollReferens] = useState(beslut.protokollReferens);
  const [mejlDatum, setMejlDatum] = useState(beslut.mejlDatum);
  const [mejlReferens, setMejlReferens] = useState(beslut.mejlReferens);
  const [fel, setFel] = useState<string | null>(null);

  const inaktiverad = beslut.slutfort;
  const vald = demoStyrelseledamoter.find((l) => l.id === valdLedamot);

  function sparaProtokoll() {
    if (!vald) {
      setFel("Välj vem som registrerar protokollföringen.");
      return;
    }
    const result = registreraProtokollfort(lasUpphandlingLager(), upphandlingId, {
      datum: protokollDatum,
      referens: protokollReferens,
      av: vald.namn,
    });
    if ("fel" in result) {
      setFel(result.fel);
      return;
    }
    sparaUpphandlingLager(result.lager);
    setFel(null);
    onUppdaterad();
  }

  function sparaMejl() {
    if (!vald) {
      setFel("Välj vem som registrerar mejlbeslutet.");
      return;
    }
    const result = registreraMejlbeslut(lasUpphandlingLager(), upphandlingId, {
      datum: mejlDatum,
      referens: mejlReferens,
      av: vald.namn,
    });
    if ("fel" in result) {
      setFel(result.fel);
      return;
    }
    sparaUpphandlingLager(result.lager);
    setFel(null);
    onUppdaterad();
  }

  function slutfor() {
    if (!vald) {
      setFel("Välj vem som låser beslutet.");
      return;
    }
    const result = slutforStyrelsebeslut(lasUpphandlingLager(), upphandlingId, vald.namn);
    if ("fel" in result) {
      setFel(result.fel);
      return;
    }
    sparaUpphandlingLager(result.lager);
    setFel(null);
    onUppdaterad();
  }

  return (
    <div className="mt-4 space-y-4 rounded-xl border-2 border-primary/20 bg-surface p-4 sm:p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
          Styrelsebeslut · endast styrelsen
        </p>
        <h4 className="mt-1 text-sm font-semibold text-foreground">
          Godkännande och dokumentation av beslut
        </h4>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Två ledamöter godkänner beslutet efter anbudsutvärdering. Registrera sedan
          protokollfört och/eller mejlbeslut — allt sparas i spårbarhetsloggen.
        </p>
      </div>

      <StyrelseGodkannandeSektion
        rubrik="Godkännande av beslut"
        beskrivning="Två olika styrelseledamöter godkänner att styrelsen fattar beslut utifrån anbudsutvärderingen."
        godkannanden={beslut.godkannanden}
        upphandlingId={upphandlingId}
        typ="beslut"
        inaktiverad={inaktiverad}
        onUppdaterad={onUppdaterad}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <fieldset
          disabled={inaktiverad}
          className="rounded-lg border border-border bg-background p-4 disabled:opacity-60"
        >
          <legend className="px-1 text-sm font-semibold text-foreground">
            Protokollfört
          </legend>
          <label className="mt-3 block text-sm">
            <span className="text-muted">Protokolldatum</span>
            <input
              type="date"
              value={protokollDatum}
              onChange={(event) => setProtokollDatum(event.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
          <label className="mt-3 block text-sm">
            <span className="text-muted">Referens (valfritt)</span>
            <input
              type="text"
              value={protokollReferens}
              onChange={(event) => setProtokollReferens(event.target.value)}
              placeholder="T.ex. § 14 styrelsemöte 2026-03-12"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={sparaProtokoll}
            disabled={inaktiverad}
            className="mt-3 rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6] disabled:cursor-not-allowed"
          >
            {beslut.protokollfort ? "Uppdatera protokollfört" : "Registrera protokollfört"}
          </button>
          {beslut.protokollfort && (
            <p className="mt-2 text-xs text-primary-dark">
              Protokollfört {formatDatum(beslut.protokollDatum)}
              {beslut.protokollReferens ? ` · ${beslut.protokollReferens}` : ""}
            </p>
          )}
        </fieldset>

        <fieldset
          disabled={inaktiverad}
          className="rounded-lg border border-border bg-background p-4 disabled:opacity-60"
        >
          <legend className="px-1 text-sm font-semibold text-foreground">
            Mejlbeslut
          </legend>
          <label className="mt-3 block text-sm">
            <span className="text-muted">Datum för mejlbeslut</span>
            <input
              type="date"
              value={mejlDatum}
              onChange={(event) => setMejlDatum(event.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
          <label className="mt-3 block text-sm">
            <span className="text-muted">Referens (valfritt)</span>
            <input
              type="text"
              value={mejlReferens}
              onChange={(event) => setMejlReferens(event.target.value)}
              placeholder="T.ex. Ämnesrad eller tråd-id"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={sparaMejl}
            disabled={inaktiverad}
            className="mt-3 rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6] disabled:cursor-not-allowed"
          >
            {beslut.mejlbeslut ? "Uppdatera mejlbeslut" : "Registrera mejlbeslut"}
          </button>
          {beslut.mejlbeslut && (
            <p className="mt-2 text-xs text-primary-dark">
              Mejlbeslut {formatDatum(beslut.mejlDatum)}
              {beslut.mejlReferens ? ` · ${beslut.mejlReferens}` : ""}
            </p>
          )}
        </fieldset>
      </div>

      {!inaktiverad && (
        <div className="flex flex-wrap items-end gap-3 border-t border-border pt-4">
          <label className="text-sm">
            <span className="font-medium text-foreground">Lås beslut som</span>
            <select
              value={valdLedamot}
              onChange={(event) => setValdLedamot(event.target.value)}
              className="mt-1 block min-w-[220px] rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            >
              <option value="">Välj styrelseledamot…</option>
              {demoStyrelseledamoter.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.namn} ({l.roll})
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={slutfor}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Slutför och spara beslut
          </button>
        </div>
      )}

      {beslut.slutfort && (
        <p className="rounded-lg bg-[#eef6f0] px-4 py-3 text-sm text-primary-dark">
          Beslutet är dokumenterat och låst sedan {formatTidpunkt(beslut.slutfortTidpunkt ?? "")}.
        </p>
      )}

      {fel && (
        <p className="text-sm text-red-700" role="alert">
          {fel}
        </p>
      )}

      <SpårbarhetsLogg rader={spårbarhet} />
    </div>
  );
}

function SpårbarhetsLogg({ rader }: { rader: UpphandlingsSpårbarhet[] }) {
  if (rader.length === 0) return null;

  return (
    <details className="rounded-lg border border-border bg-background/80 p-4">
      <summary className="cursor-pointer text-sm font-semibold text-foreground">
        Spårbarhetslogg ({rader.length})
      </summary>
      <ol className="mt-3 space-y-2 border-t border-border pt-3">
        {rader.map((rad) => (
          <li key={rad.id} className="text-xs leading-relaxed text-muted">
            <span className="font-medium text-foreground">{formatTidpunkt(rad.tidpunkt)}</span>
            {" · "}
            {rad.beskrivning}
            <span className="block text-[11px] text-muted/80">Av: {rad.av}</span>
          </li>
        ))}
      </ol>
    </details>
  );
}

export function visaStyrelseBeslutSammanfattning(beslut: StyrelseBeslut): string | null {
  if (!beslut.slutfort) return null;
  const delar: string[] = [];
  if (beslut.protokollfort) {
    delar.push(`protokollfört ${formatDatum(beslut.protokollDatum)}`);
  }
  if (beslut.mejlbeslut) {
    delar.push(`mejlbeslut ${formatDatum(beslut.mejlDatum)}`);
  }
  return delar.length > 0 ? delar.join(" och ") : "beslut dokumenterat";
}
