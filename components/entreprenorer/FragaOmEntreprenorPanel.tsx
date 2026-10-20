"use client";

import { useState } from "react";
import { KONTAKT_EPOST, kontaktMailto } from "@/lib/kontakt-epost";
import { hamtaAktivForeningsNamn } from "@/lib/forening-registry";

export function FragaOmEntreprenorPanel() {
  const [arbete, setArbete] = useState("");
  const [ort, setOrt] = useState("");
  const [beskrivning, setBeskrivning] = useState("");

  function mejla(event: React.FormEvent) {
    event.preventDefault();
    const forening = hamtaAktivForeningsNamn();
    const brodtext = [
      `Förening: ${forening}`,
      arbete.trim() ? `Typ av arbete: ${arbete.trim()}` : "",
      ort.trim() ? `Ort / område: ${ort.trim()}` : "",
      "",
      beskrivning.trim() || "Vi vill fråga om en entreprenör till ett uppdrag.",
      "",
      "Vi förstår att föreningen ansvarar för uppdraget och att Styrelse-Navet inte tar ansvar för valet eller utförandet.",
    ]
      .filter((rad) => rad !== "")
      .join("\n");
    window.location.href = kontaktMailto(
      KONTAKT_EPOST.johan,
      `Fråga om entreprenör — ${forening}`,
      brodtext,
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-surface/60 p-4 sm:p-5">
        <p className="text-sm font-semibold text-foreground">
          Fråga Styrelse-Navet om entreprenör
        </p>
        <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted">
          <li>
            <span className="font-medium text-foreground">
              Föreningen har ansvaret.
            </span>{" "}
            Uppdraget som entreprenören anlitas för är föreningens. Styrelse-Navet
            tar inget ansvar för valet, avtalet eller utförandet.
          </li>
          <li>
            <span className="font-medium text-foreground">
              Vi har goda erfarenheter
            </span>{" "}
            av de entreprenörer vi tipsar om. Ta ändå egna referenser och teckna
            avtalet skriftligt.
          </li>
          <li>
            <span className="font-medium text-foreground">Vid missnöje</span> hör
            föreningen av sig. Styrelse-Navet frågar entreprenören och ber om en
            förklaring. Kan en godtagbar förklaring lämnas finns entreprenören
            kvar bland dem vi tipsar om. Annars tas entreprenören bort.
          </li>
        </ul>
      </div>

      <form
        onSubmit={mejla}
        className="rounded-2xl border border-border bg-white p-5 shadow-sm"
      >
        <h3 className="text-base font-semibold text-foreground">
          Mejla en förfrågan
        </h3>
        <p className="mt-1 text-sm text-muted">
          Beskriv arbetet. Mejlet öppnas till {KONTAKT_EPOST.johan}, så ni kan
          läsa det innan det skickas.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-foreground">Typ av arbete</span>
            <input
              value={arbete}
              onChange={(e) => setArbete(e.target.value)}
              placeholder="t.ex. tak, stambyte, fasad"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-foreground">Ort eller område</span>
            <input
              value={ort}
              onChange={(e) => setOrt(e.target.value)}
              placeholder="t.ex. Stockholm"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-foreground">
              Vad behöver ni hjälp med?
            </span>
            <textarea
              value={beskrivning}
              onChange={(e) => setBeskrivning(e.target.value)}
              rows={4}
              placeholder="Kort om fastigheten och uppdraget"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
        </div>
        <button type="submit" className="brf-knapp-gron mt-4 px-5 py-2.5 text-sm">
          Mejla Styrelse-Navet
        </button>
      </form>
    </div>
  );
}
