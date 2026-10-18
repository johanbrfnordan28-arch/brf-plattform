"use client";

import { useCallback, useEffect, useState } from "react";
import { ForeningAvtalPanel } from "@/components/forening/ForeningAvtalPanel";
import { ForeningAvtalSammanfattning } from "@/components/forening/ForeningAvtalSammanfattning";
import { ForeningFakturaUppgifter } from "@/components/forening/ForeningFakturaUppgifter";
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
  "Avtalet tecknas med BankID av två personer, vardera med sitt personnummer.",
];

export function TecknaAvtalSida() {
  const [profil, setProfil] = useState<ForeningProfil | null>(null);
  const [redo, setRedo] = useState(false);

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
    return <p className="text-sm text-muted">Laddar …</p>;
  }

  const egen = profil ? arEgenTestForening(profil.id) : false;
  const kund = arKundForening(profil);
  const dagarKvar = profil ? dagarKvarAvProvoperiod(profil.skapadTidpunkt) : null;

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
          Namn, organisationsnummer och adress hämtas från de grunduppgifter ni
          registrerade. Två personer signerar med BankID. Det enda ni fyller i
          här är fakturamottagare — därefter kan fakturan skickas direkt.
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

      {egen && profil && <ForeningAvtalSammanfattning profil={profil} />}

      {egen && profil && (
        <ForeningFakturaUppgifter profil={profil} onSparad={setProfil} />
      )}

      <ForeningAvtalPanel />
    </div>
  );
}
