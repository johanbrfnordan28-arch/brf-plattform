"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import {
  aktiveraForeningVidSidladdning,
  type ForeningProfil,
} from "@/lib/forening-registry";
import { byggNyForeningUrl } from "@/lib/skapa-forening-navigering";

export function ForeningAktiveraKlient() {
  const gjort = useRef(false);
  const [fel, setFel] = useState<string | null>(null);
  const [profil, setProfil] = useState<ForeningProfil | null>(null);

  useLayoutEffect(() => {
    if (gjort.current) return;
    gjort.current = true;

    const aktiverad = aktiveraForeningVidSidladdning();
    if (!aktiverad) {
      setFel("Kunde inte läsa föreningen från länken. Försök skapa igen.");
      return;
    }
    setProfil(aktiverad);
    window.location.replace(byggNyForeningUrl(aktiverad.id, aktiverad.namn));
  }, []);

  if (fel) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
          <p className="font-semibold">{fel}</p>
          <p className="mt-3">
            <Link href="/prova-gratis" className="font-medium underline">
              Tillbaka till Skapa vår förening
            </Link>
          </p>
        </div>
      </main>
    );
  }

  const malUrl = profil ? byggNyForeningUrl(profil.id, profil.namn) : null;

  return (
    <main className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <p className="text-sm font-medium text-foreground">
        {profil ? `Aktiverar ${profil.namn} …` : "Aktiverar er förening …"}
      </p>
      <p className="mt-2 text-sm text-muted">Ni skickas vidare om ett ögonblick.</p>
      {malUrl && (
        <p className="mt-6 text-sm">
          <a href={malUrl} className="font-medium text-primary-dark underline">
            Klicka här om sidan inte byter automatiskt
          </a>
        </p>
      )}
    </main>
  );
}
