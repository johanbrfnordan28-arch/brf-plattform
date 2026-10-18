import type { Metadata } from "next";
import { Suspense } from "react";
import { MedlemOmbyggnadsavtalSignering } from "@/components/lagenhetsarkiv/MedlemOmbyggnadsavtalSignering";

export const metadata: Metadata = {
  title: "Godkänn ombyggnadsavtal",
  description:
    "Medlemmens godkännande och BankID-signering av ombyggnadsavtal.",
  robots: { index: false, follow: false },
};

export default function SigneringOmbyggnadsavtalPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-muted">
          Laddar signering…
        </main>
      }
    >
      <MedlemOmbyggnadsavtalSignering />
    </Suspense>
  );
}
