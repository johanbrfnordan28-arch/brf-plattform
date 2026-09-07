"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { arGrundmallForening, lasAktivForeningId } from "@/lib/forening-registry";
import { behoverFyllaForeningsuppgifter } from "@/lib/styrelse-kontakt";

const UNDANTAG = [
  "/forening/uppgifter",
  "/forening/aktivera",
];

/**
 * Skickar till Föreningsuppgifter om obligatoriska uppgifter saknas.
 * När allt är ifyllt körs ingen omdirigering — användaren landar som vanligt.
 */
export function ForeningUppgifterGate() {
  const pathname = usePathname();
  const skickad = useRef(false);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (!pathname.startsWith("/forening")) return;
    if (UNDANTAG.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
      skickad.current = false;
      return;
    }
    if (arGrundmallForening(lasAktivForeningId())) return;
    if (!behoverFyllaForeningsuppgifter()) return;
    if (skickad.current) return;
    skickad.current = true;
    window.location.replace("/forening/uppgifter");
  }, [pathname]);

  return null;
}
