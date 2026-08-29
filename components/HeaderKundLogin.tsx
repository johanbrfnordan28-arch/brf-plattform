"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FORENING_AKTIV_EVENT } from "@/lib/forening-registry";
import {
  antalKundForeningar,
  KUND_LOGIN_KNAPP_RUBRIK,
  KUND_LOGIN_KNAPP_UNDERTEXT,
  KUND_LOGIN_PATH,
} from "@/lib/forening-kund";

/**
 * Publika knappen för föreningar med tecknat avtal («befintlig kund» med
 * tydligare namn: Logga in till er BRF).
 */
export function HeaderKundLogin() {
  const [antal, setAntal] = useState<number | null>(null);

  useEffect(() => {
    function ladda() {
      setAntal(antalKundForeningar());
    }
    ladda();
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    window.addEventListener("storage", ladda);
    return () => {
      window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
      window.removeEventListener("storage", ladda);
    };
  }, []);

  const undertext =
    antal == null
      ? KUND_LOGIN_KNAPP_UNDERTEXT
      : antal === 0
        ? KUND_LOGIN_KNAPP_UNDERTEXT
        : antal === 1
          ? "1 förening med avtal"
          : `${antal} föreningar med avtal`;

  return (
    <Link
      href={KUND_LOGIN_PATH}
      className="brf-knapp-gron flex flex-col items-start px-4 py-1.5 text-left leading-tight sm:items-center sm:text-center"
    >
      <span className="text-sm font-semibold">{KUND_LOGIN_KNAPP_RUBRIK}</span>
      <span className="text-[11px] font-medium text-white/90">{undertext}</span>
    </Link>
  );
}
