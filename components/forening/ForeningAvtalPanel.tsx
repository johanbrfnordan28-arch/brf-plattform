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
  byggAvtalsText,
  dagarKvarAvProvoperiod,
  formatAvtalsDatum,
} from "@/lib/forening-avtal";
import { sparaKundavtal } from "@/components/foreningsinformation/kundavtal-lager";
import {
  AVTAL_UNDERTECKNARE_ANTAL,
  AVTAL_UNDERTECKNARE_EVENT,
  lasAvtalsUndertecknare,
  undertecknareSaknas,
  type AvtalsUndertecknareVal,
} from "@/lib/avtal-undertecknare-val";

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
  const [undertecknare, setUndertecknare] = useState<AvtalsUndertecknareVal[]>(
    [],
  );

  const ladda = useCallback(() => {
    const p = lasForeningProfil(lasAktivForeningId());
    setProfil(p);
    setUndertecknare(
      p ? lasAvtalsUndertecknare(p.id, p.styrelseledamoter) : [],
    );
    setRedo(true);
  }, []);

  useEffect(() => {
    ladda();
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    window.addEventListener(AVTAL_UNDERTECKNARE_EVENT, ladda);
    return () => {
      window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
      window.removeEventListener(AVTAL_UNDERTECKNARE_EVENT, ladda);
    };
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
  const valdaUndertecknare = undertecknare.filter(
    (person) => !undertecknareSaknas(person),
  );
  const tvaSignatarer = valdaUndertecknare.length >= AVTAL_UNDERTECKNARE_ANTAL;
  const avtalsPart = {
    ...avtalsPartFranProfil(profil),
    foretradare: valdaUndertecknare.map((person) => ({
      namn: person.namn,
      roll: person.roll,
      epost: person.epost,
    })),
  };

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
    if (klar) {
      const personer = lasAvtalsUndertecknare(
        uppdaterad.id,
        uppdaterad.styrelseledamoter,
      ).filter((person) => !undertecknareSaknas(person));
      const part = {
        ...avtalsPartFranProfil(uppdaterad),
        foretradare: personer.map((person) => ({
          namn: person.namn,
          roll: person.roll,
          epost: person.epost,
        })),
      };
      sparaKundavtal({
        foreningsNamn: uppdaterad.namn,
        text: byggAvtalsText(part, {
          statusrad: `Status: signerat med BankID ${formatAvtalsDatum(new Date().toISOString())}.`,
        }),
        status: "signerat",
        undertecknare: personer.map((person) => ({
          namn: person.namn,
          epost: person.epost,
        })),
      });
    }
    let status = res.ok
      ? klar
        ? "Avtalet är signerat med BankID av två personer och sparat."
        : `Signatur 1 av ${BANKID_KRAV_SIGNATURER} sparad. Nästa person ska signera med sitt personnummer.`
      : `Signerat lokalt. Server: ${data.fel || "kunde inte synkas"}`;
    if (klar) {
      const personer = lasAvtalsUndertecknare(
        uppdaterad.id,
        uppdaterad.styrelseledamoter,
      );
      const skickad = await skickaForeningFakturaKlient({
        foreningId: uppdaterad.id,
        foreningsNamn: uppdaterad.namn,
        organisationsnummer: uppdaterad.organisationsnummer,
        faktura: fakturaFranProfil(uppdaterad),
        antalLagenheter: hamtaAntalLagenheterForFaktura(),
        undertecknare: personer.map((person) => ({
          namn: person.namn,
          epost: person.epost,
        })),
      });
      status = skickad.ok
        ? `${status} ${skickad.meddelande}`
        : `${status} ${skickad.meddelande}`;
    }
    setServerStatus(status);
  }

  const signering = (
    <div
      id="signera"
      className="scroll-mt-24 rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="rounded-lg border border-border bg-surface/50 px-3 py-3 text-sm">
        <p className="font-medium text-foreground">
          Styrelsen i avtalet ({valdaUndertecknare.length} av{" "}
          {AVTAL_UNDERTECKNARE_ANTAL} signerar)
        </p>
        {profil.styrelseledamoter.some((ledamot) => ledamot.namn.trim()) ? (
          <ul className="mt-2 space-y-1 text-foreground">
            {profil.styrelseledamoter
              .filter((ledamot) => ledamot.namn.trim())
              .map((ledamot) => (
                <li key={ledamot.id}>
                  {ledamot.signerarAvtal ? "Signerar" : "Ingår i styrelsen"}
                  {" · "}
                  {ledamot.namn}
                  {ledamot.roll.trim() ? ` · ${ledamot.roll}` : ""}
                  {ledamot.epost.trim()
                    ? ` · ${ledamot.epost}`
                    : " · e-post saknas"}
                </li>
              ))}
          </ul>
        ) : (
          <p className="mt-1 text-muted">
            Lägg in styrelsen under Styrelsens medlemmar ovan. Kryssa i två
            personer som ska signera.
          </p>
        )}
        {!tvaSignatarer &&
          profil.styrelseledamoter.some((ledamot) => ledamot.namn.trim()) && (
            <p className="mt-2 text-amber-950">
              Kryssa i två personer i styrelsen som ska signera avtalet.
            </p>
          )}
      </div>

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
          disabled={!check.ok || !bekraftat || !tvaSignatarer}
          ledamoter={profil.styrelseledamoter.filter((ledamot) =>
            ledamot.namn.trim(),
          )}
          disabledOrsak={
            !check.ok
              ? "Komplettera saknade grunduppgifter under Föreningsuppgifter."
              : !tvaSignatarer
                ? "Kryssa i två personer i styrelsen som ska signera avtalet."
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
          part={avtalsPart}
          skapadTidpunkt={profil.skapadTidpunkt}
        />
      )}

      {signering}
    </div>
  );
}
