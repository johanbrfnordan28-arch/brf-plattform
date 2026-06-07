"use client";

import { usePathname } from "next/navigation";
import { StyrelseKontaktKort } from "@/components/forening/StyrelseKontaktKort";

const DOLDA_SIDOR = new Set([
  "/forening",
  "/forening/aktivera",
  "/forening/uppgifter",
]);

/** Visar styrelsekontakt på föreningsmoduler (rondering, upphandling, m.m.). */
export function ForeningModulKontakt() {
  const pathname = usePathname();
  if (!pathname.startsWith("/forening") || DOLDA_SIDOR.has(pathname)) {
    return null;
  }
  return <StyrelseKontaktKort kompakt className="mb-6" />;
}
