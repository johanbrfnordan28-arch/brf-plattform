"use client";

import { BalkongerPanel } from "@/components/underhallsplan/BalkongerPanel";
import { FasadmaterialPanel } from "@/components/underhallsplan/FasadmaterialPanel";
import { FasadSockelPanel } from "@/components/underhallsplan/FasadSockelPanel";
import { FonsterDorrPanel } from "@/components/underhallsplan/FonsterDorrPanel";
import {
  hamtaFasadAtgardPrisRegister,
  uppdateraFasadAtgardPrisRegister,
} from "@/components/underhallsplan/fasad-atgard-pris";
import { TakbelaggningPanel } from "@/components/underhallsplan/TakbelaggningPanel";
import { TakfonsterListaPanel } from "@/components/underhallsplan/TakfonsterListaPanel";
import { TakterrassPanel } from "@/components/underhallsplan/TakterrassPanel";
import { MedlemstakterrassPanel } from "@/components/underhallsplan/MedlemstakterrassPanel";
import {
  hamtaFonsterDorrPoster,
  hamtaFasadAtgardData,
  hamtaFasadSidaMaterialPoster,
  hamtaFasadSockelPoster,
  hamtaKomponentMall,
  hamtaTakBelaggningData,
  hamtaBalkongPoster,
  uppdateraBalkongPoster,
  uppdateraEgnaBalkongTyper,
  uppdateraFasadAtgardData,
  uppdateraFasadSidaMaterialPoster,
  uppdateraFasadSockelPoster,
  uppdateraFonsterDorrPoster,
  uppdateraTakBelaggningData,
  hamtaTakfonsterData,
  hamtaTakterrassPoster,
  hamtaMedlemstakterrassPoster,
  uppdateraTakfonsterData,
  uppdateraTakterrassPoster,
  uppdateraMedlemstakterrassPoster,
  type KomponentDetaljData,
  type UnderkomponentDetaljPanel,
  type UnderkomponentRad,
} from "@/components/underhallsplan/komponentregister";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

/** Underkomponenter med eget formulär — enkel m²/st-rad döljs i steg 2. */
const UTFORLIGA_PANELER = new Set<UnderkomponentDetaljPanel>([
  "takbelaggning-val",
  "balkong-lista",
  "fonster-lista",
  "dorr-lista",
  "fasadmaterial-val",
  "fasad-sockel-val",
  "takfonster-lista",
  "takterrass-val",
  "medlemstakterrass-val",
]);

/** Stora formulär i steg 2 — visas ihopfällda som standard (+ / −). */
const STORA_FORMULAR_I_STEG2 = UTFORLIGA_PANELER;

export function skaDoljaEnkelMattISteg2(
  detaljPanel?: UnderkomponentDetaljPanel,
): boolean {
  return Boolean(detaljPanel && UTFORLIGA_PANELER.has(detaljPanel));
}

export function steg2UnderdelArStortFormular(
  detaljPanel?: UnderkomponentDetaljPanel,
): boolean {
  return Boolean(detaljPanel && STORA_FORMULAR_I_STEG2.has(detaljPanel));
}

type FastighetsdelUnderkomponentDetaljProps = {
  komponentNamn: string;
  rad: UnderkomponentRad;
  detaljPanel: UnderkomponentDetaljPanel;
  data: KomponentDetaljData;
  grund: Grunduppgifter;
  foreningsAdresser: string[];
  planStartAr: number;
  planLangdAr: number;
  onChange: (data: KomponentDetaljData) => void;
  onRadChange: (patch: Partial<UnderkomponentRad>) => void;
};

export function FastighetsdelUnderkomponentDetalj({
  komponentNamn,
  rad,
  detaljPanel,
  data,
  grund,
  foreningsAdresser,
  planStartAr,
  planLangdAr,
  onChange,
  onRadChange,
}: FastighetsdelUnderkomponentDetaljProps) {
  const mall = hamtaKomponentMall(komponentNamn);

  if (detaljPanel === "takbelaggning-val") {
    return (
      <div className="mt-3 rounded-lg border border-[#d4e8da] bg-white p-3">
        <TakbelaggningPanel
          data={data}
          grund={grund}
          belaggning={hamtaTakBelaggningData(data, rad.id)}
          måttenhet={rad.måttenhet}
          värde={rad.värde}
          materialvalAsSelect
          steg2Lage
          onBelaggningChange={(belaggning, radPatch) => {
            let next = uppdateraTakBelaggningData(data, rad.id, belaggning);
            if (radPatch) {
              next = {
                ...next,
                underkomponenter: next.underkomponenter.map((r) =>
                  r.id === rad.id ? { ...r, ...radPatch, aktiv: true } : r,
                ),
              };
            }
            onChange(next);
          }}
          onMåttChange={(patch) =>
            onChange({
              ...data,
              underkomponenter: data.underkomponenter.map((r) =>
                r.id === rad.id ? { ...r, ...patch, aktiv: true } : r,
              ),
            })
          }
        />
      </div>
    );
  }

  if (detaljPanel === "takfonster-lista") {
    return (
      <div className="mt-3 rounded-lg border border-[#d4e8da] bg-white p-3">
        <TakfonsterListaPanel
          data={hamtaTakfonsterData(data, rad.id)}
          foreningsAdresser={foreningsAdresser}
          grund={grund}
          steg2Lage
          onChange={(takfonster) =>
            onChange(uppdateraTakfonsterData(data, rad.id, takfonster))
          }
        />
      </div>
    );
  }

  if (detaljPanel === "takterrass-val") {
    return (
      <div className="mt-3 rounded-lg border border-[#d4e8da] bg-white p-3">
        <TakterrassPanel
          poster={hamtaTakterrassPoster(data, rad.id)}
          steg2Lage
          onChange={(poster) =>
            onChange(uppdateraTakterrassPoster(data, rad.id, poster))
          }
        />
      </div>
    );
  }

  if (detaljPanel === "medlemstakterrass-val") {
    return (
      <div className="mt-3 rounded-lg border border-[#d4e8da] bg-white p-3">
        <MedlemstakterrassPanel
          poster={hamtaMedlemstakterrassPoster(data, rad.id)}
          steg2Lage
          onChange={(poster) =>
            onChange(
              uppdateraMedlemstakterrassPoster(data, rad.id, poster),
            )
          }
        />
      </div>
    );
  }

  if (detaljPanel === "balkong-lista") {
    return (
      <div className="mt-3 rounded-lg border border-[#d4e8da] bg-white p-3">
        <BalkongerPanel
          poster={hamtaBalkongPoster(data, rad.id)}
          egnaTyper={data.egnaBalkongTyper ?? []}
          onChange={(poster) =>
            onChange(uppdateraBalkongPoster(data, rad.id, poster))
          }
          onEgnaTyperChange={(typer) =>
            onChange(uppdateraEgnaBalkongTyper(data, typer))
          }
        />
      </div>
    );
  }

  if (detaljPanel === "fonster-lista" || detaljPanel === "dorr-lista") {
    return (
      <div className="mt-3 rounded-lg border border-[#d4e8da] bg-white p-3">
        <FonsterDorrPanel
          titel={rad.etikett}
          modulmattTyp={
            rad.id === "dorrar"
              ? "dorr"
              : rad.id === "balkongdorrar"
                ? "balkongdorr"
                : "fonster"
          }
          poster={hamtaFonsterDorrPoster(data, rad.id)}
          foreningsAdresser={foreningsAdresser}
          grund={grund}
          onChange={(poster) =>
            onChange(uppdateraFonsterDorrPoster(data, rad.id, poster))
          }
          visaUnderhallTips={false}
        />
      </div>
    );
  }

  if (detaljPanel === "fasadmaterial-val") {
    return (
      <div className="mt-3 rounded-lg border border-[#d4e8da] bg-white p-3">
        <FasadmaterialPanel
          mall={mall}
          data={data}
          måttenhet={rad.måttenhet}
          värde={rad.värde}
          grund={grund}
          planStartAr={planStartAr}
          planLangdAr={planLangdAr}
          fasadAtgard={hamtaFasadAtgardData(data, rad.id)}
          fasadAtgardPriser={hamtaFasadAtgardPrisRegister(
            data,
            rad.id,
            rad.värde,
          )}
          onValdaDeltyperChange={(valdaDeltyper) =>
            onChange({ ...data, valdaDeltyper })
          }
          onMåttChange={(patch) => onRadChange(patch)}
          onFasadAtgardChange={(atgard) =>
            onChange(uppdateraFasadAtgardData(data, rad.id, atgard))
          }
          onFasadAtgardPriserChange={(priser) =>
            onChange(uppdateraFasadAtgardPrisRegister(data, rad.id, priser))
          }
          fasadSidor={hamtaFasadSidaMaterialPoster(data, rad.id)}
          onFasadSidorChange={(poster) =>
            onChange(uppdateraFasadSidaMaterialPoster(data, rad.id, poster))
          }
        />
      </div>
    );
  }

  if (detaljPanel === "fasad-sockel-val") {
    return (
      <div className="mt-3 rounded-lg border border-[#d4e8da] bg-white p-3">
        <FasadSockelPanel
          poster={hamtaFasadSockelPoster(data, rad.id)}
          onChange={(poster) =>
            onChange(uppdateraFasadSockelPoster(data, rad.id, poster))
          }
        />
      </div>
    );
  }

  return null;
}
