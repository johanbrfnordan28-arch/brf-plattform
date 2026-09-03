import type { Metadata } from "next";
import { PlattformDashboard } from "@/components/plattform/PlattformDashboard";

export const metadata: Metadata = {
  title: "Plattform — Styrelse-Navet",
  robots: { index: false, follow: false },
};

export default function PlattformPage() {
  return (
    <main>
      <PlattformDashboard />
    </main>
  );
}
