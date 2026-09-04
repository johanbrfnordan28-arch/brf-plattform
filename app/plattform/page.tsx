import type { Metadata } from "next";
import { PlattformDashboard } from "@/components/plattform/PlattformDashboard";

export const metadata: Metadata = {
  title: "Plattform — Styrelse-Navet",
  description: "Intern översikt för behörig personal.",
  robots: { index: false, follow: false, nocache: true },
};

export default function PlattformPage() {
  return (
    <main>
      <PlattformDashboard />
    </main>
  );
}
