import type { Metadata } from "next";
import { Suspense } from "react";
import { EntreprenorDriftAvtalSignering } from "@/components/rondering/EntreprenorDriftAvtalSignering";

export const metadata: Metadata = {
  title: "Godkänn avtal — städ och rondering",
  description: "Entreprenören godkänner föreningens driftavtal med BankID.",
  robots: { index: false, follow: false },
};

export default function SigneringDriftAvtalPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-muted">
          Laddar avtal…
        </main>
      }
    >
      <EntreprenorDriftAvtalSignering />
    </Suspense>
  );
}
