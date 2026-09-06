import type { Metadata } from "next";
import Link from "next/link";
import { StyrelseLoginModul } from "@/components/forening/StyrelseLoginModul";
import { BRF_NAVET_NAMN } from "@/lib/forening-konstanter";
import {
  KUND_LOGIN_KNAPP_RUBRIK,
  KUND_LOGIN_PATH,
} from "@/lib/forening-kund";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";

export const metadata: Metadata = {
  title: `Testperiod — ${BRF_NAVET_NAMN}`,
  description:
    "Sök och logga in på er testförening. Andra sparade föreningar listas inte upp.",
};

export default function StyrelseLoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col justify-center bg-surface/40 py-12">
      <div className="mb-10 px-4 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-800">
          {BRF_NAVET_NAMN} · Testperiod
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Logga in på er testförening
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted">
          Sök på er förenings namn. Av integritetsskäl visas ingen lista över
          alla sparade föreningar — bara den ni söker efter.
        </p>
      </div>

      <StyrelseLoginModul lage="test" />

      <p className="mt-10 text-center text-xs text-muted">
        Redan kund?{" "}
        <Link
          href={KUND_LOGIN_PATH}
          className="font-medium text-primary-dark underline hover:no-underline"
        >
          {KUND_LOGIN_KNAPP_RUBRIK}
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
