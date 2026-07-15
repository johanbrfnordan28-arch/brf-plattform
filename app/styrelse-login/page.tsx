import type { Metadata } from "next";
import { GrundmallInloggSektion } from "@/components/forening/GrundmallInloggSektion";
import { StyrelseLoginModul } from "@/components/forening/StyrelseLoginModul";
import { BRF_NAVET_NAMN } from "@/lib/forening-konstanter";

export const metadata: Metadata = {
  title: `Logga in — ${BRF_NAVET_NAMN}`,
  description:
    "Välj bland fem testföreningar och logga in med ett klick — data sparas separat per förening.",
};

export default function StyrelseLoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="flex flex-1 flex-col justify-center bg-surface/40 py-12">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-dark">
            {BRF_NAVET_NAMN} · Styrelseportalen
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Logga in
          </h1>
        </div>

        <StyrelseLoginModul />

        <p className="mt-10 text-center text-xs text-muted">
          All data sparas lokalt i din webbläsare under testperioden.
        </p>
      </div>

      <section
        id="grundmall-inlogg"
        className="scroll-mt-24 border-t border-border bg-surface/40 py-12 sm:py-16"
      >
        <GrundmallInloggSektion />
      </section>
    </main>
  );
}
