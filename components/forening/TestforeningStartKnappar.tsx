"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FORENING_AKTIV_EVENT } from "@/lib/forening-registry";
import { antalEgnaTestForeningar } from "@/lib/forening-inloggning";
import { TEST_LOGIN_PATH } from "@/lib/forening-kund";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";

type Variant = "hero" | "pris";

/** Skapa förening och testinloggning sida vid sida. Skapa döljs när en förening finns. */
export function TestforeningStartKnappar({ variant }: { variant: Variant }) {
  const [harSkapad, setHarSkapad] = useState<boolean | null>(null);

  useEffect(() => {
    function uppdatera() {
      setHarSkapad(antalEgnaTestForeningar() > 0);
    }
    uppdatera();
    window.addEventListener(FORENING_AKTIV_EVENT, uppdatera);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, uppdatera);
  }, []);

  const skapaKlass =
    variant === "hero"
      ? "brf-knapp-gron px-7 py-3.5 text-base"
      : "brf-knapp-gron px-5 py-2.5 text-sm";
  const loginKlass =
    variant === "hero"
      ? harSkapad
        ? "brf-knapp-gron px-7 py-3.5 text-base"
        : "rounded-lg border-2 border-primary bg-white px-7 py-3.5 text-base font-semibold text-primary-dark transition-colors hover:bg-[#eef6f0]"
      : harSkapad
        ? "brf-knapp-gron px-5 py-2.5 text-sm"
        : "rounded-lg border border-primary bg-white px-5 py-2.5 text-sm font-semibold text-primary-dark hover:bg-[#eef6f0]";

  return (
    <>
      {harSkapad === false && (
        <Link href={PROVA_GRATIS_PATH} className={skapaKlass}>
          {variant === "hero" ? "Skapa förening" : "Vi vill pröva gratis i 30 dagar"}
        </Link>
      )}
      <Link href={TEST_LOGIN_PATH} className={loginKlass}>
        Pröva på förening
      </Link>
    </>
  );
}
