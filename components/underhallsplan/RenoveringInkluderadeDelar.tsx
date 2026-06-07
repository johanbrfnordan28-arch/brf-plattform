"use client";

import {
  hamtaHuvudUnderkomponentIdForRenovering,
  hamtaLankbaraUnderkomponenter,
} from "@/components/underhallsplan/renovering-inkludering";

type RenoveringInkluderadeDelarProps = {
  komponent: string;
  underkomponentId?: string;
  valda: string[];
  onChange: (ids: string[]) => void;
};

export function RenoveringInkluderadeDelar({
  komponent,
  underkomponentId,
  valda,
  onChange,
}: RenoveringInkluderadeDelarProps) {
  const huvudId = hamtaHuvudUnderkomponentIdForRenovering(komponent);
  if (!huvudId) return null;

  const lankbara = hamtaLankbaraUnderkomponenter(komponent, huvudId);
  if (lankbara.length === 0) return null;

  function toggle(id: string) {
    onChange(
      valda.includes(id) ? valda.filter((x) => x !== id) : [...valda, id],
    );
  }

  return (
    <div className="rounded-lg border border-[#d4e8da] bg-white px-3 py-3">
      <p className="text-xs font-semibold text-primary-dark">
        Ingick i samma projekt (valfritt)
      </p>
      <p className="mt-1 text-xs text-muted">
        Kryssa i delar som utfördes tillsammans med huvudåtgärden (t.ex. skorstenar
        vid takomläggning 2010). De kopplas till renoveringen utan egen kostnad i
        planen — kommande underhåll planeras under takytor.
      </p>
      <div className="mt-2 flex flex-col gap-2">
        {lankbara.map((uk) => (
          <label
            key={uk.id}
            className="flex cursor-pointer items-start gap-2 text-sm"
          >
            <input
              type="checkbox"
              checked={valda.includes(uk.id)}
              onChange={() => toggle(uk.id)}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary"
            />
            <span>
              <span className="font-medium text-foreground">{uk.etikett}</span>
              <span className="mt-0.5 block text-[10px] text-muted">
                Ingår i länkad renovering
              </span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
