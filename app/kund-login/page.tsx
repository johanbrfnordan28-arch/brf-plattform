import type { Metadata } from "next";
import Link from "next/link";
import { StyrelseLoginModul } from "@/components/forening/StyrelseLoginModul";
import { BRF_NAVET_NAMN } from "@/lib/forening-konstanter";
import {
  KUND_LOGIN_KNAPP_RUBRIK,
  TEST_LOGIN_PATH,
} from "@/lib/forening-kund";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";

export const metadata: Metadata = {
  title: `${KUND_LOGIN_KNAPP_RUBRIK} — ${BRF_NAVET_NAMN}`,
  description:
    "Sök och logga in till er BRF med tecknat avtal. Andra föreningar listas inte.",
};

export default function KundLoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col justify-center bg-surface/40 py-12">
      <div className="mb-10 px-4 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-dark">
          {BRF_NAVET_NAMN} · Kundinloggning
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {KUND_LOGIN_KNAPP_RUBRIK}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted">
          Sök på er förenings namn. Här listas inte andra kunder eller
          testföreningar — bara den förening som matchar sökningen.
        </p>
      </div>

      <StyrelseLoginModul lage="kund" />

      <p className="mt-10 text-center text-xs text-muted">
        Fortfarande i testperiod?{" "}
        <Link
          href={TEST_LOGIN_PATH}
          className="font-medium text-primary-dark underline hover:no-underline"
        >
          Öppna testperiod
        </Link>
        {" · "}
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
