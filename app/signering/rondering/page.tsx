import type { Metadata } from "next";
import { Suspense } from "react";
import { EntreprenorRonderingSignering } from "@/components/rondering/EntreprenorRonderingSignering";

export const metadata: Metadata = {
  title: "Månadssignering — rondering och städ",
  description: "Signering för entreprenör — endast aktuellt ronderings- eller städdokument.",
  robots: { index: false, follow: false },
};

export default function SigneringRonderingPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-muted">
          Laddar signering…
        </main>
      }
    >
      <EntreprenorRonderingSignering />
    </Suspense>
  );
}
