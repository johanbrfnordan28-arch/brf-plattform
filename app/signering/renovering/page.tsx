import type { Metadata } from "next";
import { Suspense } from "react";
import { MedlemRenoveringSignering } from "@/components/medlemmar/MedlemRenoveringSignering";

export const metadata: Metadata = {
  title: "Godkänn renoveringskrav",
  description: "Medlemmens godkännande och BankID-signering av renoveringskrav.",
  robots: { index: false, follow: false },
};

export default function SigneringRenoveringPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-muted">
          Laddar signering…
        </main>
      }
    >
      <MedlemRenoveringSignering />
    </Suspense>
  );
}
