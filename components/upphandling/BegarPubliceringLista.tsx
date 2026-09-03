"use client";

import { useEffect, useState } from "react";
import {
  begarPubliceringEventName,
  begarPubliceringStorageKey,
  hamtaBegarPubliceringar,
  markeraBegarPubliceringHanterad,
  type BegarPublicering,
} from "@/components/upphandling/begar-publicering-lager";

function formatTidpunkt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("sv-SE", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function BegarPubliceringLista() {
  const [lista, setLista] = useState<BegarPublicering[]>([]);
  const [hydrated, setHydrated] = useState(false);

  function uppdatera() {
    setLista(hamtaBegarPubliceringar());
  }

  useEffect(() => {
    uppdatera();
    setHydrated(true);

    function onStorage(event: StorageEvent) {
      if (event.key === begarPubliceringStorageKey()) uppdatera();
    }
    function onCustom() {
      uppdatera();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener(begarPubliceringEventName(), onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(begarPubliceringEventName(), onCustom);
    };
  }, []);

  if (!hydrated) {
    return <p className="text-sm text-muted">Laddar publiceringsförfrågningar…</p>;
  }

  if (lista.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface/60 p-6">
        <p className="text-sm text-muted">
          Inga inkomna förfrågningar ännu. När föreningar skickar &quot;Begär
          publicering&quot; från landningssidan syns de här för manuell triage.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {lista.map((f) => (
        <li
          key={f.id}
          className="rounded-xl border border-border bg-surface p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground">{f.foreningsNamn}</p>
              <p className="mt-1 text-sm text-muted">
                {f.kategori}
                {f.onskadSistaAnbudsdag
                  ? ` · önskad sista anbudsdag ${f.onskadSistaAnbudsdag}`
                  : ""}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                f.status === "ny"
                  ? "bg-[#e8f3ec] text-primary-dark"
                  : "bg-surface text-muted border border-border"
              }`}
            >
              {f.status === "ny" ? "Ny" : "Hanterad"}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            {f.beskrivning}
          </p>
          <p className="mt-3 text-sm text-muted">
            Kontakt: {f.kontakt} · Inkommen {formatTidpunkt(f.skapad)}
          </p>
          {f.status === "ny" && (
            <button
              type="button"
              onClick={() => {
                markeraBegarPubliceringHanterad(f.id);
                uppdatera();
              }}
              className="mt-4 inline-flex rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary/50"
            >
              Markera som hanterad
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
