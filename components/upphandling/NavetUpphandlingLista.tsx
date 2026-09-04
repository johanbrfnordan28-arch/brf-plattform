"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  formatNavetDatum,
  hamtaNavetPublicerade,
  NAVET_UPPHANDLING_EVENT,
  navetUpphandlingStorageKey,
  type NavetPubliceradTeaser,
} from "@/components/upphandling/navet-upphandling-lager";
import { upphandlingsGrupper } from "@/components/upphandling/kategorier";

type Props = {
  /** Visa länk till detalj (default true). */
  visaLankar?: boolean;
};

export function NavetUpphandlingLista({ visaLankar = true }: Props) {
  const [lista, setLista] = useState<NavetPubliceradTeaser[]>([]);
  const [hydrated, setHydrated] = useState(false);

  function uppdatera() {
    setLista(hamtaNavetPublicerade());
  }

  useEffect(() => {
    uppdatera();
    setHydrated(true);

    function onStorage(event: StorageEvent) {
      if (event.key === navetUpphandlingStorageKey()) uppdatera();
    }
    function onCustom() {
      uppdatera();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener(NAVET_UPPHANDLING_EVENT, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(NAVET_UPPHANDLING_EVENT, onCustom);
    };
  }, []);

  if (!hydrated) {
    return <p className="text-sm text-muted">Laddar aktuella upphandlingar…</p>;
  }

  if (lista.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface/60 p-6">
        <p className="text-sm text-muted">
          Inga upphandlingar är publicerade just nu. När Styrelse-Navet publicerar
          ett förfrågningsunderlag syns en kort beskrivning här — utan
          kontaktuppgifter eller fullständigt underlag.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Öppen information till föreningar och entreprenörer. Fullständigt
        förfrågningsunderlag och anbud lämnas endast av inbjudna, godkända
        entreprenörer — kontakter går via Styrelse-Navet.
      </p>
      <ul className="space-y-3">
        {lista.map((upph) => {
          const grupp = upphandlingsGrupper.find((g) => g.id === upph.gruppId);
          const body = (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-primary-dark">
                    {upph.kategoriNamn}
                    {grupp ? ` · ${grupp.titel}` : ""}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-foreground">
                    {upph.titel}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{upph.ort}</p>
                </div>
                <span className="rounded-full bg-[#eef6f0] px-3 py-1 text-xs font-medium text-primary-dark">
                  Publicerad via Styrelse-Navet
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                {upph.kortBeskrivning}
              </p>
              <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted">Sista anbudsdag</dt>
                  <dd className="font-medium text-foreground">
                    {formatNavetDatum(upph.sistaAnbudsdag)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Publicerad</dt>
                  <dd className="font-medium text-foreground">
                    {formatNavetDatum(upph.publicerad)}
                  </dd>
                </div>
              </dl>
              {visaLankar && (
                <p className="mt-4 text-sm font-medium text-primary">
                  Mer om uppdraget →
                </p>
              )}
            </>
          );

          return (
            <li
              key={upph.id}
              className="rounded-xl border border-border bg-surface p-5 shadow-sm"
            >
              {visaLankar ? (
                <Link
                  href={`/upphandling/${upph.id}`}
                  className="block transition-colors hover:border-primary/40"
                >
                  {body}
                </Link>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
