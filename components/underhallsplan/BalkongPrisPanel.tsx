"use client";

import { UppskattadPrisTabell } from "@/components/underhallsplan/UppskattadPrisTabell";
import {
  beraknaBalkongPostPris,
  skapaTomBalkongPriser,
  type BalkongPrisRad,
} from "@/components/underhallsplan/balkong-pris";
import {
  normaliseraBalkongPost,
  type BalkongPost,
  type BalkongPriser,
} from "@/components/underhallsplan/balkonger";

type BalkongPrisPanelProps = {
  post: BalkongPost;
  onChange: (post: BalkongPost) => void;
};

function tillTabellRad(rad: BalkongPrisRad) {
  return {
    id: rad.id,
    etikett: rad.etikett,
    mangdText: rad.mangdText,
    enhet: rad.enhet,
    enhetspris: String(rad.enhetsprisKr),
    summaKr: rad.summaKr,
  };
}

export function BalkongPrisPanel({ post, onChange }: BalkongPrisPanelProps) {
  const p = normaliseraBalkongPost(post);
  const priser = { ...skapaTomBalkongPriser(), ...p.priser };
  const { rader, totaltKr } = beraknaBalkongPostPris(p);

  function uppdateraPris(id: keyof BalkongPriser, varde: string) {
    onChange({
      ...p,
      priser: { ...priser, [id]: varde },
    });
  }

  if (rader.length === 0) return null;

  return (
    <UppskattadPrisTabell
      titel="Uppskattad kostnad"
      beskrivning="Riktvärden för BRF — justera enhetspris eller lämna tomt för riktpris."
      rader={rader.map(tillTabellRad)}
      totaltKr={totaltKr}
      totaltEtikett="Summa balkong"
      onEnhetsprisChange={(id, varde) => {
        const key = id as keyof BalkongPriser;
        if (key in priser) uppdateraPris(key, varde);
        else if (id === "tillbyggd") uppdateraPris("tillbyggdFast", varde);
      }}
    />
  );
}
