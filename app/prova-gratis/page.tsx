import type { Metadata } from "next";
import { StyrelseLoginModul } from "@/components/forening/StyrelseLoginModul";

export const metadata: Metadata = {
  title: "Prova gratis — BRF Företag",
  description:
    "Fem testföreningar att prova gratis — logga in direkt, data sparas per förening.",
};

export default function ProvaGratisPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col justify-center bg-surface/40 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-dark">
          BRF Företag · Gratis testperiod
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Er föreningssida
        </h1>
      </div>

      {/* Login / skapa */}
      <StyrelseLoginModul />

      <p className="mt-10 text-center text-xs text-muted">
        All data sparas lokalt i din webbläsare. Testperioden är gratis.
      </p>
    </main>
  );
}
