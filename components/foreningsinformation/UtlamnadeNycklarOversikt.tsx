"use client";

import { useEffect, useState } from "react";
import {
  antalUtlamnadeNycklar,
  beraknaUtlamnadeNycklar,
  egnaNycklarStorageKey,
  formatKvittensTid,
  hamtaForetagEllerKomplettering,
  hamtaMottagareEtikett,
  lasNyckelKvittenser,
  nyckelKvittenserStorageKey,
  rollEtikett,
  type UtlamnadNyckel,
} from "@/components/foreningsinformation/nyckel-kvittenser";

type UtlamnadeNycklarOversiktProps = {
  /** Kompakt vy i bibliotekets topp — expanderbar detalj i nyckelkvittenser-mappen. */
  variant?: "full" | "kompakt";
};

export function UtlamnadeNycklarOversikt({
  variant = "full",
}: UtlamnadeNycklarOversiktProps) {
  const [utlamnade, setUtlamnade] = useState<UtlamnadNyckel[]>([]);
  const [hydrated, setHydrated] = useState(false);

  function uppdatera() {
    setUtlamnade(beraknaUtlamnadeNycklar(lasNyckelKvittenser()));
  }

  useEffect(() => {
    uppdatera();
    setHydrated(true);

    function onStorage(event: StorageEvent) {
      if (
        event.key === nyckelKvittenserStorageKey() ||
        event.key === egnaNycklarStorageKey()
      ) {
        uppdatera();
      }
    }
    function onCustom() {
      uppdatera();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("nyckel-kvittenser-uppdaterad", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("nyckel-kvittenser-uppdaterad", onCustom);
    };
  }, []);

  if (!hydrated) {
    return null;
  }

  const antal = utlamnade.length;

  if (variant === "kompakt") {
    return (
      <div
        className={`rounded-xl border px-4 py-3 sm:px-5 ${
          antal > 0
            ? "border-amber-200/90 bg-amber-50/90"
            : "border-border bg-background/80"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">
            Utlämnade nycklar just nu
          </p>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              antal > 0
                ? "bg-amber-200/80 text-amber-950"
                : "bg-[#eef6f0] text-primary-dark"
            }`}
          >
            {antal === 0 ? "Alla återlämnade" : `${antal} ute`}
          </span>
        </div>
        {antal > 0 ? (
          <ul className="mt-2 space-y-1 text-xs text-amber-950/90">
            {utlamnade.slice(0, 4).map((rad) => (
              <li key={rad.nyckelId}>
                <span className="font-medium">{rad.nyckelEtikett}</span>
                {" — "}
                {hamtaMottagareEtikett(rad)}
              </li>
            ))}
            {antal > 4 && (
              <li className="text-muted">+ {antal - 4} till under Nyckel kvittenser</li>
            )}
          </ul>
        ) : (
          <p className="mt-1 text-xs text-muted">
            Inga nycklar registrerade som utlämnade. Öppna Nyckel kvittenser för att
            kvittera ut eller in.
          </p>
        )}
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-primary/25 bg-[#eef6f0]/50 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Utlämnade nycklar — uppsamlingsplats
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
            Översikt över nycklar som fortfarande är utlämnade enligt signerade
            kvittenser. När någon återlämnar med typ &quot;Återlämning&quot; försvinner
            nyckeln här.
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${
            antal > 0
              ? "bg-amber-100 text-amber-950"
              : "bg-white text-primary-dark"
          }`}
        >
          {antal === 0 ? "0 ute" : `${antal} ute`}
        </span>
      </div>

      {antal === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-border bg-white/80 px-4 py-6 text-center text-sm text-muted">
          Inga nycklar är utlämnade just nu. Alla registrerade återlämningar är
          hanterade.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-white">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/80 text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Nyckel</th>
                <th className="px-4 py-3">Utlämnad till</th>
                <th className="px-4 py-3">Roll</th>
                <th className="px-4 py-3">Företag / lägenhet</th>
                <th className="px-4 py-3">Utlämnad</th>
              </tr>
            </thead>
            <tbody>
              {utlamnade.map((rad) => {
                const foretag = hamtaForetagEllerKomplettering(rad);
                return (
                  <tr
                    key={`${rad.nyckelId}-${rad.kvittensId}`}
                    className="border-b border-border/80 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {rad.nyckelEtikett}
                    </td>
                    <td className="px-4 py-3 text-foreground">{rad.namn}</td>
                    <td className="px-4 py-3 text-muted">{rollEtikett(rad.roll)}</td>
                    <td className="px-4 py-3 text-muted">{foretag ?? "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted">
                      {formatKvittensTid(rad.utlamnadTidpunkt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/** Exporterad hook-vänlig uppdatering för föräldrar som vill visa antal. */
export function lasAntalUtlamnadeNycklar(): number {
  if (typeof window === "undefined") return 0;
  return antalUtlamnadeNycklar();
}
