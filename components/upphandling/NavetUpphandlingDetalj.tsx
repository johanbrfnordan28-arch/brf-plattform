"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  anmalIntresse,
  arAnbudstidStangd,
  formatNavetDatum,
  hamtaNavetTeaser,
  NAVET_UPPHANDLING_EVENT,
  navetUpphandlingStorageKey,
  sakraExempelNavetUpphandling,
  type NavetPubliceradTeaser,
} from "@/components/upphandling/navet-upphandling-lager";

type Props = { upphandlingId: string };

export function NavetUpphandlingDetalj({ upphandlingId }: Props) {
  const [teaser, setTeaser] = useState<NavetPubliceradTeaser | null | undefined>(
    undefined,
  );
  const [foretag, setForetag] = useState("");
  const [epost, setEpost] = useState("");
  const [telefon, setTelefon] = useState("");
  const [meddelande, setMeddelande] = useState("");
  const [fel, setFel] = useState<string | null>(null);
  const [skickat, setSkickat] = useState(false);

  useEffect(() => {
    function las() {
      sakraExempelNavetUpphandling();
      setTeaser(hamtaNavetTeaser(upphandlingId) ?? null);
    }
    las();
    function onStorage(event: StorageEvent) {
      if (event.key === navetUpphandlingStorageKey()) las();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener(NAVET_UPPHANDLING_EVENT, las);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(NAVET_UPPHANDLING_EVENT, las);
    };
  }, [upphandlingId]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFel(null);
    try {
      anmalIntresse({
        upphandlingId,
        epost,
        foretagsnamn: foretag,
        telefon,
        meddelande,
      });
      setSkickat(true);
      setForetag("");
      setEpost("");
      setTelefon("");
      setMeddelande("");
    } catch (error) {
      setFel(error instanceof Error ? error.message : "Kunde inte skicka anmälan.");
    }
  }

  if (teaser === undefined) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <p className="text-sm text-muted">Laddar projekt…</p>
      </main>
    );
  }

  if (!teaser) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <p className="text-sm text-muted">Projektet hittades inte.</p>
        <Link href="/upphandling" className="mt-3 inline-flex text-sm font-medium text-primary">
          ← Tillbaka till aktuella projekt
        </Link>
      </main>
    );
  }

  const stangd = arAnbudstidStangd(teaser.sistaAnbudsdag);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#e8f0ea_0%,#f6f9f7_30%,#f4faf6_100%)]">
      <div className="border-b border-border/60 bg-white/50">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="text-sm font-medium text-primary-dark hover:text-primary"
          >
            ← Åter till Huvudsidan
          </Link>
          <span className="text-border" aria-hidden>
            |
          </span>
          <Link
            href="/upphandling"
            className="text-sm font-medium text-muted hover:text-primary-dark"
          >
            Aktuella projekt
          </Link>
        </div>
      </div>

      <div
        className="border-b border-amber-200/80 bg-amber-50"
        role="status"
      >
        <div className="mx-auto max-w-5xl px-4 py-3 text-sm leading-relaxed text-amber-950 sm:px-6">
          <span className="font-semibold">Upphandlingssidan är under utveckling.</span>{" "}
          Alla upphandlingar hanteras manuellt av Styrelse-Navet tills sidan är
          färdigutvecklad. Anmäl intresse — vi återkommer personligen.
        </div>
      </div>

      <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
            {teaser.kategoriNamn}
            {teaser.ort && teaser.ort !== "—" ? ` · ${teaser.ort}` : ""}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {teaser.titel}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            {teaser.kortBeskrivning}
          </p>
        </header>

        <dl className="mt-8 grid gap-4 rounded-2xl border border-border bg-white/90 p-5 sm:grid-cols-3 sm:p-6">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              Ort
            </dt>
            <dd className="mt-1 text-base font-semibold text-foreground">
              {teaser.ort && teaser.ort !== "—" ? teaser.ort : "Anges i underlag"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              Sista anbudsdag
            </dt>
            <dd className="mt-1 text-base font-semibold text-foreground">
              {formatNavetDatum(teaser.sistaAnbudsdag)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              Status
            </dt>
            <dd className="mt-1 text-base font-semibold text-foreground">
              {stangd ? "Anbudstid stängd" : "Öppen för intresseanmälan"}
            </dd>
          </div>
        </dl>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-border bg-white/90 p-6 sm:p-7">
            <h2 className="text-lg font-semibold text-foreground">
              Projektinformation
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Den publika informationen är avsiktligt begränsad. Detaljerat
              förfrågningsunderlag, ritningar och anbudsformulär delas endast med
              entreprenörer som Styrelse-Navet bjuder in. Kontaktuppgifter till
              föreningen visas inte här.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-foreground/90">
              <li className="flex gap-2">
                <span className="text-primary" aria-hidden>
                  •
                </span>
                Omfattning och krav finns i underlaget efter inbjudan
              </li>
              <li className="flex gap-2">
                <span className="text-primary" aria-hidden>
                  •
                </span>
                Anbud lämnas till Styrelse-Navet — inte direkt till föreningen
              </li>
              <li className="flex gap-2">
                <span className="text-primary" aria-hidden>
                  •
                </span>
                Andra anbudsgivare ser varken er anmälan eller ert anbud
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-primary/30 bg-[#eef6f0]/80 p-6 sm:p-7">
            <h2 className="text-lg font-semibold text-primary-dark">
              Intresserad av att lämna offert?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Anmäl intresse så återkommer vi med eventuell inbjudan till
              underlaget.
            </p>

            {stangd ? (
              <p className="mt-5 text-sm font-medium text-amber-900">
                Anbudstiden har gått ut för detta projekt.
              </p>
            ) : skickat ? (
              <div className="mt-5 rounded-xl border border-primary/25 bg-white/80 p-4">
                <p className="text-sm font-medium text-foreground">
                  Tack — er intresseanmälan är mottagen.
                </p>
                <p className="mt-1 text-sm text-muted">
                  Om ni blir utvalda mejlar vi en personlig länk till
                  förfrågningsunderlaget.
                </p>
                <button
                  type="button"
                  className="mt-3 text-sm font-medium text-primary"
                  onClick={() => setSkickat(false)}
                >
                  Skicka en till anmälan
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-5 space-y-3">
                <label className="block text-sm">
                  <span className="font-medium text-foreground">Företag</span>
                  <input
                    required
                    value={foretag}
                    onChange={(e) => setForetag(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
                    placeholder="Företagsnamn"
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-foreground">E-post</span>
                  <input
                    required
                    type="email"
                    value={epost}
                    onChange={(e) => setEpost(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
                    placeholder="anbud@foretag.se"
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-foreground">
                    Telefon <span className="font-normal text-muted">(valfritt)</span>
                  </span>
                  <input
                    value={telefon}
                    onChange={(e) => setTelefon(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-foreground">
                    Kort meddelande{" "}
                    <span className="font-normal text-muted">(valfritt)</span>
                  </span>
                  <textarea
                    rows={3}
                    value={meddelande}
                    onChange={(e) => setMeddelande(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2"
                    placeholder="T.ex. erfarenhet av liknande projekt"
                  />
                </label>
                {fel && (
                  <p className="text-sm text-red-700" role="alert">
                    {fel}
                  </p>
                )}
                <button
                  type="submit"
                  className="brf-knapp-gron w-full px-4 py-3 text-sm sm:w-auto"
                >
                  Anmäl intresse att lämna offert
                </button>
              </form>
            )}
          </div>
        </section>
      </article>
    </main>
  );
}
