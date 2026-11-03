"use client";

import { useCallback, useEffect, useState } from "react";
import { formatBackupDatum } from "@/lib/forening-backup";
import {
  AUTOSYNK_STATUS_EVENT,
  behallWebblasarensVersion,
  hamtaServerversion,
  korAutoSynk,
  lasAutoSynkLage,
  type AutoSynkLage,
} from "@/lib/forening-autosynk";
import { FORENING_AKTIV_EVENT, lasAktivForeningId } from "@/lib/forening-registry";

const KONTROLL_INTERVALL_MS = 60_000;
const SERVERKOLL_INTERVALL_MS = 10 * 60_000;

/**
 * Sparar föreningens data automatiskt på servern och erbjuder att hämta den
 * när webbläsaren saknar den eller när en annan dator har sparat nyare data.
 */
export function ForeningAutoSynk() {
  const [foreningId, setForeningId] = useState("");
  const [lage, setLage] = useState<AutoSynkLage>({ typ: "av" });
  const [arbetar, setArbetar] = useState(false);
  const [fel, setFel] = useState<string | null>(null);

  useEffect(() => {
    const uppdatera = () => setForeningId(lasAktivForeningId());
    uppdatera();
    window.addEventListener(FORENING_AKTIV_EVENT, uppdatera);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, uppdatera);
  }, []);

  useEffect(() => {
    const uppdatera = () => setLage(lasAutoSynkLage());
    window.addEventListener(AUTOSYNK_STATUS_EVENT, uppdatera);
    return () => window.removeEventListener(AUTOSYNK_STATUS_EVENT, uppdatera);
  }, []);

  useEffect(() => {
    if (!foreningId) return;
    let senastServerkoll = 0;
    const kor = (fragaServern: boolean) => {
      if (fragaServern) senastServerkoll = Date.now();
      void korAutoSynk(foreningId, { fragaServern });
    };
    const start = window.setTimeout(() => kor(true), 3000);
    const intervall = window.setInterval(() => {
      kor(Date.now() - senastServerkoll > SERVERKOLL_INTERVALL_MS);
    }, KONTROLL_INTERVALL_MS);
    const vidSynlighet = () => {
      kor(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", vidSynlighet);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(intervall);
      document.removeEventListener("visibilitychange", vidSynlighet);
    };
  }, [foreningId]);

  const hamta = useCallback(async () => {
    if (lage.typ !== "server-nyare" && lage.typ !== "konflikt") return;
    setArbetar(true);
    setFel(null);
    const resultat = await hamtaServerversion(foreningId, lage.senaste, {
      sparaLokaltForst: lage.typ === "konflikt",
    });
    if (resultat) {
      setFel(resultat);
      setArbetar(false);
      return;
    }
    window.location.reload();
  }, [foreningId, lage]);

  const behall = useCallback(async () => {
    if (
      !window.confirm(
        "Spara den här webbläsarens data som föreningens gällande version?\n\nServerns version sparas kvar och kan återställas under Säkerhetskopiering.",
      )
    ) {
      return;
    }
    setArbetar(true);
    setFel(null);
    await behallWebblasarensVersion(foreningId);
    setArbetar(false);
  }, [foreningId]);

  if (lage.typ !== "server-nyare" && lage.typ !== "konflikt") return null;

  const nar = formatBackupDatum(lage.senaste.exportedAt);
  const av = lage.senaste.skapadAvEpost ? ` av ${lage.senaste.skapadAvEpost}` : "";
  const text =
    lage.typ === "server-nyare"
      ? `Föreningen har nyare data sparad på servern (${nar}${av}). Hämta den till den här webbläsaren.`
      : lage.forstaGangen
        ? `Föreningens data finns redan sparad på servern (${nar}${av}) och skiljer sig från den här webbläsaren. Vilken version ska gälla?`
        : `Någon har sparat ändringar från en annan dator (${nar}${av}) samtidigt som den här webbläsaren har ändringar. Vilken version ska gälla?`;

  return (
    <div
      role="alertdialog"
      aria-labelledby="autosynk-rubrik"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-xl border border-primary/40 bg-white p-4 shadow-lg"
    >
      <p id="autosynk-rubrik" className="text-sm font-semibold text-foreground">
        Föreningens data på servern
      </p>
      <p className="mt-1 text-sm text-muted">{text}</p>
      {lage.typ === "konflikt" ? (
        <p className="mt-1 text-xs text-muted">
          Ingenting raderas: versionen som inte väljs sparas som säkerhetskopia.
          Automatisk sparning är pausad tills ni väljer.
        </p>
      ) : null}
      {fel && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {fel}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={arbetar}
          onClick={() => void hamta()}
          className="brf-knapp-gron px-4 py-2 text-sm disabled:opacity-50"
        >
          {arbetar ? "Hämtar …" : "Hämta serverns version"}
        </button>
        {lage.typ === "konflikt" ? (
          <button
            type="button"
            disabled={arbetar}
            onClick={() => void behall()}
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium hover:border-primary/40 disabled:opacity-50"
          >
            Behåll den här webbläsarens version
          </button>
        ) : null}
      </div>
    </div>
  );
}
