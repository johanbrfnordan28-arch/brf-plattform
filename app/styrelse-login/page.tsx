import type { Metadata } from "next";
import Link from "next/link";
import { KundLoginModul } from "@/components/forening/KundLoginModul";
import { BRF_NAVET_NAMN } from "@/lib/forening-konstanter";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";

export const metadata: Metadata = {
  title: `Logga in — ${BRF_NAVET_NAMN}`,
  description:
    "Logga in till er föreningssida med BankID. Endast personer med behörighet från styrelsen kommer in — vi visar ingen kundlista.",
};

export default function StyrelseLoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col justify-center bg-surface/40 py-12">
      <div className="mb-10 px-4 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-dark">
          {BRF_NAVET_NAMN} · Kundinloggning
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Logga in till er förening
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted">
          För styrelser som redan är kunder. Identifiering sker med BankID.
          Styrelsen styr själva vilka som får logga in.
        </p>
      </div>

      <KundLoginModul />

      <p className="mt-10 text-center text-xs text-muted">
        Inte kund ännu?{" "}
        <Link
          href={PROVA_GRATIS_PATH}
          className="font-medium text-primary-dark underline hover:no-underline"
        >
          Pröva gratis
        </Link>
        {" · "}
        <Link
          href="/"
          className="font-medium text-primary-dark underline hover:no-underline"
        >
          Till startsidan
        </Link>
      </p>
    </main>
  );
}
