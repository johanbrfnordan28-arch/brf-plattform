"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  arAnbudstidStangd,
  formatNavetDatum,
  hamtaNavetPublicerade,
  NAVET_UPPHANDLING_EVENT,
  navetUpphandlingStorageKey,
  type NavetPubliceradTeaser,
} from "@/components/upphandling/navet-upphandling-lager";

/**
 * Dedikerad sida endast för aktuella upphandlingar.
 * Teaser-info publikt; underlag och anbud är låsta till inbjudna.
 */
export function AktuellaUpphandlingarSida() {
  const [lista, setLista] = useState<NavetPubliceradTeaser[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    function las() {
      setLista(hamtaNavetPublicerade());
    }
    las();
    setHydrated(true);
    function onStorage(event: StorageEvent) {
      if (event.key === navetUpphandlingStorageKey()) las();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener(NAVET_UPPHANDLING_EVENT, las);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(NAVET_UPPHANDLING_EVENT, las);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef5f0_0%,#f7faf8_28%,#f4faf6_100%)]">
      {/* Hero — ett fokus: varumärke, rubrik, mening, CTA-hint */}
      <section className="relative overflow-hidden border-b border-border/70">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 15% 20%, rgba(61,115,84,0.16), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 10%, rgba(90,154,110,0.12), transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 pb-14 pt-12 sm:px-6 sm:pb-16 sm:pt-16">
          <p className="text-sm font-semibold tracking-wide text-primary-dark animate-[navetFadeUp_0.5s_ease-out]">
            Styrelse-Navet
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl animate-[navetFadeUp_0.55s_ease-out]">
            Aktuella upphandlingar
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted animate-[navetFadeUp_0.6s_ease-out]">
            Här syns bara vad som upphandlas. Förfrågningsunderlag och anbud är
            låsta — inbjudan sker via mejl från oss.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground/80 animate-[navetFadeUp_0.65s_ease-out]">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              Ingen kontaktinfo publikt
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              Underlag endast för inbjudna
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              Anbudsgivare ser inte varandra
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Öppna uppdrag</h2>
            <p className="mt-1 text-sm text-muted">
              Välj ett uppdrag för mer information. Fullständigt underlag kräver
              personlig inbjudan.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            ← Till Styrelse-Navet
          </Link>
        </div>

        {!hydrated ? (
          <p className="text-sm text-muted">Laddar upphandlingar…</p>
        ) : lista.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white/70 px-6 py-14 text-center">
            <p className="text-base font-medium text-foreground">
              Inga aktuella upphandlingar just nu
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              När Styrelse-Navet publicerar ett uppdrag syns det här med titel,
              ort och sista anbudsdag — utan underlag eller kontakter.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/80 overflow-hidden rounded-2xl border border-border bg-white/80 shadow-[0_12px_40px_-28px_rgba(26,46,34,0.35)]">
            {lista.map((upph, index) => {
              const stangd = arAnbudstidStangd(upph.sistaAnbudsdag);
              return (
                <li
                  key={upph.id}
                  className="group animate-[navetFadeUp_0.45s_ease-out_both]"
                  style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
                >
                  <Link
                    href={`/upphandling/${upph.id}`}
                    className="flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-[#eef6f0]/70 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6"
                  >
                    <div className="min-w-0 flex-1 border-l-2 border-primary/50 pl-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
                        {upph.kategoriNamn}
                        {upph.ort && upph.ort !== "—" ? ` · ${upph.ort}` : ""}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-foreground group-hover:text-primary-dark">
                        {upph.titel}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                        {upph.kortBeskrivning}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end sm:pl-6">
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                          stangd
                            ? "bg-amber-50 text-amber-900"
                            : "bg-[#e8f3ec] text-primary-dark"
                        }`}
                      >
                        {stangd ? "Anbudstid stängd" : "Anbudstid öppen"}
                      </span>
                      <p className="text-sm text-muted">
                        Sista dag{" "}
                        <span className="font-medium text-foreground">
                          {formatNavetDatum(upph.sistaAnbudsdag)}
                        </span>
                      </p>
                      <span className="text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
                        Visa sammanfattning →
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <aside className="mt-12 grid gap-6 border-t border-border/80 pt-10 sm:grid-cols-3">
          {[
            {
              titel: "Publikt",
              text: "Titel, ort, kort beskrivning och sista anbudsdag.",
            },
            {
              titel: "Inbjudna",
              text: "Unik mejllänk till förfrågningsunderlag och anbudsformulär.",
            },
            {
              titel: "Konfidentiellt",
              text: "Vem som är inbjuden och vilka anbud som kommit in syns bara hos oss.",
            },
          ].map((rad) => (
            <div key={rad.titel}>
              <h3 className="text-sm font-semibold text-foreground">{rad.titel}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{rad.text}</p>
            </div>
          ))}
        </aside>
      </section>
    </main>
  );
}
