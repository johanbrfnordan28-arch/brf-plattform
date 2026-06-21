"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  avslutaProvperiodForening,
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

const AVTALSVAL_STORAGE_KEY = "brf-provperiod-avtalsval";

const AVTALSALTERNATIV = [
  {
    id: "manadsvis",
    rubrik: "Månadsvis",
    beskrivning: "Flexibelt när styrelsen vill komma igång utan längre bindning.",
    etikett: "Välj månadsvis",
    framhavd: false,
  },
  {
    id: "arsvis",
    rubrik: "Årsvis",
    beskrivning: "Passar föreningar som vill samla arbetet över ett verksamhetsår.",
    etikett: "Välj årsvis",
    framhavd: false,
  },
  {
    id: "2-ar",
    rubrik: "2 år",
    beskrivning: "Stabil avtalsperiod för underhållsplan, upphandling och styrelsebyte.",
    etikett: "Välj 2 år",
    framhavd: false,
  },
  {
    id: "3-ar",
    rubrik: "3 år",
    beskrivning: "Längsta provperiodsövergången och bäst för långsiktig kontinuitet.",
    etikett: "Välj 3 år",
    framhavd: true,
  },
] as const;

type AvtalsalternativId = (typeof AVTALSALTERNATIV)[number]["id"];

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
  const [visaAvtalForId, setVisaAvtalForId] = useState<string | null>(null);
  const [valtAvtal, setValtAvtal] = useState<{
    foreningId: string;
    alternativId: AvtalsalternativId;
  } | null>(null);
  const [avslutarId, setAvslutarId] = useState<string | null>(null);

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

  function sparaAvtalsval(
    profil: ForeningProfil,
    alternativId: AvtalsalternativId,
  ) {
    const valt = AVTALSALTERNATIV.find((a) => a.id === alternativId);
    if (!valt) return;
    const post = {
      foreningId: profil.id,
      foreningsnamn: profil.namn,
      alternativId,
      alternativRubrik: valt.rubrik,
      valtTidpunkt: new Date().toISOString(),
    };

    try {
      const raw = localStorage.getItem(AVTALSVAL_STORAGE_KEY);
      const befintliga = raw ? (JSON.parse(raw) as Array<typeof post>) : [];
      const utanTidigare = befintliga.filter((p) => p.foreningId !== profil.id);
      localStorage.setItem(
        AVTALSVAL_STORAGE_KEY,
        JSON.stringify([...utanTidigare, post]),
      );
    } catch {
      /* Avtalsvalet kan fortfarande visas i komponenten. */
    }

    setValtAvtal({ foreningId: profil.id, alternativId });
  }

  function avslutaProvperiod(profil: ForeningProfil) {
    const ok = window.confirm(
      `Avsluta provperioden för ${profil.namn}? Detta tar bort föreningens lokala testdata i den här webbläsaren.`,
    );
    if (!ok) return;
    setAvslutarId(profil.id);
    avslutaProvperiodForening(profil.id);
    setForeningar((nu) => {
      const nyLista = nu.filter((f) => f.id !== profil.id);
      setAktivIndex((index) => Math.min(index, Math.max(0, nyLista.length - 1)));
      return nyLista;
    });
    setVisaAvtalForId(null);
    setValtAvtal(null);
    setAvslutarId(null);
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
  const visarAvtal = visaAvtalForId === valdForening.id;
  const valtAvtalForForening =
    valtAvtal?.foreningId === valdForening.id
      ? AVTALSALTERNATIV.find((a) => a.id === valtAvtal.alternativId)
      : null;
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
              onClick={() =>
                setVisaAvtalForId((id) =>
                  id === valdForening.id ? null : valdForening.id,
                )
              }
              className="rounded-lg border border-primary bg-[#eef6f0] px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
            >
              Skapa vår förening och teckna avtal
            </button>
            <button
              type="button"
              onClick={() => kopieraProvperiodsLank(valdForening)}
              className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
            >
              {kopieradId === valdForening.id ? "Länk kopierad" : "Kopiera provperiodslänk"}
            </button>
            <button
              type="button"
              onClick={() => avslutaProvperiod(valdForening)}
              disabled={avslutarId === valdForening.id}
              className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-70"
            >
              {avslutarId === valdForening.id ? "Avslutar …" : "Avsluta provperiod"}
            </button>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-muted">
            Provperiodslänken öppnar Styrelsenavets första sida först. Därifrån kan en
            annan styrelsemedlem logga in på just den här föreningens sida.
          </p>

          {visarAvtal && (
            <div className="mt-5 rounded-xl border border-primary/20 bg-[#fafcfa] p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Välj avtalsform för {valdForening.namn}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    Alla alternativ behåller föreningens upplagda data från
                    provperioden. Slutligt pris och orderbekräftelse hanteras i
                    nästa steg.
                  </p>
                </div>
                {valtAvtalForForening && (
                  <span className="rounded-full bg-[#dceee3] px-2.5 py-1 text-xs font-medium text-primary-dark">
                    Valt: {valtAvtalForForening.rubrik}
                  </span>
                )}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {AVTALSALTERNATIV.map((alternativ) => (
                  <button
                    key={alternativ.id}
                    type="button"
                    onClick={() => sparaAvtalsval(valdForening, alternativ.id)}
                    className={`rounded-xl border p-3 text-left transition hover:shadow-sm ${
                      alternativ.framhavd
                        ? "border-primary bg-[#eef6f0]"
                        : "border-border bg-white hover:border-primary/50"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground">
                        {alternativ.rubrik}
                      </span>
                      {alternativ.framhavd && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-white">
                          Längst period
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted">
                      {alternativ.beskrivning}
                    </span>
                    <span className="mt-3 inline-flex text-xs font-medium text-primary-dark">
                      {alternativ.etikett} →
                    </span>
                  </button>
                ))}
              </div>

              {valtAvtalForForening && (
                <div className="mt-4 rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-foreground">
                  <strong>{valtAvtalForForening.rubrik}</strong> är markerat för
                  föreningen. Nästa steg är att bekräfta avtalet med styrelsen och
                  aktivera föreningens ordinarie konto.
                </div>
              )}
            </div>
          )}
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
