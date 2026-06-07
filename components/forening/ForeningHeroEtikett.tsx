"use client";

import { useAktivForeningsNamn } from "@/components/forening/useAktivForeningsNamn";
import { GRUNDMALL_NAMN } from "@/lib/forening-registry";

export function ForeningHeroEtikett() {
  const namn = useAktivForeningsNamn();
  const etikett =
    namn === GRUNDMALL_NAMN
      ? "Grundmall föreningar · Inloggad"
      : `${namn} · Inloggad`;

  return (
    <p className="inline-flex rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-primary-dark">
      {etikett}
    </p>
  );
}
