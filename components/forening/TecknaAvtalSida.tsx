"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AvtalsUndertecknarePanel } from "@/components/forening/AvtalsUndertecknarePanel";
import { ForeningAvtalPanel } from "@/components/forening/ForeningAvtalPanel";
import { ForeningAvtalsdokument } from "@/components/forening/ForeningAvtalsdokument";
import { ForeningFakturaUppgifter } from "@/components/forening/ForeningFakturaUppgifter";
import {
  lasAvtalsUndertecknare,
  sparaAvtalsUndertecknare,
  type AvtalsUndertecknareVal,
} from "@/lib/avtal-undertecknare-val";
import { avtalsPartFranProfil } from "@/lib/forening-avtal-part";
import { arEgenTestForening } from "@/lib/forening-inloggning";
import { arKundForening } from "@/lib/forening-kund";
import {
  dagarKvarAvProvoperiod,
  PROVOPERIODE_DAGAR,
} from "@/lib/forening-avtal";
import {
  FORENING_AKTIV_EVENT,
  lasAktivForeningId,
  lasForeningProfil,
  type ForeningProfil,
} from "@/lib/forening-registry";

const INGAR_SOM_KUND = [
  "Alla moduler ni redan använder — underhållsplan, rondering, upphandling, årshjul, medlemmar och övrigt — fortsätter utan begränsning.",
  "Föreningen raderas inte efter prövoperioden.",
  "Styrelsen loggar in via «Logga in till er BRF» med samma uppgifter.",
  "Två personer i styrelsen får mejl och signerar avtalet med BankID. Avtalet sparas i portalen.",
];

export function TecknaAvtalSida() {
  const [profil, setProfil] = useState<ForeningProfil | null>(null);
  const [redo, setRedo] = useState(false);
  const [undertecknare, setUndertecknare] = useState<AvtalsUndertecknareVal[]>(
    [],
  );
  const laddadForening = useRef("");

  const ladda = useCallback(() => {
    const nasta = lasForeningProfil(lasAktivForeningId());
    setProfil(nasta);
    if (nasta && laddadForening.current !== nasta.id) {
      laddadForening.current = nasta.id;
      setUndertecknare(
        lasAvtalsUndertecknare(nasta.id, nasta.styrelseledamoter),
      );
    }
    setRedo(true);
  }, []);

  useEffect(() => {
    ladda();
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
  }, [ladda]);

  function andraUndertecknare(personer: AvtalsUndertecknareVal[]) {
    if (!profil) return;
    setUndertecknare(personer);
    sparaAvtalsUndertecknare(profil.id, personer);
  }

  if (!redo) {
    return <p className="text-sm text-muted">Laddar …</p>;
  }

  const egen = profil ? arEgenTestForening(profil.id) : false;
  const kund = arKundForening(profil);
  const dagarKvar = profil ? dagarKvarAvProvoperiod(profil.skapadTidpunkt) : null;
  const part = profil
    ? {
        ...avtalsPartFranProfil(profil),
        foretradare: undertecknare.map((person) => ({
          namn: person.namn,
          roll: person.roll,
          epost: person.epost,
        })),
      }
    : null;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-primary/30 bg-[#eef6f0] p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
          Från testförening till kund
        </p>
        <h2 className="mt-1 text-2xl font-bold text-foreground">
          {kund
            ? `${profil?.namn ?? "Föreningen"} är kund`
            : "Teckna avtal och bli kund"}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground">
          Kundavtalet visar parterna. Två personer i styrelsen tecknar avtalet
          och får ett mejl med länk för att signera med BankID. Det signerade
          avtalet sparas i portalen. Faktureringsuppgifterna fylls i längst ner.
          {dagarKvar != null && !kund
            ? ` Prövoperioden är ${PROVOPERIODE_DAGAR} dagar (${dagarKvar} dagar kvar).`
            : ""}
        </p>
        {!kund && (
          <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-foreground">
            {INGAR_SOM_KUND.map((rad) => (
              <li key={rad}>{rad}</li>
            ))}
          </ul>
        )}
      </div>

      {egen && profil && part && (
        <ForeningAvtalsdokument
          part={part}
          skapadTidpunkt={profil.skapadTidpunkt}
          signerat={
            kund
              ? {
                  namn: profil.avtalBankidNamn,
                  tidpunkt:
                    profil.avtalBankidTidpunkt || profil.avtalGodkantTidpunkt,
                  signaturer: profil.avtalBankidSignaturer,
                }
              : null
          }
        />
      )}

      {egen && profil && !kund && (
        <AvtalsUndertecknarePanel
          foreningId={profil.id}
          foreningsNamn={profil.namn}
          ledamoter={profil.styrelseledamoter}
          personer={undertecknare}
          onChange={andraUndertecknare}
        />
      )}

      <ForeningAvtalPanel doljDokument={Boolean(egen && profil)} />

      {egen && profil && (
        <ForeningFakturaUppgifter profil={profil} onSparad={setProfil} />
      )}
    </div>
  );
}
