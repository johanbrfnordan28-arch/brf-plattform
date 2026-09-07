"use client";

import { useEffect, useState } from "react";
import {
  formatDatum,
  hamtaPubliceradeUpphandlingar,
  hamtaPubliceradeUpphandlingarFranAllaForeningar,
  hamtaUpphandlingsStatus,
  lasUpphandlingLager,
  statusEtikett,
  upphandlingStorageKey,
  type PubliceradUpphandling,
} from "@/components/upphandling/upphandling-lager";
import { upphandlingsGrupper } from "@/components/upphandling/kategorier";

type PubliceradeUpphandlingarPanelProps = {
  /** Publik sida — visa upphandlingar från alla föreningar i webbläsaren. */
  publik?: boolean;
};

export function PubliceradeUpphandlingarPanel({
  publik = false,
}: PubliceradeUpphandlingarPanelProps) {
  const [lista, setLista] = useState<PubliceradUpphandling[]>([]);
  const [hydrated, setHydrated] = useState(false);

  function uppdatera() {
    setLista(
      publik
        ? hamtaPubliceradeUpphandlingarFranAllaForeningar()
        : hamtaPubliceradeUpphandlingar(),
    );
  }

  useEffect(() => {
    uppdatera();
    setHydrated(true);

    function onStorage(event: StorageEvent) {
      if (publik) {
        if (event.key?.includes("brf-upphandling-lager")) uppdatera();
        return;
      }
      if (event.key === upphandlingStorageKey()) uppdatera();
    }
    function onCustom() {
      uppdatera();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("upphandling-lager-uppdaterad", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("upphandling-lager-uppdaterad", onCustom);
    };
  }, [publik]);

  if (!hydrated) {
    return (
      <p className="text-sm text-muted">Laddar publicerade upphandlingar…</p>
    );
  }

  if (lista.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface/60 p-6">
        <p className="text-sm text-muted">
          {publik
            ? "Inga föreningar har publicerat upphandlingar ännu. När en styrelse publicerar med Upphandla-knappen syns uppdraget här med titel, ort, kategori och sista anbudsdag."
            : "Inga upphandlingar är publicerade just nu. Styrelsen publicerar från föreningssidan när förfrågningsunderlaget är komplett — då syns uppdraget här med titel, ort, kategori och sista anbudsdag."}
        </p>
      </div>
    );
  }

  const lager = publik ? null : lasUpphandlingLager();

  return (
    <ul className="space-y-3">
      {lista.map((upph) => {
        const utvardering = lager?.utvarderingar.find(
          (u) => u.upphandlingId === upph.id,
        );
        const beslut = lager?.styrelsebeslut.find((b) => b.upphandlingId === upph.id);
        const status = hamtaUpphandlingsStatus(upph, utvardering, beslut);
        const grupp = upphandlingsGrupper.find((g) => g.id === upph.gruppId);

        return (
          <li
            key={`${upph.förening}-${upph.id}`}
            className="rounded-xl border border-border bg-surface p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-primary-dark">
                  {upph.kategoriNamn}
                  {grupp ? ` · ${grupp.titel}` : ""}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-foreground">
                  {upph.titel}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {upph.förening} · {upph.ort}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  status === "pågående"
                    ? "bg-[#eef6f0] text-primary-dark"
                    : status === "stängd"
                      ? "bg-amber-50 text-amber-900"
                      : status === "beslutat"
                        ? "bg-slate-200 text-slate-800"
                        : "bg-slate-100 text-slate-700"
                }`}
              >
                {statusEtikett(status)}
              </span>
            </div>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted">Sista anbudsdag</dt>
                <dd className="font-medium text-foreground">
                  {formatDatum(upph.sistaAnbudsdag)}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Publicerad</dt>
                <dd className="font-medium text-foreground">
                  {formatDatum(upph.publicerad)}
                </dd>
              </div>
            </dl>
          </li>
        );
      })}
    </ul>
  );
}
