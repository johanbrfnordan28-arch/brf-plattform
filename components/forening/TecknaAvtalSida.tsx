"use client";

import { useCallback, useEffect, useState } from "react";
import { ForeningAvtalPanel } from "@/components/forening/ForeningAvtalPanel";
import { ForeningGrunduppgifterPanel } from "@/components/forening/ForeningGrunduppgifterPanel";
import { ForeningProfilFormular } from "@/components/forening/ForeningProfilFormular";
import { arEgenTestForening } from "@/lib/forening-inloggning";
import {
  arKundForening,
  kanGodkannaAvtal,
} from "@/lib/forening-kund";
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
  const check = profil && egen ? kanGodkannaAvtal(profil) : { ok: false, saknas: [] };
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
          Under prövoperioden har ni redan samma funktioner som en kund. Skillnaden
          är att avtalet gör föreningen permanent — den raderas inte efter{" "}
          {PROVOPERIODE_DAGAR} dagar
          {dagarKvar != null && !kund ? ` (${dagarKvar} dagar kvar nu)` : ""}.
        </p>
        {!kund && (
          <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-foreground">
            {INGAR_SOM_KUND.map((rad) => (
              <li key={rad}>{rad}</li>
            ))}
          </ul>
        )}
      </div>

      {egen && !kund && !check.ok && (
        <div className="space-y-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <p className="font-semibold">Komplettera uppgifter först</p>
            <p className="mt-1">
              Saknas: {check.saknas.join(", ")}. Fyll i och spara nedan — sedan
              kan två personer signera avtalet med BankID.
            </p>
          </div>
          <ForeningProfilFormular />
          <ForeningGrunduppgifterPanel />
        </div>
      )}

      <ForeningAvtalPanel />
    </div>
  );
}
