"use client";

import {
  byggSteg2KomponentSammanstallning,
  type Steg2SammanstallningRad,
} from "@/components/underhallsplan/fastighetsdel-steg2-sammanstallning";
import {
  hamtaKomponentMall,
  type KomponentDetaljData,
} from "@/components/underhallsplan/komponentregister";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

type FastighetsdelSammanstallningProps = {
  komponentNamn: string;
  data: KomponentDetaljData;
  grund: Grunduppgifter;
};

function SammanstallningLista({ rader }: { rader: Steg2SammanstallningRad[] }) {
  if (rader.length === 0) return null;
  return (
    <ul className="mt-2 space-y-2 text-sm">
      {rader.map((block) => (
        <li
          key={block.id}
          className="rounded-lg border border-[#d4e8da] bg-[#fafcfa] px-3 py-2"
        >
          <p className="text-xs font-semibold text-primary-dark">
            {block.etikett}
          </p>
          <ul className="mt-1 space-y-0.5 text-xs text-foreground">
            {block.rader.map((rad, i) => (
              <li key={`${block.id}-${i}`}>{rad}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

export function FastighetsdelSammanstallning({
  komponentNamn,
  data,
  grund,
}: FastighetsdelSammanstallningProps) {
  const mall = hamtaKomponentMall(komponentNamn);
  const rader = byggSteg2KomponentSammanstallning(data, mall, grund);
  const harSynliga = data.underkomponenter.some((r) => r.medIPlan !== false);
  if (!harSynliga) return null;

  return (
    <div className="rounded-xl border border-primary/25 bg-[#eef6f0]/40 px-3 py-3">
      <p className="text-xs font-semibold text-primary-dark">
        Sammanställning — {komponentNamn}
      </p>
      <p className="mt-0.5 text-[11px] text-muted">
        Översikt av det ni lagt till i steg 2. Kostnader för planerat och
        utfört underhåll fylls i senare steg — inte här.
      </p>
      <SammanstallningLista rader={rader} />
    </div>
  );
}
