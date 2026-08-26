"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  arAnbudstidStangd,
  formatNavetDatum,
  hamtaEgetAnbudViaToken,
  hamtaUnderlagMedToken,
  lamnaNavetAnbud,
  NAVET_UPPHANDLING_EVENT,
  navetUpphandlingStorageKey,
  type UnderlagAccess,
} from "@/components/upphandling/navet-upphandling-lager";

type Props = { token: string };

export function EntreprenorUnderlagVy({ token }: Props) {
  const [access, setAccess] = useState<UnderlagAccess | null>(null);
  const [summa, setSumma] = useState("");
  const [meddelande, setMeddelande] = useState("");
  const [fel, setFel] = useState<string | null>(null);
  const [skickat, setSkickat] = useState(false);
  const [egetAnbudSumma, setEgetAnbudSumma] = useState<number | null>(null);

  function las() {
    const result = hamtaUnderlagMedToken(token);
    setAccess(result);
    if (result.ok) {
      const egna = hamtaEgetAnbudViaToken(token);
      setEgetAnbudSumma(egna?.anbudSummaKr ?? null);
    }
  }

  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload on token change
  }, [token]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFel(null);
    const belopp = Number(summa.replace(/\s/g, "").replace(",", "."));
    try {
      const anbud = lamnaNavetAnbud({
        token,
        anbudSummaKr: belopp,
        meddelande,
      });
      setSkickat(true);
      setEgetAnbudSumma(anbud.anbudSummaKr);
      setSumma("");
      setMeddelande("");
    } catch (error) {
      setFel(error instanceof Error ? error.message : "Kunde inte skicka anbud.");
    }
  }

  if (!access) {
    return <p className="text-sm text-muted">Kontrollerar behörighet…</p>;
  }

  if (!access.ok) {
    return (
      <div className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground">Ingen tillgång till underlaget</h2>
        <p className="text-sm text-muted">
          {access.orsak === "ej_godkand"
            ? "Entreprenören är inte godkänd ännu. Styrelse-Navet måste godkänna er innan underlaget öppnas."
            : access.orsak === "saknar_underlag"
              ? "Underlaget saknas för denna upphandling."
              : "Inbjudningslänken är ogiltig eller har gått ut."}
        </p>
        {access.teaser && (
          <p className="text-sm text-foreground">
            Publik sammanfattning:{" "}
            <Link
              href={`/upphandling/${access.teaser.id}`}
              className="font-medium text-primary"
            >
              {access.teaser.titel}
            </Link>
          </p>
        )}
        <Link href="/upphandling" className="inline-flex text-sm font-medium text-primary">
          Se aktuella upphandlingar
        </Link>
      </div>
    );
  }

  const { teaser, underlag, entreprenor } = access;
  const stangd = arAnbudstidStangd(teaser.sistaAnbudsdag);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-primary/30 bg-[#eef6f0]/60 p-5">
        <p className="text-sm text-primary-dark">
          Inbjuden som <strong>{entreprenor.foretagsnamn}</strong> ({entreprenor.epost}).
          Underlaget är endast för godkända, inbjudna entreprenörer.
        </p>
      </div>

      <article className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <p className="text-xs font-medium uppercase tracking-wide text-primary-dark">
          {teaser.kategoriNamn}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-foreground">{teaser.titel}</h2>
        <p className="mt-2 text-sm text-muted">
          {teaser.ort} · Sista anbudsdag {formatNavetDatum(teaser.sistaAnbudsdag)}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-foreground/90">
          {teaser.kortBeskrivning}
        </p>

        <h3 className="mt-8 text-lg font-semibold text-foreground">
          Förfrågningsunderlag
        </h3>
        <ul className="mt-3 space-y-2">
          {underlag.dokument.length === 0 ? (
            <li className="text-sm text-muted">Inga dokument bifogade ännu.</li>
          ) : (
            underlag.dokument.map((dok) => (
              <li
                key={`${dok.etikett}-${dok.filnamn}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm"
              >
                <span className="font-medium text-foreground">{dok.etikett}</span>
                <span className="text-muted">{dok.filnamn}</span>
              </li>
            ))
          )}
        </ul>
        <p className="mt-4 text-xs text-muted">
          Kontaktuppgifter till föreningen ingår inte. Frågor och anbud går via
          Styrelse-Navet.
        </p>
      </article>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <h3 className="text-lg font-semibold text-foreground">Lämna anbud</h3>
        <p className="mt-2 text-sm text-muted">
          Anbudet skickas till Styrelse-Navet. Andra anbudsgivare ser varken ert
          anbud eller att ni är inbjudna — och ni ser inte dem.
        </p>

        {stangd ? (
          <p className="mt-4 text-sm font-medium text-amber-900">
            Anbudstiden har gått ut.
          </p>
        ) : skickat || egetAnbudSumma !== null ? (
          <div className="mt-4 rounded-xl border border-primary/30 bg-[#e8f3ec]/60 p-4">
            <p className="text-sm text-foreground">
              Anbud mottaget
              {egetAnbudSumma !== null
                ? `: ${egetAnbudSumma.toLocaleString("sv-SE")} kr`
                : ""}
              . Ni kan skicka in ett uppdaterat belopp nedan om ni vill.
            </p>
          </div>
        ) : null}

        {!stangd && (
          <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-1">
              <span className="font-medium text-foreground">Anbudssumma (kr)</span>
              <input
                required
                inputMode="decimal"
                value={summa}
                onChange={(e) => setSumma(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
                placeholder="t.ex. 1250000"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium text-foreground">Meddelande (valfritt)</span>
              <textarea
                rows={3}
                value={meddelande}
                onChange={(e) => setMeddelande(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
                placeholder="Kort kommentar till anbudet"
              />
            </label>
            {fel && (
              <p className="text-sm text-red-700 sm:col-span-2" role="alert">
                {fel}
              </p>
            )}
            <button
              type="submit"
              className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark sm:col-span-2 sm:w-fit"
            >
              Skicka anbud till Styrelse-Navet
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
