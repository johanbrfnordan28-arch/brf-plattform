"use client";

import Link from "next/link";
import type { ArshjulHandelse } from "@/components/arshjul/arshjul";
import {
  arshjulUpphandlingsLank,
  hamtaArshjulProtokollTillUpphandling,
} from "@/components/arshjul/arshjul-handelse-falt";

type Props = {
  handelse: ArshjulHandelse;
};

export function ArshjulSkapaUpphandlingKnapp({ handelse }: Props) {
  const upphandling = arshjulUpphandlingsLank(handelse);

  if (!upphandling) return null;

  return (
    <div className="rounded-lg border border-primary/30 bg-[#f7fbf8] px-3 py-3">
      <Link
        href={upphandling.href}
        onClick={() => hamtaArshjulProtokollTillUpphandling(handelse)}
        className="inline-flex rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-dark"
      >
        {upphandling.etikett}
      </Link>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        {upphandling.beskrivning} Anbudsformuläret inkluderar tillkommande kostnader
        (ombesiktning, timpris, kanalrensning).
      </p>
    </div>
  );
}
