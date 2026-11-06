"use client";

import type { ArshjulHandelse } from "@/components/arshjul/arshjul";
import {
  arshjulArEnergideklaration,
  arshjulArOvk,
  arshjulArRadon,
  arshjulArSotning,
} from "@/components/arshjul/arshjul-handelse-falt";
import { SenasteBesiktningFormular } from "@/components/SenasteBesiktningFormular";
import { arFranDatum, type BesiktningTyp } from "@/lib/besiktning-intervall";

function besiktningTyp(h: ArshjulHandelse): BesiktningTyp {
  if (arshjulArOvk(h)) return "ovk";
  if (arshjulArEnergideklaration(h)) return "energideklaration";
  if (arshjulArRadon(h)) return "radon";
  if (arshjulArSotning(h)) return "sotning";
  return "besiktning";
}

type Props = {
  handelse: ArshjulHandelse;
  onSpara: (patch: Partial<ArshjulHandelse>) => void;
};

/** Senaste besiktning i årshjulet: utförare, datum, nästa tillfälle och resultat. */
export function ArshjulBesiktningUppgifter({ handelse, onSpara }: Props) {
  return (
    <div className="rounded-lg border border-border bg-white p-3">
      <p className="mb-2 text-sm font-medium text-foreground">Senaste besiktning</p>
      <SenasteBesiktningFormular
        typ={besiktningTyp(handelse)}
        intervallAr={handelse.intervallAr}
        sparat={{
          utforsAv: handelse.leverantor,
          datum: handelse.besiktningSenastDatum,
          ...handelse.besiktningResultat,
        }}
        sparaEtikett="Spara uppgifter"
        onSpara={({ utforsAv, datum, ...resultat }) =>
          onSpara({
            leverantor: utforsAv,
            besiktningSenastDatum: datum,
            besiktningResultat: resultat,
            besiktningUnderkandForst: undefined,
            besiktningOrdinarieAr: undefined,
            senastKlarAr: arFranDatum(datum) ?? handelse.senastKlarAr,
          })
        }
      />
    </div>
  );
}
