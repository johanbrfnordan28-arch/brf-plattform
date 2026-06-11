"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  lasUnderhallsplanState,
  sparaUnderhallsplanState,
} from "@/components/underhallsplan/underhallsplan-lager";
import {
  arGrundmallForening,
  FORENING_AKTIV_EVENT,
  lasAktivForeningId,
  lasForeningProfil,
  rensaNyssSkapadMarkering,
  repareraForeningRegistry,
  sparaForeningProfil,
  type ForeningProfil,
} from "@/lib/forening-registry";
import { STYRELSEFLOW_NAMN } from "@/lib/forening-konstanter";
import {
  appliceraKontaktPaGrund,
  planNamnFranKontakt,
  styrelseKontaktFranProfil,
} from "@/lib/styrelse-kontakt";

function lasAktivProfilForFormular(): ForeningProfil | null {
  repareraForeningRegistry();
  const id = lasAktivForeningId();
  const profil = lasForeningProfil(id);
  if (!profil || arGrundmallForening(profil.id)) return null;
  return profil;
}

export function ForeningProfilFormular() {
  const [profil, setProfil] = useState<ForeningProfil | null>(null);
  const [redo, setRedo] = useState(false);
  const [redigerad, setRedigerad] = useState<ForeningProfil | null>(null);
  const [sparad, setSparad] = useState(false);
  const [sparFel, setSparFel] = useState<string | null>(null);

  const laddaProfil = useCallback(() => {
    setProfil(lasAktivProfilForFormular());
    setRedo(true);
  }, []);

  useEffect(() => {
    laddaProfil();
    window.addEventListener(FORENING_AKTIV_EVENT, laddaProfil);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, laddaProfil);
  }, [laddaProfil]);

  useEffect(() => {
    setRedigerad(null);
    setSparad(false);
    setSparFel(null);
  }, [profil?.id]);

  const visningsProfil = redigerad ?? profil;

  if (!redo) {
    return (
      <p className="text-sm text-muted">Laddar föreningsuppgifter …</p>
    );
  }

  if (!profil || !visningsProfil) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
        <p className="font-semibold">Ingen förening vald</p>
        <p className="mt-2">
          <Link href="/prova-gratis" className="font-medium underline">
            Skapa er förening
          </Link>{" "}
          först, eller välj en befintlig förening i menyn uppe till höger.
        </p>
      </div>
    );
  }

  function uppdatera(falt: keyof ForeningProfil, varde: string | boolean) {
    setRedigerad({ ...visningsProfil!, [falt]: varde });
    setSparad(false);
    setSparFel(null);
  }

  function spara() {
    setSparFel(null);
    const uppdaterad = { ...visningsProfil, grundinfoPaborjad: true };
    try {
      sparaForeningProfil(uppdaterad);
      const kontakt = styrelseKontaktFranProfil(uppdaterad);
      const plan = lasUnderhallsplanState();
      if (plan) {
        sparaUnderhallsplanState({
          ...plan,
          planNamn: plan.planNamn || planNamnFranKontakt(kontakt),
          grund: appliceraKontaktPaGrund(plan.grund, kontakt),
          sparad: new Date().toISOString(),
        });
      }
      rensaNyssSkapadMarkering();
      setProfil(uppdaterad);
      setRedigerad(null);
      setSparad(true);
    } catch (e) {
      setSparFel(
        e instanceof Error ? e.message : "Kunde inte spara — försök igen.",
      );
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <p className="text-sm text-muted">
        Uppgifterna sparas för <strong className="text-foreground">{profil.namn}</strong>{" "}
        och används i dokument, städschema och underhållsplanen.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-foreground">Föreningens namn</span>
          <input
            type="text"
            value={visningsProfil.namn}
            onChange={(e) => uppdatera("namn", e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-foreground">Organisationsnummer</span>
          <input
            type="text"
            value={visningsProfil.organisationsnummer}
            onChange={(e) => uppdatera("organisationsnummer", e.target.value)}
            placeholder="t.ex. 716501-2345"
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-foreground">E-post styrelse</span>
          <input
            type="email"
            value={visningsProfil.epost}
            onChange={(e) => uppdatera("epost", e.target.value)}
            placeholder="styrelsen@exempel.se"
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-foreground">Kontaktperson</span>
          <input
            type="text"
            value={visningsProfil.kontaktperson}
            onChange={(e) => uppdatera("kontaktperson", e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-foreground">Postadress</span>
          <input
            type="text"
            value={visningsProfil.postadress}
            onChange={(e) => uppdatera("postadress", e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-foreground">Ort</span>
          <input
            type="text"
            value={visningsProfil.ort}
            onChange={(e) => uppdatera("ort", e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
          />
        </label>
      </div>

      {sparFel && (
        <p
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {sparFel}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={spara}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Spara föreningsuppgifter
        </button>
        <Link
          href="/forening/underhallsplan#grund"
          className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
        >
          Fortsätt till grunduppgifter
        </Link>
        <Link
          href="/forening"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground"
        >
          Tillbaka till {STYRELSEFLOW_NAMN}
        </Link>
      </div>

      {sparad && (
        <p className="mt-3 text-sm text-primary-dark" role="status">
          Sparat. Data ligger i den här webbläsaren under {visningsProfil.namn}.
        </p>
      )}
    </div>
  );
}
