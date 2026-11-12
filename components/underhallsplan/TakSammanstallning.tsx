"use client";

import { byggSteg2KomponentSammanstallning } from "@/components/underhallsplan/fastighetsdel-steg2-sammanstallning";
import {
  formatSummeringTal,
} from "@/components/underhallsplan/lista-summering";
import {
  hamtaKomponentMall,
  type KomponentDetaljData,
} from "@/components/underhallsplan/komponentregister";
import { summeraTakBelaggningKvm } from "@/components/underhallsplan/tak-belaggning";
import { TAK_PRELIMINAR_INFO } from "@/components/underhallsplan/TakForeningSammanstallning";
import {
  TAK_EGNA_DELAR_IDS,
  TAK_YTSKIKT_ID,
  takVisningsnamn,
} from "@/components/underhallsplan/tak-enheter";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

type TakSammanstallningProps = {
  namn: string;
  data: KomponentDetaljData;
  grund: Grunduppgifter;
  /** Hus som taket omfattar. */
  husNamn?: string[];
};

const EJ_ANGIVET = "Inget angivet ännu";

/** Vad taket består av — adress, takpartier, komponenter och egna delar. */
export function TakSammanstallning({
  namn,
  data,
  grund,
  husNamn = [],
}: TakSammanstallningProps) {
  const block = byggSteg2KomponentSammanstallning(
    data,
    hamtaKomponentMall(namn),
    grund,
  );
  const ytskikt = block.filter((b) => b.id === TAK_YTSKIKT_ID);
  const egnaDelar = block.filter((b) => TAK_EGNA_DELAR_IDS.includes(b.id));
  const komponenter = block.filter(
    (b) => b.id !== TAK_YTSKIKT_ID && !TAK_EGNA_DELAR_IDS.includes(b.id),
  );
  const visning = takVisningsnamn({
    komponentNamn: namn,
    adress: data.takAdress,
    benamning: data.takBenamning,
    husNamn,
  });
  const bel = data.takBelaggningRegister?.[TAK_YTSKIKT_ID];
  const totalKvm = bel ? summeraTakBelaggningKvm(bel) : 0;

  const grupper = [
    { titel: "Ytskikt / beläggning", block: ytskikt },
    { titel: "Komponenter på taket", block: komponenter },
    { titel: "Egna delar", block: egnaDelar },
  ].filter((g) => g.block.length > 0);

  return (
    <div className="rounded-xl border border-primary/25 bg-[#eef6f0]/40 px-3 py-3">
      <p className="text-sm font-semibold text-primary-dark">
        Taket består av — {visning}
      </p>
      <p className="mt-0.5 text-xs text-muted">
        {data.takAdress?.trim()
          ? `Adress: ${data.takAdress.trim()}`
          : "Ingen adress angiven"}
        {data.takBenamning?.trim()
          ? ` · ${data.takBenamning.trim()}`
          : ""}
        {husNamn.length > 0 ? ` · Omfattar ${husNamn.join(", ")}` : ""}
        {totalKvm > 0
          ? ` · Total yta ${formatSummeringTal(totalKvm)} m²`
          : ""}
      </p>
      {grupper.length === 0 ? (
        <p className="mt-2 text-xs text-muted">Inget tillagt på taket ännu.</p>
      ) : (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-xs">
            <tbody className="text-foreground">
              {grupper.map((grupp) => (
                <GruppRader
                  key={grupp.titel}
                  titel={grupp.titel}
                  block={grupp.block}
                  detaljer={data.takKomponentDetaljer}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/70 px-2.5 py-2 text-[11px] leading-relaxed text-amber-950">
        {TAK_PRELIMINAR_INFO}
      </p>
    </div>
  );
}

function GruppRader({
  titel,
  block,
  detaljer,
}: {
  titel: string;
  block: ReturnType<typeof byggSteg2KomponentSammanstallning>;
  detaljer?: KomponentDetaljData["takKomponentDetaljer"];
}) {
  return (
    <>
      <tr>
        <th
          colSpan={2}
          className="pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted"
        >
          {titel}
        </th>
      </tr>
      {block.map((b) => {
        const ifyllda = b.detaljer.filter((d) => d.varde !== EJ_ANGIVET);
        const extra = detaljer?.[b.id];
        const extraText = [
          extra?.material?.trim() ? `material ${extra.material.trim()}` : "",
          extra?.dimension?.trim() ? `dim. ${extra.dimension.trim()}` : "",
          extra?.kulor?.trim() ? `kulör ${extra.kulor.trim()}` : "",
        ]
          .filter(Boolean)
          .join(" · ");

        if (ifyllda.length === 0) {
          return (
            <tr key={b.id} className="border-b border-border/60">
              <td className="py-1 pr-3 font-medium">{b.etikett}</td>
              <td className="py-1 text-muted">
                {extraText || "Mängd ej angiven"}
              </td>
            </tr>
          );
        }
        return ifyllda.map((d, i) => (
          <tr key={`${b.id}-${i}`} className="border-b border-border/60">
            <td className="py-1 pr-3 align-top font-medium">
              {ifyllda.length > 1 || d.benamning !== b.etikett
                ? `${b.etikett}: ${d.benamning}`
                : b.etikett}
            </td>
            <td className="py-1 align-top tabular-nums">
              {d.varde}
              {i === 0 && extraText ? ` · ${extraText}` : ""}
            </td>
          </tr>
        ));
      })}
    </>
  );
}
