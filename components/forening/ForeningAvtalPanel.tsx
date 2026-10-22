"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  FORENING_AKTIV_EVENT,
  lasAktivForeningId,
  lasForeningProfil,
  type ForeningProfil,
} from "@/lib/forening-registry";
import { BankIdAvtalSignering } from "@/components/bankid/BankIdAvtalSignering";
import {
  arKundForening,
  kanGodkannaAvtal,
  KUND_LOGIN_PATH,
  registreraKundAvtalSignatur,
} from "@/lib/forening-kund";
import {
  arFakturaUppgifterKlara,
  fakturaFranProfil,
  hamtaAntalLagenheterForFaktura,
  skickaForeningFakturaKlient,
} from "@/lib/forening-faktura";
import {
  BANKID_KRAV_SIGNATURER,
  harTillrackligaBankIdSignaturer,
} from "@/lib/bankid-signering";
import { arEgenTestForening } from "@/lib/forening-inloggning";
import { ARSAVTAL_RABATT_PROCENT } from "@/lib/prislista";
import { ForeningPrisPanel } from "@/components/pris/ForeningPrisPanel";
import { ForeningAvtalsdokument } from "@/components/forening/ForeningAvtalsdokument";
import { avtalsPartFranProfil } from "@/lib/forening-avtal-part";
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
export function ForeningAvtalPanel({
  doljDokument = false,
  doljPris = false,
}: {
  /** Sidan visar redan kundavtalet högre upp. */
  doljDokument?: boolean;
  /** Priset visas redan högre upp. */
  doljPris?: boolean;
} = {}) {
  const [profil, setProfil] = useState<ForeningProfil | null>(null);
  const [redo, setRedo] = useState(false);
  const [bekraftat, setBekraftat] = useState(false);
  const [fel, setFel] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<string | null>(null);

  const ladda = useCallback(() => {
    const p = lasForeningProfil(lasAktivForeningId());
    setProfil(p);
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
            Årsavtal ({AVTAL_LANGD_AR} år) signerat med BankID av två
            företrädare
            {profil.avtalGodkantTidpunkt
              ? ` ${formatAvtalsDatum(profil.avtalGodkantTidpunkt)}`
              : ""}
            . Uppsägningstid {AVTAL_UPPSAGNING_MANADER} månader. Nästa gång
            loggar styrelsen in via{" "}
            <strong className="text-foreground">Logga in</strong> på
            Styrelse-Navets startsida.
          </p>
          {!doljPris && <ForeningPrisPanel variant="avtal" visaLankTillGrund />}
          <Link
            href={KUND_LOGIN_PATH}
            className="mt-4 inline-flex rounded-lg border border-primary/40 bg-white px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
          >
            Öppna kundinloggning
          </Link>
          <p className="mt-3 text-sm text-primary-dark">
            Det signerade avtalet är sparat i portalen.
          </p>
        </div>

        {!doljDokument && (
          <ForeningAvtalsdokument
            part={avtalsPartFranProfil(profil)}
            skapadTidpunkt={profil.skapadTidpunkt}
            signerat={{
              namn: profil.avtalBankidNamn,
              tidpunkt: profil.avtalBankidTidpunkt || profil.avtalGodkantTidpunkt,
              signaturer: profil.avtalBankidSignaturer,
            }}
          />
        )}
      </div>
    );
  }

  const check = kanGodkannaAvtal(profil);
  const dagarKvar = dagarKvarAvProvoperiod(profil.skapadTidpunkt);

  async function signeraMedBankId(
    signatur: Parameters<typeof registreraKundAvtalSignatur>[0],
    personnummerKlartext: string,
  ) {
    setFel(null);
    setServerStatus(null);
    if (!bekraftat) {
      throw new Error("Bekräfta att ni godkänner avtalsvillkoren.");
    }
    const uppdaterad = registreraKundAvtalSignatur(signatur, profil!.id);
    setProfil(uppdaterad);

    const access = hamtaServerAccessNyckel(uppdaterad.id);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (access) headers["x-access-nyckel"] = access;

    const res = await fetch(`/api/foreningar/${uppdaterad.id}/avtal-bankid`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        signerNamn: signatur.namn,
        personnummer: personnummerKlartext,
      }),
    });
    const data = (await res.json()) as { fel?: string };
    const klar = harTillrackligaBankIdSignaturer(uppdaterad.avtalBankidSignaturer);
    let status = res.ok
      ? klar
        ? "Avtalet är signerat med BankID av två personer och sparat."
        : `Signatur 1 av ${BANKID_KRAV_SIGNATURER} sparad. Nästa person ska signera med sitt personnummer.`
      : `Signerat lokalt. Server: ${data.fel || "kunde inte synkas"}`;
    if (klar) {
      const faktura = fakturaFranProfil(uppdaterad);
      const antal = hamtaAntalLagenheterForFaktura();
      if (arFakturaUppgifterKlara(faktura) && antal > 0) {
        const skickad = await skickaForeningFakturaKlient({
          foreningId: uppdaterad.id,
          foreningsNamn: uppdaterad.namn,
          organisationsnummer: uppdaterad.organisationsnummer,
          faktura,
          antalLagenheter: antal,
        });
        status = skickad.ok
          ? `${status} ${skickad.meddelande}`
          : `${status} Fakturan kunde inte skickas: ${skickad.meddelande}`;
      }
    }
    setServerStatus(status);
  }

  const signering = (
    <div
      id="signera"
      className="scroll-mt-24 rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6"
    >
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
          Jag är behörig att teckna avtal för <strong>{profil.namn}</strong> och
          godkänner villkoren i avtalet ovan (prövoperiod {PROVOPERIODE_DAGAR}{" "}
          dagar, därefter årsavtal {AVTAL_LANGD_AR} år, uppsägningstid{" "}
          {AVTAL_UPPSAGNING_MANADER} månader, {ARSAVTAL_RABATT_PROCENT}&nbsp;%
          årsrabatt och KPI-justering).
        </span>
      </label>

      {!check.ok && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          <p className="font-semibold">Uppgifter saknas för att signera</p>
          <p className="mt-1">
            Saknas: {check.saknas.join(", ")}.{" "}
            <Link
              href="/forening/uppgifter#grunduppgifter"
              className="font-medium underline hover:no-underline"
            >
              Öppna grunduppgifter
            </Link>{" "}
            och spara — sedan kan två personer signera.
          </p>
        </div>
      )}

      {fel && (
        <p
          className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {fel}
        </p>
      )}

      <div className="mt-4">
        <BankIdAvtalSignering
          part="kund"
          partEtikett="föreningen"
          signaturer={profil.avtalBankidSignaturer}
          disabled={!check.ok || !bekraftat}
          ledamoter={profil.styrelseledamoter}
          disabledOrsak={
            !check.ok
              ? "Komplettera saknade grunduppgifter under Föreningsuppgifter."
              : !bekraftat
                ? "Bekräfta avtalsvillkoren ovan innan BankID öppnas."
                : undefined
          }
          onSignera={signeraMedBankId}
        />
      </div>

      {serverStatus && (
        <p className="mt-3 text-sm text-primary-dark" role="status">
          {serverStatus}
        </p>
      )}
    </div>
  );

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
          Läs igenom avtalet nedan. Två personer signerar med BankID — var
          och en med sitt personnummer. När båda har signerat blir{" "}
          <strong className="text-foreground">{profil.namn}</strong> kund.
          Prövoperioden är {PROVOPERIODE_DAGAR} dagar utan uppsägningstid
          {dagarKvar != null ? ` — ${dagarKvar} dagar kvar` : ""}. Därefter
          gäller årsavtal ({AVTAL_LANGD_AR} år) med {AVTAL_UPPSAGNING_MANADER}{" "}
          månaders uppsägningstid och prisjustering enligt KPI.
        </p>

        {!doljPris && <ForeningPrisPanel variant="avtal" />}
      </div>

      {!doljDokument && (
        <ForeningAvtalsdokument
          part={avtalsPartFranProfil(profil)}
          skapadTidpunkt={profil.skapadTidpunkt}
        />
      )}

      {signering}
    </div>
  );
}
