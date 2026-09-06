"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  FORENING_AKTIV_EVENT,
  lasAktivForeningId,
  lasForeningProfil,
  sparaForeningProfil,
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
import { ARSAVTAL_RABATT_PROCENT } from "@/lib/prislista";
import { ForeningPrisPanel } from "@/components/pris/ForeningPrisPanel";
import { ForeningAvtalsdokument } from "@/components/forening/ForeningAvtalsdokument";
import { hamtaServerAccessNyckel } from "@/lib/forening-server-sync";
import {
  AVTAL_LANGD_AR,
  AVTAL_UPPSAGNING_MANADER,
  PROVOPERIODE_DAGAR,
  dagarKvarAvProvoperiod,
  formatAvtalsDatum,
} from "@/lib/forening-avtal";

/**
 * Godkänn ettårsavtal — kräver BankID-signering.
 */
export function ForeningAvtalPanel() {
  const [profil, setProfil] = useState<ForeningProfil | null>(null);
  const [redo, setRedo] = useState(false);
  const [bekraftat, setBekraftat] = useState(false);
  const [signerNamn, setSignerNamn] = useState("");
  const [bankidSteg, setBankidSteg] = useState<"idle" | "pagar" | "klar">(
    "idle",
  );
  const [fel, setFel] = useState<string | null>(null);
  const [sparar, setSparar] = useState(false);
  const [serverStatus, setServerStatus] = useState<string | null>(null);

  const ladda = useCallback(() => {
    const p = lasForeningProfil(lasAktivForeningId());
    setProfil(p);
    setSignerNamn((nu) => nu || p?.kontaktperson || "");
    setRedo(true);
  }, []);

  useEffect(() => {
    ladda();
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
  }, [ladda]);

  if (!redo) {
    return <p className="text-sm text-muted">Laddar avtalsstatus …</p>;
  }

  if (!profil || !arEgenTestForening(profil.id)) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5 text-sm text-muted">
        Avtal tecknas för er egen skapade förening (inte demoföreningar).{" "}
        <Link
          href="/prova-gratis"
          className="font-medium text-primary-dark underline"
        >
          Skapa er förening
        </Link>
        .
      </div>
    );
  }

  if (arKundForening(profil)) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-primary/40 bg-[#eef6f0] p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
            Kundavtal
          </p>
          <h3 className="mt-1 text-lg font-bold text-foreground">
            {profil.namn} är kund
          </h3>
          <p className="mt-2 text-sm text-muted">
            Årsavtal ({AVTAL_LANGD_AR} år) signerat med BankID
            {profil.avtalBankidNamn ? ` av ${profil.avtalBankidNamn}` : ""}
            {profil.avtalGodkantTidpunkt
              ? ` ${formatAvtalsDatum(profil.avtalGodkantTidpunkt)}`
              : ""}
            . Uppsägningstid {AVTAL_UPPSAGNING_MANADER} månader. Nästa gång
            loggar styrelsen in via{" "}
            <strong className="text-foreground">{KUND_LOGIN_KNAPP_RUBRIK}</strong>{" "}
            på Styrelse-Navet.
          </p>
          <ForeningPrisPanel variant="avtal" visaLankTillGrund />
          <Link
            href={KUND_LOGIN_PATH}
            className="mt-4 inline-flex rounded-lg border border-primary/40 bg-white px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
          >
            Öppna kundinloggning
          </Link>
        </div>

        <ForeningAvtalsdokument
          part={{
            foreningsNamn: profil.namn,
            organisationsnummer: profil.organisationsnummer,
            ort: profil.ort,
          }}
          skapadTidpunkt={profil.skapadTidpunkt}
          signerat={{
            namn: profil.avtalBankidNamn,
            tidpunkt: profil.avtalBankidTidpunkt || profil.avtalGodkantTidpunkt,
          }}
        />
      </div>
    );
  }

  const check = kanGodkannaAvtal(profil);
  const dagarKvar = dagarKvarAvProvoperiod(profil.skapadTidpunkt);

  async function signeraMedBankId() {
    setFel(null);
    setServerStatus(null);
    if (!bekraftat) {
      setFel("Bekräfta att ni godkänner avtalsvillkoren.");
      return;
    }
    if (!signerNamn.trim()) {
      setFel("Ange namn för BankID-signering.");
      return;
    }
    setSparar(true);
    setBankidSteg("pagar");
    try {
      await new Promise((r) => window.setTimeout(r, 1800));

      const uppdaterad = godkannForeningsAvtal(profil!.id);
      const medBankid = {
        ...uppdaterad,
        avtalBankidNamn: signerNamn.trim(),
        avtalBankidTidpunkt: new Date().toISOString(),
      };
      sparaForeningProfil(medBankid, { synkaServer: false });
      setBankidSteg("klar");
      setProfil(medBankid);

      const access = hamtaServerAccessNyckel(medBankid.id);
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (access) headers["x-access-nyckel"] = access;

      const res = await fetch(`/api/foreningar/${medBankid.id}/avtal-bankid`, {
        method: "POST",
        headers,
        body: JSON.stringify({ signerNamn: signerNamn.trim() }),
      });
      const data = (await res.json()) as { fel?: string };
      setServerStatus(
        res.ok
          ? "Avtalet är signerat med BankID och sparat."
          : `Signerat lokalt. Server: ${data.fel || "kunde inte synkas"}`,
      );
    } catch (e) {
      setBankidSteg("idle");
      setFel(e instanceof Error ? e.message : "Kunde inte signera avtalet.");
    } finally {
      setSparar(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Bli kund
        </p>
        <h3 className="mt-1 text-lg font-bold text-foreground">
          Signera avtal med BankID för {profil.namn}
        </h3>
        <p className="mt-2 text-sm text-muted">
          Läs igenom avtalet nedan. När ni signerar med BankID blir{" "}
          <strong className="text-foreground">{profil.namn}</strong> kund.
          Prövoperioden är {PROVOPERIODE_DAGAR} dagar utan uppsägningstid
          {dagarKvar != null
            ? ` — ${dagarKvar} dagar kvar`
            : ""}
          . Därefter gäller årsavtal ({AVTAL_LANGD_AR} år) med{" "}
          {AVTAL_UPPSAGNING_MANADER} månaders uppsägningstid och prisjustering
          enligt KPI.
        </p>

        <ForeningPrisPanel variant="avtal" />

        {!check.ok && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            <p className="font-semibold">Fyll i och spara uppgifter först</p>
            <p className="mt-1">
              Saknas: {check.saknas.join(", ")}. Gå till formuläret ovan, spara,
              och kom tillbaka hit.
            </p>
          </div>
        )}
      </div>

      <ForeningAvtalsdokument
        part={{
          foreningsNamn: profil.namn,
          organisationsnummer: profil.organisationsnummer,
          ort: profil.ort,
        }}
        skapadTidpunkt={profil.skapadTidpunkt}
      />

      <div className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-foreground">
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
            Jag är behörig att teckna avtal för{" "}
            <strong>{profil.namn}</strong> och godkänner villkoren i avtalet
            ovan (prövoperiod {PROVOPERIODE_DAGAR} dagar, därefter årsavtal{" "}
            {AVTAL_LANGD_AR} år, uppsägningstid {AVTAL_UPPSAGNING_MANADER}{" "}
            månader, {ARSAVTAL_RABATT_PROCENT}&nbsp;% årsrabatt och
            KPI-justering).
          </span>
        </label>

        <label className="mt-4 block text-sm">
          <span className="font-medium text-foreground">
            Namn vid BankID-signering
          </span>
          <input
            type="text"
            value={signerNamn}
            onChange={(e) => setSignerNamn(e.target.value)}
            disabled={!check.ok || sparar}
            placeholder="För- och efternamn"
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
          />
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
          onClick={() => void signeraMedBankId()}
          disabled={!check.ok || sparar}
          className="mt-4 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {bankidSteg === "pagar"
            ? "Öppnar BankID …"
            : bankidSteg === "klar"
              ? "Signerat"
              : `Signera avtal för ${profil.namn} med BankID`}
        </button>

        <p className="mt-2 text-xs text-muted">
          Demo: simulerad BankID-signering tills riktig e-legitimation kopplas
          in.
        </p>

        {serverStatus && (
          <p className="mt-3 text-sm text-primary-dark" role="status">
            {serverStatus}
          </p>
        )}
      </div>
    </div>
  );
}
