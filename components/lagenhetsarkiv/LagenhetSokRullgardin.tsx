"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  filtreraLagenheter,
  lagenhetRullgardinEtikett,
  type ApartmentFolder,
} from "@/components/lagenhetsarkiv/lagenhetsarkiv";

type Props = {
  apartments: ApartmentFolder[];
  sok: string;
  onSokChange: (varde: string) => void;
  valdId: number | null;
  onValj: (id: number) => void;
};

export function LagenhetSokRullgardin({
  apartments,
  sok,
  onSokChange,
  valdId,
  onValj,
}: Props) {
  const [oppen, setOppen] = useState(false);
  const [aktivIndex, setAktivIndex] = useState(0);
  const rotRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listaId = useId();
  const filtrerade = useMemo(
    () => filtreraLagenheter(apartments, sok),
    [apartments, sok],
  );

  useEffect(() => {
    setAktivIndex(0);
  }, [sok]);

  useEffect(() => {
    if (!oppen) return;
    const aktiv = filtrerade[aktivIndex];
    if (!aktiv) return;
    document
      .getElementById(`${listaId}-opt-${aktiv.id}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [aktivIndex, filtrerade, listaId, oppen]);

  useEffect(() => {
    if (!oppen) return;
    function stang(e: MouseEvent | KeyboardEvent) {
      if (e instanceof KeyboardEvent) {
        if (e.key === "Escape") setOppen(false);
        return;
      }
      if (!rotRef.current?.contains(e.target as Node)) setOppen(false);
    }
    document.addEventListener("mousedown", stang);
    document.addEventListener("keydown", stang);
    return () => {
      document.removeEventListener("mousedown", stang);
      document.removeEventListener("keydown", stang);
    };
  }, [oppen]);

  function valj(id: number) {
    onValj(id);
    setOppen(false);
    inputRef.current?.blur();
  }

  function hanteraTangent(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!oppen) {
        setOppen(true);
        return;
      }
      setAktivIndex((i) =>
        filtrerade.length === 0 ? 0 : Math.min(i + 1, filtrerade.length - 1),
      );
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setAktivIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const vald = filtrerade[aktivIndex];
      if (oppen && vald) valj(vald.id);
      else setOppen(true);
      return;
    }
    if (e.key === "Escape") {
      setOppen(false);
    }
  }

  const aktiv = filtrerade[aktivIndex];

  return (
    <div ref={rotRef} className="relative min-w-0 flex-1">
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-dark">
          Sök lägenhet
        </span>
        <div className="mt-1 flex overflow-hidden rounded-lg border-2 border-primary/40 bg-white shadow-sm focus-within:border-primary">
          <input
            ref={inputRef}
            type="search"
            value={sok}
            onChange={(e) => {
              onSokChange(e.target.value);
              setOppen(true);
            }}
            onFocus={() => setOppen(true)}
            onKeyDown={hanteraTangent}
            placeholder="Nummer, adress eller våning — t.ex. 1001"
            autoComplete="off"
            spellCheck={false}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={oppen}
            aria-controls={listaId}
            aria-activedescendant={
              oppen && aktiv ? `${listaId}-opt-${aktiv.id}` : undefined
            }
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-foreground outline-none"
          />
          {sok ? (
            <button
              type="button"
              onClick={() => {
                onSokChange("");
                inputRef.current?.focus();
                setOppen(true);
              }}
              className="px-3 text-xs font-medium text-muted hover:text-foreground"
            >
              Rensa
            </button>
          ) : (
            <button
              type="button"
              aria-label={oppen ? "Stäng listan" : "Öppna listan"}
              onClick={() => {
                setOppen((v) => !v);
                inputRef.current?.focus();
              }}
              className="px-3 text-muted"
            >
              <span aria-hidden>{oppen ? "▴" : "▾"}</span>
            </button>
          )}
        </div>
      </label>
      <p className="mt-1 text-xs text-muted">
        {apartments.length} lägenheter
        {sok.trim()
          ? ` · ${filtrerade.length} träff${filtrerade.length === 1 ? "" : "ar"}`
          : " · skriv eller öppna rullgardinen"}
      </p>
      {oppen ? (
        <ul
          id={listaId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-border bg-white py-1 shadow-lg"
        >
          {filtrerade.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted">
              Ingen lägenhet matchar «{sok.trim()}».
            </li>
          ) : (
            filtrerade.map((a, index) => {
              const aktivRad = index === aktivIndex;
              const vald = a.id === valdId;
              return (
                <li key={a.id} role="presentation">
                  <button
                    type="button"
                    id={`${listaId}-opt-${a.id}`}
                    role="option"
                    aria-selected={vald}
                    onMouseEnter={() => setAktivIndex(index)}
                    onClick={() => valj(a.id)}
                    className={`flex w-full items-start justify-between gap-2 px-3 py-2 text-left text-sm ${
                      aktivRad
                        ? "bg-[#eef6f0] text-foreground"
                        : "text-foreground hover:bg-[#eef6f0]"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="font-medium">
                        {lagenhetRullgardinEtikett(a)}
                      </span>
                      {a.antalRum ? (
                        <span className="mt-0.5 block text-xs text-muted">
                          {a.antalRum}
                          {a.boyta ? ` · ${a.boyta} m²` : ""}
                        </span>
                      ) : null}
                    </span>
                    {vald ? (
                      <span className="shrink-0 text-xs font-medium text-primary-dark">
                        Öppen
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
