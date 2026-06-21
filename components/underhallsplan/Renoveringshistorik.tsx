"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createRenoveringId,
  formatKostnad,
  normaliseraRenoveringKomponent,
  sammanstallRenoveringar,
  type KommandeAtgardOverride,
  type UtfördRenovering,
} from "@/components/underhallsplan/renoveringar";
import {
  hamtaKomponentMall,
  underkomponenterIRenoveringshistorik,
  type KomponentDetaljData,
} from "@/components/underhallsplan/komponentregister";
import type { PlanKostnaderNormaliserade } from "@/components/underhallsplan/plan-kostnader";
import {
  fordelRenovering,
  renoveringHarFordelning,
} from "@/components/underhallsplan/renovering-fordelning";
import { forhandsvisaNastaAtgarder } from "@/components/underhallsplan/renovering-planering";
import { RenoveringDelFormular } from "@/components/underhallsplan/RenoveringDelFormular";
import { formateraBalkongRenoveringMeta } from "@/components/underhallsplan/BalkongRenoveringFalt";
import { BALKONGER_UNDERKOMPONENT_ID } from "@/components/underhallsplan/balkonger";
import { RenoveringshistorikKomponentTräd } from "@/components/underhallsplan/RenoveringshistorikKomponentTräd";
import { RenoveringYtaAiSektion } from "@/components/underhallsplan/RenoveringYtaAiSektion";
import type { Grunduppgifter } from "@/components/underhallsplan/types";
import {
  delFormTillRenovering,
  kommandeAtgardOverridesFranState,
  nastaArInputsFranOverrides,
  nastaArOverridesFranInputs,
  renoveringTillDelForm,
  tomRenoveringDelForm,
} from "@/components/underhallsplan/renovering-del-form";
import {
  renoveringMaterialAlternativ,
  renoveringMaterialEtikett,
} from "@/components/underhallsplan/renovering-material";
import {
  gissaInkluderadeUnderkomponenter,
  hamtaHuvudUnderkomponentIdForRenovering,
} from "@/components/underhallsplan/renovering-inkludering";
import type { RenoveringSammanfattning } from "@/components/underhallsplan/types";
import type { Besiktning } from "@/components/underhallsplan/besiktningar";
import type { UnderhallBesiktningStatus } from "@/components/underhallsplan/komponentregister";
import { UtfördaBesiktningarPanel } from "@/components/underhallsplan/UtfördaBesiktningarPanel";
import { SamfallighetsavgiftPanel } from "@/components/underhallsplan/SamfallighetsavgiftPanel";
import type { Samfallighetsavgift } from "@/components/underhallsplan/samfallighetsavgift";

type RenoveringshistorikProps = {
  unlocked: boolean;
  activeComponents: string[];
  foreslagnaKomponenter?: readonly string[];
  onToggleKomponent?: (name: string) => void;
  planStartAr: number;
  planLangdAr: number;
  planKostnader?: PlanKostnaderNormaliserade;
  grund?: Grunduppgifter;
  komponentDetaljer?: Record<string, KomponentDetaljData>;
  onKomponentDetaljerChange?: (
    register: Record<string, KomponentDetaljData>,
  ) => void;
  renoveringar: UtfördRenovering[];
  besiktningar?: Besiktning[];
  onBesiktningarChange?: (lista: Besiktning[]) => void;
  samfallighetsavgift?: Samfallighetsavgift;
  onSamfallighetsavgiftChange?: (avgift: Samfallighetsavgift) => void;
  antalLagenheter?: number;
  ventilationssystem?: string;
  onOpenKomponent?: (komponent: string) => void;
  onSammanfattningChange?: (sammanfattning: RenoveringSammanfattning) => void;
  onRenoveringarChange?: (lista: UtfördRenovering[]) => void;
  saved?: boolean;
  onSave?: () => void;
};

const emptyForm = {
  komponent: "",
  underkomponentId: "",
  ar: "",
  titel: "",
  material: "",
  omfattning: "",
  kostnadKr: "",
  avdragProcent: "",
  avdragAnledning: "",
  entreprenor: "",
  underhallBesiktning: "" as UnderhallBesiktningStatus | "",
  garantiAr: "2",
  ansvarAr: "10",
};

export function Renoveringshistorik({
  unlocked,
  activeComponents,
  foreslagnaKomponenter,
  onToggleKomponent,
  planStartAr,
  planLangdAr,
  planKostnader,
  grund,
  komponentDetaljer = {},
  onKomponentDetaljerChange,
  renoveringar,
  besiktningar,
  onBesiktningarChange,
  samfallighetsavgift,
  onSamfallighetsavgiftChange,
  antalLagenheter = 0,
  ventilationssystem = "",
  onOpenKomponent,
  onSammanfattningChange,
  onRenoveringarChange,
  saved,
  onSave,
}: RenoveringshistorikProps) {
  const allaKomponenter = foreslagnaKomponenter ?? activeComponents;
  const synligaKomponenter = activeComponents.filter((name) =>
    allaKomponenter.includes(name),
  );
  const komponentLista = synligaKomponenter.length > 0 ? synligaKomponenter : allaKomponenter;
  const [form, setForm] = useState(emptyForm);
  const [filterKomponent, setFilterKomponent] = useState<string>("alla");
  const [listRedigerarId, setListRedigerarId] = useState<string | null>(null);
  const [listDelForm, setListDelForm] = useState(tomRenoveringDelForm);
  const [listNastaArInputs, setListNastaArInputs] = useState<
    Record<string, string>
  >({});
  const [listKommandeAtgardOverrides, setListKommandeAtgardOverrides] =
    useState<Record<string, KommandeAtgardOverride>>({});
  const [listInkluderadeUnderkomponenter, setListInkluderadeUnderkomponenter] =
    useState<string[]>([]);

  const underkomponenterForForm = useMemo(() => {
    if (!form.komponent) return [];
    const mall = hamtaKomponentMall(form.komponent);
    return underkomponenterIRenoveringshistorik(mall, (ukId) =>
      renoveringar.some(
        (r) =>
          r.komponent === form.komponent &&
          (r.underkomponentId === ukId ||
            r.del === mall.underkomponenter.find((u) => u.id === ukId)?.etikett),
      ),
    );
  }, [form.komponent, renoveringar]);

  useEffect(() => {
    onSammanfattningChange?.(sammanstallRenoveringar(renoveringar));
  }, [renoveringar, onSammanfattningChange]);

  const visible = useMemo(() => {
    if (filterKomponent === "alla") return renoveringar;
    return renoveringar.filter((item) => item.komponent === filterKomponent);
  }, [renoveringar, filterKomponent]);

  function uppdateraRenoveringar(lista: UtfördRenovering[]) {
    onRenoveringarChange?.(lista);
  }

  function byggPostFranForm(): UtfördRenovering | null {
    const ar = Number.parseInt(form.ar, 10);
    if (!form.komponent || !form.titel.trim() || Number.isNaN(ar)) return null;

    const kostnad = form.kostnadKr.trim()
      ? Number.parseInt(form.kostnadKr.replace(/\s/g, ""), 10)
      : undefined;
    const avdragProcent = form.avdragProcent.trim()
      ? Number.parseFloat(form.avdragProcent.replace(",", "."))
      : undefined;
    const uk = underkomponenterForForm.find((u) => u.id === form.underkomponentId);

    return {
      id: createRenoveringId(),
      komponent: form.komponent,
      underkomponentId: uk?.id,
      del: uk?.etikett,
      ar,
      titel: form.titel.trim(),
      material: form.material.trim() || undefined,
      omfattning: form.omfattning.trim() || "—",
      kostnadKr: Number.isNaN(kostnad ?? NaN) ? undefined : kostnad,
      avdragProcent:
        avdragProcent !== undefined && Number.isFinite(avdragProcent)
          ? Math.min(100, Math.max(0, avdragProcent))
          : undefined,
      avdragAnledning: form.avdragAnledning.trim() || undefined,
      entreprenor: form.entreprenor.trim() || undefined,
      kalla: "styrelse",
    };
  }

  function addRenovering(event: React.FormEvent) {
    event.preventDefault();
    const post = byggPostFranForm();
    if (!post) return;
    uppdateraRenoveringar([...renoveringar, post]);
    setForm({
      ...emptyForm,
      komponent: form.komponent,
      underkomponentId: form.underkomponentId,
    });
  }

  function taBortRenovering(id: string) {
    if (listRedigerarId === id) avbrytListRedigera();
    uppdateraRenoveringar(renoveringar.filter((item) => item.id !== id));
  }

  function uppdateraRenovering(post: UtfördRenovering) {
    uppdateraRenoveringar(
      renoveringar.map((item) => (item.id === post.id ? post : item)),
    );
  }

  function avbrytListRedigera() {
    setListRedigerarId(null);
    setListDelForm(tomRenoveringDelForm());
    setListNastaArInputs({});
    setListKommandeAtgardOverrides({});
    setListInkluderadeUnderkomponenter([]);
  }

  function öppnaListRedigera(item: UtfördRenovering) {
    setListRedigerarId(item.id);
    setListDelForm(renoveringTillDelForm(item));
    const fordelningKontext = komponentDetaljer
      ? { komponentDetaljer }
      : undefined;
    const bas = forhandsvisaNastaAtgarder(
      item,
      planStartAr,
      planKostnader,
      fordelningKontext,
    );
    setListNastaArInputs(
      nastaArInputsFranOverrides(bas, item.nastaAtgardArOverrides),
    );
    setListKommandeAtgardOverrides(item.kommandeAtgardOverrides ?? {});
    const huvudUk = hamtaHuvudUnderkomponentIdForRenovering(
      item.komponent,
      item.underkomponentId,
    );
    setListInkluderadeUnderkomponenter(
      item.inkluderadeUnderkomponenter ??
        (huvudUk ? gissaInkluderadeUnderkomponenter(item, huvudUk) : []),
    );
  }

  const listUtkast = useMemo(() => {
    if (!listRedigerarId) return null;
    const befintlig = renoveringar.find((r) => r.id === listRedigerarId);
    if (!befintlig) return null;
    return delFormTillRenovering({
      form: listDelForm,
      komponent: befintlig.komponent,
      underkomponentId: befintlig.underkomponentId ?? "",
      del: befintlig.del ?? "",
      id: listRedigerarId,
      kalla: befintlig.kalla,
      nastaAtgardArOverrides: befintlig.nastaAtgardArOverrides,
      kommandeAtgardOverrides: listKommandeAtgardOverrides,
      inkluderadeUnderkomponenter: listInkluderadeUnderkomponenter,
    });
  }, [
    listRedigerarId,
    listDelForm,
    renoveringar,
    listKommandeAtgardOverrides,
    listInkluderadeUnderkomponenter,
  ]);

  const listFordelningKontext = komponentDetaljer
    ? { komponentDetaljer }
    : undefined;

  const listPlaneradeBas = useMemo(() => {
    if (!listUtkast || (listUtkast.kostnadKr ?? 0) <= 0) return [];
    return forhandsvisaNastaAtgarder(
      listUtkast,
      planStartAr,
      planKostnader,
      listFordelningKontext,
    );
  }, [listUtkast, planStartAr, planKostnader, listFordelningKontext]);

  const listPlanerade = useMemo(() => {
    if (!listUtkast || listPlaneradeBas.length === 0) return listPlaneradeBas;
    const overrides = nastaArOverridesFranInputs(
      listPlaneradeBas,
      listNastaArInputs,
    );
    return forhandsvisaNastaAtgarder(
      {
        ...listUtkast,
        nastaAtgardArOverrides: overrides,
        kommandeAtgardOverrides: listKommandeAtgardOverrides,
      },
      planStartAr,
      planKostnader,
      listFordelningKontext,
    );
  }, [
    listUtkast,
    listPlaneradeBas,
    listNastaArInputs,
    listKommandeAtgardOverrides,
    planStartAr,
    planKostnader,
    listFordelningKontext,
  ]);

  function sparaListRedigera(event: React.FormEvent) {
    event.preventDefault();
    if (!listRedigerarId) return;
    const befintlig = renoveringar.find((r) => r.id === listRedigerarId);
    if (!befintlig) return;
    const overrides = nastaArOverridesFranInputs(
      listPlaneradeBas,
      listNastaArInputs,
    );
    const atgardOverrides = kommandeAtgardOverridesFranState(
      listPlaneradeBas,
      listKommandeAtgardOverrides,
    );
    const post = delFormTillRenovering({
      form: listDelForm,
      komponent: befintlig.komponent,
      underkomponentId: befintlig.underkomponentId ?? "",
      del: befintlig.del ?? "",
      id: listRedigerarId,
      kalla: befintlig.kalla,
      nastaAtgardArOverrides: overrides,
      kommandeAtgardOverrides: atgardOverrides,
      inkluderadeUnderkomponenter:
        listInkluderadeUnderkomponenter.length > 0
          ? listInkluderadeUnderkomponenter
          : undefined,
    });
    if (!post) return;
    uppdateraRenovering(post);
    avbrytListRedigera();
  }

  const lockedClass = !unlocked ? "pointer-events-none opacity-50" : "";

  return (
    <div>
      <p className="text-sm leading-relaxed text-muted">
        Lägg in utförda arbeten med år och kostnad — plus besiktning efter åtgärd
        och obligatoriska besiktningar (OVK m.m.). Vid sparning förs uppgifterna
        över till komponentregistret; i steg 3 justerar du bara kommande underhåll.
      </p>

      {!unlocked && (
        <p className="mt-4 rounded-lg border border-dashed border-border bg-background px-4 py-3 text-sm text-muted">
          Spara grunduppgifterna i steg 1 först, sedan kan renoveringshistoriken fyllas i.
        </p>
      )}

      <div className={`mt-6 space-y-6 ${lockedClass}`}>
        {renoveringar.some((r) => (r.kostnadKr ?? 0) > 0) && planKostnader && (
          <p className="rounded-lg border border-primary/20 bg-[#eef6f0]/60 px-3 py-2 text-xs leading-relaxed text-foreground">
            Planeringsunderlag från steg 1: index per år, upphandling{" "}
            {planKostnader.upphandlingProcent}% och projektledning{" "}
            {planKostnader.projektledningProcent}% på entreprenadkostnaden.
            Branschregler läggs ovanpå vid planerat år — se utgifter i årsbudgeten
            (steg 6) och slutsidan.
          </p>
        )}

        {onToggleKomponent && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Välj komponenter — stäng av det som inte ingår
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
            {allaKomponenter.map((name) => {
              const isActive = activeComponents.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => onToggleKomponent(name)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-primary bg-[#e2f0e6] text-primary-dark"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  }`}
                >
                  {isActive ? "✓ " : ""}
                  {name}
                </button>
              );
            })}
            </div>
          </div>
        )}

        <RenoveringshistorikKomponentTräd
          komponenter={komponentLista}
          renoveringar={renoveringar}
          planStartAr={planStartAr}
          planKostnader={planKostnader}
          komponentDetaljer={komponentDetaljer}
          onLaggTill={(post) => uppdateraRenoveringar([...renoveringar, post])}
          onUppdatera={uppdateraRenovering}
          onTaBort={taBortRenovering}
        />

        {grund && onKomponentDetaljerChange && (
          <RenoveringYtaAiSektion
            grund={grund}
            activeComponents={activeComponents}
            komponentDetaljer={komponentDetaljer}
            onKomponentDetaljerChange={onKomponentDetaljerChange}
          />
        )}

        {besiktningar && onBesiktningarChange && (
          <UtfördaBesiktningarPanel
            lista={besiktningar}
            antalLagenheter={antalLagenheter}
            planLangdAr={planLangdAr}
            ventilationssystem={ventilationssystem}
            onChange={onBesiktningarChange}
          />
        )}

        {samfallighetsavgift && onSamfallighetsavgiftChange && (
          <SamfallighetsavgiftPanel
            avgift={samfallighetsavgift}
            onChange={onSamfallighetsavgiftChange}
          />
        )}

        {renoveringar.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-foreground">
              Filtrera komponent
              <select
                value={filterKomponent}
                onChange={(event) => setFilterKomponent(event.target.value)}
                className="ml-2 rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="alla">Alla</option>
                {allaKomponenter.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-sm text-muted">
              {visible.length} {visible.length === 1 ? "post" : "poster"}
            </p>
          </div>
        )}

        {visible.length > 0 ? (
          <ul className="space-y-3">
            {visible.map((item) => {
              const fordelningKontext = komponentDetaljer
                ? { komponentDetaljer }
                : undefined;
              const delar = fordelRenovering(item, fordelningKontext);
              const planerade = forhandsvisaNastaAtgarder(
                item,
                planStartAr,
                planKostnader,
                fordelningKontext,
              );
              const balkongMeta = formateraBalkongRenoveringMeta(item);
              const materialText = renoveringMaterialEtikett(item.material);
              return (
                <li
                  key={item.id}
                  className="rounded-xl border border-border bg-background p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted">
                        {item.komponent}
                        {item.del ? ` — ${item.del}` : ""} · {item.ar}
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-foreground">
                        {item.titel}
                      </h3>
                      {materialText && (
                        <p className="mt-1 text-xs font-medium text-primary-dark">
                          Material/ytskikt: {materialText}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {onOpenKomponent && (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenKomponent(
                              normaliseraRenoveringKomponent(item.komponent),
                            )
                          }
                          className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:border-primary/40"
                        >
                          Öppna i register
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          listRedigerarId === item.id
                            ? avbrytListRedigera()
                            : öppnaListRedigera(item)
                        }
                        className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:border-primary/40"
                      >
                        {listRedigerarId === item.id ? "Stäng" : "Redigera"}
                      </button>
                      <button
                        type="button"
                        onClick={() => taBortRenovering(item.id)}
                        className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted hover:border-red-300 hover:text-red-700"
                      >
                        Ta bort
                      </button>
                    </div>
                  </div>
                  {listRedigerarId === item.id && (
                    <div className="mt-4">
                      <RenoveringDelFormular
                        rubrik={`Redigera — ${item.komponent}${item.del ? ` / ${item.del}` : ""}`}
                        komponentNamn={item.komponent}
                        form={listDelForm}
                        onFormChange={setListDelForm}
                        visaStambyteKlumpsumma={
                          item.underkomponentId === "stambyte" ||
                          item.del?.toLowerCase().includes("stambyte") === true
                        }
                        visaBalkongFalt={
                          item.underkomponentId === BALKONGER_UNDERKOMPONENT_ID
                        }
                        balkongRegisterPoster={
                          item.underkomponentId === BALKONGER_UNDERKOMPONENT_ID
                            ? (komponentDetaljer?.Balkonger?.balkongRegister?.[
                                BALKONGER_UNDERKOMPONENT_ID
                              ] ?? [])
                            : undefined
                        }
                        besiktningRadioName={`list-bes-${item.id}`}
                        planerade={listPlanerade}
                        nastaArInputs={listNastaArInputs}
                        onNastaArChange={(id, ar) =>
                          setListNastaArInputs((c) => ({ ...c, [id]: ar }))
                        }
                        kommandeAtgardOverrides={listKommandeAtgardOverrides}
                        onKommandeAtgardOverrideChange={(id, override) =>
                          setListKommandeAtgardOverrides((c) => ({
                            ...c,
                            [id]: override,
                          }))
                        }
                        underkomponentId={item.underkomponentId}
                        inkluderadeUnderkomponenter={listInkluderadeUnderkomponenter}
                        onInkluderadeChange={setListInkluderadeUnderkomponenter}
                        utkastRenovering={listUtkast}
                        planKostnader={planKostnader}
                        redigerar
                        onSubmit={sparaListRedigera}
                        onAvbryt={avbrytListRedigera}
                      />
                    </div>
                  )}
                  {listRedigerarId !== item.id && (
                    <>
                      <p className="mt-2 text-sm text-muted">{item.omfattning}</p>
                      {materialText && (
                        <p className="mt-1 text-xs font-medium text-primary-dark">
                          Material/ytskikt: {materialText}
                        </p>
                      )}
                      {balkongMeta && (
                        <p className="mt-1 text-xs font-medium text-primary-dark">
                          {balkongMeta}
                        </p>
                      )}
                      {item.klumpsumma &&
                        (item.klumpsummaAntalBadrum != null ||
                          item.klumpsummaAntalKok != null ||
                          item.klumpsummaAntalWc != null) && (
                          <p className="mt-2 text-xs text-muted">
                            Klumpsumma avser: {item.klumpsummaAntalBadrum ?? 0} badrum,{" "}
                            {item.klumpsummaAntalKok ?? 0} kök, {item.klumpsummaAntalWc ?? 0}{" "}
                            WC
                          </p>
                        )}
                    </>
                  )}
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-muted">Kostnad</dt>
                      <dd className="font-medium text-foreground">
                        {formatKostnad(item.kostnadKr)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted">Engångskostnad (avdrag)</dt>
                      <dd className="font-medium text-foreground">
                        {(item.avdragProcent ?? 0) > 0
                          ? `${item.avdragProcent}%`
                          : "—"}
                      </dd>
                    </div>
                    {item.entreprenor && (
                      <div>
                        <dt className="text-muted">Entreprenör</dt>
                        <dd className="font-medium text-foreground">
                          {item.entreprenor}
                        </dd>
                      </div>
                    )}
                  </dl>
                  {item.avdragAnledning && (
                    <p className="mt-2 text-xs text-muted">
                      Avdrag: {item.avdragAnledning}
                    </p>
                  )}
                  {renoveringHarFordelning(item) && delar.length > 1 && (
                    <div className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2.5">
                      <p className="text-xs font-semibold text-amber-950">
                        Kostnad fördelad på delar
                      </p>
                      <ul className="mt-2 space-y-1.5 text-sm text-foreground">
                        {delar.map((del) => (
                          <li
                            key={del.renoveringId}
                            className="flex flex-wrap justify-between gap-x-3 gap-y-0.5"
                          >
                            <span>
                              {del.komponent} — {del.del}
                              <span className="text-muted">
                                {" "}
                                ({del.fordelningsNotering})
                              </span>
                            </span>
                            <span className="font-medium tabular-nums">
                              {formatKostnad(del.basKostnadKr)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {listRedigerarId !== item.id && planerade.length > 0 && (
                    <div className="mt-3 rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/50 px-3 py-2.5">
                      <p className="text-xs font-semibold text-primary-dark">
                        {planerade.length === 1
                          ? "Kommande åtgärd i underhållsplanen"
                          : `Kommande åtgärder i underhållsplanen (${planerade.length} delar)`}
                      </p>
                      <ul className="mt-2 space-y-2">
                        {planerade.map((planerad) => {
                          const avvikande =
                            item.kommandeAtgardOverrides?.[planerad.renoveringId]
                              ?.läge === "avvikande";
                          return (
                            <li
                              key={planerad.renoveringId}
                              className="text-sm text-foreground"
                            >
                              <strong>{planerad.titel}</strong> — nästa{" "}
                              <strong>{planerad.nastaAr}</strong>, uppskattat{" "}
                              {formatKostnad(planerad.uppskattadKostnadKr)}
                              {avvikande
                                ? " · annan åtgärd vald (redigera för att ändra)"
                                : ` (standard vart ${planerad.intervallAr}:e år)`}
                            </li>
                          );
                        })}
                      </ul>
                      <p className="mt-2 text-[10px] text-muted">
                        Klicka Redigera för att föreslå annan åtgärd (t.ex. målning).
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          unlocked && (
            <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted">
              Inga renoveringar ännu. Öppna en komponent ovan och lägg till per
              underkomponent.
            </p>
          )
        )}

        <form
          onSubmit={addRenovering}
          className="rounded-xl border border-dashed border-border bg-background/80 p-4 sm:p-5"
        >
          <p className="text-sm font-semibold text-foreground">
            Snabb inmatning (valfritt)
          </p>
          <p className="mt-1 text-xs text-muted">
            Alternativ till trädet ovan — välj komponent och gärna underkomponent.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-foreground">Komponent</span>
              <select
                required
                value={form.komponent}
                onChange={(event) =>
                  setForm({
                    ...emptyForm,
                    komponent: event.target.value,
                  })
                }
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="">Välj komponent</option>
                {komponentLista.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-foreground">
                Underkomponent
              </span>
              <select
                value={form.underkomponentId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    underkomponentId: event.target.value,
                  }))
                }
                disabled={!form.komponent || underkomponenterForForm.length === 0}
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary disabled:opacity-50"
              >
                <option value="">Hela komponenten</option>
                {underkomponenterForForm.map((uk) => (
                  <option key={uk.id} value={uk.id}>
                    {uk.etikett}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted">
                Valfritt — fakturor på utfört arbete behöver inte delas per
                underkomponent. Välj &quot;Hela komponenten&quot; om underlaget
                bara anger total kostnad.
              </p>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-foreground">År</span>
              <input
                type="number"
                required
                value={form.ar}
                onChange={(event) =>
                  setForm((current) => ({ ...current, ar: event.target.value }))
                }
                placeholder="t.ex. 2023"
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-foreground">Rubrik</span>
              <input
                required
                value={form.titel}
                onChange={(event) =>
                  setForm((current) => ({ ...current, titel: event.target.value }))
                }
                placeholder="t.ex. Stambyte etapp 2"
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
            {renoveringMaterialAlternativ(
              form.komponent,
              form.underkomponentId,
            ).length > 0 && (
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-foreground">
                  Material / ytskikt
                </span>
                <select
                  value={form.material}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      material: event.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                >
                  <option value="">Välj material / ytskikt</option>
                  {renoveringMaterialAlternativ(
                    form.komponent,
                    form.underkomponentId,
                  ).map((alt) => (
                    <option key={alt.id} value={alt.id}>
                      {alt.etikett}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-xs text-muted">
                  För papptak: välj bitumenbaserad tätskiktsmatta (takpapp).
                </span>
              </label>
            )}
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-foreground">Omfattning</span>
              <textarea
                value={form.omfattning}
                onChange={(event) =>
                  setForm((current) => ({ ...current, omfattning: event.target.value }))
                }
                rows={2}
                placeholder="Kort beskrivning av arbetet"
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-foreground">Kostnad (kr)</span>
              <input
                value={form.kostnadKr}
                onChange={(event) =>
                  setForm((current) => ({ ...current, kostnadKr: event.target.value }))
                }
                placeholder="t.ex. 450 000"
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-foreground">
                Avdrag engångskostnad (%)
              </span>
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={form.avdragProcent}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    avdragProcent: event.target.value,
                  }))
                }
                placeholder="t.ex. 20"
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-foreground">
                Anledning till avdrag
              </span>
              <input
                value={form.avdragAnledning}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    avdragAnledning: event.target.value,
                  }))
                }
                placeholder="t.ex. Hisschakt/etablering (engång)"
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-foreground">Entreprenör</span>
              <input
                value={form.entreprenor}
                onChange={(event) =>
                  setForm((current) => ({ ...current, entreprenor: event.target.value }))
                }
                placeholder="Valfritt"
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-4 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
          >
            Lägg till renovering
          </button>
        </form>

        {onSave && (
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <button
              type="button"
              onClick={onSave}
              disabled={!unlocked}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
            >
              Spara renoveringshistorik
            </button>
            {saved && (
              <p className="text-sm font-medium text-primary-dark">
                Sparat — gå vidare till komponentregistret (steg 3).
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
