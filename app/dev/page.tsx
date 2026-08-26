import type { Metadata } from "next";
import { DevPubliceraPanel } from "@/components/dev/DevPubliceraPanel";

export const metadata: Metadata = {
  title: "Skicka till GitHub — BRF-plattformen",
  description: "Lokal utvecklarsida för att synka ändringar till GitHub med ett klick.",
  robots: { index: false, follow: false },
};

export default function DevPage() {
  return <DevPubliceraPanel />;
}
