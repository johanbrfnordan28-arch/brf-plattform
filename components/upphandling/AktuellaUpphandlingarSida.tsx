"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  arAnbudstidStangd,
  formatNavetDatum,
  NAVET_UPPHANDLING_EVENT,
  navetUpphandlingStorageKey,
  sakraExempelNavetUpphandling,
  sokNavetUpphandlingar,
  type NavetPubliceradTeaser,
} from "@/components/upphandling/navet-upphandling-lager";

function UnderUtvecklingBanner() {
  return (
    <div
      className="border-b border-amber-200/80 bg-amber-50"
      role="status"
    >
      <div className="mx-auto max-w-5xl px-4 py-3 text-sm leading-relaxed text-amber-950 sm:px-6">
        <span className="font-semibold">Upphandlingssidan är under utveckling.</span>{" "}
        Alla upphandlingar hanteras manuellt av Styrelse-Navet tills sidan är
        färdigutvecklad. Anmäl gärna intresse — vi återkommer personligen.
      </div>
    </div>
  );
}

/**
 * Dedikerad sida för entreprenörer: projektöversikt, sök och exempelprojekt.
 */
export function AktuellaUpphandlingarSida() {
  const [lista, setLista] = useState<NavetPubliceradTeaser[]>([]);
  const [sokord, setSokord] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    function las() {
      sakraExempelNavetUpphandling();
      setLista(sokNavetUpphandlingar(""));
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

  const filtrerad = useMemo(() => {
    const q = sokord.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter((u) => {
      const hay = [
        u.titel,
        u.ort,
        u.stadsdel,
        u.kategoriNamn,
        u.kortBeskrivning,
        u.fastighetsInfo,
        u.omfattning,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [lista, sokord]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#e8f0ea_0%,#f6f9f7_32%,#f4faf6_100%)]">
      <div className="border-b border-border/60 bg-white/50">
        <div className="mx-auto flex max-w-5xl items-center px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="text-sm font-medium text-primary-dark hover:text-primary"
          >
            ← Åter till Huvudsidan
          </Link>
        </div>
      </div>

      <UnderUtvecklingBanner />

      <section className="relative overflow-hidden border-b border-border/70">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 75% 55% at 10% 0%, rgba(61,115,84,0.14), transparent 50%), radial-gradient(ellipse 60% 45% at 95% 20%, rgba(90,154,110,0.1), transparent 48%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 pb-12 pt-10 sm:px-6 sm:pb-14 sm:pt-12">
          <p className="text-sm font-semibold tracking-wide text-primary-dark">
            Styrelse-Navet · För entreprenörer
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Aktuella projekt
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            Sök och läs projektinformation om pågående upphandlingar. Är ni
            intresserade av att lämna offert kan ni anmäla er — vi bjuder sedan
            in utvalda entreprenörer till förfrågningsunderlaget.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Projektöversikt
            </h2>
            <p className="mt-1 text-sm text-muted">
              Öppna ett projekt för omfattning, ort och anbudstid. Underlag delas
              först efter inbjudan.
            </p>
          </div>
          <label className="block w-full sm:max-w-xs">
            <span className="sr-only">Sök projekt</span>
            <input
              type="search"
              value={sokord}
              onChange={(e) => setSokord(e.target.value)}
              placeholder="Sök på titel, ort eller kategori…"
              className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground shadow-sm placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </div>

        {!hydrated ? (
          <p className="text-sm text-muted">Laddar projekt…</p>
        ) : filtrerad.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white/80 px-6 py-14 text-center">
            <p className="text-base font-medium text-foreground">
              {sokord.trim()
                ? "Inga projekt matchade sökningen"
                : "Inga aktuella projekt just nu"}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              {sokord.trim()
                ? "Prova ett annat sökord, t.ex. fasad, Stockholm eller tak."
                : "När nya upphandlingar publiceras syns de här med projektnamn, ort och sista anbudsdag."}
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {filtrerad.map((upph, index) => {
              const stangd = arAnbudstidStangd(upph.sistaAnbudsdag);
              return (
                <li
                  key={upph.id}
                  className="animate-[navetFadeUp_0.45s_ease-out_both]"
                  style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                >
                  <Link
                    href={`/upphandling/${upph.id}`}
                    className="group block rounded-2xl border border-border bg-white/90 p-5 shadow-[0_10px_36px_-28px_rgba(26,46,34,0.4)] transition-all hover:border-primary/40 hover:bg-white sm:p-7"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
                          {upph.kategoriNamn}
                          {upph.ort && upph.ort !== "—" ? ` · ${upph.ort}` : ""}
                          {upph.stadsdel ? ` · ${upph.stadsdel}` : ""}
                        </p>
                        <h3 className="mt-1.5 text-xl font-semibold text-foreground group-hover:text-primary-dark">
                          {upph.titel}
                        </h3>
                      </div>
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                          stangd
                            ? "bg-amber-50 text-amber-900"
                            : "bg-[#e8f3ec] text-primary-dark"
                        }`}
                      >
                        {stangd ? "Anbudstid stängd" : "Tar emot intresse"}
                      </span>
                    </div>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted sm:text-[15px]">
                      {upph.kortBeskrivning}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border/70 pt-4 text-sm">
                      <p className="text-muted">
                        Sista anbudsdag{" "}
                        <span className="font-semibold text-foreground">
                          {formatNavetDatum(upph.sistaAnbudsdag)}
                        </span>
                      </p>
                      <span className="font-medium text-primary">
                        Visa projektinformation →
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <aside className="mt-12 rounded-2xl border border-border/80 bg-white/70 p-6 sm:p-8">
          <h2 className="text-base font-semibold text-foreground">
            Så fungerar det för er som entreprenör
          </h2>
          <ol className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              {
                n: "1",
                t: "Läs projektet",
                d: "Se stadsdel, basinformation om fastigheten och vad som ska utföras — utan handlingar på sidan.",
              },
              {
                n: "2",
                t: "Anmäl intresse",
                d: "Skicka en intresseanmälan om ni vill lämna offert.",
              },
              {
                n: "3",
                t: "Få underlag och lämna anbud",
                d: "Utvalda får underlaget via mejl och lämnar anbud via mejl till Styrelse-Navet.",
              },
            ].map((steg) => (
              <li key={steg.n} className="text-sm">
                <p className="font-semibold text-primary-dark">
                  {steg.n}. {steg.t}
                </p>
                <p className="mt-1 leading-relaxed text-muted">{steg.d}</p>
              </li>
            ))}
          </ol>
        </aside>
      </section>
    </main>
  );
}
