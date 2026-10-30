"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ArshjulHandelse } from "@/components/arshjul/arshjul";
import {
  arshjulUpphandlingsLank,
  skapaUpphandlingFranArshjul,
} from "@/components/arshjul/arshjul-handelse-falt";

type Props = {
  handelse: ArshjulHandelse;
};

export function ArshjulSkapaUpphandlingKnapp({ handelse }: Props) {
  const router = useRouter();
  const upphandling = arshjulUpphandlingsLank(handelse);
  const [status, setStatus] = useState<string | null>(null);
  const [laddar, setLaddar] = useState(false);

  if (!upphandling) return null;

  return (
    <div className="rounded-lg border border-primary/30 bg-[#f7fbf8] px-3 py-3">
      <button
        type="button"
        disabled={laddar}
        onClick={() => {
          setLaddar(true);
          setStatus(null);
          const result = skapaUpphandlingFranArshjul(handelse);
          setLaddar(false);
          if (!result.ok) {
            setStatus(result.fel);
            return;
          }
          setStatus(`${result.titel} — senaste protokoll och föreningens uppgifter är bifogade.`);
          router.push(result.href);
        }}
        className="inline-flex rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {laddar ? "Skapar…" : upphandling.etikett}
      </button>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        {upphandling.beskrivning} Anbudsformuläret inkluderar tillkommande kostnader
        (ombesikning, timpris, kanalrensning). Mejla ut efter granskning under
        upphandling.
      </p>
      <Link
        href={upphandling.href}
        className="mt-2 inline-block text-xs font-medium text-primary-dark underline"
      >
        Öppna upphandling utan att skapa på nytt
      </Link>
      {status && (
        <p className="mt-2 text-xs text-primary-dark" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
