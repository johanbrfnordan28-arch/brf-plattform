"use client";

import { UppskattadPrisTabell } from "@/components/underhallsplan/UppskattadPrisTabell";
import {
  beraknaTvattstugaPostPris,
  skapaTomTvattstugaPriser,
} from "@/components/underhallsplan/tvattstuga-pris";
import type {
  TvattstugaPost,
  TvattstugaPriser,
} from "@/components/underhallsplan/tvattstugor";

type TvattstugaPrisPanelProps = {
  post: TvattstugaPost;
  onChange: (post: TvattstugaPost) => void;
};

export function TvattstugaPrisPanel({ post, onChange }: TvattstugaPrisPanelProps) {
  const priser = { ...skapaTomTvattstugaPriser(), ...post.priser };
  const { rader, totaltKr } = beraknaTvattstugaPostPris(post);

  function uppdateraPris(id: keyof TvattstugaPriser, varde: string) {
    onChange({
      ...post,
      priser: { ...priser, [id]: varde },
    });
  }

  if (rader.length === 0) return null;

  return (
    <UppskattadPrisTabell
      titel="Uppskattad kostnad"
      beskrivning="Riktvärden per maskin och yta — justera enhetspris eller lämna tomt."
      rader={rader.map((rad) => ({
        id: rad.id,
        etikett: rad.etikett,
        mangdText: rad.mangdText,
        enhet: rad.enhet,
        enhetspris: String(rad.enhetsprisKr),
        summaKr: rad.summaKr,
      }))}
      totaltKr={totaltKr}
      totaltEtikett="Summa tvättstuga"
      onEnhetsprisChange={(id, varde) =>
        uppdateraPris(id as keyof TvattstugaPriser, varde)
      }
    />
  );
}
