"use client";

import { useEffect, useMemo, useState } from "react";
import {
  foreslagnaHandlingar,
  listaPortalHandlingar,
  oppnaPortalHandling,
  portalHandlingTillRef,
  PORTAL_KALLOR,
  type PortalHandling,
  type PortalKalla,
} from "@/components/upphandling/portal-handlingar";
import type { DokumentRef } from "@/components/upphandling/upphandling-dokument-lager";

type Props = {
  kategoriNamn: string;
  /** portalId och filId för handlingar som redan finns i kategorin. */
  redanKopplade: Set<string>;
  arshjulHandelseId?: string | null;
  /** Förvälj handlingar som hör till kategorin. */
  forvalj: boolean;
  onLaggTill: (rader: { etikett: string; ref: DokumentRef }[]) => void;
  onStang: () => void;
};

export function PortalHandlingarValjare({
  kategoriNamn,
  redanKopplade,
  arshjulHandelseId,
  forvalj,
  onLaggTill,
  onStang,
}: Props) {
  const [lista, setLista] = useState<PortalHandling[]>([]);
  const [valda, setValda] = useState<Set<string>>(new Set());
  const [kalla, setKalla] = useState<PortalKalla | "alla" | "forslag">("alla");
  const [sok, setSok] = useState("");
  const [laggerTill, setLaggerTill] = useState(false);
  const [fel, setFel] = useState<string | null>(null);

  useEffect(() => {
    const alla = listaPortalHandlingar();
    setLista(alla);
    const forslag = foreslagnaHandlingar(alla, kategoriNamn, arshjulHandelseId);
    if (forslag.length > 0) setKalla("forslag");
    if (forvalj) {
      setValda(
        new Set(
          forslag.filter((id) => {
            const h = alla.find((rad) => rad.id === id);
            return h && !arKopplad(h, redanKopplade);
          }),
        ),
      );
    }
    // Listan läses en gång när väljaren öppnas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const forslagIds = useMemo(
    () => new Set(foreslagnaHandlingar(lista, kategoriNamn, arshjulHandelseId)),
    [lista, kategoriNamn, arshjulHandelseId],
  );

  const synliga = useMemo(() => {
    const fras = sok.trim().toLowerCase();
    return lista.filter((h) => {
      if (kalla === "forslag" && !forslagIds.has(h.id)) return false;
      if (kalla !== "alla" && kalla !== "forslag" && h.kalla !== kalla) return false;
      if (!fras) return true;
      return `${h.filnamn} ${h.plats}`.toLowerCase().includes(fras);
    });
  }, [lista, kalla, sok, forslagIds]);

  const antalPerKalla = useMemo(() => {
    const antal: Partial<Record<PortalKalla, number>> = {};
    for (const h of lista) antal[h.kalla] = (antal[h.kalla] ?? 0) + 1;
    return antal;
  }, [lista]);

  function vaxla(id: string) {
    setValda((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function laggTill() {
    const att = lista.filter((h) => valda.has(h.id));
    if (att.length === 0) return;
    setLaggerTill(true);
    setFel(null);
    const rader: { etikett: string; ref: DokumentRef }[] = [];
    const misslyckade: string[] = [];
    for (const h of att) {
      const res = await portalHandlingTillRef(h);
      if (res.ok) rader.push({ etikett: h.plats, ref: res.ref });
      else misslyckade.push(res.fel);
    }
    setLaggerTill(false);
    if (rader.length > 0) onLaggTill(rader);
    if (misslyckade.length > 0) {
      setFel(misslyckade.join(" "));
      setValda(new Set());
      return;
    }
    onStang();
  }

  const kallFlikar: { id: PortalKalla | "alla" | "forslag"; etikett: string; antal: number }[] = [
    ...(forslagIds.size > 0
      ? [{ id: "forslag" as const, etikett: "Förslag för kategorin", antal: forslagIds.size }]
      : []),
    { id: "alla", etikett: "Alla", antal: lista.length },
    ...PORTAL_KALLOR.filter((k) => antalPerKalla[k.id]).map((k) => ({
      id: k.id,
      etikett: k.etikett,
      antal: antalPerKalla[k.id] ?? 0,
    })),
  ];

  return (
    <div className="rounded-xl border-2 border-primary/40 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Hämta handlingar från portalen
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Välj protokoll, bilder, fakturor, scheman och dokument från hela portalen. De
            kopplas till {kategoriNamn.toLowerCase()} som bilagor.
          </p>
        </div>
        <button
          type="button"
          onClick={onStang}
          className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground"
        >
          Stäng
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Källa">
        {kallFlikar.map((flik) => (
          <button
            key={flik.id}
            type="button"
            role="tab"
            aria-selected={kalla === flik.id}
            onClick={() => setKalla(flik.id)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
              kalla === flik.id
                ? "border-primary bg-[#e2f0e6] text-primary-dark"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            {flik.etikett} ({flik.antal})
          </button>
        ))}
      </div>

      <input
        type="search"
        value={sok}
        onChange={(event) => setSok(event.target.value)}
        placeholder="Sök på filnamn eller mapp"
        aria-label="Sök handlingar"
        className="mt-3 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
      />

      {synliga.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          {lista.length === 0
            ? "Det finns inga handlingar i portalen ännu."
            : "Inga handlingar matchar."}
        </p>
      ) : (
        <ul className="mt-3 max-h-80 space-y-1.5 overflow-y-auto pr-1">
          {synliga.map((h) => {
            const kopplad = arKopplad(h, redanKopplade);
            return (
              <li
                key={h.id}
                className={`flex items-start gap-3 rounded-lg border px-3 py-2 ${
                  valda.has(h.id) ? "border-primary bg-[#eef6f0]" : "border-border"
                }`}
              >
                <input
                  type="checkbox"
                  checked={valda.has(h.id)}
                  disabled={kopplad}
                  onChange={() => vaxla(h.id)}
                  aria-label={`Välj ${h.filnamn}`}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-medium text-foreground">{h.filnamn}</p>
                  <p className="text-xs text-muted">
                    {h.plats}
                    {h.datum ? ` · ${h.datum}` : ""}
                    {kopplad ? " · redan kopplad" : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void oppnaPortalHandling(h)}
                  className="shrink-0 rounded-lg border border-border px-2.5 py-1 text-xs text-foreground hover:bg-surface"
                >
                  Öppna
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {fel && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {fel}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void laggTill()}
          disabled={valda.size === 0 || laggerTill}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {laggerTill ? "Lägger till…" : `Lägg till valda (${valda.size})`}
        </button>
        {valda.size > 0 && !laggerTill && (
          <button
            type="button"
            onClick={() => setValda(new Set())}
            className="text-xs text-muted underline hover:text-foreground"
          >
            Avmarkera alla
          </button>
        )}
      </div>
    </div>
  );
}

function arKopplad(h: PortalHandling, redanKopplade: Set<string>): boolean {
  return redanKopplade.has(h.id) || Boolean(h.fil && redanKopplade.has(h.fil.filId));
}
