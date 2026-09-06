"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { FORENING_AKTIV_EVENT } from "@/lib/forening-registry";
import { uppdateraForeningSidtitel } from "@/lib/forening-sidtitlar";

/** Sätter flikrubrik: hubbnamn på /forening, annars föreningens namn + modul. */
export function ForeningSidTitel() {
  const pathname = usePathname();

  useEffect(() => {
    function sync() {
      uppdateraForeningSidtitel(pathname);
    }
    sync();
    const direkt = window.setTimeout(sync, 0);
    const efterHydrering = window.setTimeout(sync, 50);
    window.addEventListener(FORENING_AKTIV_EVENT, sync);
    return () => {
      window.clearTimeout(direkt);
      window.clearTimeout(efterHydrering);
      window.removeEventListener(FORENING_AKTIV_EVENT, sync);
    };
  }, [pathname]);

  return null;
}
