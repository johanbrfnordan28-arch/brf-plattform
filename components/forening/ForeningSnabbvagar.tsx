"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  FORENING_MODULER,
  hamtaModul,
  type ForeningModulDef,
} from "@/lib/forening-moduler";
import {
  bytSnabbvagModul,
  flyttaSnabbvag,
  lasSnabbvagIds,
  SNABBVAGAR_EVENT,
  sparaSnabbvagIds,
} from "@/lib/forening-snabbvagar";
import { FORENING_AKTIV_EVENT } from "@/lib/forening-registry";

const BASE = "/forening";

export function ForeningSnabbvagar() {
  const [ids, setIds] = useState<string[]>([]);
  const [redigera, setRedigera] = useState(false);
  const [bytIndex, setBytIndex] = useState<number | null>(null);

  const ladda = useCallback(() => {
    setIds(lasSnabbvagIds());
  }, []);

  useEffect(() => {
    ladda();
    const onUppdatering = () => ladda();
    window.addEventListener(SNABBVAGAR_EVENT, onUppdatering);
    window.addEventListener(FORENING_AKTIV_EVENT, onUppdatering);
    window.addEventListener("storage", onUppdatering);
    return () => {
      window.removeEventListener(SNABBVAGAR_EVENT, onUppdatering);
      window.removeEventListener(FORENING_AKTIV_EVENT, onUppdatering);
      window.removeEventListener("storage", onUppdatering);
    };
  }, [ladda]);

  function uppdatera(next: string[]) {
    setIds(next);
    sparaSnabbvagIds(next);
  }

  const moduler: ForeningModulDef[] = ids
    .map((id) => hamtaModul(id))
    .filter((m): m is ForeningModulDef => Boolean(m));

  if (moduler.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-border bg-[#eef6f0]/50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary-dark">Snabbvägar</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
              Vanliga verktyg för styrelsen
            </h2>
            <p className="mt-2 text-muted">
              Samma moduler som i listan nedan — standard är de fyra översta.
              Flytta om ordningen eller byt ut mot andra moduler.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setRedigera((v) => !v);
              setBytIndex(null);
            }}
            className="shrink-0 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50"
          >
            {redigera ? "Klar" : "Ändra snabbvägar"}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {moduler.map((mod, index) => (
            <div key={mod.id} className="relative flex min-h-[14rem] flex-col">
              <Link
                href={`${BASE}${mod.path}`}
                className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <span
                  className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f3ec] text-xl"
                  aria-hidden
                >
                  {mod.icon}
                </span>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary-dark">
                  {mod.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {mod.description}
                </p>
                <span className="mt-4 text-sm font-medium text-primary group-hover:text-primary-dark">
                  Öppna modul →
                </span>
              </Link>

              {redigera && (
                <div className="absolute right-2 top-2 flex flex-col gap-1">
                  <button
                    type="button"
                    aria-label={`Flytta upp ${mod.title}`}
                    disabled={index === 0}
                    onClick={() =>
                      uppdatera(flyttaSnabbvag(ids, index, -1))
                    }
                    className="rounded-md border border-border bg-white px-2 py-1 text-xs font-semibold text-foreground shadow-sm disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label={`Flytta ner ${mod.title}`}
                    disabled={index === moduler.length - 1}
                    onClick={() =>
                      uppdatera(flyttaSnabbvag(ids, index, 1))
                    }
                    className="rounded-md border border-border bg-white px-2 py-1 text-xs font-semibold text-foreground shadow-sm disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    aria-label={`Byt ut ${mod.title}`}
                    onClick={() =>
                      setBytIndex((prev) => (prev === index ? null : index))
                    }
                    className="rounded-md border border-primary/40 bg-[#eef6f0] px-2 py-1 text-xs font-semibold text-primary-dark shadow-sm"
                  >
                    Byt
                  </button>
                </div>
              )}

              {redigera && bytIndex === index && (
                <div className="absolute inset-x-2 bottom-2 z-10 max-h-48 overflow-y-auto rounded-xl border border-border bg-white p-2 shadow-lg">
                  <p className="px-2 py-1 text-xs font-medium text-muted">
                    Ersätt med
                  </p>
                  {FORENING_MODULER.filter((m) => !ids.includes(m.id)).map(
                    (alt) => (
                      <button
                        key={alt.id}
                        type="button"
                        onClick={() => {
                          uppdatera(bytSnabbvagModul(ids, index, alt.id));
                          setBytIndex(null);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-[#eef6f0]"
                      >
                        <span aria-hidden>{alt.icon}</span>
                        <span className="font-medium text-foreground">
                          {alt.title}
                        </span>
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
