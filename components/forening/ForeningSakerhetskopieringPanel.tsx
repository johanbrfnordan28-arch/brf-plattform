"use client";

import { useCallback, useEffect, useState } from "react";
import { laddaNerForeningSakerhetskopia } from "@/lib/forening-backup";
import {
  arGrundmallForening,
  FORENING_AKTIV_EVENT,
  lasAktivForeningId,
  lasForeningProfil,
} from "@/lib/forening-registry";

/**
 * Låter styrelsen ladda ner en säkerhetskopia av föreningens data.
 * Ansvaret för lagring ligger hos föreningen.
 */
export function ForeningSakerhetskopieringPanel() {
  const [redo, setRedo] = useState(false);
  const [foreningsNamn, setForeningsNamn] = useState("");
  const [arGrundmall, setArGrundmall] = useState(true);
  const [meddelande, setMeddelande] = useState<string | null>(null);
  const [fel, setFel] = useState<string | null>(null);

  const ladda = useCallback(() => {
    const id = lasAktivForeningId();
    const grundmall = arGrundmallForening(id);
    setArGrundmall(grundmall);
    setForeningsNamn(lasForeningProfil(id)?.namn?.trim() || "");
    setRedo(true);
  }, []);

  useEffect(() => {
    ladda();
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
  }, [ladda]);

  function hanteraBackup() {
    setMeddelande(null);
    setFel(null);
    const resultat = laddaNerForeningSakerhetskopia();
    if (!resultat.ok) {
      setFel(resultat.fel || "Kunde inte skapa säkerhetskopia.");
      return;
    }
    setMeddelande(
      `Säkerhetskopia nedladdad (${resultat.filnamn}). Spara filen på en plats ni kontrollerar — t.ex. styrelsens gemensamma moln eller USB.`,
    );
  }

  if (!redo || arGrundmall) return null;

  return (
    <section
      id="sakerhetskopiering"
      className="scroll-mt-24 rounded-xl border border-border bg-white p-5 sm:p-6"
      aria-labelledby="sakerhetskopiering-rubrik"
    >
      <h2
        id="sakerhetskopiering-rubrik"
        className="text-lg font-bold text-foreground"
      >
        Säkerhetskopiering
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Ladda ner en kopia av{" "}
        <strong className="font-medium text-foreground">
          {foreningsNamn || "er förenings"}
        </strong>{" "}
        uppgifter i den här webbläsaren (underhållsplan, årshjul, medlemmar,
        upphandling m.m.). Filen sparas hos er — ansvaret för backup ligger hos
        föreningen.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={hanteraBackup}
          className="brf-knapp-gron px-5 py-2.5 text-sm shadow-sm"
        >
          Ladda ner säkerhetskopia
        </button>
        <p className="text-xs text-muted">
          JSON-fil · kan öppnas eller arkiveras av styrelsen
        </p>
      </div>

      {meddelande && (
        <p
          className="mt-3 rounded-lg border border-primary/30 bg-[#eef6f0] px-3 py-2 text-sm text-primary-dark"
          role="status"
        >
          {meddelande}
        </p>
      )}
      {fel && (
        <p
          className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {fel}
        </p>
      )}
    </section>
  );
}
