"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FORENING_AKTIV_EVENT,
  GRUNDMALL_FORENING_ID,
  lasAktivForeningId,
  listaForeningar,
  markeraPendingAktivForening,
  repareraForeningRegistry,
  sattAktivForeningId,
  type ForeningProfil,
} from "@/lib/forening-registry";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";

type Props = {
  kompakt?: boolean;
};

function formateraDatum(iso: string): string {
  const datum = new Date(iso);
  if (Number.isNaN(datum.getTime())) return "Datum saknas";
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(datum);
}

export function ForeningInloggningsLista({ kompakt = false }: Props) {
  const [foreningar, setForeningar] = useState<ForeningProfil[]>([]);
  const [aktivId, setAktivId] = useState(GRUNDMALL_FORENING_ID);
  const [redo, setRedo] = useState(false);
  const [oppnarId, setOppnarId] = useState<string | null>(null);

  const ladda = useCallback(() => {
    repareraForeningRegistry();
    setAktivId(lasAktivForeningId());
    setForeningar(
      listaForeningar()
        .filter((f) => f.id !== GRUNDMALL_FORENING_ID)
        .sort(
          (a, b) =>
            new Date(b.skapadTidpunkt).getTime() -
            new Date(a.skapadTidpunkt).getTime(),
        ),
    );
    setRedo(true);
  }, []);

  useEffect(() => {
    ladda();
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
  }, [ladda]);

  const antalText = useMemo(() => {
    if (foreningar.length === 1) return "1 registrerad testförening";
    return `${foreningar.length} registrerade testföreningar`;
  }, [foreningar.length]);

  function oppnaForening(profil: ForeningProfil) {
    setOppnarId(profil.id);
    markeraPendingAktivForening(profil.id);
    sattAktivForeningId(profil.id, { tyst: true });
    window.location.assign("/forening");
  }

  if (!redo) {
    return (
      <div className="rounded-xl border border-border bg-background/80 px-4 py-3 text-sm text-muted">
        Laddar registrerade testföreningar …
      </div>
    );
  }

  if (foreningar.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-background/80 p-5">
        <p className="text-sm font-semibold text-foreground">
          Inga testföreningar är registrerade i den här webbläsaren ännu.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Skapa en testförening först. Den sparas lokalt i webbläsaren och dyker
          sedan upp här så att du kan logga in igen.
        </p>
        <Link
          href={PROVA_GRATIS_PATH}
          className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Skapa testförening
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/25 bg-[#eef6f0]/70 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary-dark">
            Mina testföreningar
          </p>
          <h3 className="mt-1 text-xl font-bold text-foreground">
            Välj förening att logga in på
          </h3>
          <p className="mt-1 text-sm text-muted">{antalText} i den här webbläsaren.</p>
        </div>
        <Link
          href={PROVA_GRATIS_PATH}
          className="rounded-lg border border-primary bg-white px-3 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
        >
          + Skapa ny
        </Link>
      </div>

      <ul className={`mt-5 grid gap-3 ${kompakt ? "" : "sm:grid-cols-2"}`}>
        {foreningar.map((profil) => {
          const arAktiv = profil.id === aktivId;
          const oppnar = oppnarId === profil.id;
          return (
            <li
              key={profil.id}
              className="rounded-xl border border-border bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-foreground">
                    {profil.namn}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Skapad {formateraDatum(profil.skapadTidpunkt)}
                  </p>
                </div>
                {arAktiv && (
                  <span className="shrink-0 rounded-full bg-[#dceee3] px-2.5 py-1 text-xs font-medium text-primary-dark">
                    Aktiv
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => oppnaForening(profil)}
                  disabled={Boolean(oppnarId)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-wait disabled:opacity-70"
                >
                  {oppnar ? "Öppnar …" : arAktiv ? "Fortsätt in" : "Logga in"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
