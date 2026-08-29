"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FORENING_AKTIV_EVENT } from "@/lib/forening-registry";
import { listaTestperiodForeningar } from "@/lib/forening-kund";
import { TEST_LOGIN_PATH } from "@/lib/forening-kund";

/**
 * Länk till testperiod / skapade föreningar utan avtal.
 */
export function HeaderTestperiodLank() {
  const [antal, setAntal] = useState<number | null>(null);

  useEffect(() => {
    function ladda() {
      setAntal(listaTestperiodForeningar().length);
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
      ? "Pågående test"
      : antal === 0
        ? "Pågående test"
        : antal === 1
          ? "1 testförening"
          : `${antal} testföreningar`;

  return (
    <Link
      href={TEST_LOGIN_PATH}
      className="hidden flex-col items-start rounded-lg border border-border bg-surface px-3 py-1.5 text-left leading-tight transition-colors hover:border-primary/50 sm:flex sm:items-center sm:text-center"
    >
      <span className="text-sm font-medium text-foreground">Testperiod</span>
      <span className="text-[11px] text-muted">{undertext}</span>
    </Link>
  );
}
