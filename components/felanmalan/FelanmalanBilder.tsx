"use client";

import { useEffect, useState } from "react";
import type { FelanmalanBildDto } from "@/lib/felanmalan/felanmalan-typer";
import { hamtaServerAccessNyckel } from "@/lib/forening-server-sync";

/** Bilderna hämtas med samma behörighet som ärendet — de ligger inte publikt. */
export function FelanmalanBilder({
  foreningId,
  arendeId,
  bilder,
}: {
  foreningId: string;
  arendeId: string;
  bilder: FelanmalanBildDto[];
}) {
  const [urler, setUrler] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (bilder.length === 0) return;
    let avbruten = false;
    const skapade: string[] = [];
    const headers: Record<string, string> = {};
    const access = hamtaServerAccessNyckel(foreningId);
    if (access) headers["x-access-nyckel"] = access;

    void Promise.all(
      bilder.map(async (b) => {
        try {
          const res = await fetch(
            `/api/foreningar/${encodeURIComponent(foreningId)}/felanmalan/${encodeURIComponent(arendeId)}/bilder/${encodeURIComponent(b.id)}`,
            { headers },
          );
          if (!res.ok) return [b.id, null] as const;
          const url = URL.createObjectURL(await res.blob());
          skapade.push(url);
          return [b.id, url] as const;
        } catch {
          return [b.id, null] as const;
        }
      }),
    ).then((par) => {
      if (!avbruten) setUrler(Object.fromEntries(par));
    });

    return () => {
      avbruten = true;
      skapade.forEach((u) => URL.revokeObjectURL(u));
      setUrler({});
    };
  }, [foreningId, arendeId, bilder]);

  if (bilder.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="text-sm text-muted">Bilder från medlemmen</p>
      <div className="mt-2 flex flex-wrap gap-3">
        {bilder.map((b, i) => {
          const url = urler[b.id];
          return url ? (
            <a key={b.id} href={url} target="_blank" rel="noreferrer" title="Öppna i full storlek">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Bild ${i + 1} till ärendet`}
                className="h-28 w-28 rounded-lg border border-border object-cover hover:opacity-90"
              />
            </a>
          ) : (
            <div
              key={b.id}
              className="flex h-28 w-28 items-center justify-center rounded-lg border border-dashed border-border text-center text-xs text-muted"
            >
              {url === null ? "Kunde inte visas" : "Laddar …"}
            </div>
          );
        })}
      </div>
    </div>
  );
}
