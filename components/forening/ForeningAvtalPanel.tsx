"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  FORENING_AKTIV_EVENT,
  lasAktivForeningId,
  lasForeningProfil,
  type ForeningProfil,
} from "@/lib/forening-registry";
import {
  arKundForening,
  godkannForeningsAvtal,
  kanGodkannaAvtal,
  KUND_LOGIN_KNAPP_RUBRIK,
  KUND_LOGIN_PATH,
} from "@/lib/forening-kund";
import { arEgenTestForening } from "@/lib/forening-inloggning";

function formatDatum(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("sv-SE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Godkänn ettårsavtal på föreningssidan — testförening blir kund.
 * Endast den aktiva föreningens uppgifter används.
 */
export function ForeningAvtalPanel() {
  const [profil, setProfil] = useState<ForeningProfil | null>(null);
  const [redo, setRedo] = useState(false);
  const [bekraftat, setBekraftat] = useState(false);
  const [fel, setFel] = useState<string | null>(null);
  const [sparar, setSparar] = useState(false);
  const [serverStatus, setServerStatus] = useState<string | null>(null);

  const ladda = useCallback(() => {
    setProfil(lasForeningProfil(lasAktivForeningId()));
    setRedo(true);
  }, []);

  useEffect(() => {
    ladda();
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
  }, [ladda]);

  if (!redo) {
    return (
      <p className="text-sm text-muted">Laddar avtalsstatus …</p>
    );
  }

  if (!profil || !arEgenTestForening(profil.id)) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5 text-sm text-muted">
        Avtal tecknas för er egen skapade förening (inte demoföreningar).{" "}
        <Link href="/prova-gratis" className="font-medium text-primary-dark underline">
          Skapa er förening
        </Link>
        .
      </div>
    );
  }

  if (arKundForening(profil)) {
    return (
      <div className="rounded-xl border border-primary/40 bg-[#eef6f0] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
          Kundavtal
        </p>
        <h3 className="mt-1 text-lg font-bold text-foreground">
          {profil.namn} är kund
        </h3>
        <p className="mt-2 text-sm text-muted">
          Ettårsavtal godkänt
          {profil.avtalGodkantTidpunkt
            ? ` ${formatDatum(profil.avtalGodkantTidpunkt)}`
            : ""}
          . Nästa gång loggar styrelsen in via{" "}
          <strong className="text-foreground">{KUND_LOGIN_KNAPP_RUBRIK}</strong>{" "}
          på Styrelse-Navet — endast er förening syns, inga andra föreningars
          uppgifter.
        </p>
        <Link
          href={KUND_LOGIN_PATH}
          className="mt-4 inline-flex rounded-lg border border-primary/40 bg-white px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
        >
          Öppna kundinloggning
        </Link>
      </div>
    );
  }

  const check = kanGodkannaAvtal(profil);

  function godkänn() {
    setFel(null);
    setServerStatus(null);
    if (!bekraftat) {
      setFel("Bekräfta att ni godkänner avtalsvillkoren.");
      return;
    }
    setSparar(true);
    try {
      const uppdaterad = godkannForeningsAvtal(profil!.id);
      setBekraftat(false);
      void import("@/lib/forening-server-sync").then(
        async ({ synkaAvtalTillServer }) => {
          const resultat = await synkaAvtalTillServer(
            uppdaterad.id,
            uppdaterad,
          );
          setServerStatus(
            resultat.ok
              ? "Avtalet sparat lokalt och på servern."
              : `Avtalet sparat lokalt. Server: ${resultat.fel}`,
          );
        },
      );
    } catch (e) {
      setFel(e instanceof Error ? e.message : "Kunde inte spara avtalet.");
    } finally {
      setSparar(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Bli kund
      </p>
      <h3 className="mt-1 text-lg font-bold text-foreground">
        Godkänn avtal för {profil.namn}
      </h3>
      <p className="mt-2 text-sm text-muted">
        När ni sparat föreningsuppgifterna kan styrelsen godkänna ettårsavtalet.
        Då blir föreningen kund och inloggning sker via «{KUND_LOGIN_KNAPP_RUBRIK}».
        Endast er förenings data visas — aldrig andra föreningars.
      </p>

      <ul className="mt-4 space-y-1.5 text-sm text-muted">
        <li>Avtalstid: 1 år med automatisk förlängning</li>
        <li>Fakturering kvartalsvis · 30 % rabatt mot månadsdebitering</li>
        <li>Uppsägningstid: 6 månader</li>
      </ul>

      {!check.ok && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          <p className="font-semibold">Fyll i och spara uppgifter först</p>
          <p className="mt-1">
            Saknas: {check.saknas.join(", ")}. Gå till formuläret ovan, spara,
            och kom tillbaka hit.
          </p>
        </div>
      )}

      <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-foreground">
        <input
          type="checkbox"
          checked={bekraftat}
          onChange={(e) => {
            setBekraftat(e.target.checked);
            setFel(null);
          }}
          disabled={!check.ok}
          className="mt-1"
        />
        <span>
          Jag är behörig att teckna avtal för <strong>{profil.namn}</strong> och
          godkänner ettårsavtalet enligt villkoren ovan.
        </span>
      </label>

      {fel && (
        <p
          className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {fel}
        </p>
      )}

      <button
        type="button"
        onClick={godkänn}
        disabled={!check.ok || sparar}
        className="mt-4 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {sparar ? "Sparar …" : "Godkänn avtal och bli kund"}
      </button>

      {serverStatus && (
        <p className="mt-3 text-sm text-primary-dark" role="status">
          {serverStatus}
        </p>
      )}
    </div>
  );
}
