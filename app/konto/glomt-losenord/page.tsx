import type { Metadata } from "next";
import { GlomtLosenordForm } from "@/components/auth/GlomtLosenordForm";

export const metadata: Metadata = {
  title: "Glömt lösenord — Styrelse-Navet",
};

export default function GlomtLosenordPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <GlomtLosenordForm />
    </main>
  );
}
