import {
  formateraTakBelaggningPost,
  materialEtikettTakBelaggningPost,
} from "@/components/underhallsplan/tak-belaggning";
import { takfonsterSteg2DetaljRader } from "@/components/underhallsplan/takfonster";
import { formateraFonsterDorrPoster } from "@/components/underhallsplan/fonster-dorrar";
import { formateraBalkongPoster } from "@/components/underhallsplan/balkonger";
import { formateraFasadSockelPoster } from "@/components/underhallsplan/fasad-sockel";
import { formateraFasadSidorMaterial } from "@/components/underhallsplan/fasad-sidor-material";
import { formateraTakterrass } from "@/components/underhallsplan/takterrass";
import { formateraMedlemstakterrass } from "@/components/underhallsplan/medlemstakterrass";
import {
  deltypEtikett,
  hamtaBalkongPoster,
  hamtaFasadSidaMaterialPoster,
  hamtaFasadSockelPoster,
  hamtaFonsterDorrPoster,
  hamtaMattPartier,
  hamtaTakBelaggningData,
  hamtaTakfonsterData,
  hamtaTakterrassPoster,
  hamtaMedlemstakterrassPoster,
  måttenhetEtiketter,
  type KomponentDetaljData,
  type KomponentMall,
} from "@/components/underhallsplan/komponentregister";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

export type Steg2SammanstallningDetalj = {
  benamning: string;
  varde: string;
};

export type Steg2SammanstallningBlock = {
  id: string;
  etikett: string;
  detaljer: Steg2SammanstallningDetalj[];
};

/** @deprecated — använd Steg2SammanstallningBlock */
export type Steg2SammanstallningRad = Steg2SammanstallningBlock & {
  rader: string[];
};

function enkelMattDetalj(
  etikett: string,
  värde: string,
  måttenhet: keyof typeof måttenhetEtiketter,
): Steg2SammanstallningDetalj | null {
  const v = värde.trim();
  if (!v) return null;
  const enhet = måttenhetEtiketter[måttenhet].enhet;
  return { benamning: etikett, varde: `${v} ${enhet}` };
}

function delaLangRad(text: string): Steg2SammanstallningDetalj[] {
  const delar = text
    .split(/\s·\s/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (delar.length <= 1) {
    return [{ benamning: "Sammanfattning", varde: text }];
  }
  return delar.map((d, i) => ({
    benamning: delar.length > 3 ? `Post ${i + 1}` : "Detalj",
    varde: d,
  }));
}

export function byggSteg2KomponentSammanstallning(
  data: KomponentDetaljData,
  mall: KomponentMall,
  grund: Grunduppgifter,
): Steg2SammanstallningBlock[] {
  const resultat: Steg2SammanstallningBlock[] = [];

  for (const rad of data.underkomponenter) {
    if (rad.medIPlan === false) continue;
    const def = mall.underkomponenter.find((u) => u.id === rad.id);
    let detaljer: Steg2SammanstallningDetalj[] = [];

    if (def?.detaljPanel === "takbelaggning-val") {
      const bel = hamtaTakBelaggningData(data, rad.id);
      for (const p of bel.belaggningar) {
        const namn =
          p.namn?.trim() ||
          materialEtikettTakBelaggningPost(p).split(" · ")[0] ||
          "Takparti";
        const mangd = p.mangd?.trim();
        const enhet =
          p.mangdEnhet === "antal" || p.mangdEnhet === "styck" ? "st" : "m²";
        detaljer.push({
          benamning: namn,
          varde: mangd ? `${mangd} ${enhet}` : formateraTakBelaggningPost(p),
        });
      }
      const total = enkelMattDetalj("Total takyta", rad.värde, rad.måttenhet);
      if (total) detaljer.push(total);
    } else if (
      def?.detaljPanel === "fonster-lista" ||
      def?.detaljPanel === "dorr-lista"
    ) {
      const poster = hamtaFonsterDorrPoster(data, rad.id);
      const typ = def.detaljPanel === "dorr-lista" ? "dorr" : "fonster";
      const text = formateraFonsterDorrPoster(poster, typ);
      detaljer = text ? delaLangRad(text) : [];
    } else if (def?.detaljPanel === "balkong-lista") {
      const text = formateraBalkongPoster(
        hamtaBalkongPoster(data, rad.id),
        data.egnaBalkongTyper ?? [],
      );
      detaljer = text ? delaLangRad(text) : [];
    } else if (def?.detaljPanel === "fasadmaterial-val") {
      const sidor = formateraFasadSidorMaterial(
        hamtaFasadSidaMaterialPoster(data, rad.id),
        grund,
        (id) => deltypEtikett(id, data, mall),
      );
      if (sidor) detaljer.push(...delaLangRad(sidor));
      const valda = data.valdaDeltyper
        .map((id) => deltypEtikett(id, data, mall))
        .filter(Boolean);
      if (valda.length > 0) {
        detaljer.push({
          benamning: "Material",
          varde: valda.join(", "),
        });
      }
      const yta = enkelMattDetalj("Yta", rad.värde, rad.måttenhet);
      if (yta) detaljer.push(yta);
    } else if (def?.detaljPanel === "fasad-sockel-val") {
      const text = formateraFasadSockelPoster(
        hamtaFasadSockelPoster(data, rad.id),
      );
      detaljer = text ? delaLangRad(text) : [];
    } else if (def?.detaljPanel === "takfonster-lista") {
      detaljer = takfonsterSteg2DetaljRader(hamtaTakfonsterData(data, rad.id));
    } else if (def?.detaljPanel === "takterrass-val") {
      const poster = hamtaTakterrassPoster(data, rad.id);
      detaljer = poster.map((p, i) => ({
        benamning: p.benamning.trim() || `Terrass ${i + 1}`,
        varde: formateraTakterrass(p) || "—",
      }));
    } else if (def?.detaljPanel === "medlemstakterrass-val") {
      const poster = hamtaMedlemstakterrassPoster(data, rad.id);
      detaljer = poster.map((p, i) => ({
        benamning: p.benamning.trim() || `Medlemsterrass ${i + 1}`,
        varde: formateraMedlemstakterrass(p) || "—",
      }));
    } else {
      const partier = hamtaMattPartier(data, rad.id, rad);
      const enhet = måttenhetEtiketter[rad.måttenhet].enhet;
      const medNamn = partier.filter(
        (p) => p.mangd.trim() || p.namn.trim(),
      );
      if (medNamn.length > 0) {
        detaljer = medNamn.map((p) => {
          const namn = p.namn.trim() || rad.etikett;
          const mangd = p.mangd.trim();
          return {
            benamning: namn,
            varde: mangd ? `${mangd} ${enhet}` : "—",
          };
        });
      } else {
        const v = rad.värde.trim();
        if (v) {
          detaljer.push({ benamning: rad.etikett, varde: `${v} ${enhet}` });
        }
      }
    }

    if (detaljer.length === 0) {
      detaljer = [{ benamning: "—", varde: "Inget angivet ännu" }];
    }

    resultat.push({
      id: rad.id,
      etikett: rad.etikett,
      detaljer,
    });
  }

  return resultat;
}
