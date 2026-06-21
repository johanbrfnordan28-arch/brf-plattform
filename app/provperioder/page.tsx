import type { Metadata } from "next";
import Link from "next/link";
import { ModulePage } from "@/components/ModulePage";
import { ForeningInloggningsLista } from "@/components/forening/ForeningInloggningsLista";

export const metadata: Metadata = {
  title: "Pågående provperioder — Styrelsenavet",
  description:
    "Välj bland föreningar som provar Styrelsenavet och öppna rätt testmiljö i Styrelseflow.",
};

export default function ProvperioderPage() {
  return (
    <ModulePage
      title="Pågående provperioder"
      icon="🏘️"
      intro="Här visas föreningar som har startat en provperiod i den här webbläsaren. Välj förening för att logga in och fortsätta i Styrelseflow."
    >
      <ForeningInloggningsLista />

      <div className="rounded-2xl border border-border bg-surface p-6 text-sm leading-relaxed text-muted sm:p-8">
        <h2 className="text-xl font-semibold text-foreground">
          Ser du inte föreningen?
        </h2>
        <p className="mt-3">
          Provperioder sparas lokalt i den webbläsare där de skapades. Om du
          byter dator, webbläsare eller rensar webbplatsdata behöver föreningen
          starta en ny provperiod.
        </p>
        <Link
          href="/prova-gratis"
          className="mt-4 inline-flex rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
        >
          Starta ny provperiod
        </Link>
      </div>
    </ModulePage>
  );
}
