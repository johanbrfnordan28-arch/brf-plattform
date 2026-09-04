import type { Metadata } from "next";
import { PlattformLoginForm } from "@/components/plattform/PlattformLoginForm";

export const metadata: Metadata = {
  title: "Plattformsinloggning — Styrelse-Navet",
  robots: { index: false, follow: false },
};

export default function PlattformLoginPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PlattformLoginForm />
    </main>
  );
}
