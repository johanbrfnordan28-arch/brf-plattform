"use client";

import { useCallback, useEffect, useState } from "react";
import {
  arGrundmallId,
  laddaNerForeningBackup,
  listaForeningLagringNycklar,
  nollstallForeningTillStartlage,
} from "@/lib/forening-data-admin";
import {
  FORENING_AKTIV_EVENT,
  hamtaAktivForeningsNamn,
  lasAktivForeningId,
} from "@/lib/forening-registry";
import { arStandardTestForening } from "@/lib/testforeningar";

/**
 * Spara all information + nollställ till startläge för den aktiva föreningen.
 * Visas på /forening/uppgifter (den köpta föreningsportalen).
 */
export function ForeningDataAdmin() {
  const [foreningId, setForeningId] = useState(lasAktivForeningId);
  const [foreningNamn, setForeningNamn] = useState(hamtaAktivForeningsNamn);
  const [antalNycklar, setAntalNycklar] = useState(0);
  const [bekraftaNollstall, setBekraftaNollstall] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [fel, setFel] = useState<string | null>(null);

  const ladda = useCallback(() => {
    const id = lasAktivForeningId();
    setForeningId(id);
    setForeningNamn(hamtaAktivForeningsNamn());
    setAntalNycklar(listaForeningLagringNycklar(id).length);
    setBekraftaNollstall(false);
  }, []);

  useEffect(() => {
    ladda();
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
  }, [ladda]);

  const arGrundmall = arGrundmallId(foreningId);
  const arTest = arStandardTestForening(foreningId);

  function sparaAllInformation() {
    setFel(null);
    try {
      const backup = laddaNerForeningBackup(foreningId);
      const antal = Object.keys(backup.data).length;
      setStatus(
        arGrundmall
          ? `Grundmallens data är sparad (${antal} delar) — filen laddades ner. Ändringar i modulerna sparas också automatiskt i webbläsaren.`
          : `All information för «${backup.foreningNamn}» är sparad (${antal} delar) — filen laddades ner.`,
      );
      setAntalNycklar(listaForeningLagringNycklar(foreningId).length);
    } catch (e) {
      setFel(
        e instanceof Error
          ? e.message
          : "Kunde inte spara — kontrollera att webbläsaren tillåter nedladdningar.",
      );
    }
  }

  function nollstall() {
    setFel(null);
    setStatus(null);
    const resultat = nollstallForeningTillStartlage(foreningId);
    if (!resultat.ok) {
      setFel(resultat.meddelande);
      setBekraftaNollstall(false);
      return;
    }
    setStatus(resultat.meddelande);
    setBekraftaNollstall(false);
    ladda();
    // Ladda om så alla moduler plockar upp det tomma/seedade läget.
    window.setTimeout(() => {
      window.location.assign("/forening/uppgifter");
    }, 600);
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
          Data & säkerhet
        </p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">
          {arGrundmall
            ? "Spara grundmallens information"
            : "Spara och nollställ föreningen"}
        </h2>
        <p className="mt-1 text-sm text-muted">
          Aktiv förening:{" "}
          <strong className="text-foreground">{foreningNamn}</strong>
          {arTest ? " (testförening)" : arGrundmall ? " (grundmall)" : ""}
          {antalNycklar > 0
            ? ` · ${antalNycklar} sparade datadelar i webbläsaren`
            : ""}
          .
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-primary/25 bg-[#eef6f0]/50 p-4">
          <p className="text-sm font-semibold text-foreground">
            {arGrundmall
              ? "Spara grundmallens data"
              : "Spara all information"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {arGrundmall
              ? "Laddar ner en JSON-fil med all inmatad information i grundmallen. Modulerna sparas redan automatiskt — den här knappen ger dig en säkerhetskopia."
              : "Laddar ner en JSON-fil med all inmatad information (underhållsplan, lägenheter, upphandling, dokument m.m.). Använd som säkerhetskopia innan ni testar vidare."}
          </p>
          <button
            type="button"
            onClick={sparaAllInformation}
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            {arGrundmall ? "Spara grundmallens data" : "Spara all information"}
          </button>
        </div>

        {!arGrundmall && (
          <div className="rounded-xl border border-red-200 bg-red-50/40 p-4">
            <p className="text-sm font-semibold text-foreground">
              Nollställ till startläge
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {arTest
                ? "Raderar all inmatad testdata och återställer föreningen till ursprungligt startläge med demoplan."
                : "Raderar all inmatad information och återställer föreningen till startläge utifrån grundmallen. Föreningsnamnet behålls."}
            </p>
            {!bekraftaNollstall ? (
              <button
                type="button"
                onClick={() => {
                  setBekraftaNollstall(true);
                  setStatus(null);
                  setFel(null);
                }}
                className="mt-3 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-50"
              >
                Nollställ föreningen…
              </button>
            ) : (
              <div className="mt-3 space-y-2" role="alertdialog">
                <p className="text-xs font-medium text-red-900">
                  All inmatad data i «{foreningNamn}» raderas permanent. Vill du
                  fortsätta?
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={nollstall}
                    className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
                  >
                    Ja, nollställ till startläge
                  </button>
                  <button
                    type="button"
                    onClick={() => setBekraftaNollstall(false)}
                    className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {status && (
        <p
          className="rounded-lg border border-primary/20 bg-[#eef6f0] px-3 py-2 text-sm text-primary-dark"
          role="status"
        >
          {status}
        </p>
      )}
      {fel && (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {fel}
        </p>
      )}
    </div>
  );
}
