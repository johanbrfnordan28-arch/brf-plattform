"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { arEgenTestForening } from "@/lib/forening-inloggning";
import {
  arKundForening,
  TECKNA_AVTAL_PATH,
} from "@/lib/forening-kund";
import {
  dagarKvarAvProvoperiod,
  PROVOPERIODE_DAGAR,
} from "@/lib/forening-avtal";
import {
  FORENING_AKTIV_EVENT,
  lasAktivForeningId,
  lasForeningProfil,
} from "@/lib/forening-registry";

/**
 * Synlig väg till avtal för testföreningar i prövoperiod.
 * Döljs när avtalet är tecknat och på själva avtalsidan.
 */
export function TecknaAvtalBaner() {
  const pathname = usePathname();
  const [visa, setVisa] = useState(false);
  const [dagarKvar, setDagarKvar] = useState<number | null>(null);
  const [namn, setNamn] = useState("");

  const ladda = useCallback(() => {
    const profil = lasForeningProfil(lasAktivForeningId());
    if (
      !profil ||
      !arEgenTestForening(profil.id) ||
      arKundForening(profil)
    ) {
      setVisa(false);
      return;
    }
    setNamn(profil.namn);
    setDagarKvar(dagarKvarAvProvoperiod(profil.skapadTidpunkt));
    setVisa(true);
  }, []);

  useEffect(() => {
    ladda();
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
  }, [ladda]);

  if (!visa || pathname.startsWith(TECKNA_AVTAL_PATH)) return null;

  return (
    <div className="border-b border-primary/25 bg-[#eef6f0]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <p className="text-sm text-foreground">
          <span className="font-semibold text-primary-dark">
            {namn || "Er förening"}
          </span>
          {" · "}
          prövoperiod {PROVOPERIODE_DAGAR} dagar
          {dagarKvar != null ? ` — ${dagarKvar} dagar kvar` : ""}. Tecknar ni
          avtal blir ni kund och behåller alla funktioner.
        </p>
        <Link
          href={TECKNA_AVTAL_PATH}
          className="brf-knapp-gron shrink-0 px-4 py-2 text-sm"
        >
          Teckna avtal och bli kund
        </Link>
      </div>
    </div>
  );
}
