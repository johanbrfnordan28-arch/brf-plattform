"use client";

import { OppnaStangIkon, OppnaStangKnapp } from "@/components/OppnaStangKnapp";
import { useState } from "react";
import {
  UnderkomponentKort,
  UnderkomponentKortLista,
} from "@/components/underhallsplan/KomponentTrädUi";
import { FasadmaterialPanel } from "@/components/underhallsplan/FasadmaterialPanel";
import { formateraFasadAtgarder } from "@/components/underhallsplan/fasad-atgard";
import { beraknaFasadKostnadPerAr } from "@/components/underhallsplan/fasad-atgard-plan";
import {
  hamtaFasadAtgardPrisRegister,
  uppdateraFasadAtgardPrisRegister,
} from "@/components/underhallsplan/fasad-atgard-pris";
import { harFasadAtgardPlan } from "@/components/underhallsplan/fasad-atgard";
import { hamtaUnderhallTillfallenPlanNyckel } from "@/components/underhallsplan/underhall-atgard-katalog";
import { harUnderhallTillfallenPlan } from "@/components/underhallsplan/underhall-tillfallen";
import { beraknaUnderhallTillfallenKostnadPerAr } from "@/components/underhallsplan/underhall-tillfallen-plan";
import {
  hamtaTillfallenKopplingForUnderkomponent,
  hamtaUnderhallTillfallenData,
  hamtaUnderhallTillfallenPriser,
  skapaForslagFonsterTillfallen,
  skapaForslagTakTillfallen,
  uppdateraUnderhallTillfallenData,
  uppdateraUnderhallTillfallenPriser,
} from "@/components/underhallsplan/underhall-tillfallen-register";
import { UnderhallTillfallenPanel } from "@/components/underhallsplan/UnderhallTillfallenPanel";
import { FonsterDorrPanel } from "@/components/underhallsplan/FonsterDorrPanel";
import { formateraFonsterDorrPoster } from "@/components/underhallsplan/fonster-dorrar";
import {
  allaDeltyper,
  formateraKomponentSammanfattning,
  hamtaFonsterDorrPoster,
  hamtaFasadAtgardData,
  hamtaKomponentMall,
  hamtaLokalInventar,
  hamtaLokalYtskikt,
  uppdateraLokalYtskikt,
  hamtaMedlemstakterrassData,
  hamtaTakterrassData,
  hamtaTakfonsterData,
  hamtaBalkongPoster,
  hamtaHissPoster,
  hamtaVentilationExtraPoster,
  hamtaTvattstugaPoster,
  hamtaPPlatserData,
  hamtaVvsRadiatorData,
  hamtaVvsStambyteData,
  hamtaVarmestamPoster,
  hamtaStamventilPoster,
  måttenhetEtiketter,
  skapaKomponentId,
  formateraForradRad,
  formateraGolvRad,
  standardForradMaterial,
  standardTrapphusGolvMaterial,
  standardYtskikt,
  uppdateraFonsterDorrPoster,
  uppdateraFasadAtgardData,
  uppdateraLokalInventar,
  uppdateraMedlemstakterrassData,
  uppdateraTakterrassData,
  uppdateraTakfonsterData,
  uppdateraBalkongPoster,
  uppdateraEgnaHissMarken,
  uppdateraHissPoster,
  uppdateraVentilationExtraPoster,
  hamtaBrandskyddSbaData,
  uppdateraBrandskyddSbaData,
  hamtaBrandskyddBranddorrarData,
  uppdateraBrandskyddBranddorrarData,
  uppdateraTvattstugaPoster,
  uppdateraPPlatserData,
  uppdateraVvsRadiatorData,
  uppdateraVvsStambyteData,
  uppdateraVarmestamPoster,
  uppdateraStamventilPoster,
  ytskiktEtikett,
  deltypEtikett,
  type ForradMaterialId,
  type KomponentDetaljData,
  type Måttenhet,
  type TrapphusGolvMaterialId,
  type UnderkomponentRad,
} from "@/components/underhallsplan/komponentregister";
import { GolvValPanel } from "@/components/underhallsplan/GolvValPanel";
import { LokalInventarPanel } from "@/components/underhallsplan/LokalInventarPanel";
import { LokalKomplementPanel } from "@/components/underhallsplan/LokalKomplementPanel";
import { formateraLokalInventar } from "@/components/underhallsplan/lokal-inventar";
import { formateraLokalYtskikt } from "@/components/underhallsplan/lokal-ytskikt";
import { StambytePanel } from "@/components/underhallsplan/StambytePanel";
import { formateraPPlatser } from "@/components/underhallsplan/p-platser";
import { PPlatserPanel } from "@/components/underhallsplan/PPlatserPanel";
import { formateraVvsRadiator } from "@/components/underhallsplan/vvs-radiatorer";
import {
  beraknaStambytePris,
  formateraStambytePris,
} from "@/components/underhallsplan/stambyte-pris";
import { formateraVvsStambyte } from "@/components/underhallsplan/vvs-stambyte";
import { VvsRadiatorPanel } from "@/components/underhallsplan/VvsRadiatorPanel";
import { VarmestammarPanel } from "@/components/underhallsplan/VarmestammarPanel";
import { StamventilerPanel } from "@/components/underhallsplan/StamventilerPanel";
import { formateraVarmestamPoster } from "@/components/underhallsplan/varmestammar";
import { formateraStamventilPoster } from "@/components/underhallsplan/stamventiler";
import { MedlemstakterrassPanel } from "@/components/underhallsplan/MedlemstakterrassPanel";
import { TakterrassPanel } from "@/components/underhallsplan/TakterrassPanel";
import { formateraMedlemstakterrass } from "@/components/underhallsplan/medlemstakterrass";
import { formateraTakterrass } from "@/components/underhallsplan/takterrass";
import {
  beraknaMedlemstakterrassPris,
  formateraMedlemstakterrassPris,
} from "@/components/underhallsplan/medlemstakterrass-pris";
import {
  beraknaTakterrassPris,
  formateraTakterrassPris,
} from "@/components/underhallsplan/takterrass-pris";
import { BalkongerPanel } from "@/components/underhallsplan/BalkongerPanel";
import { TvattstugaListaPanel } from "@/components/underhallsplan/TvattstugaListaPanel";
import { formateraBalkongPoster } from "@/components/underhallsplan/balkonger";
import { formateraHissPoster } from "@/components/underhallsplan/hissar";
import { HissListaPanel } from "@/components/underhallsplan/HissListaPanel";
import { VentilationExtraPanel } from "@/components/underhallsplan/VentilationExtraPanel";
import { BrandskyddSbaPanel } from "@/components/underhallsplan/BrandskyddSbaPanel";
import { BranddorrarPanel } from "@/components/underhallsplan/BranddorrarPanel";
import { formateraVentilationExtraPoster } from "@/components/underhallsplan/ventilation-extra";
import { TakfonsterListaPanel } from "@/components/underhallsplan/TakfonsterListaPanel";
import { formateraTakfonsterData } from "@/components/underhallsplan/takfonster";
import { formateraTvattstugaPoster } from "@/components/underhallsplan/tvattstugor";
import { KommandeUnderhallFalt } from "@/components/underhallsplan/KommandeUnderhallFalt";
import { YtskiktValPanel } from "@/components/underhallsplan/YtskiktValPanel";
import { TakYtaSammanstallning } from "@/components/underhallsplan/TakYtaSammanstallning";
import { KomponentKlumpsummaVy } from "@/components/underhallsplan/KomponentKlumpsummaVy";
import { YtaOchMaterialAiHjalp } from "@/components/underhallsplan/YtaOchMaterialAiHjalp";
import {
  skaVisaUnderkomponentLista,
} from "@/components/underhallsplan/komponent-vy";
import type { Grunduppgifter } from "@/components/underhallsplan/types";

type KomponentDetaljerProps = {
  komponentNamn: string;
  data: KomponentDetaljData;
  onChange: (data: KomponentDetaljData) => void;
  disabled?: boolean;
  planStartAr: number;
  planLangdAr: number;
  foreningsAdresser?: string[];
  grund: Grunduppgifter;
};

export function KomponentDetaljer({
  komponentNamn,
  data,
  onChange,
  disabled,
  planStartAr,
  planLangdAr,
  foreningsAdresser = [],
  grund,
}: KomponentDetaljerProps) {
  const mall = hamtaKomponentMall(komponentNamn);
  const tillatEgenDeltyp = mall.tillatEgenDeltyp !== false;
  const deltyper = tillatEgenDeltyp
    ? allaDeltyper(data, mall)
    : mall.deltyper;

  const [öppnaDeltyper, setÖppnaDeltyper] = useState(true);
  const [nyDeltyp, setNyDeltyp] = useState("");
  const [nyUnder, setNyUnder] = useState("");
  const [öppenUnderkomponentId, setÖppenUnderkomponentId] = useState<string | null>(
    null,
  );
  const [underNavFel, setUnderNavFel] = useState<{
    targetId: string;
    text: string;
    visaStangOchByt: boolean;
  } | null>(null);

  function etikettForUnderkomponent(id: string): string {
    return (
      data.underkomponenter.find((u) => u.id === id)?.etikett ?? "underkomponent"
    );
  }

  function toggleUnderkomponentDetaljer(radId: string, aktiv: boolean) {
    if (öppenUnderkomponentId === radId) {
      setUnderNavFel(null);
      setÖppenUnderkomponentId(null);
      return;
    }
    if (!aktiv) {
      setUnderNavFel({
        targetId: radId,
        text: `Aktivera «${etikettForUnderkomponent(radId)}» med kryssrutan till vänster innan detaljer kan öppnas.`,
        visaStangOchByt: false,
      });
      return;
    }
    if (öppenUnderkomponentId) {
      setUnderNavFel({
        targetId: radId,
        text: `«${etikettForUnderkomponent(öppenUnderkomponentId)}» är öppen. Stäng den innan du öppnar «${etikettForUnderkomponent(radId)}».`,
        visaStangOchByt: true,
      });
      return;
    }
    setUnderNavFel(null);
    setÖppenUnderkomponentId(radId);
  }

  function stangOchOppnaUnderkomponent(radId: string, aktiv: boolean) {
    if (!aktiv) return;
    setUnderNavFel(null);
    setÖppenUnderkomponentId(radId);
  }

  function toggleDeltyp(id: string) {
    onChange({
      ...data,
      valdaDeltyper: data.valdaDeltyper.includes(id)
        ? data.valdaDeltyper.filter((d) => d !== id)
        : [...data.valdaDeltyper, id],
    });
  }

  function läggTillEgenDeltyp() {
    const etikett = nyDeltyp.trim();
    if (!etikett) return;
    const id = skapaKomponentId("deltyp");
    onChange({
      ...data,
      egnaDeltyper: [...data.egnaDeltyper, { id, etikett }],
      valdaDeltyper: [...data.valdaDeltyper, id],
    });
    setNyDeltyp("");
  }

  function taBortEgenDeltyp(id: string) {
    onChange({
      ...data,
      egnaDeltyper: data.egnaDeltyper.filter((d) => d.id !== id),
      valdaDeltyper: data.valdaDeltyper.filter((d) => d !== id),
    });
  }

  function läggTillEgenUnderkomponent() {
    const etikett = nyUnder.trim();
    if (!etikett) return;
    const id = skapaKomponentId("under");
    onChange({
      ...data,
      underkomponenter: [
        ...data.underkomponenter,
        {
          id,
          etikett,
          aktiv: true,
          måttenhet: "antal",
          värde: "",
          ärEgen: true,
          underhallIntervallAr: "",
          avskrivningAr: "",
          underhallNastaAr: String(planStartAr),
          underhallKostnadKr: "",
        },
      ],
    });
    setNyUnder("");
  }

  function taBortUnderkomponent(id: string) {
    if (öppenUnderkomponentId === id) setÖppenUnderkomponentId(null);
    onChange({
      ...data,
      underkomponenter: data.underkomponenter.filter((r) => r.id !== id),
    });
  }

  function uppdateraUnderkomponent(
    id: string,
    patch: Partial<UnderkomponentRad>,
  ) {
    onChange({
      ...data,
      underkomponenter: data.underkomponenter.map((rad) => {
        if (rad.id !== id) return rad;
        const next = { ...rad, ...patch };
        const def = mall.underkomponenter.find((u) => u.id === id);
        if (patch.aktiv === true && def?.ytskiktGrupp && !next.ytskikt) {
          next.ytskikt = standardYtskikt(def.ytskiktGrupp);
        }
        if (
          patch.aktiv === true &&
          (def?.detaljPanel === "forrad-val" ||
            (def?.detaljPanel === "lokal-komplement-val" && def.id === "forrad")) &&
          !next.forradMaterial
        ) {
          next.forradMaterial = standardForradMaterial();
        }
        if (patch.aktiv === true && def?.detaljPanel === "golv-val" && !next.golvMaterial) {
          next.golvMaterial = standardTrapphusGolvMaterial();
        }
        return next;
      }),
    });
  }

  const visaDeltypSektion = deltyper.length > 0 || tillatEgenDeltyp;
  const visaUnderkomponentLista = skaVisaUnderkomponentLista(data);
  const visaEnkelKlumpsummaVy =
    data.enkelKlumpsummaLage === true && data.visaUnderkomponenterLista !== true;

  function sattEnkelVy() {
    onChange({
      ...data,
      enkelKlumpsummaLage: true,
      visaUnderkomponenterLista: false,
    });
  }

  function sattVisaAllaUnderkomponenter() {
    onChange({
      ...data,
      visaUnderkomponenterLista: true,
    });
  }

  return (
    <div className={disabled ? "pointer-events-none opacity-50" : ""}>
      {visaDeltypSektion && (
      <div>
        <button
          type="button"
          onClick={() => setÖppnaDeltyper((o) => !o)}
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-white px-3 py-2.5 text-left"
          aria-expanded={öppnaDeltyper}
        >
          <OppnaStangIkon oppen={öppnaDeltyper} storlek="sm" />
          <span className="text-sm font-semibold text-foreground">
            {mall.deltypSektionTitel}
          </span>
          {data.valdaDeltyper.length > 0 && (
            <span className="ml-auto text-xs text-primary-dark">
              {data.valdaDeltyper.length} valda
            </span>
          )}
        </button>

        {öppnaDeltyper && (
          <div className="mt-2 space-y-3 rounded-lg border border-border bg-white p-3">
            {deltyper.length > 0 ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {deltyper.map((del) => {
                    const vald = data.valdaDeltyper.includes(del.id);
                    const ärEgen = data.egnaDeltyper.some((e) => e.id === del.id);
                    return (
                      <span key={del.id} className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleDeltyp(del.id)}
                          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                            vald
                              ? "border-primary bg-[#e2f0e6] text-primary-dark"
                              : "border-border text-foreground hover:border-primary/50"
                          }`}
                        >
                          {vald ? "✓ " : ""}
                          {del.etikett}
                        </button>
                        {tillatEgenDeltyp && ärEgen && (
                          <button
                            type="button"
                            onClick={() => taBortEgenDeltyp(del.id)}
                            className="text-xs text-muted hover:text-red-700"
                            title="Ta bort egen typ"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>
                {deltyper.some((del) => del.beskrivning) && (
                  <ul className="space-y-2 border-t border-dashed border-border pt-3">
                    {deltyper
                      .filter((del) => del.beskrivning)
                      .map((del) => (
                        <li
                          key={del.id}
                          className={`text-xs leading-relaxed ${
                            data.valdaDeltyper.includes(del.id)
                              ? "text-foreground"
                              : "text-muted"
                          }`}
                        >
                          <span className="font-medium">{del.etikett}:</span>{" "}
                          {del.beskrivning}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted">
                Inga fördefinierade typer — lägg till egna nedan.
              </p>
            )}

            {tillatEgenDeltyp && (
              <div className="flex flex-col gap-2 border-t border-dashed border-border pt-3 sm:flex-row sm:items-end">
                <label className="min-w-0 flex-1">
                  <span className="text-xs font-medium text-foreground">
                    Lägg till egen typ
                  </span>
                  <input
                    value={nyDeltyp}
                    onChange={(e) => setNyDeltyp(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        läggTillEgenDeltyp();
                      }
                    }}
                    placeholder="t.ex. Tjärpapp, Fibercement"
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                </label>
                <button
                  type="button"
                  onClick={läggTillEgenDeltyp}
                  className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
                >
                  + Typ
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      )}

      <div className={visaDeltypSektion ? "mt-3" : ""}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Underkomponenter
          </p>
          <button
            type="button"
            onClick={sattEnkelVy}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              visaEnkelKlumpsummaVy
                ? "border-primary bg-[#e2f0e6] text-primary-dark"
                : "border-border bg-white text-foreground hover:border-primary/50"
            }`}
          >
            Enkel vy (klumpsumma)
          </button>
          <button
            type="button"
            onClick={sattVisaAllaUnderkomponenter}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              visaUnderkomponentLista && !visaEnkelKlumpsummaVy
                ? "border-primary bg-[#e2f0e6] text-primary-dark"
                : "border-border bg-white text-foreground hover:border-primary/50"
            }`}
          >
            Visa alla underkomponenter
          </button>
        </div>

        {visaEnkelKlumpsummaVy && (
          <KomponentKlumpsummaVy
            komponentNamn={komponentNamn}
            data={data}
            grund={grund}
            onChange={onChange}
          />
        )}

        {visaUnderkomponentLista && (
        <UnderkomponentKortLista>
          {data.underkomponenter.map((rad) => {
            const def = mall.underkomponenter.find((u) => u.id === rad.id);
            const hint = def?.måttHint ?? "Ange antal, kvm eller löpmeter.";
            const enhetInfo = måttenhetEtiketter[rad.måttenhet];
            const detaljPanel = def?.detaljPanel;
            const fonsterDorrPoster = detaljPanel
              ? hamtaFonsterDorrPoster(data, rad.id)
              : [];
            const tillfallenPlanNyckel = hamtaUnderhallTillfallenPlanNyckel(
              komponentNamn,
              rad.id,
            );
            const tillfallenData = tillfallenPlanNyckel
              ? hamtaUnderhallTillfallenData(data, rad.id, tillfallenPlanNyckel)
              : null;
            const tillfallenPriser = tillfallenPlanNyckel
              ? hamtaUnderhallTillfallenPriser(data, rad.id, rad.värde)
              : null;
            const planeratViaTillfallen = Boolean(
              tillfallenPlanNyckel &&
                tillfallenData &&
                harUnderhallTillfallenPlan(tillfallenData),
            );
            const tillfallenKoppling = hamtaTillfallenKopplingForUnderkomponent(
              data,
              mall,
              rad.id,
            );
            const utförtHistorikAr =
              rad.underhallHistorikAr != null
                ? String(rad.underhallHistorikAr)
                : "";
            const utförtArNum = utförtHistorikAr
              ? Number.parseInt(utförtHistorikAr, 10)
              : NaN;
            const fonsterDorrKort =
              detaljPanel === "fonster-lista" || detaljPanel === "dorr-lista"
                ? formateraFonsterDorrPoster(
                    fonsterDorrPoster,
                    detaljPanel === "dorr-lista" ? "dorr" : "fonster",
                  )
                : null;
            const ytskiktKort =
              detaljPanel === "ytskikt-val" &&
              rad.aktiv &&
              def?.ytskiktGrupp
                ? `${ytskiktEtikett(
                    def.ytskiktGrupp,
                    rad.ytskikt ?? standardYtskikt(def.ytskiktGrupp),
                    rad.ytskiktAnnanText,
                  )}${
                    rad.värde.trim()
                      ? ` · ${rad.värde.trim()} ${enhetInfo.enhet}`
                      : ""
                  }`
                : null;
            const fasadmaterialKort =
              detaljPanel === "fasadmaterial-val" && rad.aktiv
                ? [
                    data.valdaDeltyper
                      .map((id) => deltypEtikett(id, data, mall))
                      .join(", "),
                    formateraFasadAtgarder(hamtaFasadAtgardData(data, rad.id)),
                    rad.värde.trim()
                      ? `${rad.värde.trim()} ${enhetInfo.enhet}`
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" · ") || null
                : null;
            const golvKort =
              detaljPanel === "golv-val" && rad.aktiv
                ? formateraGolvRad(rad)
                : null;
            const lokalKomplementKort =
              detaljPanel === "lokal-komplement-val" && rad.aktiv
                ? (() => {
                    const delar = [
                      formateraLokalYtskikt(hamtaLokalYtskikt(data, rad.id)),
                      rad.id === "forrad" ? formateraForradRad(rad) : "",
                      def?.lokalTyp
                        ? formateraLokalInventar(
                            def.lokalTyp,
                            hamtaLokalInventar(data, rad.id, def.lokalTyp),
                            rad.värde,
                          )
                        : "",
                    ].filter(Boolean);
                    return delar.length > 0 ? delar.join(" · ") : null;
                  })()
                : null;
            const lokalKort =
              detaljPanel === "lokal-inventar" &&
              rad.aktiv &&
              def?.lokalTyp
                ? formateraLokalInventar(
                    def.lokalTyp,
                    hamtaLokalInventar(data, rad.id, def.lokalTyp),
                    rad.värde,
                  )
                : null;
            const vvsKort =
              detaljPanel === "vvs-radiatorer" && rad.aktiv
                ? formateraVvsRadiator(hamtaVvsRadiatorData(data, rad.id))
                : null;
            const varmestammarKort =
              detaljPanel === "varmestammar-lista" && rad.aktiv
                ? formateraVarmestamPoster(hamtaVarmestamPoster(data, rad.id))
                : null;
            const stamventilerKort =
              detaljPanel === "stamventiler-lista" && rad.aktiv
                ? formateraStamventilPoster(hamtaStamventilPoster(data, rad.id))
                : null;
            const pPlatserKort =
              detaljPanel === "p-platser-val" && rad.aktiv
                ? formateraPPlatser(hamtaPPlatserData(data, rad.id))
                : null;
            const stambyteKort =
              detaljPanel === "vvs-stambyte" && rad.aktiv
                ? (() => {
                    const stamData = hamtaVvsStambyteData(data, rad.id);
                    const text = formateraVvsStambyte(stamData);
                    const pris = formateraStambytePris(
                      beraknaStambytePris(stamData).totaltKr,
                    );
                    return pris ? `${text} · ${pris}` : text;
                  })()
                : null;
            const tvattstugaKort =
              detaljPanel === "tvattstuga-lista" && rad.aktiv
                ? formateraTvattstugaPoster(hamtaTvattstugaPoster(data, rad.id))
                : null;
            const balkongKort =
              detaljPanel === "balkong-lista" && rad.aktiv
                ? formateraBalkongPoster(hamtaBalkongPoster(data, rad.id))
                : null;
            const hissKort =
              detaljPanel === "hiss-lista" && rad.aktiv
                ? formateraHissPoster(
                    hamtaHissPoster(data, rad.id),
                    data.egnaHissMarken ?? [],
                  )
                : null;
            const ventilationExtraKort =
              detaljPanel === "ventilation-extra-lista" && rad.aktiv
                ? formateraVentilationExtraPoster(
                    hamtaVentilationExtraPoster(data, rad.id),
                  )
                : null;
            const takfonsterKort =
              detaljPanel === "takfonster-lista" && rad.aktiv
                ? formateraTakfonsterData(hamtaTakfonsterData(data, rad.id))
                : null;
            const takterrassKort =
              detaljPanel === "takterrass-val" && rad.aktiv
                ? (() => {
                    const terrassData = hamtaTakterrassData(data, rad.id);
                    const text = formateraTakterrass(terrassData);
                    const pris = formateraTakterrassPris(
                      beraknaTakterrassPris(terrassData).totaltKr,
                    );
                    return pris ? `${text} · ${pris}` : text;
                  })()
                : null;
            const medlemstakterrassKort =
              detaljPanel === "medlemstakterrass-val" && rad.aktiv
                ? (() => {
                    const terrassData = hamtaMedlemstakterrassData(data, rad.id);
                    const text = formateraMedlemstakterrass(terrassData);
                    const pris = formateraMedlemstakterrassPris(
                      beraknaMedlemstakterrassPris(terrassData).totaltKr,
                    );
                    return pris ? `${text} · ${pris}` : text;
                  })()
                : null;
            const underKort =
              fonsterDorrKort ??
              ytskiktKort ??
              fasadmaterialKort ??
              golvKort ??
              lokalKomplementKort ??
              lokalKort ??
              vvsKort ??
              varmestammarKort ??
              stamventilerKort ??
              pPlatserKort ??
              stambyteKort ??
              tvattstugaKort ??
              balkongKort ??
              hissKort ??
              ventilationExtraKort ??
              takfonsterKort ??
              takterrassKort ??
              medlemstakterrassKort ??
              null;
            const visaFasadUnderhall =
              komponentNamn === "Fasad" &&
              (rad.id === "fonster" || rad.id === "dorrar") &&
              (detaljPanel === "fonster-lista" || detaljPanel === "dorr-lista");

            const etikettMedEgen = `${rad.etikett}${rad.ärEgen ? " (egen)" : ""}`;
            const sammanfattningRad =
              underKort ??
              (!detaljPanel && rad.aktiv && rad.värde.trim()
                ? `${rad.värde.trim()} ${enhetInfo.enhet}`
                : null);
            const ärÖppen = öppenUnderkomponentId === rad.id;
            const ärLast = !rad.aktiv;
            const navFel =
              underNavFel?.targetId === rad.id ? underNavFel.text : null;
            const visaStangOchByt = underNavFel?.visaStangOchByt ?? false;

            return (
              <UnderkomponentKort
                key={rad.id}
                etikett={etikettMedEgen}
                hint={hint}
                sammanfattning={sammanfattningRad}
                aktiv={rad.aktiv}
                onAktivChange={(aktiv) => {
                  if (!aktiv && öppenUnderkomponentId === rad.id) {
                    setÖppenUnderkomponentId(null);
                  }
                  uppdateraUnderkomponent(rad.id, { aktiv });
                }}
                headerAction={
                  <div className="flex flex-col items-end gap-1">
                    {ärLast ? (
                      <span className="rounded-lg border border-amber-200 bg-amber-50/80 px-2.5 py-1.5 text-xs font-semibold text-amber-950">
                        Låst
                      </span>
                    ) : (
                      <OppnaStangKnapp
                        oppen={ärÖppen}
                        onClick={() => toggleUnderkomponentDetaljer(rad.id, rad.aktiv)}
                        storlek="sm"
                        ariaLabel={
                          ärÖppen
                            ? `Stäng ${etikettMedEgen}`
                            : `Öppna ${etikettMedEgen}`
                        }
                      />
                    )}
                    {navFel && (
                      <div
                        role="alert"
                        className="max-w-[14rem] rounded border border-amber-300 bg-amber-50 px-2 py-1 text-[10px] leading-snug text-amber-950"
                      >
                        {navFel}
                        {visaStangOchByt && (
                          <button
                            type="button"
                            onClick={() =>
                              stangOchOppnaUnderkomponent(rad.id, rad.aktiv)
                            }
                            className="mt-1 block font-semibold text-primary-dark underline"
                          >
                            Stäng övrig och öppna här
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                }
                taBortAction={
                  rad.ärEgen ? (
                    <button
                      type="button"
                      onClick={() => taBortUnderkomponent(rad.id)}
                      className="text-xs text-muted hover:text-red-700"
                      title="Ta bort underkomponent"
                    >
                      Ta bort
                    </button>
                  ) : undefined
                }
              >
                {ärÖppen && (
                  <KommandeUnderhallFalt
                      komponentNamn={komponentNamn}
                      underkomponentId={rad.id}
                      rad={rad}
                      planStartAr={planStartAr}
                      planLangdAr={planLangdAr}
                      onChange={(patch) => uppdateraUnderkomponent(rad.id, patch)}
                      planeratViaTillfallen={
                        planeratViaTillfallen ||
                        (komponentNamn === "Fasad" &&
                          rad.id === "fasadmaterial" &&
                          harFasadAtgardPlan(hamtaFasadAtgardData(data, rad.id)))
                      }
                      tillfallenKoppling={tillfallenKoppling}
                      kostnadPerArOverride={
                        komponentNamn === "Fasad" && rad.id === "fasadmaterial"
                          ? beraknaFasadKostnadPerAr(
                              hamtaFasadAtgardData(data, rad.id),
                              hamtaFasadAtgardPrisRegister(data, rad.id, rad.värde),
                              planStartAr,
                              planLangdAr,
                            )
                          : tillfallenPlanNyckel && tillfallenData && tillfallenPriser
                            ? beraknaUnderhallTillfallenKostnadPerAr(
                                tillfallenPlanNyckel,
                                tillfallenData,
                                tillfallenPriser,
                                planStartAr,
                                planLangdAr,
                              )
                            : undefined
                      }
                    />
                )}

                {ärÖppen &&
                  rad.aktiv &&
                  tillfallenPlanNyckel &&
                  tillfallenData &&
                  tillfallenPriser && (
                  <div
                    id={`underhall-tillfallen-${rad.id}`}
                    className="border-t border-border bg-[#fafcfa] px-3 py-3 sm:px-4 scroll-mt-4"
                  >
                    <UnderhallTillfallenPanel
                      komponentNamn={komponentNamn}
                      underkomponentId={rad.id}
                      planNyckel={tillfallenPlanNyckel}
                      mall={mall}
                      tillfallenData={tillfallenData}
                      priser={tillfallenPriser}
                      defaultKvm={rad.värde}
                      planStartAr={planStartAr}
                      planLangdAr={planLangdAr}
                      underhallHistorikAr={utförtHistorikAr}
                      onTillfallenChange={(next) =>
                        onChange(
                          uppdateraUnderhallTillfallenData(
                            data,
                            rad.id,
                            next,
                            tillfallenPlanNyckel,
                          ),
                        )
                      }
                      onPriserChange={(priser) =>
                        onChange(uppdateraUnderhallTillfallenPriser(data, rad.id, priser))
                      }
                      onForslagStandard={
                        Number.isFinite(utförtArNum)
                          ? () =>
                              onChange(
                                uppdateraUnderhallTillfallenData(
                                  data,
                                  rad.id,
                                  tillfallenPlanNyckel === "tak-takyta"
                                    ? skapaForslagTakTillfallen(utförtArNum, planStartAr)
                                    : skapaForslagFonsterTillfallen(
                                        utförtArNum,
                                        planStartAr,
                                      ),
                                  tillfallenPlanNyckel,
                                ),
                              )
                          : undefined
                      }
                      forslagEtikett={
                        tillfallenPlanNyckel === "tak-takyta"
                          ? "Föreslå takmålning + omläggning (25 år)"
                          : "Föreslå målning + fönsterbyte"
                      }
                    />
                  </div>
                )}

                {ärÖppen &&
                  rad.aktiv &&
                  (detaljPanel === "fonster-lista" ||
                    detaljPanel === "dorr-lista") && (
                  <div className="border-t border-border bg-[#fafcfa] px-3 py-3 sm:px-4">
                    <FonsterDorrPanel
                      titel={rad.etikett}
                      modulmattTyp={rad.id === "dorrar" ? "dorr" : "fonster"}
                      poster={fonsterDorrPoster}
                      foreningsAdresser={foreningsAdresser}
                      grund={grund}
                      onChange={(poster) =>
                        onChange(uppdateraFonsterDorrPoster(data, rad.id, poster))
                      }
                      visaUnderhallTips={visaFasadUnderhall}
                    />
                  </div>
                )}

                {ärÖppen &&
                  rad.aktiv &&
                  detaljPanel === "ytskikt-val" &&
                  def?.ytskiktGrupp && (
                  <div className="border-t border-border bg-[#fafcfa] px-3 py-3 sm:px-4">
                    <YtskiktValPanel
                      grupp={def.ytskiktGrupp}
                      ytskikt={
                        rad.ytskikt ?? standardYtskikt(def.ytskiktGrupp)
                      }
                      måttenhet={rad.måttenhet}
                      värde={rad.värde}
                      annanAtgardText={rad.ytskiktAnnanText ?? ""}
                      onYtskiktChange={(ytskikt) =>
                        uppdateraUnderkomponent(rad.id, { ytskikt })
                      }
                      onAnnanAtgardChange={
                        def.ytskiktGrupp === "kallare-ytskikt"
                          ? (text) =>
                              uppdateraUnderkomponent(rad.id, {
                                ytskiktAnnanText: text,
                              })
                          : undefined
                      }
                      onMåttChange={(patch) =>
                        uppdateraUnderkomponent(rad.id, patch)
                      }
                    />
                  </div>
                )}

                {ärÖppen && rad.aktiv && detaljPanel === "fasadmaterial-val" && (
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
                    onMåttChange={(patch) => {
                      uppdateraUnderkomponent(rad.id, patch);
                    }}
                    onFasadAtgardChange={(atgard) =>
                      onChange(uppdateraFasadAtgardData(data, rad.id, atgard))
                    }
                    onFasadAtgardPriserChange={(priser) =>
                      onChange(
                        uppdateraFasadAtgardPrisRegister(data, rad.id, priser),
                      )
                    }
                  />
                )}

                {ärÖppen && rad.aktiv && detaljPanel === "golv-val" && (
                  <div className="border-t border-border bg-[#fafcfa] px-3 py-3 sm:px-4">
                    <GolvValPanel
                      material={
                        rad.golvMaterial ?? standardTrapphusGolvMaterial()
                      }
                      värde={rad.värde}
                      onMaterialChange={(golvMaterial) =>
                        uppdateraUnderkomponent(rad.id, { golvMaterial })
                      }
                      onVärdeChange={(värde) =>
                        uppdateraUnderkomponent(rad.id, { värde })
                      }
                    />
                  </div>
                )}

                {ärÖppen && rad.aktiv && detaljPanel === "lokal-komplement-val" && (
                  <div className="border-t border-border bg-[#fafcfa] px-3 py-3 sm:px-4">
                    <LokalKomplementPanel
                      titel={rad.etikett}
                      antalRum={rad.värde}
                      onAntalRumChange={(värde) =>
                        uppdateraUnderkomponent(rad.id, { värde })
                      }
                      ytskiktRader={hamtaLokalYtskikt(data, rad.id)}
                      onYtskiktChange={(rader) =>
                        onChange(uppdateraLokalYtskikt(data, rad.id, rader))
                      }
                      inventarTyp={def?.lokalTyp}
                      inventarRader={
                        def?.lokalTyp
                          ? hamtaLokalInventar(data, rad.id, def.lokalTyp)
                          : undefined
                      }
                      onInventarChange={
                        def?.lokalTyp
                          ? (inventar) =>
                              onChange(
                                uppdateraLokalInventar(data, rad.id, inventar),
                              )
                          : undefined
                      }
                      visaForradPartition={rad.id === "forrad"}
                      forradMaterial={
                        rad.forradMaterial ?? standardForradMaterial()
                      }
                      forradMåttenhet={rad.måttenhet}
                      forradVärde={rad.värde}
                      forradAntalDorrar={rad.forradAntalDorrar ?? ""}
                      onForradChange={(patch) =>
                        uppdateraUnderkomponent(rad.id, patch)
                      }
                    />
                  </div>
                )}

                {ärÖppen &&
                  rad.aktiv &&
                  detaljPanel === "lokal-inventar" &&
                  def?.lokalTyp && (
                  <div className="border-t border-border bg-[#fafcfa] px-3 py-3 sm:px-4">
                    <LokalInventarPanel
                      typ={def.lokalTyp}
                      titel={rad.etikett}
                      antalRum={rad.värde}
                      rader={hamtaLokalInventar(data, rad.id, def.lokalTyp)}
                      onAntalRumChange={(värde) =>
                        uppdateraUnderkomponent(rad.id, { värde })
                      }
                      onChange={(inventar) =>
                        onChange(
                          uppdateraLokalInventar(data, rad.id, inventar),
                        )
                      }
                    />
                  </div>
                )}

                {ärÖppen && rad.aktiv && detaljPanel === "vvs-radiatorer" && (
                  <div className="border-t border-border bg-[#fafcfa] px-3 py-3 sm:px-4">
                    <VvsRadiatorPanel
                      data={hamtaVvsRadiatorData(data, rad.id)}
                      onChange={(radiatorData) =>
                        onChange(
                          uppdateraVvsRadiatorData(data, rad.id, radiatorData),
                        )
                      }
                    />
                  </div>
                )}

                {ärÖppen && rad.aktiv && detaljPanel === "varmestammar-lista" && (
                  <div className="border-t border-border bg-[#fafcfa] px-3 py-3 sm:px-4">
                    <VarmestammarPanel
                      poster={hamtaVarmestamPoster(data, rad.id)}
                      onChange={(poster) =>
                        onChange(uppdateraVarmestamPoster(data, rad.id, poster))
                      }
                    />
                  </div>
                )}

                {ärÖppen && rad.aktiv && detaljPanel === "stamventiler-lista" && (
                  <div className="border-t border-border bg-[#fafcfa] px-3 py-3 sm:px-4">
                    <StamventilerPanel
                      poster={hamtaStamventilPoster(data, rad.id)}
                      onChange={(poster) =>
                        onChange(uppdateraStamventilPoster(data, rad.id, poster))
                      }
                    />
                  </div>
                )}

                {ärÖppen && rad.aktiv && detaljPanel === "p-platser-val" && (
                  <div className="border-t border-border bg-[#fafcfa] px-3 py-3 sm:px-4">
                    <PPlatserPanel
                      data={hamtaPPlatserData(data, rad.id)}
                      onChange={(pPlatserData) =>
                        onChange(
                          uppdateraPPlatserData(data, rad.id, pPlatserData),
                        )
                      }
                    />
                  </div>
                )}

                {ärÖppen && rad.aktiv && detaljPanel === "vvs-stambyte" && (
                  <div className="border-t border-border bg-[#fafcfa] px-3 py-3 sm:px-4">
                    <StambytePanel
                      data={hamtaVvsStambyteData(data, rad.id)}
                      onChange={(stambyteData) =>
                        onChange(
                          uppdateraVvsStambyteData(data, rad.id, stambyteData),
                        )
                      }
                    />
                  </div>
                )}

                {ärÖppen &&
                  rad.aktiv &&
                  detaljPanel === "tvattstuga-lista" && (
                  <div className="border-t border-border bg-[#fafcfa] px-3 py-3 sm:px-4">
                    <TvattstugaListaPanel
                      poster={hamtaTvattstugaPoster(data, rad.id)}
                      onChange={(poster) =>
                        onChange(uppdateraTvattstugaPoster(data, rad.id, poster))
                      }
                    />
                  </div>
                )}

                {ärÖppen && rad.aktiv && detaljPanel === "balkong-lista" && (
                  <div className="border-t border-border bg-[#fafcfa] px-3 py-3 sm:px-4">
                    <BalkongerPanel
                      poster={hamtaBalkongPoster(data, rad.id)}
                      onChange={(poster) =>
                        onChange(uppdateraBalkongPoster(data, rad.id, poster))
                      }
                    />
                  </div>
                )}

                {ärÖppen && rad.aktiv && detaljPanel === "hiss-lista" && (
                  <div className="border-t border-border bg-[#fafcfa] px-3 py-3 sm:px-4">
                    <HissListaPanel
                      poster={hamtaHissPoster(data, rad.id)}
                      egnaMarken={data.egnaHissMarken ?? []}
                      onChange={(poster) =>
                        onChange(uppdateraHissPoster(data, rad.id, poster))
                      }
                      onEgnaMarkenChange={(marken) =>
                        onChange(uppdateraEgnaHissMarken(data, marken))
                      }
                    />
                  </div>
                )}

                {ärÖppen &&
                  rad.aktiv &&
                  detaljPanel === "ventilation-extra-lista" && (
                  <div className="border-t border-border bg-[#fafcfa] px-3 py-3 sm:px-4">
                    <VentilationExtraPanel
                      poster={hamtaVentilationExtraPoster(data, rad.id)}
                      onChange={(poster) =>
                        onChange(
                          uppdateraVentilationExtraPoster(data, rad.id, poster),
                        )
                      }
                    />
                  </div>
                )}

                {ärÖppen &&
                  rad.aktiv &&
                  detaljPanel === "brandskydd-sba" && (
                  <div className="border-t border-border bg-[#fafcfa] px-3 py-3 sm:px-4">
                    <BrandskyddSbaPanel
                      data={hamtaBrandskyddSbaData(data, rad.id)}
                      onChange={(sbaData) =>
                        onChange(uppdateraBrandskyddSbaData(data, rad.id, sbaData))
                      }
                    />
                  </div>
                )}

                {ärÖppen &&
                  rad.aktiv &&
                  detaljPanel === "brandskydd-branddorrar" && (
                  <div className="border-t border-border bg-[#fafcfa] px-3 py-3 sm:px-4">
                    <BranddorrarPanel
                      data={hamtaBrandskyddBranddorrarData(data, rad.id)}
                      onChange={(branddorrData) =>
                        onChange(
                          uppdateraBrandskyddBranddorrarData(
                            data,
                            rad.id,
                            branddorrData,
                          ),
                        )
                      }
                    />
                  </div>
                )}

                {ärÖppen &&
                  rad.aktiv &&
                  detaljPanel === "takfonster-lista" && (
                  <div className="border-t border-border bg-[#fafcfa] px-3 py-3 sm:px-4">
                    <TakfonsterListaPanel
                      data={hamtaTakfonsterData(data, rad.id)}
                      onChange={(takfonster) =>
                        onChange(uppdateraTakfonsterData(data, rad.id, takfonster))
                      }
                    />
                  </div>
                )}

                {ärÖppen && rad.aktiv && detaljPanel === "takterrass-val" && (
                  <div className="border-t border-border bg-[#fafcfa] px-3 py-3 sm:px-4">
                    <TakterrassPanel
                      data={hamtaTakterrassData(data, rad.id)}
                      onChange={(takterrass) =>
                        onChange(uppdateraTakterrassData(data, rad.id, takterrass))
                      }
                    />
                  </div>
                )}

                {ärÖppen &&
                  rad.aktiv &&
                  detaljPanel === "medlemstakterrass-val" && (
                  <div className="border-t border-border bg-[#fafcfa] px-3 py-3 sm:px-4">
                    <MedlemstakterrassPanel
                      data={hamtaMedlemstakterrassData(data, rad.id)}
                      onChange={(medlemstakterrass) =>
                        onChange(
                          uppdateraMedlemstakterrassData(
                            data,
                            rad.id,
                            medlemstakterrass,
                          ),
                        )
                      }
                    />
                  </div>
                )}

                {ärÖppen && rad.aktiv && !detaljPanel && (
                  <div className="border-t border-border bg-[#fafcfa] px-3 py-3 sm:px-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block text-sm">
                        <span className="text-xs font-medium text-muted">Mått som</span>
                        <select
                          value={rad.måttenhet}
                          onChange={(e) =>
                            uppdateraUnderkomponent(rad.id, {
                              måttenhet: e.target.value as Måttenhet,
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                        >
                          {(Object.keys(måttenhetEtiketter) as Måttenhet[]).map(
                            (key) => (
                              <option key={key} value={key}>
                                {måttenhetEtiketter[key].etikett} (
                                {måttenhetEtiketter[key].enhet})
                              </option>
                            ),
                          )}
                        </select>
                      </label>
                      <label className="block text-sm">
                        <span className="text-xs font-medium text-muted">
                          {enhetInfo.etikett} ({enhetInfo.enhet})
                        </span>
                        <input
                          type="number"
                          min={0}
                          step={rad.måttenhet === "antal" ? 1 : 0.1}
                          value={rad.värde}
                          onChange={(e) =>
                            uppdateraUnderkomponent(rad.id, { värde: e.target.value })
                          }
                          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                        />
                      </label>
                    </div>
                    {komponentNamn === "Tak" && rad.id === "takyta" && (
                      <>
                        <YtaOchMaterialAiHjalp
                          typ="Tak"
                          grund={grund}
                          komponentData={data}
                          registerKvm={rad.värde}
                          onApplyKvm={(kvm) =>
                            uppdateraUnderkomponent(rad.id, { värde: kvm })
                          }
                        />
                        <TakYtaSammanstallning
                          grund={grund}
                          registerTakKvm={rad.värde}
                          onApplyGrundSummaTillRegister={(kvm) =>
                            uppdateraUnderkomponent(rad.id, { värde: kvm })
                          }
                        />
                      </>
                    )}
                  </div>
                )}

              </UnderkomponentKort>
            );
          })}
        </UnderkomponentKortLista>
        )}

        {visaUnderkomponentLista && (
        <div className="mt-3 flex flex-col gap-2 border-t border-dashed border-border pt-3 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1">
            <span className="text-xs font-medium text-foreground">
              Lägg till underkomponent
            </span>
            <input
              value={nyUnder}
              onChange={(e) => setNyUnder(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  läggTillEgenUnderkomponent();
                }
              }}
              placeholder="t.ex. Taklucka, Snörasskydd"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={läggTillEgenUnderkomponent}
            className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
          >
            + Underkomponent
          </button>
        </div>
        )}
      </div>

      <p className="mt-4 rounded-lg border border-border bg-white px-3 py-2 text-xs text-muted">
        <span className="font-medium text-foreground">Sammanfattning: </span>
        {formateraKomponentSammanfattning(data, mall)}
      </p>
    </div>
  );
}
