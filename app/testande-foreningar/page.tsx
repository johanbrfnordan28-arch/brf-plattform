import type { Metadata } from "next";
import Link from "next/link";
import { ModulePage } from "@/components/ModulePage";
import { ForeningInloggningsLista } from "@/components/forening/ForeningInloggningsLista";

export const metadata: Metadata = {
  title: "Testande föreningar — BRF Företag",
  description:
    "Välj bland föreningar som provar BRF Företag och öppna rätt testmiljö i Styrelseflow.",
};

export default function TestandeForeningarPage() {
  return (
    <ModulePage
      title="Testande föreningar"
      icon="🏘️"
      intro="Här visas föreningar som har skapat en testmiljö i den här webbläsaren. Välj förening för att logga in och fortsätta i Styrelseflow."
    >
      <ForeningInloggningsLista />

      <div className="rounded-2xl border border-border bg-surface p-6 text-sm leading-relaxed text-muted sm:p-8">
        <h2 className="text-xl font-semibold text-foreground">
          Ser du inte föreningen?
        </h2>
        <p className="mt-3">
          Testmiljöer sparas lokalt i den webbläsare där de skapades. Om du
          byter dator, webbläsare eller rensar webbplatsdata behöver föreningen
          skapa en ny testmiljö.
        </p>
        <Link
          href="/prova-gratis"
          className="mt-4 inline-flex rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
        >
          Skapa ny testmiljö
        </Link>
      </div>
    </ModulePage>
  );
}
