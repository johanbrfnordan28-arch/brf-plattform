import type { Metadata } from "next";
import Link from "next/link";
import { StyrelseLoginModul } from "@/components/forening/StyrelseLoginModul";
import { BRF_NAVET_NAMN } from "@/lib/forening-konstanter";

export const metadata: Metadata = {
  title: `Pröva gratis — ${BRF_NAVET_NAMN}`,
  description:
    "Välj en testförening och prova hela plattformen gratis — logga in direkt, data sparas per förening.",
};

export default function ProvaGratisPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col bg-surface/40 py-12">
      <div className="mx-auto mb-10 max-w-2xl px-4 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-dark">
          {BRF_NAVET_NAMN} · 30 dagar gratis
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Välj en testförening
        </h1>
        <p className="mt-3 text-base text-muted">
          Fem färdiga demo-föreningar att klicka sig in i. Ingen bindning — utforska
          underhållsplan, upphandling och övriga moduler i er egen takt.
        </p>
      </div>

      <StyrelseLoginModul />

      <p className="mt-10 text-center text-sm text-muted">
        Vill ni starta på riktigt?{" "}
        <Link
          href="/#foreningsformation"
          className="font-medium text-primary-dark underline hover:no-underline"
        >
          Skapa er egen förening
        </Link>
        {" · "}
        <Link href="/" className="font-medium text-primary-dark underline hover:no-underline">
          Tillbaka till startsidan
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-muted">
        All data sparas lokalt i din webbläsare. Testperioden är gratis.
      </p>
    </main>
  );
}
