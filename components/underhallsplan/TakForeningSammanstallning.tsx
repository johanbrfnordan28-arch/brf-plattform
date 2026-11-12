"use client";

import {
  formatSummeringTal,
  parseNummerSumma,
} from "@/components/underhallsplan/lista-summering";
import {
  hamtaMattPartier,
  måttenhetEtiketter,
  type KomponentDetaljData,
} from "@/components/underhallsplan/komponentregister";
import { summeraTakBelaggningKvm } from "@/components/underhallsplan/tak-belaggning";
import {
  TAK_YTSKIKT_ID,
  takVisningsnamn,
} from "@/components/underhallsplan/tak-enheter";

export const TAK_PRELIMINAR_INFO =
  "Takytor, längder och antal är preliminära planeringsuppgifter. Inför upphandling och utförande ska entreprenören kontrollera samtliga mängder, mått och tekniska förutsättningar på plats. Ansvar för mängduppgifter ska regleras i förfrågningsunderlaget.";

/** Komponent-id:n som summeras över föreningens alla tak. */
const SUMMERBARA: { id: string; etikett: string }[] = [
  { id: "hangrannor", etikett: "Hängrännor" },
  { id: "stupror", etikett: "Stuprör" },
  { id: "snoras-skydd", etikett: "Snörasskydd" },
  { id: "takbrunnar", etikett: "Takbrunnar" },
  { id: "ranndal", etikett: "Ränndalar" },
  { id: "platbeslag", etikett: "Plåtbeslag" },
  { id: "takstegar", etikett: "Takstegar" },
  { id: "takbryggor", etikett: "Takbryggor" },
  { id: "takluckor", etikett: "Takluckor" },
];

type TakForeningSammanstallningProps = {
  tak: {
    namn: string;
    data: KomponentDetaljData;
    husNamn?: string[];
  }[];
};

function mangdForKomponent(
  data: KomponentDetaljData,
  underId: string,
): { summa: number; enhet: string } | null {
  const rad = data.underkomponenter.find(
    (r) => r.id === underId && r.medIPlan !== false,
  );
  if (!rad) return null;
  const partier = hamtaMattPartier(data, underId, rad);
  const summa = parseNummerSumma(partier.map((p) => p.mangd));
  if (summa <= 0) {
    const legacy = parseNummerSumma([rad.värde]);
    if (legacy <= 0) return null;
    return {
      summa: legacy,
      enhet: måttenhetEtiketter[rad.måttenhet].enhet,
    };
  }
  return { summa, enhet: måttenhetEtiketter[rad.måttenhet].enhet };
}

/**
 * Summerar alla tak i planen utan dubbelräkning
 * (varje tak räknas en gång oavsett antal adresser).
 */
export function TakForeningSammanstallning({
  tak,
}: TakForeningSammanstallningProps) {
  if (tak.length === 0) return null;

  const takYtor = tak.map((t) => {
    const bel =
      t.data.takBelaggningRegister?.[TAK_YTSKIKT_ID] ??
      t.data.takBelaggningRegister?.takyta;
    const kvm = bel ? summeraTakBelaggningKvm(bel) : 0;
    const rad = t.data.underkomponenter.find((r) => r.id === TAK_YTSKIKT_ID);
    const fallback = rad
      ? parseNummerSumma([rad.värde])
      : 0;
    return {
      namn: t.namn,
      visning: takVisningsnamn({
        komponentNamn: t.namn,
        adress: t.data.takAdress,
        benamning: t.data.takBenamning,
        husNamn: t.husNamn,
      }),
      kvm: kvm > 0 ? kvm : fallback,
    };
  });

  const totalKvm = takYtor.reduce((s, t) => s + t.kvm, 0);

  const summeringar = SUMMERBARA.map((def) => {
    let summa = 0;
    let enhet = "";
    for (const t of tak) {
      const m = mangdForKomponent(t.data, def.id);
      if (!m) continue;
      summa += m.summa;
      enhet = m.enhet;
    }
    return { ...def, summa, enhet };
  }).filter((r) => r.summa > 0);

  return (
    <div className="rounded-xl border border-primary/30 bg-[#eef6f0]/50 px-3 py-3">
      <p className="text-sm font-semibold text-primary-dark">
        Samtliga tak — föreningen
      </p>
      <p className="mt-0.5 text-xs text-muted">
        Summering per tak (ingen dubbelräkning när flera adresser delar samma
        tak). Underlag för framtida upphandling.
      </p>

      <ul className="mt-2 space-y-1 text-xs text-foreground">
        {takYtor.map((t) => (
          <li key={t.namn} className="flex flex-wrap justify-between gap-2">
            <span className="font-medium">{t.visning}</span>
            <span className="tabular-nums text-muted">
              {t.kvm > 0 ? `${formatSummeringTal(t.kvm)} m²` : "yta ej angiven"}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-2 text-sm font-medium text-foreground">
        Total takyta:{" "}
        <span className="tabular-nums">
          {formatSummeringTal(totalKvm)} m²
        </span>
      </p>

      {summeringar.length > 0 ? (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[240px] text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="pb-1 pr-3 font-semibold">Komponent</th>
                <th className="pb-1 font-semibold">Summa</th>
              </tr>
            </thead>
            <tbody>
              {summeringar.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="py-1 pr-3 font-medium">{r.etikett}</td>
                  <td className="py-1 tabular-nums">
                    {formatSummeringTal(r.summa)} {r.enhet}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <p className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/80 px-2.5 py-2 text-[11px] leading-relaxed text-amber-950">
        {TAK_PRELIMINAR_INFO}
      </p>
    </div>
  );
}
