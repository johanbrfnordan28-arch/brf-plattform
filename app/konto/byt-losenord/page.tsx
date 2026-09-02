import type { Metadata } from "next";
import Link from "next/link";
import { BytLosenordForm } from "@/components/auth/BytLosenordForm";
import { MittLosenordKort } from "@/components/auth/MittLosenordKort";

export const metadata: Metadata = {
  title: "Byt lösenord — Styrelse-Navet",
};

export default function BytLosenordPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-md space-y-6">
        <MittLosenordKort kompakt />
        <BytLosenordForm />
        <p className="text-center text-sm text-muted">
          Styrelse: öppna{" "}
          <Link
            href="/forening/konto"
            className="font-medium text-primary-dark underline"
          >
            Konto
          </Link>{" "}
          i föreningsmenyn för samma funktioner.
        </p>
      </div>
    </main>
  );
}
