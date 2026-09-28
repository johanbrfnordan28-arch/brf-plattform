"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  importeraForeningFranServer,
} from "@/lib/forening-server-sync";
import {
  markeraPendingAktivForening,
  sattAktivForeningId,
} from "@/lib/forening-registry";
import { hamtaForeningStartPath } from "@/lib/styrelse-kontakt";

function IduraKlarInre() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fel, setFel] = useState<string | null>(null);

  useEffect(() => {
    let avbruten = false;
    async function kora() {
      if (searchParams.get("bankid") !== "ok") {
        setFel("Ogiltig BankID-redirect.");
        return;
      }
      try {
        const res = await fetch("/api/auth/idura/efter-inloggning");
        const data = (await res.json()) as {
          fel?: string;
          foreningId?: string;
          forening?: Parameters<typeof importeraForeningFranServer>[0];
          accessNyckel?: string;
        };
        if (!res.ok || !data.foreningId || !data.forening) {
          setFel(data.fel || "Kunde inte slutföra inloggningen.");
          return;
        }
        if (avbruten) return;
        importeraForeningFranServer(data.forening, data.accessNyckel);
        markeraPendingAktivForening(data.foreningId);
        sattAktivForeningId(data.foreningId);
        router.replace(hamtaForeningStartPath(data.foreningId));
      } catch {
        if (!avbruten) setFel("Kunde inte nå servern.");
      }
    }
    void kora();
    return () => {
      avbruten = true;
    };
  }, [router, searchParams]);

  if (fel) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {fel}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16 text-center text-sm text-muted">
      Slutför BankID-inloggning …
    </main>
  );
}

export default function IduraKlarPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md px-4 py-16 text-center text-sm text-muted">
          Slutför BankID-inloggning …
        </main>
      }
    >
      <IduraKlarInre />
    </Suspense>
  );
}
