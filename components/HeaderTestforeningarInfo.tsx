"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FORENING_AKTIV_EVENT } from "@/lib/forening-registry";
import { antalEgnaTestForeningar } from "@/lib/forening-inloggning";

/**
 * Huvudmeny på Styrelse-Navet: tydlig inloggning + antal sparade (skapade) testföreningar.
 */
export function HeaderTestforeningarInfo() {
  const [antalEgna, setAntalEgna] = useState<number | null>(null);

  useEffect(() => {
    function ladda() {
      setAntalEgna(antalEgnaTestForeningar());
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
    antalEgna == null
      ? "Sök er testförening"
      : antalEgna === 0
        ? "Sök er testförening"
        : antalEgna === 1
          ? "1 sparad testförening"
          : `${antalEgna} sparade testföreningar`;

  return (
    <Link
      href="/styrelse-login"
      className="brf-knapp-gron flex flex-col items-start px-4 py-1.5 text-left leading-tight sm:items-center sm:text-center"
    >
      <span className="text-sm font-semibold">Logga in styrelse</span>
      <span className="text-[11px] font-medium text-white/90">{undertext}</span>
    </Link>
  );
}
