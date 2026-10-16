"use client";

import { SigneringSchemaKonfiguration } from "@/components/rondering/SigneringSchemaKonfiguration";
import { DriftOffertAvtalPanel } from "@/components/rondering/DriftOffertAvtalPanel";
import { DriftUppdragStyrelse } from "@/components/rondering/DriftUppdragStyrelse";

export function RonderingSigneringStyrelse() {
  return (
    <div className="space-y-8">
      <p className="text-sm leading-relaxed text-muted">
        Bygg föreningens eget schema, skicka offert, teckna avtal med vald
        entreprenör och kräv kvittens per utfört uppdrag.
      </p>

      <SigneringSchemaKonfiguration />
      <DriftOffertAvtalPanel />
      <DriftUppdragStyrelse />
    </div>
  );
}
