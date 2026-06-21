"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  bootstrapForeningFranUrl,
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
  const [aktivIndex, setAktivIndex] = useState(0);
  const [kopieradId, setKopieradId] = useState<string | null>(null);

  const ladda = useCallback(() => {
    bootstrapForeningFranUrl();
    repareraForeningRegistry();
    const id = lasAktivForeningId();
    const lista = listaForeningar()
        .filter((f) => f.id !== GRUNDMALL_FORENING_ID)
        .sort(
          (a, b) =>
            new Date(b.skapadTidpunkt).getTime() -
            new Date(a.skapadTidpunkt).getTime(),
        );
    setAktivId(id);
    setForeningar(lista);
    const hittadIndex = lista.findIndex((f) => f.id === id);
    if (hittadIndex >= 0) setAktivIndex(hittadIndex);
    setRedo(true);
  }, []);

  useEffect(() => {
    ladda();
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
  }, [ladda]);

  const antalText = useMemo(() => {
    if (foreningar.length === 1) return "1 förening i testläge";
    return `${foreningar.length} föreningar i testläge`;
  }, [foreningar.length]);

  const valdForening = foreningar[aktivIndex] ?? foreningar[0] ?? null;

  function oppnaForening(profil: ForeningProfil) {
    setOppnarId(profil.id);
    markeraPendingAktivForening(profil.id);
    sattAktivForeningId(profil.id, { tyst: true });
    window.location.assign("/forening");
  }

  function bytSteg(riktning: -1 | 1) {
    if (foreningar.length <= 1) return;
    setAktivIndex((nu) => (nu + riktning + foreningar.length) % foreningar.length);
  }

  function provperiodsLank(profil: ForeningProfil): string {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams({
      foreningId: profil.id,
      namn: profil.namn,
    });
    return `${window.location.origin}/?${params.toString()}`;
  }

  async function kopieraProvperiodsLank(profil: ForeningProfil) {
    const lank = provperiodsLank(profil);
    if (!lank) return;
    try {
      await navigator.clipboard.writeText(lank);
      setKopieradId(profil.id);
      window.setTimeout(() => setKopieradId(null), 2200);
    } catch {
      window.prompt("Kopiera provperiodslänken:", lank);
    }
  }

  if (!redo) {
    return (
      <div className="rounded-xl border border-border bg-background/80 px-4 py-3 text-sm text-muted">
        Laddar pågående provperioder …
      </div>
    );
  }

  if (foreningar.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-background/80 p-5">
        <p className="text-sm font-semibold text-foreground">
          Inga pågående provperioder hittades i den här webbläsaren ännu.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Starta en provperiod först. Den sparas lokalt i webbläsaren och dyker
          sedan upp här så att föreningen kan logga in igen.
        </p>
        <Link
          href={PROVA_GRATIS_PATH}
          className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Starta provperiod
        </Link>
      </div>
    );
  }

  if (!valdForening) return null;

  const arAktiv = valdForening.id === aktivId;
  const oppnar = oppnarId === valdForening.id;
  const harFlera = foreningar.length > 1;
  const foregaende =
    harFlera ? foreningar[(aktivIndex - 1 + foreningar.length) % foreningar.length] : null;
  const nasta = harFlera ? foreningar[(aktivIndex + 1) % foreningar.length] : null;

  return (
    <div className="rounded-2xl border border-primary/25 bg-[#eef6f0]/70 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary-dark">
            Pågående provperioder
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

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center">
        {foregaende && !kompakt && (
          <button
            type="button"
            onClick={() => bytSteg(-1)}
            className="hidden rounded-xl border border-border bg-white/70 p-4 text-left opacity-75 transition hover:opacity-100 lg:block"
          >
            <span className="text-xs font-medium text-muted">Föregående</span>
            <span className="mt-1 block truncate text-sm font-semibold text-foreground">
              {foregaende.namn}
            </span>
          </button>
        )}

        <article className="rounded-2xl border-2 border-primary/30 bg-white p-5 shadow-sm sm:p-6 lg:min-w-[24rem]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
                Provperiod {aktivIndex + 1} av {foreningar.length}
              </p>
              <h4 className="mt-1 truncate text-2xl font-bold text-foreground">
                {valdForening.namn}
              </h4>
              <p className="mt-1 text-sm text-muted">
                Skapad {formateraDatum(valdForening.skapadTidpunkt)}
              </p>
            </div>
            {arAktiv && (
              <span className="shrink-0 rounded-full bg-[#dceee3] px-2.5 py-1 text-xs font-medium text-primary-dark">
                Aktiv
              </span>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => oppnaForening(valdForening)}
              disabled={Boolean(oppnarId)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-wait disabled:opacity-70"
            >
              {oppnar ? "Öppnar …" : arAktiv ? "Fortsätt in" : "Logga in på föreningen"}
            </button>
            <button
              type="button"
              onClick={() => kopieraProvperiodsLank(valdForening)}
              className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
            >
              {kopieradId === valdForening.id ? "Länk kopierad" : "Kopiera provperiodslänk"}
            </button>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-muted">
            Provperiodslänken öppnar Styrelsenavets första sida först. Därifrån kan en
            annan styrelsemedlem logga in på just den här föreningens sida.
          </p>
        </article>

        {nasta && !kompakt && (
          <button
            type="button"
            onClick={() => bytSteg(1)}
            className="hidden rounded-xl border border-border bg-white/70 p-4 text-left opacity-75 transition hover:opacity-100 lg:block"
          >
            <span className="text-xs font-medium text-muted">Nästa</span>
            <span className="mt-1 block truncate text-sm font-semibold text-foreground">
              {nasta.namn}
            </span>
          </button>
        )}
      </div>

      {harFlera && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => bytSteg(-1)}
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:border-primary/50"
          >
            ← Föregående
          </button>
          <div className="flex gap-1.5">
            {foreningar.map((profil, index) => (
              <button
                key={profil.id}
                type="button"
                onClick={() => setAktivIndex(index)}
                aria-label={`Visa ${profil.namn}`}
                className={`h-2.5 w-2.5 rounded-full ${
                  index === aktivIndex ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => bytSteg(1)}
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:border-primary/50"
          >
            Nästa →
          </button>
        </div>
      )}
    </div>
  );
}
