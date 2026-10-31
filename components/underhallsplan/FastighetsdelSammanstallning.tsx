"use client";

import { useState } from "react";
import { OppnaStangKnapp } from "@/components/OppnaStangKnapp";
import {
  byggSteg2KomponentSammanstallning,
  type Steg2SammanstallningBlock,
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

function antalIfyllda(block: Steg2SammanstallningBlock): number {
  return block.detaljer.filter(
    (d) => d.varde !== "Inget angivet ännu" && d.benamning !== "—",
  ).length;
}

function SammanstallningBlock({
  block,
  oppen,
  onToggle,
}: {
  block: Steg2SammanstallningBlock;
  oppen: boolean;
  onToggle: () => void;
}) {
  const antal = antalIfyllda(block);
  const kort =
    antal === 1
      ? "1 post"
      : antal > 0
        ? `${antal} poster`
        : "ej ifyllt";

  return (
    <li className="rounded-lg border border-[#d4e8da] bg-white overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-[#e8f2ec] bg-[#fafcfa] px-2 py-2">
        <OppnaStangKnapp
          oppen={oppen}
          storlek="sm"
          onClick={onToggle}
          ariaLabel={
            oppen
              ? `Stäng sammanställning ${block.etikett}`
              : `Öppna sammanställning ${block.etikett}`
          }
        />
        <p className="min-w-0 flex-1 text-sm font-medium text-foreground">
          {block.etikett}
        </p>
        <span className="rounded-full bg-[#e2f0e6] px-2 py-0.5 text-[11px] font-medium text-primary-dark">
          {kort}
        </span>
      </div>
      {oppen && (
        <div className="overflow-x-auto px-3 py-2">
          <table className="w-full min-w-[280px] text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="pb-1.5 pr-3 font-semibold">Benämning</th>
                <th className="pb-1.5 font-semibold">Antal / mängd</th>
              </tr>
            </thead>
            <tbody className="text-foreground">
              {block.detaljer.map((rad, i) => (
                <tr
                  key={`${block.id}-${i}`}
                  className="border-b border-border/60 last:border-0"
                >
                  <td className="py-1.5 pr-3 align-top font-medium">
                    {rad.benamning}
                  </td>
                  <td className="py-1.5 align-top tabular-nums">{rad.varde}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </li>
  );
}

export function FastighetsdelSammanstallning({
  komponentNamn,
  data,
  grund,
}: FastighetsdelSammanstallningProps) {
  const mall = hamtaKomponentMall(komponentNamn);
  const block = byggSteg2KomponentSammanstallning(data, mall, grund);
  const harSynliga = data.underkomponenter.some((r) => r.medIPlan !== false);
  const [oppen, setOppen] = useState(false);
  const [oppnaBlock, setOppnaBlock] = useState<Record<string, boolean>>({});

  if (!harSynliga || block.length === 0) return null;

  const totaltPoster = block.reduce((sum, b) => sum + antalIfyllda(b), 0);

  function blockOppen(id: string) {
    return oppnaBlock[id] ?? false;
  }

  function toggleBlock(id: string) {
    setOppnaBlock((current) => ({
      ...current,
      [id]: !blockOppen(id),
    }));
  }

  return (
    <div className="rounded-xl border border-primary/25 bg-[#eef6f0]/40 px-2 py-2 sm:px-3 sm:py-3">
      <div className="flex flex-wrap items-center gap-2 px-1">
        <OppnaStangKnapp
          oppen={oppen}
          storlek="sm"
          onClick={() => setOppen((v) => !v)}
          ariaLabel={
            oppen
              ? `Stäng sammanställning ${komponentNamn}`
              : `Öppna sammanställning ${komponentNamn}`
          }
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-primary-dark">
            Sammanställning — {komponentNamn}
          </p>
          <p className="text-[11px] text-muted">
            {block.length}{" "}
            {block.length === 1 ? "underdel" : "underdelar"}
            {totaltPoster > 0 ? ` · ${totaltPoster} ifyllda poster` : ""}
          </p>
        </div>
      </div>
      {oppen && (
        <>
          <p className="mt-2 px-1 text-[11px] leading-relaxed text-muted">
            Översikt per benämning (takfönster, skorsten, nock m.m.). Kostnader
            fylls i senare steg.
          </p>
          <ul className="mt-2 space-y-2">
            {block.map((b) => (
              <SammanstallningBlock
                key={b.id}
                block={b}
                oppen={blockOppen(b.id)}
                onToggle={() => toggleBlock(b.id)}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
