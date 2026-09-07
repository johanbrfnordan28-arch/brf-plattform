"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  DEV_GITHUB_URL,
  DEV_NPM_COMMAND,
  DEV_PUBLICERA_COMMAND,
  DEV_PUBLICERA_STEG,
  DEV_VERCEL_URL,
} from "@/lib/dev-publicera";

type GitStatus = {
  branch: string;
  remote: string;
  hasChanges: boolean;
  changedCount: number;
  changedFiles: string[];
  ahead: number;
  behind: number;
};

function statusEtikett(status: GitStatus | null): { text: string; tone: "ok" | "warn" | "neutral" } {
  if (!status) return { text: "Läser status…", tone: "neutral" };
  if (status.hasChanges) {
    return {
      text: `${status.changedCount} osparad${status.changedCount === 1 ? "" : "e"} ändring${status.changedCount === 1 ? "" : "ar"}`,
      tone: "warn",
    };
  }
  if (status.ahead > 0) {
    return { text: `${status.ahead} commit${status.ahead === 1 ? "" : "s"} väntar på push`, tone: "warn" };
  }
  return { text: "Allt synkat med GitHub", tone: "ok" };
}

export function DevPubliceraPanel() {
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [statusFel, setStatusFel] = useState<string | null>(null);
  const [oppnar, setOppnar] = useState(false);
  const [oppnaMeddelande, setOppnaMeddelande] = useState<string | null>(null);
  const [kopierat, setKopierat] = useState<string | null>(null);

  const hamtaStatus = useCallback(async () => {
    setStatusFel(null);
    try {
      const res = await fetch("/api/dev/git-status");
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Kunde inte hämta git-status");
      }
      setStatus((await res.json()) as GitStatus);
    } catch (error) {
      setStatus(null);
      setStatusFel(
        error instanceof Error
          ? error.message
          : "Git-status finns bara när du kör npm run dev lokalt.",
      );
    }
  }, []);

  useEffect(() => {
    void hamtaStatus();
  }, [hamtaStatus]);

  async function oppnaPublicera() {
    setOppnar(true);
    setOppnaMeddelande(null);
    try {
      const res = await fetch("/api/dev/open-publicera", { method: "POST" });
      const data = (await res.json().catch(() => null)) as { error?: string; ok?: boolean } | null;
      if (!res.ok) {
        throw new Error(data?.error ?? "Kunde inte starta publicering");
      }
      setOppnaMeddelande(
        "Terminalfönster öppnat — följ stegen där (commit-dialog → push). Uppdatera status nedan när du är klar.",
      );
      window.setTimeout(() => void hamtaStatus(), 4000);
    } catch (error) {
      setOppnaMeddelande(
        error instanceof Error
          ? error.message
          : "Något gick fel. Dubbelklicka PUBLICERA-GITHUB.command i Finder istället.",
      );
    } finally {
      setOppnar(false);
    }
  }

  async function kopiera(text: string, etikett: string) {
    try {
      await navigator.clipboard.writeText(text);
      setKopierat(etikett);
      window.setTimeout(() => setKopierat(null), 2000);
    } catch {
      setKopierat("Kunde inte kopiera");
    }
  }

  const etikett = statusEtikett(status);
  const toneKlass =
    etikett.tone === "ok"
      ? "border-[#d4e8da] bg-[#eef6f0] text-[#1a4d2e]"
      : etikett.tone === "warn"
        ? "border-amber-200 bg-amber-50 text-amber-950"
        : "border-border bg-surface text-muted";

  return (
    <main>
      <section className="border-b border-border bg-surface/80">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="inline-flex rounded-full border border-primary/30 bg-[#e2f0e6] px-3 py-1 text-xs font-semibold text-primary-dark">
            Utvecklare · Lokal synk
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Skicka till GitHub
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            En knapp som gör allt: lägg till ändringar, committa och pusha. Fungerar när du kör
            appen lokalt med <code className="rounded bg-background px-1.5 py-0.5 text-sm">npm run dev</code>.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={oppnar}
              onClick={() => void oppnaPublicera()}
              className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {oppnar ? "Öppnar…" : "Skicka till GitHub"}
            </button>
            <button
              type="button"
              onClick={() => void hamtaStatus()}
              className="rounded-lg border border-border bg-white px-6 py-3 text-sm font-medium text-foreground hover:border-primary/40"
            >
              Uppdatera status
            </button>
            <Link
              href={DEV_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border bg-white px-6 py-3 text-sm font-medium text-foreground hover:border-primary/40"
            >
              Öppna på GitHub
            </Link>
          </div>

          {oppnaMeddelande ? (
            <p className="mt-4 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground">
              {oppnaMeddelande}
            </p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className={`rounded-2xl border p-5 sm:p-6 ${toneKlass}`}>
          <h2 className="text-lg font-semibold">Status</h2>
          <p className="mt-2 text-sm">{etikett.text}</p>
          {status ? (
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-medium opacity-80">Branch</dt>
                <dd className="font-mono">{status.branch}</dd>
              </div>
              <div>
                <dt className="font-medium opacity-80">Remote</dt>
                <dd className="break-all font-mono text-xs sm:text-sm">{status.remote}</dd>
              </div>
            </dl>
          ) : null}
          {statusFel ? (
            <p className="mt-3 text-sm opacity-90">{statusFel}</p>
          ) : null}
          {status?.changedFiles.length ? (
            <ul className="mt-4 space-y-1 font-mono text-xs opacity-90">
              {status.changedFiles.map((rad) => (
                <li key={rad}>{rad}</li>
              ))}
              {status.changedCount > status.changedFiles.length ? (
                <li>…och {status.changedCount - status.changedFiles.length} till</li>
              ) : null}
            </ul>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <h2 className="text-xl font-semibold text-foreground">Vad knappen gör</h2>
        <ol className="mt-4 space-y-3">
          {DEV_PUBLICERA_STEG.map((steg, i) => (
            <li
              key={steg}
              className="flex gap-3 rounded-2xl border border-border bg-surface p-4 text-sm text-muted"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e2f0e6] text-xs font-bold text-primary-dark">
                {i + 1}
              </span>
              {steg}
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-border bg-surface/60">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:pb-16">
          <h2 className="text-xl font-semibold text-foreground">Alternativ utan webbläsare</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="font-semibold text-foreground">Dubbelklick i Finder</h3>
              <p className="mt-2 text-sm text-muted">
                Öppna projektmappen och dubbelklicka på{" "}
                <code className="rounded bg-background px-1 py-0.5">{DEV_PUBLICERA_COMMAND}</code>.
              </p>
              <button
                type="button"
                onClick={() => void kopiera(DEV_PUBLICERA_COMMAND, "filnamn")}
                className="mt-4 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
              >
                {kopierat === "filnamn" ? "Kopierat!" : "Kopiera filnamn"}
              </button>
            </article>
            <article className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="font-semibold text-foreground">Terminal</h3>
              <p className="mt-2 text-sm text-muted">Kör i projektmappen:</p>
              <code className="mt-3 block rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm">
                {DEV_NPM_COMMAND}
              </code>
              <button
                type="button"
                onClick={() => void kopiera(DEV_NPM_COMMAND, "kommando")}
                className="mt-4 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
              >
                {kopierat === "kommando" ? "Kopierat!" : "Kopiera kommando"}
              </button>
            </article>
          </div>

          <div className="mt-8 rounded-2xl border border-amber-200/80 bg-amber-50/90 p-5 sm:p-6">
            <h3 className="text-lg font-semibold text-amber-950">Publik länk (Vercel)</h3>
            <p className="mt-2 text-sm leading-relaxed text-amber-950/90">
              Efter första push till GitHub: koppla repot i Vercel så kollegor kan öppna en publik
              URL. Varje ny push uppdaterar sajten automatiskt.
            </p>
            <Link
              href={DEV_VERCEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex rounded-lg bg-amber-900 px-4 py-2 text-sm font-medium text-amber-50 hover:bg-amber-950"
            >
              Öppna vercel.com/new
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
