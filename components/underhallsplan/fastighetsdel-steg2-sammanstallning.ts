import { formateraTakBelaggningPost } from "@/components/underhallsplan/tak-belaggning";
import { formateraFonsterDorrPoster } from "@/components/underhallsplan/fonster-dorrar";
import { formateraBalkongPoster } from "@/components/underhallsplan/balkonger";
import { formateraFasadSockelPoster } from "@/components/underhallsplan/fasad-sockel";
import { formateraFasadSidorMaterial } from "@/components/underhallsplan/fasad-sidor-material";
import {
  deltypEtikett,
  hamtaBalkongPoster,
  hamtaFasadSidaMaterialPoster,
  hamtaFasadSockelPoster,
  hamtaFonsterDorrPoster,
  hamtaTakBelaggningData,
  måttenhetEtiketter,
  type KomponentDetaljData,
  type KomponentMall,
} from "@/components/underhallsplan/komponentregister";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

export type Steg2SammanstallningRad = {
  id: string;
  etikett: string;
  rader: string[];
};

function enkelMattRad(
  etikett: string,
  värde: string,
  måttenhet: keyof typeof måttenhetEtiketter,
): string | null {
  const v = värde.trim();
  if (!v) return null;
  const enhet = måttenhetEtiketter[måttenhet].enhet;
  return `${etikett}: ${v} ${enhet}`;
}

export function byggSteg2KomponentSammanstallning(
  data: KomponentDetaljData,
  mall: KomponentMall,
  grund: Grunduppgifter,
): Steg2SammanstallningRad[] {
  const resultat: Steg2SammanstallningRad[] = [];

  for (const rad of data.underkomponenter) {
    if (rad.medIPlan === false) continue;
    const def = mall.underkomponenter.find((u) => u.id === rad.id);
    const rader: string[] = [];

    if (def?.detaljPanel === "takbelaggning-val") {
      const bel = hamtaTakBelaggningData(data, rad.id);
      for (const p of bel.belaggningar) {
        rader.push(formateraTakBelaggningPost(p));
      }
      const total = enkelMattRad("Total takyta", rad.värde, rad.måttenhet);
      if (total) rader.push(total);
    } else if (
      def?.detaljPanel === "fonster-lista" ||
      def?.detaljPanel === "dorr-lista"
    ) {
      const poster = hamtaFonsterDorrPoster(data, rad.id);
      const typ = def.detaljPanel === "dorr-lista" ? "dorr" : "fonster";
      const text = formateraFonsterDorrPoster(poster, typ);
      if (text) rader.push(text);
    } else if (def?.detaljPanel === "balkong-lista") {
      const text = formateraBalkongPoster(
        hamtaBalkongPoster(data, rad.id),
        data.egnaBalkongTyper ?? [],
      );
      if (text) rader.push(text);
    } else if (def?.detaljPanel === "fasadmaterial-val") {
      const sidor = formateraFasadSidorMaterial(
        hamtaFasadSidaMaterialPoster(data, rad.id),
        grund,
        (id) => deltypEtikett(id, data, mall),
      );
      if (sidor) rader.push(sidor);
      const valda = data.valdaDeltyper
        .map((id) => deltypEtikett(id, data, mall))
        .join(", ");
      if (valda) rader.push(`Material: ${valda}`);
      const yta = enkelMattRad("Yta", rad.värde, rad.måttenhet);
      if (yta) rader.push(yta);
    } else if (def?.detaljPanel === "fasad-sockel-val") {
      const text = formateraFasadSockelPoster(
        hamtaFasadSockelPoster(data, rad.id),
      );
      if (text) rader.push(text);
    } else {
      const v = rad.värde.trim();
      if (v) {
        const enhet = måttenhetEtiketter[rad.måttenhet].enhet;
        rader.push(`${v} ${enhet}`);
      }
    }

    resultat.push({
      id: rad.id,
      etikett: rad.etikett,
      rader: rader.length > 0 ? rader : ["— inget angivet ännu"],
    });
  }

  return resultat;
}
