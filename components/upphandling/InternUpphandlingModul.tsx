"use client";

import { useEffect, useState } from "react";
import {
  formatDatum,
  hamtaUpphandlingsStatus,
  lasUpphandlingLager,
  levereraUtvarderingTillStyrelse,
  sparaUpphandlingLager,
  statusEtikett,
  upphandlingStorageKey,
  type PubliceradUpphandling,
  type UpphandlingLager,
} from "@/components/upphandling/upphandling-lager";

export function InternUpphandlingModul() {
  const [lager, setLager] = useState<UpphandlingLager | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLager(lasUpphandlingLager());
    setHydrated(true);

    function onStorage(event: StorageEvent) {
      if (event.key === upphandlingStorageKey()) setLager(lasUpphandlingLager());
    }
    function onCustom() {
      setLager(lasUpphandlingLager());
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("upphandling-lager-uppdaterad", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("upphandling-lager-uppdaterad", onCustom);
    };
  }, []);

  function leverera(upphandlingId: string) {
    const nu = lasUpphandlingLager();
    const uppdaterat = levereraUtvarderingTillStyrelse(nu, upphandlingId);
    sparaUpphandlingLager(uppdaterat);
    setLager(uppdaterat);
  }

  if (!hydrated || !lager) {
    return <p className="text-sm text-muted">Laddar upphandlingar…</p>;
  }

  if (lager.publicerade.length === 0) {
    return (
      <p className="text-sm text-muted">
        Inga publicerade upphandlingar ännu. När en förening publicerar från sin
        upphandlingssida syns ärendet här med inkomna anbud (endast internt).
      </p>
    );
  }

  const sorterade = [...lager.publicerade].sort(
    (a, b) => new Date(b.publicerad).getTime() - new Date(a.publicerad).getTime(),
  );

  return (
    <div className="space-y-6">
      {sorterade.map((upph) => (
        <InternUpphandlingKort
          key={upph.id}
          upphandling={upph}
          lager={lager}
          onLeverera={() => leverera(upph.id)}
        />
      ))}
    </div>
  );
}

type InternUpphandlingKortProps = {
  upphandling: PubliceradUpphandling;
  lager: UpphandlingLager;
  onLeverera: () => void;
};

function InternUpphandlingKort({
  upphandling,
  lager,
  onLeverera,
}: InternUpphandlingKortProps) {
  const anbud = lager.anbud.filter((a) => a.upphandlingId === upphandling.id);
  const utvardering = lager.utvarderingar.find(
    (u) => u.upphandlingId === upphandling.id,
  );
  const status = hamtaUpphandlingsStatus(upphandling, utvardering);

  return (
    <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-primary-dark">
            {upphandling.kategoriNamn} · {upphandling.förening}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">
            {upphandling.titel}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {upphandling.ort} · Sista anbudsdag {formatDatum(upphandling.sistaAnbudsdag)}
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {statusEtikett(status)}
        </span>
      </div>

      <div className="mt-5 rounded-lg border border-amber-200/80 bg-amber-50/80 p-4">
        <h4 className="text-sm font-semibold text-amber-950">
          Inkomna anbud — endast intern vy
        </h4>
        <p className="mt-1 text-xs text-amber-900/80">
          Styrelsen ser inte dessa uppgifter. Utvärdering levereras separat för beslut.
        </p>
        {anbud.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Inga anbud ännu.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {anbud.map((rad) => (
              <li
                key={rad.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <span className="font-medium text-foreground">{rad.entreprenor}</span>
                <span className="text-muted">
                  {rad.anbudSummaKr.toLocaleString("sv-SE")} kr ·{" "}
                  {formatDatum(rad.inlamnad)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {utvardering?.synligForStyrelse ? (
          <p className="text-sm text-primary-dark">
            Anbudsutvärdering levererad till styrelsen{" "}
            {formatDatum(utvardering.levererad)}.
          </p>
        ) : (
          <button
            type="button"
            onClick={onLeverera}
            disabled={anbud.length === 0}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            Leverera anbudsutvärdering till styrelsen
          </button>
        )}
      </div>
    </article>
  );
}
