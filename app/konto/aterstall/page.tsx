import type { Metadata } from "next";
import { Suspense } from "react";
import { AterstallLosenordForm } from "@/components/auth/AterstallLosenordForm";

export const metadata: Metadata = {
  title: "Återställ lösenord — Styrelse-Navet",
};

export default function AterstallPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Suspense fallback={<p className="text-sm text-muted">Laddar …</p>}>
        <AterstallLosenordForm />
      </Suspense>
    </main>
  );
}
