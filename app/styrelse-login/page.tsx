import type { Metadata } from "next";
import Link from "next/link";
import { StyrelseLoginModul } from "@/components/forening/StyrelseLoginModul";
import { BRF_NAVET_NAMN } from "@/lib/forening-konstanter";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";

export const metadata: Metadata = {
  title: `Logga in styrelse — ${BRF_NAVET_NAMN}`,
  description:
    "Sök och logga in på er testförening. Brf är förifyllt — skriv fler bokstäver för att filtrera.",
};

export default function StyrelseLoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col justify-center bg-surface/40 py-12">
      <div className="mb-10 px-4 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-dark">
          {BRF_NAVET_NAMN} · Pågående testföreningar
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Logga in till er förening
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted">
          Har ni skapat en testförening visas den först när ni skriver Brf +
          fler bokstäver. Övriga demoföreningar döljs då.
        </p>
      </div>

      <StyrelseLoginModul />

      <p className="mt-10 text-center text-xs text-muted">
        Ny testperiod?{" "}
        <Link
          href={PROVA_GRATIS_PATH}
          className="font-medium text-primary-dark underline hover:no-underline"
        >
          Pröva gratis 30 dagar
        </Link>
        {" · "}
        <Link
          href="/"
          className="font-medium text-primary-dark underline hover:no-underline"
        >
          Till Styrelse-Navet
        </Link>
      </p>
    </main>
  );
}
