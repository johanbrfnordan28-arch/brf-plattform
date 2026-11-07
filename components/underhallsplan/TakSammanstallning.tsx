"use client";

import { byggSteg2KomponentSammanstallning } from "@/components/underhallsplan/fastighetsdel-steg2-sammanstallning";
import {
  hamtaKomponentMall,
  type KomponentDetaljData,
} from "@/components/underhallsplan/komponentregister";
import {
  TAK_EGNA_DELAR_IDS,
  TAK_YTSKIKT_ID,
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
  const adress = data.takAdress?.trim();

  const grupper = [
    { titel: "Ytskikt", block: ytskikt },
    { titel: "Komponenter på taket", block: komponenter },
    { titel: "Egna delar", block: egnaDelar },
  ].filter((g) => g.block.length > 0);

  return (
    <div className="rounded-xl border border-primary/25 bg-[#eef6f0]/40 px-3 py-3">
      <p className="text-sm font-semibold text-primary-dark">
        Taket består av — {namn}
      </p>
      <p className="mt-0.5 text-xs text-muted">
        {adress ? `Adress: ${adress}` : "Ingen adress angiven"}
        {husNamn.length > 0 ? ` · Omfattar ${husNamn.join(", ")}` : ""}
      </p>
      {grupper.length === 0 ? (
        <p className="mt-2 text-xs text-muted">Inget tillagt på taket ännu.</p>
      ) : (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-xs">
            <tbody className="text-foreground">
              {grupper.map((grupp) => (
                <GruppRader key={grupp.titel} titel={grupp.titel} block={grupp.block} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function GruppRader({
  titel,
  block,
}: {
  titel: string;
  block: ReturnType<typeof byggSteg2KomponentSammanstallning>;
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
        if (ifyllda.length === 0) {
          return (
            <tr key={b.id} className="border-b border-border/60">
              <td className="py-1 pr-3 font-medium">{b.etikett}</td>
              <td className="py-1 text-muted">Mängd ej angiven</td>
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
            <td className="py-1 align-top tabular-nums">{d.varde}</td>
          </tr>
        ));
      })}
    </>
  );
}
