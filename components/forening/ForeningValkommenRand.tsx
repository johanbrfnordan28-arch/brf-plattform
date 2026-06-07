"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAktivForeningsNamn } from "@/components/forening/useAktivForeningsNamn";
import {
  arNyssSkapadForening,
  FORENING_AKTIV_EVENT,
  lasAktivForeningId,
  rensaNyssSkapadMarkering,
} from "@/lib/forening-registry";

/** Kompakt välkomst efter skapande — samma huvudsida som grundmall, ingen formulärruta. */
export function ForeningValkommenRand() {
  const namn = useAktivForeningsNamn();
  const [visa, setVisa] = useState(false);

  useEffect(() => {
    function uppdatera() {
      setVisa(arNyssSkapadForening(lasAktivForeningId()));
    }
    uppdatera();
    window.addEventListener(FORENING_AKTIV_EVENT, uppdatera);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, uppdatera);
  }, []);

  if (!visa) return null;

  function stang() {
    rensaNyssSkapadMarkering();
    setVisa(false);
    window.dispatchEvent(new Event(FORENING_AKTIV_EVENT));
  }

  return (
    <div className="mt-6 max-w-2xl rounded-xl border border-primary/40 bg-[#eef6f0] p-5">
      <p className="text-sm font-semibold text-primary-dark">Välkommen!</p>
      <p className="mt-1 text-base font-bold text-foreground">{namn}</p>
      <p className="mt-2 text-sm text-muted">
        Er föreningssida är en kopia av grundmallen — samma moduler och demo-innehåll.
        Börja med årshjulet eller underhållsplanen nedan. Föreningsuppgifter fyller ni i
        när det passar.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/forening/uppgifter"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Fyll i styrelsens kontakt
        </Link>
        <Link
          href="/forening/underhallsplan#grund"
          className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
        >
          Grunduppgifter fastighet
        </Link>
        <Link
          href="/forening/arshjul"
          className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:border-primary/50"
        >
          Årshjul
        </Link>
        <button
          type="button"
          onClick={stang}
          className="rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground"
        >
          Stäng
        </button>
      </div>
    </div>
  );
}
