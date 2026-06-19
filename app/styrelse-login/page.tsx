import type { Metadata } from "next";
import { StyrelseLoginModul } from "@/components/forening/StyrelseLoginModul";

export const metadata: Metadata = {
  title: "Logga in — BRF Företag",
  description:
    "Välj bland fem testföreningar och logga in med ett klick — data sparas separat per förening.",
};

export default function StyrelseLoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col justify-center bg-surface/40 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-dark">
          BRF Företag · Styrelseportalen
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Logga in
        </h1>
      </div>

      {/* Login-modulen */}
      <StyrelseLoginModul />

      {/* Footer-notering */}
      <p className="mt-10 text-center text-xs text-muted">
        All data sparas lokalt i din webbläsare under testperioden.
      </p>
    </main>
  );
}
