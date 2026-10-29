"use client";

import { useEffect, useMemo, useState } from "react";
import type { ForeningsDokument } from "@/components/dokumentbank/forening-dokumenter-lager";
import {
  foreslagenMappForOmrade,
  laggForeningsDokumentIProjekt,
  lasProjektLista,
} from "@/components/dokumentbank/dokument-projekt-koppling";
import type { DokumentMallOmrade } from "@/components/dokumentbank/mallar";
import Link from "next/link";

type LaggTillIProjektDialogProps = {
  dokument: ForeningsDokument;
  onStang: () => void;
  onKlar?: () => void;
};

export function LaggTillIProjektDialog({
  dokument,
  onStang,
  onKlar,
}: LaggTillIProjektDialogProps) {
  const [projekt, setProjekt] = useState(lasProjektLista());
  const [projektId, setProjektId] = useState("");
  const [mappId, setMappId] = useState("");
  const [fel, setFel] = useState<string | null>(null);
  const [klar, setKlar] = useState(false);

  useEffect(() => {
    setProjekt(lasProjektLista());
  }, []);

  const valtProjekt = useMemo(
    () => projekt.find((p) => p.id === projektId),
    [projekt, projektId],
  );

  useEffect(() => {
    if (!valtProjekt) {
      setMappId("");
      return;
    }
    const foreslagen = foreslagenMappForOmrade(
      dokument.omrade as DokumentMallOmrade,
    );
    const finns = valtProjekt.mappDefinitioner.some((m) => m.id === foreslagen);
    setMappId(finns ? foreslagen : valtProjekt.mappDefinitioner[0]?.id ?? "");
  }, [valtProjekt, dokument.omrade]);

  function spara() {
    setFel(null);
    if (!projektId || !mappId) {
      setFel("Välj projekt och mapp.");
      return;
    }
    const result = laggForeningsDokumentIProjekt(projektId, mappId, dokument);
    if (!result.ok) {
      setFel(result.fel);
      return;
    }
    setKlar(true);
    onKlar?.();
  }

  if (projekt.length === 0) {
    return (
      <div className="mt-3 rounded-lg border border-primary/30 bg-[#f7fbf8] p-4 text-sm">
        <p className="text-foreground">
          Det finns inga projekt ännu. Skapa ett projekt under{" "}
          <Link href="/forening/projekt" className="font-medium text-primary-dark underline">
            Projekt
          </Link>{" "}
          och försök igen.
        </p>
        <button
          type="button"
          onClick={onStang}
          className="mt-3 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted"
        >
          Stäng
        </button>
      </div>
    );
  }

  if (klar) {
    return (
      <div className="mt-3 rounded-lg border border-primary/30 bg-[#eef6f0] p-4 text-sm text-primary-dark">
        <p className="font-medium">Dokumentet är tillagt i projektet.</p>
        <Link
          href="/forening/projekt"
          className="mt-2 inline-block text-xs font-medium underline"
        >
          Öppna projekt
        </Link>
        <button
          type="button"
          onClick={onStang}
          className="mt-3 block rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted"
        >
          Stäng
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-primary/30 bg-[#f7fbf8] p-4">
      <p className="text-xs font-medium text-muted">Lägg till i projekt</p>
      <p className="mt-1 text-xs text-muted">
        Välj projekt och undermapp. Kopian är redigerbar och knyts till samma
        dokument i Mina dokument.
      </p>
      <div className="mt-2 space-y-2">
        <label className="block text-xs text-muted">
          Projekt
          <select
            value={projektId}
            onChange={(e) => setProjektId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="">Välj projekt…</option>
            {projekt.map((p) => (
              <option key={p.id} value={p.id}>
                {p.titel} ({p.ar})
              </option>
            ))}
          </select>
        </label>
        {valtProjekt && (
          <label className="block text-xs text-muted">
            Undermapp
            <select
              value={mappId}
              onChange={(e) => setMappId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            >
              {valtProjekt.mappDefinitioner.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.titel}
                </option>
              ))}
            </select>
          </label>
        )}
        {fel && <p className="text-xs text-red-700">{fel}</p>}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={spara}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark"
          >
            Lägg till
          </button>
          <button
            type="button"
            onClick={onStang}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted"
          >
            Avbryt
          </button>
        </div>
      </div>
    </div>
  );
}
