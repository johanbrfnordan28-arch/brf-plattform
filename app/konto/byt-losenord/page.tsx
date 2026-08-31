import type { Metadata } from "next";
import { BytLosenordForm } from "@/components/auth/BytLosenordForm";

export const metadata: Metadata = {
  title: "Byt lösenord — Styrelse-Navet",
};

export default function BytLosenordPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <BytLosenordForm />
    </main>
  );
}
