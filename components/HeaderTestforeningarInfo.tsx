"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FORENING_AKTIV_EVENT } from "@/lib/forening-registry";
import { antalInloggningsForeningar } from "@/lib/forening-inloggning";

/**
 * Huvudmeny på Styrelse-Navet: tydlig inloggning + antal sparade testföreningar.
 */
export function HeaderTestforeningarInfo() {
  const [antal, setAntal] = useState<number | null>(null);

  useEffect(() => {
    function ladda() {
      setAntal(antalInloggningsForeningar());
    }
    ladda();
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    window.addEventListener("storage", ladda);
    return () => {
      window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
      window.removeEventListener("storage", ladda);
    };
  }, []);

  return (
    <Link
      href="/styrelse-login"
      className="brf-knapp-gron flex flex-col items-start px-4 py-1.5 text-left leading-tight sm:items-center sm:text-center"
    >
      <span className="text-sm font-semibold">Logga in styrelse</span>
      <span className="text-[11px] font-medium text-white/90">
        {antal == null
          ? "Testföreningar"
          : antal === 1
            ? "1 pågående testförening"
            : `${antal} pågående testföreningar`}
      </span>
    </Link>
  );
}
