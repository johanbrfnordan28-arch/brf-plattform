"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { OppnaStangKnapp } from "@/components/OppnaStangKnapp";
import { Besiktningar } from "@/components/underhallsplan/BesiktningarSteg";
import { BildstodAnalys } from "@/components/underhallsplan/BildstodAnalys";
import { Renoveringshistorik } from "@/components/underhallsplan/Renoveringshistorik";
import { TestplanValjare } from "@/components/underhallsplan/TestplanValjare";
import { UnderhallsplanBudget } from "@/components/underhallsplan/UnderhallsplanBudget";
import { KommandeProjektSteg } from "@/components/underhallsplan/KommandeProjektSteg";
import { UnderhallsplanSlutsida } from "@/components/underhallsplan/UnderhallsplanSlutsida";
import { PLAN_BEGREPP } from "@/components/underhallsplan/plan-terminologi";
import {
  skapaStandardBesiktningar,
  synkaNastaBesiktningFranUtfört,
  tillampaOvkIntervallFromVentilation,
  type Besiktning,
} from "@/components/underhallsplan/besiktningar";
import {
  appliceraRenoveringarPaKomponentregister,
  komponenterFranRenoveringar,
} from "@/components/underhallsplan/renovering-till-register";
import {
  sattFasadYtaIKomponent,
  sattTakYtaIKomponent,
} from "@/components/underhallsplan/register-ytor";
import {
  foreslagnaKomponenter,
  synkaUnderhallsplanState,
  type KomponentDetaljData,
} from "@/components/underhallsplan/komponentregister";
import { KomponentRegisterLista } from "@/components/underhallsplan/KomponentRegisterLista";
import { GrundByggnadAdressPanel } from "@/components/underhallsplan/GrundByggnadAdressPanel";
import { GrundFasaderPanel } from "@/components/underhallsplan/GrundFasaderPanel";
import { GrundFasaderPaminnelse } from "@/components/underhallsplan/GrundFasaderPaminnelse";
import { GrundFastighetsYtorPanel } from "@/components/underhallsplan/GrundFastighetsYtorPanel";
import {
  hamtaByggnadAdresser,
  uppdateraGrundAntalByggnader,
} from "@/components/underhallsplan/grund-byggnad-adress";
import { Steg1YtaAiHjalp } from "@/components/underhallsplan/Steg1YtaAiHjalp";
import { KommandeUnderhallSammanfattning } from "@/components/underhallsplan/KommandeUnderhallSammanfattning";
import {
  PlanKostnadsparametrarPanel,
  synkaPlaninstallningarIndex,
} from "@/components/underhallsplan/PlanKostnadsparametrarPanel";
import { normaliseraPlanKostnader } from "@/components/underhallsplan/plan-kostnader";
import { arTillatenTestplanForForening, hamtaTillgangligaTestplaner } from "@/components/underhallsplan/testplan-for-forening";
import {
  hamtaTestplan,
  type TestplanDefinition,
  type TestplanId,
} from "@/components/underhallsplan/testplaner";
import {
  arGrundmallForening,
  FORENING_AKTIV_EVENT,
  hamtaAktivForeningsNamn,
  lasAktivForeningId,
  lasForeningProfil,
} from "@/lib/forening-registry";
import {
  appliceraSailorGrund,
  arSailorForening,
  SAILOR_PLAN_START_AR,
  SAILOR_VARDERING_UNDERLAG,
} from "@/lib/sailor-forening";
import { byggSailorKomponentUtkast } from "@/lib/sailor-underhallsplan-utkast";
import {
  importeraSaknadeKomponenterFranGrundmall,
  lasGrundmallUnderhallsplanState,
} from "@/components/underhallsplan/importera-fran-grundmall";
import {
  appliceraImporteradeKomponentVarden,
  type ImporteradUnderhallsplanExcel,
} from "@/components/underhallsplan/importera-underhallsplan-excel";
import {
  ForeningPlanLagePanel,
  type ForeningPlanLage,
} from "@/components/underhallsplan/ForeningPlanLagePanel";
import { sattTillfalleTotalKostnad } from "@/components/underhallsplan/plan-underhall-tidslista";
import {
  maxPlanLangdAr,
  minPlanLangdAr,
  normaliseraPlaninstallningar,
  normaliseraPlanLangdAr,
  normaliseraPlanStartAr,
  standardPlaninstallningar,
  standardPlanLangdAr,
  type Planinstallningar,
} from "@/components/underhallsplan/planinstallningar";
import type { UtfördRenovering } from "@/components/underhallsplan/renoveringar";
import {
  normaliseraSamfallighetsavgift,
  skapaStandardSamfallighetsavgift,
  type Samfallighetsavgift,
} from "@/components/underhallsplan/samfallighetsavgift";
import type {
  Grunduppgifter,
  RenoveringSammanfattning,
} from "@/components/underhallsplan/types";
import {
  GRUNDUPPGIFTER_ANNAT_ID,
  grunduppgiftAnnanText,
  grunduppgiftFranVal,
  grunduppgiftValId,
  uppvarmningAlternativ,
  ventilationssystemAlternativ,
  type GrunduppgiftAlternativ,
} from "@/components/underhallsplan/grunduppgifter-val";
import {
  hamtaAvsattningsYtaM2,
  parseHeltalFranText,
} from "@/components/underhallsplan/parse-grundtal";
import {
  beraknaForeslagenAvsattningKrPerKvmAr,
  begransaAvsattningKrPerKvmAr,
  TYPISK_AVSATTNING_KR_PER_KVM,
  summaPlaneradeInvesteringar,
} from "@/components/underhallsplan/plan-budget-sammanfattning";
import { samlaAllaUnderhallAtgarder } from "@/components/underhallsplan/underhall-budget";
import {
  harUnderhallsplanSparat,
  lasUnderhallsplanState,
  rensaUnderhallsplanState,
  sparaUnderhallsplanState,
  type UnderhallsplanLagratState,
} from "@/components/underhallsplan/underhallsplan-lager";
import {
  appliceraKontaktPaGrund,
  hamtaStyrelseKontakt,
  markeraGrundinfoPaborjad,
  planNamnFranKontakt,
} from "@/lib/styrelse-kontakt";
import { VerksamhetsLokalerPanel } from "@/components/underhallsplan/VerksamhetsLokalerPanel";
import {
  besiktningarBehoverGrundSynk,
  hamtaAntalLagenheterFranGrund,
  hamtaAntalVerksamhetslokaler,
  normaliseraGrund,
  planNamnFranForeningsnamn,
  registerBehoverLagenhetsSynk,
  synkaBesiktningarMedGrund,
  synkaRegisterMedAntalLagenheter,
  uppdateraPlanTitelMedLagenheter,
} from "@/components/underhallsplan/grund-synk";

const empty: Grunduppgifter = {
  boarea: "",
  lokalyta: "",
  lokaler: [],
  antalLagenheter: "",
  byggar: "",
  tomtstorlek: "",
  antalVaningar: "",
  antalByggnader: "1",
  adresser: [""],
  uppvarmning: "",
  ventilationssystem: "",
  fastighetsbeteckning: "",
};

const grundFieldKeys = [
  "boarea",
  "lokalyta",
  "antalLagenheter",
  "byggar",
  "tomtstorlek",
  "antalVaningar",
  "antalByggnader",
  "uppvarmning",
  "ventilationssystem",
  "fastighetsbeteckning",
] as const;

type GrundFieldKey = (typeof grundFieldKeys)[number];

const grundFields: {
  key: GrundFieldKey;
  label: string;
  placeholder: string;
  type?: string;
  hint?: string;
  showOvk?: boolean;
  selectAlternativ?: GrunduppgiftAlternativ[];
}[] = [
  { key: "boarea", label: "Boarea (m²)", placeholder: "t.ex. 4 200" },
  { key: "lokalyta", label: "Lokalyta (m²)", placeholder: "t.ex. 180" },
  {
    key: "antalLagenheter",
    label: "Antal lägenheter",
    placeholder: "t.ex. 48",
    type: "number",
    hint: "Styr summering, OVK bostäder och stambyte — uppdateras automatiskt i registret.",
  },
  { key: "byggar", label: "Byggår", placeholder: "t.ex. 1968", type: "number" },
  {
    key: "tomtstorlek",
    label: "Tomtstorlek (m²)",
    placeholder: "t.ex. 2 500",
    hint: "Markyta som föreningen ansvarar för.",
  },
  {
    key: "antalVaningar",
    label: "Antal våningar",
    placeholder: "t.ex. 5",
    type: "number",
  },
  {
    key: "uppvarmning",
    label: "Uppvärmning",
    placeholder: "Välj uppvärmningssystem",
    selectAlternativ: uppvarmningAlternativ,
  },
  {
    key: "ventilationssystem",
    label: "Ventilationssystem",
    placeholder: "Välj ventilationssystem",
    hint: "Vanligast är F (frånluftsfläkt + fönsterventiler). OVK-intervall: S/F/FX 6 år, FT/FTX 3 år.",
    showOvk: true,
    selectAlternativ: ventilationssystemAlternativ,
  },
  {
    key: "fastighetsbeteckning",
    label: "Fastighetsbeteckning",
    placeholder: "t.ex. Stockholm Exempel 1:1",
    hint: "Underlättar när handlingar och offerter kopplas till rätt fastighet.",
  },
];

const defaultKrPerKvmAr = 45;

const allaForeslagnaKomponenter = [...foreslagnaKomponenter];

function renoveringarListaLik(
  a: UtfördRenovering[],
  b: UtfördRenovering[],
): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (item, i) =>
      item.id === b[i]?.id &&
      item.ar === b[i]?.ar &&
      item.kostnadKr === b[i]?.kostnadKr &&
      item.titel === b[i]?.titel &&
      item.komponent === b[i]?.komponent &&
      item.underkomponentId === b[i]?.underkomponentId &&
      item.del === b[i]?.del &&
      item.avdragProcent === b[i]?.avdragProcent,
  );
}

type WizardStegId =
  | "grund"
  | "renoveringar"
  | "register"
  | "besiktningar"
  | "bildstod"
  | "arsbudget"
  | "slutsida"
  | "kommandeProjekt";

const WIZARD_STEG_META: Record<
  WizardStegId,
  { stegNummer: number; titel: string }
> = {
  grund: { stegNummer: 1, titel: "Grunduppgifter" },
  renoveringar: { stegNummer: 2, titel: "Utförda arbeten" },
  register: { stegNummer: 3, titel: "Kommande underhåll" },
  besiktningar: { stegNummer: 4, titel: "Schema besiktningar" },
  bildstod: { stegNummer: 5, titel: "Bildstöd" },
  arsbudget: { stegNummer: 6, titel: PLAN_BEGREPP.arsbudgetSteg },
  slutsida: { stegNummer: 7, titel: "Slutsida" },
  kommandeProjekt: { stegNummer: 8, titel: "Kommande projekt" },
};

type StegLasStatus = {
  grundSaved: boolean;
  renoveringarSaved: boolean;
  komponenterSaved: boolean;
  besiktningarSaved: boolean;
};

function hamtaStegLasOrsak(
  id: WizardStegId,
  status: StegLasStatus,
): string | null {
  switch (id) {
    case "grund":
      return null;
    case "renoveringar":
    case "slutsida":
    case "kommandeProjekt":
      return status.grundSaved
        ? null
        : "Spara grunduppgifter i steg 1 (Grunduppgifter) innan detta steg kan öppnas.";
    case "register":
      return status.renoveringarSaved
        ? null
        : "Spara utförda arbeten i steg 2 innan komponentregistret kan öppnas.";
    case "besiktningar":
    case "bildstod":
      return status.komponenterSaved
        ? null
        : "Spara komponentregistret i steg 3 (Kommande underhåll) innan detta steg kan öppnas.";
    case "arsbudget":
      return status.besiktningarSaved
        ? null
        : "Spara schemat för besiktningar i steg 4 innan årsbudgeten kan öppnas.";
    default:
      return null;
  }
}

type StegNavFel =
  | { typ: "las"; targetId: WizardStegId; text: string }
  | {
      typ: "annat-oppet";
      targetId: WizardStegId;
      oppnetStegId: WizardStegId;
      text: string;
    };

function StegPanel({
  id,
  stegNummer,
  titel,
  summary,
  isOpen,
  alwaysOpen = false,
  lasOrsak = null,
  navFeedback = null,
  visaStangOchBytKnapp = false,
  blockerarAndra = false,
  hideInPrint = false,
  skrivskyddad = false,
  onToggle,
  onStangOchOppna,
  children,
}: {
  id: WizardStegId;
  stegNummer: number;
  titel: string;
  summary?: string;
  isOpen: boolean;
  alwaysOpen?: boolean;
  lasOrsak?: string | null;
  navFeedback?: string | null;
  visaStangOchBytKnapp?: boolean;
  blockerarAndra?: boolean;
  hideInPrint?: boolean;
  /** Tillåter öppna/stäng steg men blockerar redigering i innehållet. */
  skrivskyddad?: boolean;
  onToggle: (id: WizardStegId) => void;
  onStangOchOppna?: (id: WizardStegId) => void;
  children: React.ReactNode;
}) {
  const open = alwaysOpen ? true : isOpen;
  const isLocked = Boolean(lasOrsak);
  const kanBytaDirekt = Boolean(onStangOchOppna && visaStangOchBytKnapp);

  return (
    <section
      id={id}
      className={`scroll-mt-24 rounded-2xl border bg-surface shadow-sm transition-colors ${
        open
          ? "border-primary/35 p-6 sm:p-8 ring-1 ring-primary/10"
          : "border-border p-4 sm:p-5"
      } ${hideInPrint ? "print:hidden" : ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-primary-dark">
            Steg {stegNummer}
            {skrivskyddad ? " · Skrivskyddad" : ""}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-foreground">{titel}</h2>
          {!open && summary && (
            <p className="mt-2 text-sm leading-relaxed text-muted">{summary}</p>
          )}
          {open && (
            <p className="mt-2 text-xs text-muted">
              Öppna ett annat steg när som helst — det här stängs automatiskt.
            </p>
          )}
          {isLocked && lasOrsak && (
            <p className="mt-2 text-xs font-medium text-amber-800">{lasOrsak}</p>
          )}
        </div>
        {!alwaysOpen && (
          <div className="flex shrink-0 flex-col items-end gap-2">
            {isLocked ? (
              <span className="rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs font-semibold text-amber-950">
                Låst steg
              </span>
            ) : (
              <OppnaStangKnapp
                oppen={open}
                onClick={() => onToggle(id)}
                ariaLabel={
                  open ? `Stäng steg ${stegNummer}: ${titel}` : `Öppna steg ${stegNummer}: ${titel}`
                }
              />
            )}
          </div>
        )}
      </div>

      {navFeedback && (
        <div
          role="alert"
          className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-950"
        >
          <p>{navFeedback}</p>
          {kanBytaDirekt && onStangOchOppna && (
            <button
              type="button"
              onClick={() => onStangOchOppna(id)}
              className="mt-2 text-sm font-semibold text-primary-dark underline decoration-primary/50 hover:decoration-primary"
            >
              Stäng nuvarande steg och öppna detta
            </button>
          )}
        </div>
      )}

      {open && (
        <div
          id={`${id}-innehall`}
          className="mt-6"
          {...(skrivskyddad ? { inert: true } : {})}
        >
          {children}
        </div>
      )}
    </section>
  );
}

function GrunduppgiftSelect({
  label,
  hint,
  value,
  alternativ,
  placeholder,
  showOvk,
  onChange,
  onToggleOvk,
  visarOvk,
  ovkSystemText,
}: {
  label: string;
  hint?: string;
  value: string;
  alternativ: GrunduppgiftAlternativ[];
  placeholder: string;
  showOvk?: boolean;
  onChange: (value: string) => void;
  onToggleOvk?: () => void;
  visarOvk?: boolean;
  ovkSystemText?: string;
}) {
  const valId = grunduppgiftValId(value, alternativ);
  const annanText = grunduppgiftAnnanText(value, alternativ);
  const valt = alternativ.find((alt) => alt.id === valId);

  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <select
        value={valId}
        onChange={(event) => {
          const nextId = event.target.value;
          onChange(grunduppgiftFranVal(nextId, annanText, alternativ));
        }}
        className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
      >
        <option value="">{placeholder}</option>
        {alternativ.map((alt) => (
          <option key={alt.id} value={alt.id}>
            {alt.etikett}
          </option>
        ))}
      </select>
      {valt?.beskrivning && valId !== GRUNDUPPGIFTER_ANNAT_ID && (
        <span className="mt-1 block text-xs text-muted">{valt.beskrivning}</span>
      )}
      {valId === GRUNDUPPGIFTER_ANNAT_ID && (
        <input
          type="text"
          value={annanText}
          onChange={(event) =>
            onChange(grunduppgiftFranVal(GRUNDUPPGIFTER_ANNAT_ID, event.target.value, alternativ))
          }
          placeholder="Beskriv systemet"
          className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
      )}
      {hint && (
        <span className="mt-1 block text-xs text-muted">{hint}</span>
      )}
      {showOvk && onToggleOvk && (
        <>
          <button
            type="button"
            onClick={onToggleOvk}
            className="mt-2 text-sm font-medium text-primary hover:text-primary-dark"
          >
            {visarOvk ? "Dölj OVK-protokoll" : "Visa OVK-protokoll"}
          </button>
          {visarOvk && (
            <div className="mt-2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted">
              <p className="font-medium text-foreground">OVK-protokoll</p>
              <p className="mt-1">
                System: {ovkSystemText || "—"} · Senaste kontroll: godkänd · OVK-intervall
                enligt ventilationstyp (S/F/FX: 6 år, FT/FTX: 3 år i flerbostadshus).
              </p>
            </div>
          )}
        </>
      )}
    </label>
  );
}

export function UnderhallsplanWizard() {
  const [grund, setGrund] = useState<Grunduppgifter>(empty);
  const [planinstallningar, setPlaninstallningar] = useState<Planinstallningar>(
    standardPlaninstallningar,
  );
  const [grundSaved, setGrundSaved] = useState(false);
  const [visarOvk, setVisarOvk] = useState(false);
  const [renoveringarSaved, setRenoveringarSaved] = useState(false);
  const [komponenterSaved, setKomponenterSaved] = useState(false);
  const [besiktningar, setBesiktningar] = useState<Besiktning[]>(skapaStandardBesiktningar);
  const [besiktningarSaved, setBesiktningarSaved] = useState(false);
  const [samfallighetsavgift, setSamfallighetsavgift] = useState<Samfallighetsavgift>(
    skapaStandardSamfallighetsavgift,
  );
  const initialKomponentState = synkaUnderhallsplanState(allaForeslagnaKomponenter, {});
  const [activeComponents, setActiveComponents] = useState<string[]>(
    initialKomponentState.activeComponents,
  );
  const [komponentDetaljer, setKomponentDetaljer] = useState<
    Record<string, KomponentDetaljData>
  >(() => initialKomponentState.register);
  const [customComponent, setCustomComponent] = useState("");
  const [krPerKvmAr, setKrPerKvmAr] = useState(defaultKrPerKvmAr);
  const [aktivTestplan, setAktivTestplan] = useState<TestplanId | null>(null);
  const [planNamn, setPlanNamn] = useState<string | null>(null);
  const [planNotering, setPlanNotering] = useState<string | null>(null);
  const [renoveringSammanfattning, setRenoveringSammanfattning] =
    useState<RenoveringSammanfattning | null>(null);
  const [renoveringarLista, setRenoveringarLista] = useState<UtfördRenovering[]>(
    [],
  );
  const [senastTillagdKomponent, setSenastTillagdKomponent] = useState<string | null>(
    null,
  );
  const [sparadTid, setSparadTid] = useState<string | null>(null);
  const [sparFel, setSparFel] = useState<string | null>(null);
  const [laddatFranLager, setLaddatFranLager] = useState(false);
  const [harOsparadeAndringar, setHarOsparadeAndringar] = useState(false);
  const [tillgangligaTestplaner, setTillgangligaTestplaner] = useState<
    TestplanDefinition[]
  >([]);
  const [demoVarning, setDemoVarning] = useState<string | null>(null);
  const [planLage, setPlanLage] = useState<ForeningPlanLage>("forening");
  const [grundmallTom, setGrundmallTom] = useState(false);
  const [varderingsUnderlag, setVarderingsUnderlag] = useState<
    import("@/components/underhallsplan/fastighets-vardering").FastighetsVarderingsUnderlag | null
  >(null);
  const skipAutosparRef = useRef(true);
  const renoveringarListaRef = useRef(renoveringarLista);
  renoveringarListaRef.current = renoveringarLista;

  function appliceraLagratState(state: UnderhallsplanLagratState) {
    setGrund(normaliseraGrund(state.grund));
    setPlaninstallningar(normaliseraPlaninstallningar(state.planinstallningar));
    setGrundSaved(state.grundSaved);
    setRenoveringarSaved(state.renoveringarSaved);
    setKomponenterSaved(state.komponenterSaved);
    setBesiktningarSaved(state.besiktningarSaved);
    setActiveComponents(state.activeComponents);
    setKomponentDetaljer(state.komponentDetaljer);
    setBesiktningar(state.besiktningar);
    setSamfallighetsavgift(normaliseraSamfallighetsavgift(state.samfallighetsavgift));
    setRenoveringarLista(state.renoveringarLista);
    setRenoveringSammanfattning(state.renoveringSammanfattning);
    setKrPerKvmAr(begransaAvsattningKrPerKvmAr(state.krPerKvmAr));
    setAktivTestplan(state.aktivTestplan);
    setPlanNamn(state.planNamn);
    setPlanNotering(state.planNotering);
    setSparadTid(state.sparad);
    setSenastTillagdKomponent(state.activeComponents[0] ?? null);
    setVarderingsUnderlag(state.varderingsUnderlag ?? null);
  }

  function uppdateraTillgangligaTestplaner() {
    const foreningId = lasAktivForeningId();
    setTillgangligaTestplaner(hamtaTillgangligaTestplaner(foreningId));
  }

  useEffect(() => {
    uppdateraTillgangligaTestplaner();
    window.addEventListener(FORENING_AKTIV_EVENT, uppdateraTillgangligaTestplaner);
    return () =>
      window.removeEventListener(FORENING_AKTIV_EVENT, uppdateraTillgangligaTestplaner);
  }, []);

  useEffect(() => {
    const foreningId = lasAktivForeningId();
    const profil = lasForeningProfil(foreningId);
    let sparad = lasUnderhallsplanState();
    if (sparad && arSailorForening(foreningId)) {
      const grund = normaliseraGrund(appliceraSailorGrund(sparad.grund));
      const lgh = hamtaAntalLagenheterFranGrund(grund);
      const utkast = byggSailorKomponentUtkast();
      sparad = {
        ...sparad,
        grund,
        planNamn:
          planNamnFranForeningsnamn(
            "Bostadsrättsföreningen Trazie",
            lgh,
          ) ?? sparad.planNamn,
        planNotering: utkast.planNotering,
        activeComponents: utkast.activeComponents,
        komponentDetaljer: utkast.komponentDetaljer,
        samfallighetsavgift: utkast.samfallighetsavgift,
        besiktningar: utkast.besiktningar,
        krPerKvmAr: utkast.krPerKvmAr,
        varderingsUnderlag: SAILOR_VARDERING_UNDERLAG,
        planinstallningar: normaliseraPlaninstallningar({
          ...(sparad.planinstallningar ?? standardPlaninstallningar()),
          planStartAr: String(SAILOR_PLAN_START_AR),
        }),
        grundSaved: true,
        komponenterSaved: true,
        besiktningarSaved: true,
      };
      sparaUnderhallsplanState(sparad, foreningId);
    }
    if (sparad) {
      if (
        sparad.aktivTestplan &&
        !arTillatenTestplanForForening(sparad.aktivTestplan, foreningId)
      ) {
        // Epokmall-id ska inte sitta kvar på föreningsplaner — innehållet är deras plan.
        const rensad = { ...sparad, aktivTestplan: null as TestplanId | null };
        appliceraLagratState(rensad);
        if (!arGrundmallForening(foreningId)) {
          sparaUnderhallsplanState(rensad, foreningId);
        }
      } else {
        appliceraLagratState(sparad);
      }
      // Slutsidan ska visa den aktiva föreningens namn — inte demoplanens titel.
      if (!arGrundmallForening(foreningId)) {
        const foreningsnamn =
          hamtaStyrelseKontakt(foreningId)?.foreningsnamn ||
          profil?.namn ||
          hamtaAktivForeningsNamn();
        const lgh = hamtaAntalLagenheterFranGrund(
          normaliseraGrund(sparad.grund),
        );
        const synkat = planNamnFranForeningsnamn(foreningsnamn, lgh);
        if (synkat) {
          setPlanNamn(synkat);
          if (synkat !== sparad.planNamn) {
            sparaUnderhallsplanState({ ...sparad, planNamn: synkat });
          }
        }
      }
    } else {
      const kontakt = hamtaStyrelseKontakt();
      if (kontakt) {
        setGrund((current) => {
          const medKontakt = appliceraKontaktPaGrund(current, kontakt);
          return arSailorForening(foreningId)
            ? appliceraSailorGrund(medKontakt)
            : medKontakt;
        });
        setPlanNamn(planNamnFranKontakt(kontakt));
      }
    }
    setLaddatFranLager(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- endast vid mount
  }, []);

  useEffect(() => {
    if (!laddatFranLager) return;
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash === "#slutsida") {
      stangOchOppnaSteg("slutsida");
    } else if (hash === "#grund") {
      setOpenSteg("grund");
      window.setTimeout(() => {
        document.getElementById("grund")?.scrollIntoView({ behavior: "smooth" });
      }, 80);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hash-navigering vid mount
  }, [laddatFranLager]);

  useEffect(() => {
    if (!laddatFranLager) return;
    const grundNorm = normaliseraGrund(grund);
    const lgh = hamtaAntalLagenheterFranGrund(grundNorm);

    if (lgh > 0 && registerBehoverLagenhetsSynk(lgh, komponentDetaljer)) {
      setKomponentDetaljer((current) =>
        synkaRegisterMedAntalLagenheter(lgh, current),
      );
    }

    if (besiktningarBehoverGrundSynk(besiktningar, grundNorm, lgh)) {
      setBesiktningar((current) =>
        synkaBesiktningarMedGrund(current, grundNorm, lgh),
      );
    }

    if (planNamn) {
      const titel = uppdateraPlanTitelMedLagenheter(planNamn, lgh);
      if (titel !== planNamn) setPlanNamn(titel);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- synka register/besiktningar vid ändrad grund
  }, [
    laddatFranLager,
    grund.antalLagenheter,
    grund.lokaler,
  ]);

  function byggLagratState(): UnderhallsplanLagratState {
    return {
      version: 1,
      sparad: new Date().toISOString(),
      aktivTestplan,
      planNamn,
      planNotering,
      grund,
      planinstallningar,
      grundSaved,
      renoveringarSaved,
      komponenterSaved,
      besiktningarSaved,
      activeComponents,
      komponentDetaljer,
      besiktningar,
      samfallighetsavgift,
      renoveringarLista,
      renoveringSammanfattning,
      krPerKvmAr: begransaAvsattningKrPerKvmAr(krPerKvmAr),
      // Behåll underlaget i lagring men visa det aldrig i UI/PDF
      varderingsUnderlag: varderingsUnderlag ?? undefined,
    };
  }

  function sparaUppdateringar(): boolean {
    if (planLage === "grundmall" && !arGrundmallForening()) {
      return false;
    }
    const state = byggLagratState();
    const result = sparaUnderhallsplanState(state);
    if (result.ok) {
      setSparadTid(result.sparad);
      setSparFel(null);
      setHarOsparadeAndringar(false);
      return true;
    }
    setSparFel(result.message);
    return false;
  }

  useEffect(() => {
    if (!laddatFranLager) return;
    if (planLage === "grundmall" && !arGrundmallForening()) return;
    if (skipAutosparRef.current) {
      skipAutosparRef.current = false;
      return;
    }
    setHarOsparadeAndringar(true);
    const timer = window.setTimeout(() => {
      sparaUppdateringar();
    }, 800);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounced autospar av hela wizarden
  }, [
    laddatFranLager,
    planLage,
    grund,
    planinstallningar,
    grundSaved,
    renoveringarSaved,
    komponenterSaved,
    besiktningarSaved,
    activeComponents,
    komponentDetaljer,
    besiktningar,
    samfallighetsavgift,
    renoveringarLista,
    renoveringSammanfattning,
    krPerKvmAr,
    aktivTestplan,
    planNamn,
    planNotering,
    varderingsUnderlag,
  ]);

  useEffect(() => {
    if (!laddatFranLager || !harOsparadeAndringar) return;
    function varna(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", varna);
    return () => window.removeEventListener("beforeunload", varna);
  }, [laddatFranLager, harOsparadeAndringar]);

  function appliceraKomponentSynk(
    active: string[],
    register: Record<string, KomponentDetaljData>,
  ) {
    const synced = synkaUnderhallsplanState(active, register);
    setActiveComponents(synced.activeComponents);
    setKomponentDetaljer(synced.register);
  }

  function laddaTestplan(id: TestplanId) {
    const foreningId = lasAktivForeningId();
    if (!arTillatenTestplanForForening(id, foreningId)) {
      return;
    }
    if (
      laddatFranLager &&
      harUnderhallsplanSparat() &&
      !window.confirm(
        "Du har sparade uppdateringar. Ladda testplan och ersätt allt sparat innehåll?",
      )
    ) {
      return;
    }
    setDemoVarning(null);
    const plan = hamtaTestplan(id);
    const foreningsnamn = arGrundmallForening(foreningId)
      ? plan.namn
      : hamtaStyrelseKontakt(foreningId)?.foreningsnamn ||
        lasForeningProfil(foreningId)?.namn ||
        hamtaAktivForeningsNamn() ||
        plan.namn;
    setGrund(normaliseraGrund(plan.grund));
    setSenastTillagdKomponent(plan.activeComponents[0] ?? null);
    setBesiktningar(plan.besiktningar);
    setKrPerKvmAr(plan.krPerKvmAr);
    setPlaninstallningar(normaliseraPlaninstallningar(plan.planinstallningar));
    setRenoveringarLista([]);
    setRenoveringSammanfattning(null);
    setPlanNamn(
      planNamnFranForeningsnamn(
        foreningsnamn,
        hamtaAntalLagenheterFranGrund(plan.grund),
      ) ?? plan.namn,
    );
    setPlanNotering(plan.planNotering ?? null);
    setAktivTestplan(id);
    setGrundSaved(true);
    setRenoveringarSaved(false);
    appliceraKomponentSynk(
      plan.activeComponents,
      synkaUnderhallsplanState(plan.activeComponents, plan.komponentDetaljer ?? {})
        .register,
    );
    setKomponenterSaved(false);
    setBesiktningarSaved(false);
    rensaUnderhallsplanState();
    setSparadTid(null);
  }

  const handleRenoveringSammanfattning = useCallback(
    (sammanfattning: RenoveringSammanfattning) => {
      setRenoveringSammanfattning(sammanfattning);
    },
    [],
  );

  const handleRenoveringarLista = useCallback((lista: UtfördRenovering[]) => {
    if (renoveringarListaLik(renoveringarListaRef.current, lista)) return;
    setRenoveringarSaved(false);
    setKomponenterSaved(false);
    setBesiktningarSaved(false);
    setRenoveringarLista(lista);
  }, []);

  const planStartAr = normaliseraPlanStartAr(planinstallningar.planStartAr);
  const planLangdAr = normaliseraPlanLangdAr(planinstallningar.planLangdAr);

  const planKostnader = useMemo(
    () => normaliseraPlanKostnader(planinstallningar),
    [planinstallningar],
  );

  function uppdateraPlaninstallningar(patch: Partial<Planinstallningar>) {
    setPlaninstallningar((current) =>
      synkaPlaninstallningarIndex({ ...current, ...patch }),
    );
    setGrundSaved(false);
    setRenoveringarSaved(false);
    setBesiktningarSaved(false);
  }

  function rensaTestplan() {
    setDemoVarning(null);
    const kontakt = hamtaStyrelseKontakt();
    const nyGrund = kontakt ? appliceraKontaktPaGrund(empty, kontakt) : empty;
    setGrund(nyGrund);
    setPlaninstallningar(standardPlaninstallningar());
    setGrundSaved(false);
    setRenoveringarSaved(false);
    setKomponenterSaved(false);
    setBesiktningarSaved(false);
    appliceraKomponentSynk(allaForeslagnaKomponenter, {});
    setBesiktningar(skapaStandardBesiktningar());
    setKrPerKvmAr(defaultKrPerKvmAr);
    setPlanNamn(kontakt ? planNamnFranKontakt(kontakt) : null);
    setPlanNotering(null);
    setRenoveringSammanfattning(null);
    setRenoveringarLista([]);
    setAktivTestplan(null);
    setSenastTillagdKomponent(null);
    rensaUnderhallsplanState();
    setSparadTid(null);
  }

  function visaForeningsplan() {
    if (planLage === "forening") return;
    skipAutosparRef.current = true;
    setGrundmallTom(false);
    const sparad = lasUnderhallsplanState();
    if (sparad) {
      appliceraLagratState(sparad);
    }
    setPlanLage("forening");
    setHarOsparadeAndringar(false);
  }

  function visaGrundmallSkrivskyddad() {
    if (arGrundmallForening()) return;
    // Spara föreningens arbete innan vi byter till mallvisning
    if (planLage === "forening") {
      sparaUppdateringar();
    }
    skipAutosparRef.current = true;
    const mall = lasGrundmallUnderhallsplanState();
    if (mall) {
      setGrundmallTom(false);
      appliceraLagratState(mall);
    } else {
      setGrundmallTom(true);
      setGrund(empty);
      setPlaninstallningar(standardPlaninstallningar());
      setGrundSaved(false);
      setRenoveringarSaved(false);
      setKomponenterSaved(false);
      setBesiktningarSaved(false);
      appliceraKomponentSynk(allaForeslagnaKomponenter, {});
      setBesiktningar(skapaStandardBesiktningar());
      setSamfallighetsavgift(skapaStandardSamfallighetsavgift());
      setKrPerKvmAr(defaultKrPerKvmAr);
      setPlanNamn("Central grundmall");
      setPlanNotering(
        "Grundmallen har ännu ingen sparad underhållsplan centralt. När den sparats kan ni öppna den här.",
      );
      setRenoveringSammanfattning(null);
      setRenoveringarLista([]);
      setAktivTestplan(null);
      setSenastTillagdKomponent(null);
      setSparadTid(null);
    }
    setPlanLage("grundmall");
    setHarOsparadeAndringar(false);
    setOpenSteg("grund");
  }

  function gotoSlutsida() {
    if (planLage === "grundmall" && !arGrundmallForening()) {
      visaForeningsplan();
    }
    stangOchOppnaSteg("slutsida");
  }

  function oppnaKomponentFranHistorik(komponent: string) {
    setSenastTillagdKomponent(komponent);
    stangOchOppnaSteg("register");
  }

  function updateGrund(key: GrundFieldKey, value: string) {
    setGrund((current) => {
      if (key === "antalByggnader") {
        return uppdateraGrundAntalByggnader(current, value);
      }
      return { ...current, [key]: value };
    });
    if (key === "antalLagenheter" && planNamn) {
      const lgh = parseHeltalFranText(value);
      const titel = uppdateraPlanTitelMedLagenheter(planNamn, lgh);
      if (titel !== planNamn) setPlanNamn(titel);
    }
    setGrundSaved(false);
  }

  function saveGrund(event: React.FormEvent) {
    event.preventDefault();
    const grundNorm = normaliseraGrund(grund);
    const lgh = hamtaAntalLagenheterFranGrund(grundNorm);
    const nyaDetaljer = synkaRegisterMedAntalLagenheter(lgh, komponentDetaljer);
    const nyaBesiktningar = synkaBesiktningarMedGrund(
      besiktningar,
      grundNorm,
      lgh,
    );
    const state: UnderhallsplanLagratState = {
      ...byggLagratState(),
      grund: grundNorm,
      komponentDetaljer: nyaDetaljer,
      besiktningar: nyaBesiktningar,
      grundSaved: true,
      sparad: new Date().toISOString(),
    };
    const result = sparaUnderhallsplanState(state);
    if (!result.ok) {
      setSparFel(result.message);
      return;
    }
    setGrund(grundNorm);
    setKomponentDetaljer(nyaDetaljer);
    setBesiktningar(nyaBesiktningar);
    setGrundSaved(true);
    setSparadTid(result.sparad);
    setSparFel(null);
    setHarOsparadeAndringar(false);
    markeraGrundinfoPaborjad();
  }

  function toggleKomponentAktiv(name: string) {
    if (!grundSaved) return;
    setRenoveringarSaved(false);
    setKomponenterSaved(false);
    setBesiktningarSaved(false);
    const läggsTill = !activeComponents.includes(name);
    const next = läggsTill
      ? [...activeComponents, name]
      : activeComponents.filter((item) => item !== name);
    if (läggsTill) setSenastTillagdKomponent(name);
    appliceraKomponentSynk(next, komponentDetaljer);
  }

  function toggleComponent(name: string) {
    if (!renoveringarSaved) return;
    toggleKomponentAktiv(name);
  }

  /** Tar bort komponent helt från föreningens plan (inte bara avstängd). */
  function taBortKomponent(name: string) {
    if (!renoveringarSaved) return;
    if (
      !window.confirm(
        `Ta bort «${name}» från er plan? Tillfällen och priser för komponenten raderas i denna förenings plan. Grundmallen påverkas inte.`,
      )
    ) {
      return;
    }
    setKomponenterSaved(false);
    setBesiktningarSaved(false);
    const next = activeComponents.filter((item) => item !== name);
    const { [name]: _bort, ...rest } = komponentDetaljer;
    appliceraKomponentSynk(next, rest);
    if (senastTillagdKomponent === name) {
      setSenastTillagdKomponent(next[0] ?? null);
    }
  }

  function importeraFranGrundmall() {
    if (!renoveringarSaved || arGrundmallForening()) return;
    if (planLage === "grundmall") return;
    const foreningId = lasAktivForeningId();
    const { activeComponents: next, komponentDetaljer: detaljer, resultat } =
      importeraSaknadeKomponenterFranGrundmall(
        activeComponents,
        komponentDetaljer,
        foreningId,
      );
    if (resultat.tillagdaKomponenter.length > 0) {
      setKomponenterSaved(false);
      setBesiktningarSaved(false);
      appliceraKomponentSynk(next, detaljer);
      setSenastTillagdKomponent(resultat.tillagdaKomponenter[0] ?? null);
    }
    window.alert(resultat.meddelande);
  }

  function justeraTillfalleKostnad(
    komponent: string,
    underkomponentId: string,
    tillfalleId: string,
    nyKostnadKr: number,
  ) {
    if (planLage === "grundmall" && !arGrundmallForening()) return;
    const nasta = sattTillfalleTotalKostnad(
      komponentDetaljer,
      komponent,
      underkomponentId,
      tillfalleId,
      nyKostnadKr,
    );
    setKomponentDetaljer(nasta);
    setKomponenterSaved(false);
  }

  function importeraFranExcel(data: ImporteradUnderhallsplanExcel) {
    if (skrivskyddad) return;
    if (Object.keys(data.grundPatch).length > 0) {
      setGrund((current) =>
        normaliseraGrund({
          ...current,
          ...data.grundPatch,
          adresser: data.grundPatch.adresser ?? current.adresser,
        }),
      );
      setGrundSaved(false);
    }
    if (data.krPerKvmAr != null) {
      setKrPerKvmAr(begransaAvsattningKrPerKvmAr(data.krPerKvmAr));
    }
    if (data.planNotering != null) {
      setPlanNotering(data.planNotering);
    }
    if (data.planNamn?.trim()) {
      setPlanNamn(data.planNamn.trim());
    }
    if (data.planStartAr != null || data.planSlutAr != null) {
      setPlaninstallningar((current) => {
        const start =
          data.planStartAr != null
            ? normaliseraPlanStartAr(String(data.planStartAr))
            : normaliseraPlanStartAr(current.planStartAr);
        const slut =
          data.planSlutAr != null
            ? data.planSlutAr
            : start + normaliseraPlanLangdAr(current.planLangdAr) - 1;
        const langd = Math.max(
          minPlanLangdAr,
          Math.min(maxPlanLangdAr, slut - start + 1),
        );
        return normaliseraPlaninstallningar({
          ...current,
          planStartAr: String(start),
          planLangdAr: String(langd),
        });
      });
    }
    if (data.komponentVarden.length > 0) {
      setKomponentDetaljer((current) =>
        appliceraImporteradeKomponentVarden(current, data.komponentVarden),
      );
      setKomponenterSaved(false);
    }
  }

  function addCustomComponent() {
    const trimmed = customComponent.trim();
    if (!trimmed || !renoveringarSaved || activeComponents.includes(trimmed)) return;
    setKomponenterSaved(false);
    setBesiktningarSaved(false);
    const next = [...activeComponents, trimmed];
    appliceraKomponentSynk(next, komponentDetaljer);
    setSenastTillagdKomponent(trimmed);
    setCustomComponent("");
  }

  function uppdateraKomponentDetalj(namn: string, data: KomponentDetaljData) {
    setKomponentDetaljer((current) => ({ ...current, [namn]: data }));
    setKomponenterSaved(false);
    setBesiktningarSaved(false);
  }

  function saveRenoveringar() {
    if (!grundSaved) return;
    const franHistorik = komponenterFranRenoveringar(renoveringarLista);
    const active = [...new Set([...activeComponents, ...franHistorik])];
    const synced = synkaUnderhallsplanState(active, komponentDetaljer);
    const registerMedHistorik = appliceraRenoveringarPaKomponentregister(
      renoveringarLista,
      synced.register,
      planStartAr,
      planKostnader,
    );
    appliceraKomponentSynk(active, registerMedHistorik);
    setBesiktningar((current) =>
      synkaNastaBesiktningFranUtfört(
        tillampaOvkIntervallFromVentilation(current, grund.ventilationssystem),
        planStartAr,
      ),
    );
    setSenastTillagdKomponent(active[0] ?? null);
    setRenoveringarSaved(true);
    setKomponenterSaved(false);
    setBesiktningarSaved(false);
  }

  function saveKomponenter() {
    if (!renoveringarSaved || activeComponents.length === 0) return;
    setKomponenterSaved(true);
  }

  function saveBesiktningar() {
    if (!komponenterSaved) return;
    setBesiktningarSaved(true);
  }

  function updateBesiktningar(lista: Besiktning[]) {
    setBesiktningar(lista);
    setBesiktningarSaved(false);
  }

  function updateSamfallighetsavgift(avgift: Samfallighetsavgift) {
    setSamfallighetsavgift(normaliseraSamfallighetsavgift(avgift));
    setRenoveringarSaved(false);
  }

  const grundNorm = normaliseraGrund(grund);
  const avsattningsYtaM2 = hamtaAvsattningsYtaM2(grundNorm);
  const antalLagenheter = hamtaAntalLagenheterFranGrund(grundNorm);
  const skrivskyddad = planLage === "grundmall" && !arGrundmallForening();
  const arCentralGrundmall = arGrundmallForening();

  const autoAvsattning = useMemo(() => {
    if (!laddatFranLager || avsattningsYtaM2 <= 0 || planLangdAr <= 0) {
      return null;
    }
    const atgarder = samlaAllaUnderhallAtgarder(
      activeComponents,
      komponentDetaljer,
      renoveringarLista,
      planStartAr,
      planLangdAr,
      planKostnader,
    );
    const summa = summaPlaneradeInvesteringar(
      atgarder,
      planStartAr,
      planLangdAr,
    );
    return beraknaForeslagenAvsattningKrPerKvmAr(
      summa,
      avsattningsYtaM2,
      planLangdAr,
    );
  }, [
    laddatFranLager,
    activeComponents,
    komponentDetaljer,
    renoveringarLista,
    planStartAr,
    planLangdAr,
    planKostnader,
    avsattningsYtaM2,
  ]);

  useEffect(() => {
    if (!laddatFranLager) return;
    if (planLage === "grundmall" && !arGrundmallForening()) return;
    // Korrigera orimligt hög sparad avsättning (t.ex. auto-bump från uppblåsta kostnader).
    setKrPerKvmAr((prev) => {
      if (prev > TYPISK_AVSATTNING_KR_PER_KVM.max) {
        return TYPISK_AVSATTNING_KR_PER_KVM.standard;
      }
      return prev;
    });
  }, [laddatFranLager, planLage]);

  // Föreslå höjning inom typiskt intervall — aldrig över max 600 kr/m².
  useEffect(() => {
    if (!laddatFranLager || !autoAvsattning?.foreslagen) return;
    if (planLage === "grundmall" && !arGrundmallForening()) return;
    if (autoAvsattning.overTypiskt) return;
    setKrPerKvmAr((prev) =>
      autoAvsattning.foreslagen! > prev
        ? autoAvsattning.foreslagen!
        : prev,
    );
  }, [laddatFranLager, autoAvsattning, planLage]);
  const [openSteg, setOpenSteg] = useState<WizardStegId | null>(null);
  const [stegNavFel, setStegNavFel] = useState<StegNavFel | null>(null);

  const stegLasStatus: StegLasStatus =
    planLage === "grundmall" && !arGrundmallForening()
      ? {
          grundSaved: true,
          renoveringarSaved: true,
          komponenterSaved: true,
          besiktningarSaved: true,
        }
      : {
          grundSaved,
          renoveringarSaved,
          komponenterSaved,
          besiktningarSaved,
        };

  function scrollTillSteg(id: WizardStegId) {
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  }

  function stangOchOppnaSteg(id: WizardStegId) {
    const las = hamtaStegLasOrsak(id, stegLasStatus);
    if (las) {
      setStegNavFel({ typ: "las", targetId: id, text: las });
      return;
    }
    setStegNavFel(null);
    setOpenSteg(id);
    scrollTillSteg(id);
  }

  function toggleSteg(id: WizardStegId) {
    if (openSteg === id) {
      setStegNavFel(null);
      setOpenSteg(null);
      return;
    }

    const las = hamtaStegLasOrsak(id, stegLasStatus);
    if (las) {
      setStegNavFel({ typ: "las", targetId: id, text: las });
      return;
    }

    // Byt steg direkt — ingen särskild stängning krävs.
    setStegNavFel(null);
    setOpenSteg(id);
    scrollTillSteg(id);
  }

  function stegPanelNavProps(id: WizardStegId) {
    return {
      lasOrsak: hamtaStegLasOrsak(id, stegLasStatus),
      navFeedback:
        stegNavFel?.targetId === id ? stegNavFel.text : null,
      visaStangOchBytKnapp: false,
      blockerarAndra: false,
      skrivskyddad,
      onStangOchOppna: stangOchOppnaSteg,
    };
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">
              {skrivskyddad
                ? "Grundmallen (skrivskyddad)"
                : "Spara dina uppdateringar"}
            </p>
            {!skrivskyddad && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  harOsparadeAndringar
                    ? "bg-amber-100 text-amber-900"
                    : sparadTid
                      ? "bg-[#dcefe2] text-primary-dark"
                      : "bg-border/50 text-muted"
                }`}
                role="status"
                aria-live="polite"
              >
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 rounded-full ${
                    harOsparadeAndringar
                      ? "bg-amber-500"
                      : sparadTid
                        ? "bg-primary"
                        : "bg-muted"
                  }`}
                />
                {harOsparadeAndringar
                  ? "Sparar…"
                  : sparadTid
                    ? "Sparat"
                    : "Autosparas"}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted">
            {skrivskyddad
              ? "Ni kan bläddra i stegen men inte ändra. Stäng grundmallen för att fortsätta i er plan."
              : sparadTid
                ? `Senast sparad ${new Date(sparadTid).toLocaleString("sv-SE")}. Ändringar sparas automatiskt i webbläsaren.`
                : "Sparas automatiskt lokalt i webbläsaren när du redigerar."}
          </p>
          {sparFel && !skrivskyddad && (
            <p className="mt-1 text-xs font-medium text-red-700" role="alert">
              {sparFel}
            </p>
          )}
        </div>
        {skrivskyddad ? (
          <button
            type="button"
            onClick={visaForeningsplan}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Tillbaka till er plan
          </button>
        ) : (
          <button
            type="button"
            onClick={sparaUppdateringar}
            className="rounded-lg border border-primary bg-white px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
          >
            Spara nu
          </button>
        )}
      </div>

      <div className="rounded-xl border border-primary/25 bg-[#eef6f0]/60 px-4 py-4">
        <p className="text-sm font-semibold text-primary-dark">
          {skrivskyddad
            ? "Central grundmall — skrivskyddad"
            : arCentralGrundmall
              ? "Central grundmall — underhållsplan"
              : "Föreningens underhållsplan"}
        </p>
        <p className="mt-1 text-sm text-muted">
          {skrivskyddad ? (
            <>
              Ni tittar på den centrala grunden. Ändringar görs bara centralt.
              Stäng grundmallen när ni vill fortsätta bygga{" "}
              <strong>er egen</strong> underhållsplan.
              {grundmallTom
                ? " Grundmallen har ännu ingen sparad plan — öppna den igen när den fyllts i centralt."
                : null}
            </>
          ) : arCentralGrundmall ? (
            <>
              Ni arbetar i den centrala grunden. Ändringar här ska bara göras av
              er centralt. Föreningar får egen plan och kan öppna grundmallen
              skrivskyddat samt importera saknade delar — deras sparade plan
              skrivs inte över automatiskt.
            </>
          ) : (
            <>
              Här bygger och ändrar styrelsen <strong>er egen</strong> underhållsplan —
              anpassad för just er fastighet. Öppna grundmallen för att se den
              centrala mallen. I steg 3 importerar ni saknade delar och tar bort
              det som inte är aktuellt, så planen blir mer överskådlig.
            </>
          )}
        </p>
        {!skrivskyddad && (
          <ul className="mt-3 space-y-1.5 text-sm text-muted">
            <li className="flex gap-2">
              <span className="text-primary" aria-hidden>
                1.
              </span>
              <span>
                Börja med <strong>Steg 1 — Grunduppgifter</strong> (adresser först,
                fasader när byggnader finns). Det låser upp beräkningar och AI-stöd.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary" aria-hidden>
                2.
              </span>
              <span>
                Fortsätt i ordning:{" "}
                <strong>steg 2 → 3 → 4</strong> (utförda arbeten, komponenter,
                besiktningar). Steg 5 (bildstöd) och steg 6 (årsbudget) öppnas
                när föregående steg sparats. Allt sparas i er plan.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary" aria-hidden>
                3.
              </span>
              <span>
                <strong>Steg 7 — Summering</strong> ger en överskådlig slutprodukt
                för styrelsemötet och för nästa styrelse. Justera kostnader där
                vid behov.
              </span>
            </li>
          </ul>
        )}
        <p className="mt-3 text-xs text-muted">
          Underhållsplanen är den långsiktiga 50-årsplanen med budget och
          livslängder. Börja i steg 1 (grunduppgifter) och gå vidare steg för
          steg — summeringen i steg 7 är underlaget till styrelsemötet.
        </p>
      </div>

      {demoVarning && (
        <div
          className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="status"
        >
          <p>{demoVarning}</p>
          <button
            type="button"
            onClick={rensaTestplan}
            className="mt-3 rounded-lg bg-amber-900 px-3 py-2 text-sm font-medium text-white hover:bg-amber-950"
          >
            Rensa demo och börja om
          </button>
        </div>
      )}

      {arCentralGrundmall ? (
        <TestplanValjare
          planer={tillgangligaTestplaner}
          aktivPlan={aktivTestplan}
          onLadda={laddaTestplan}
          onRensa={rensaTestplan}
          onGotoSlutsida={gotoSlutsida}
        />
      ) : (
        <ForeningPlanLagePanel
          lage={planLage}
          onVisaForeningsplan={visaForeningsplan}
          onVisaGrundmall={visaGrundmallSkrivskyddad}
          onGotoSlutsida={gotoSlutsida}
        />
      )}

      {grundSaved && !skrivskyddad && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/25 bg-[#eef6f0]/60 px-4 py-3">
          <p className="text-sm text-foreground">
            Snabbnavigering — öppna summeringen av er plan när som helst.
          </p>
          <button
            type="button"
            onClick={gotoSlutsida}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Visa summering (steg 7)
          </button>
        </div>
      )}

      <StegPanel
        id="grund"
        stegNummer={1}
        titel="Grunduppgifter"
        isOpen={openSteg === "grund"}
        onToggle={toggleSteg}
        {...stegPanelNavProps("grund")}
        summary={
          grundSaved
            ? "Sparat — öppna igen för att ändra adresser, fasader eller planinställningar."
            : "Börja med planinställningar, uppgifter och adresser — fasader öppnas när byggnader lagts in."
        }
      >
        <form onSubmit={(e) => {
          saveGrund(e);
          setOpenSteg(null);
        }}>

        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-[#d4e8da] bg-[#eef6f0]/30 p-4 sm:p-5">
            <p className="text-sm font-semibold text-foreground">Planinställningar</p>
            <p className="mt-1 text-xs text-muted">
              Underhållsplanen är normalt 50 år men kan kortas eller förlängas.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-foreground">
                  Plan startår
                </span>
                <input
                  type="number"
                  min={2000}
                  max={2100}
                  value={planinstallningar.planStartAr}
                  onChange={(e) =>
                    uppdateraPlaninstallningar({ planStartAr: e.target.value })
                  }
                  className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-foreground">
                  Planlängd (år)
                </span>
                <input
                  type="number"
                  min={minPlanLangdAr}
                  max={maxPlanLangdAr}
                  value={planinstallningar.planLangdAr}
                  onChange={(e) =>
                    uppdateraPlaninstallningar({ planLangdAr: e.target.value })
                  }
                  className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
                <span className="mt-1 block text-xs text-muted">
                  Standard {standardPlanLangdAr} år. Planperiod: {planStartAr}–
                  {planStartAr + planLangdAr - 1}.
                </span>
              </label>
            </div>
          </div>

          <PlanKostnadsparametrarPanel
            installningar={planinstallningar}
            onChange={(next) => {
              setPlaninstallningar(synkaPlaninstallningarIndex(next));
              setGrundSaved(false);
              setRenoveringarSaved(false);
              setBesiktningarSaved(false);
            }}
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {grundFields.map((field) =>
            field.selectAlternativ ? (
              <GrunduppgiftSelect
                key={field.key}
                label={field.label}
                hint={field.hint}
                value={grund[field.key]}
                alternativ={field.selectAlternativ}
                placeholder={field.placeholder}
                showOvk={field.showOvk}
                onChange={(value) => updateGrund(field.key, value)}
                onToggleOvk={
                  field.showOvk ? () => setVisarOvk((current) => !current) : undefined
                }
                visarOvk={visarOvk}
                ovkSystemText={grund.ventilationssystem}
              />
            ) : (
              <label key={field.key} className="block">
                <span className="text-sm font-medium text-foreground">
                  {field.label}
                </span>
                <input
                  type={field.type ?? "text"}
                  value={grund[field.key]}
                  onChange={(event) => updateGrund(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
                {field.hint && (
                  <span className="mt-1 block text-xs text-muted">{field.hint}</span>
                )}
              </label>
            ),
          )}
        </div>

        <GrundByggnadAdressPanel
          grund={grund}
          onChange={(next) => {
            setGrund(next);
            setGrundSaved(false);
          }}
        />

        <GrundFasaderPaminnelse grund={grund} />

        <GrundFasaderPanel
          grund={grund}
          onChange={(next) => {
            setGrund(next);
            setGrundSaved(false);
          }}
        />

        <VerksamhetsLokalerPanel
          lokaler={grundNorm.lokaler}
          lokalyta={grund.lokalyta}
          onChange={(lokaler) => {
            setGrund((current) => ({ ...current, lokaler }));
            setGrundSaved(false);
          }}
          onLokalytaChange={(lokalyta) => updateGrund("lokalyta", lokalyta)}
        />

        <GrundFastighetsYtorPanel
          grund={grund}
          data={grundNorm.fastighetsYtor}
          onChange={(fastighetsYtor) => {
            setGrund((current) => ({ ...current, fastighetsYtor }));
            setGrundSaved(false);
          }}
        />

        <Steg1YtaAiHjalp
          grund={grund}
          onGrundChange={(next) => {
            setGrund(next);
            setGrundSaved(false);
          }}
        />

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Spara grunduppgifter
          </button>
          {grundSaved && (
            <p className="text-sm font-medium text-primary-dark">
              Sparat — gå vidare till renoveringshistorik (steg 2).
            </p>
          )}
        </div>
        </form>
      </StegPanel>

      <StegPanel
        id="renoveringar"
        stegNummer={2}
        titel="Utförda arbeten"
        isOpen={openSteg === "renoveringar"}
        onToggle={toggleSteg}
        {...stegPanelNavProps("renoveringar")}
        summary={
          renoveringarSaved
            ? "Sparat — komponentregistret är förifyllt; steg 3 visar kommande underhåll."
            : "Renoveringar, besiktningar och kostnader — spara för att fylla registret."
        }
      >
        <Renoveringshistorik
          unlocked={grundSaved}
          activeComponents={activeComponents}
          foreslagnaKomponenter={allaForeslagnaKomponenter}
          onToggleKomponent={toggleKomponentAktiv}
          planStartAr={planStartAr}
          planLangdAr={planLangdAr}
          planKostnader={planKostnader}
          grund={grund}
          komponentDetaljer={komponentDetaljer}
          onKomponentDetaljerChange={setKomponentDetaljer}
          renoveringar={renoveringarLista}
          besiktningar={besiktningar}
          onBesiktningarChange={updateBesiktningar}
          samfallighetsavgift={samfallighetsavgift}
          onSamfallighetsavgiftChange={updateSamfallighetsavgift}
          antalLagenheter={antalLagenheter}
          ventilationssystem={grund.ventilationssystem}
          onOpenKomponent={oppnaKomponentFranHistorik}
          onSammanfattningChange={handleRenoveringSammanfattning}
          onRenoveringarChange={handleRenoveringarLista}
          saved={renoveringarSaved}
          onSave={() => {
            saveRenoveringar();
            setOpenSteg(null);
          }}
        />
      </StegPanel>

      <StegPanel
        id="register"
        stegNummer={3}
        titel="Kommande underhåll"
        isOpen={openSteg === "register"}
        onToggle={toggleSteg}
        {...stegPanelNavProps("register")}
        summary={
          komponenterSaved
            ? "Sparat — justera kommande år och kostnader vid behov."
            : "Sammanställning av planerat underhåll per del — förifyllt från steg 2."
        }
      >
        <p className="text-sm leading-relaxed text-muted">
          {skrivskyddad ? (
            <>
              Ni tittar på grundmallens kommande underhåll. Innehållet kan inte
              ändras här — stäng grundmallen och importera saknade delar till er
              plan när ni är tillbaka.
            </>
          ) : arCentralGrundmall ? (
            <>
              Här underhåller ni den centrala grunden. Stäng av eller justera det
              som ska ingå i mallen. Föreningar får egen plan och importerar
              saknade delar därifrån — deras sparade innehåll skrivs inte över
              automatiskt.
            </>
          ) : (
            <>
              Anpassa planen för er fastighet: aktivera det som ingår, ta bort
              delar som inte är aktuella och lägg till egna komponenter vid
              behov. Då blir planen överskådlig — även för nästa styrelse.
              Uppdateringar i grundmallen skriver inte över det ni redan sparat.
            </>
          )}
        </p>

        {!skrivskyddad && (
          <div className="mt-3 rounded-lg border border-border bg-background px-3 py-3 text-xs leading-relaxed text-muted">
            <p className="font-medium text-foreground">
              Lägg till och ta bort — så fungerar knapparna
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>
                <strong className="text-foreground">Aktiv / Inaktiv</strong> —
                döljer eller visar komponenten i planen. Sparade tillfällen och
                priser behålls när ni sätter den inaktiv.
              </li>
              <li>
                <strong className="text-foreground">Ta bort</strong> — raderar
                komponenten och dess tillfällen från er plan (går inte att ångra
                utan att lägga in på nytt).
              </li>
              <li>
                <strong className="text-foreground">Lägg till egen</strong> —
                skapa huvudkomponent som saknas i listan (t.ex. solceller).
              </li>
              <li>
                Inne i varje aktiv komponent: lägg till eller ta bort
                underkomponenter och underhållstillfällen så registret speglar
                just er fastighet.
              </li>
            </ul>
          </div>
        )}

        {!skrivskyddad && (
          <p className="mt-3 rounded-lg border border-primary/20 bg-[#eef6f0]/50 px-3 py-2 text-xs leading-relaxed text-muted">
            <strong className="font-medium text-foreground">K3 från 2026:</strong>{" "}
            Komponentregistret är grunden även för komponentavskrivning. Ange
            avskrivningstid (nyttjandeperiod) per del — den skiljer sig från
            underhållsintervall. Underlaget visas på slutsidan och kan användas
            tillsammans med ekonomisk förvaltare.
          </p>
        )}

        {renoveringarSaved && (
          <div className="mt-4">
            <KommandeUnderhallSammanfattning
              komponentDetaljer={komponentDetaljer}
              planStartAr={planStartAr}
              planLangdAr={planLangdAr}
            />
          </div>
        )}

        {!renoveringarSaved && (
          <p className="mt-4 rounded-lg border border-dashed border-border bg-background px-4 py-3 text-sm text-muted">
            Spara renoveringshistoriken i steg 2 först, sedan aktiveras registret.
          </p>
        )}

        <div
          className={`mt-6 space-y-2 ${!renoveringarSaved ? "pointer-events-none opacity-50" : ""}`}
        >
          {foreslagnaKomponenter.map((name) => {
            const isActive = activeComponents.includes(name);
            return (
              <div
                key={name}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-white px-3 py-2"
              >
                <button
                  type="button"
                  onClick={() => toggleComponent(name)}
                  className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-primary bg-[#e2f0e6] text-primary-dark"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  }`}
                >
                  {isActive ? "✓ Aktiv" : "Inaktiv"} · {name}
                </button>
                {isActive && (
                  <button
                    type="button"
                    onClick={() => taBortKomponent(name)}
                    className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-800 hover:bg-red-50"
                  >
                    Ta bort
                  </button>
                )}
              </div>
            );
          })}
          {activeComponents
            .filter((n) => !(foreslagnaKomponenter as readonly string[]).includes(n))
            .map((name) => (
              <div
                key={name}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-white px-3 py-2"
              >
                <span className="rounded-full border border-primary bg-[#e2f0e6] px-3 py-1 text-sm font-medium text-primary-dark">
                  ✓ Aktiv · {name}
                </span>
                <button
                  type="button"
                  onClick={() => taBortKomponent(name)}
                  className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-800 hover:bg-red-50"
                >
                  Ta bort
                </button>
              </div>
            ))}
        </div>

        {!arCentralGrundmall && !skrivskyddad && (
          <div
            className={`mt-4 rounded-lg border border-dashed border-primary/30 bg-[#eef6f0]/50 px-3 py-3 ${!renoveringarSaved ? "pointer-events-none opacity-50" : ""}`}
          >
            <p className="text-xs text-muted">
              Centrala uppdateringar görs i grundmallen. Här hämtar ni in
              komponenter som saknas — och tar bort det som inte är aktuellt för
              er fastighet (knappen «Ta bort» på varje del ovan). Befintliga
              priser och tillfällen behålls vid import.
            </p>
            <button
              type="button"
              onClick={importeraFranGrundmall}
              className="mt-2 rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
            >
              Importera saknade från grundmall
            </button>
          </div>
        )}

        <div
          className={`mt-6 flex flex-col gap-2 sm:flex-row ${!renoveringarSaved ? "pointer-events-none opacity-50" : ""}`}
        >
          <input
            value={customComponent}
            onChange={(event) => setCustomComponent(event.target.value)}
            placeholder="Lägg till egen huvudkomponent, t.ex. Solceller"
            className="min-w-0 flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={addCustomComponent}
            className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
          >
            Lägg till
          </button>
        </div>

        {renoveringarSaved ? (
          <KomponentRegisterLista
            activeComponents={activeComponents}
            komponentDetaljer={komponentDetaljer}
            onKomponentChange={uppdateraKomponentDetalj}
            senastTillagd={senastTillagdKomponent}
            planStartAr={planStartAr}
            planLangdAr={planLangdAr}
            grund={grund}
            foreningsAdresser={hamtaByggnadAdresser(grundNorm)}
            oppnaAlla
          />
        ) : (
          <p className="mt-6 rounded-lg border border-dashed border-border bg-background px-4 py-6 text-center text-sm text-muted">
            Spara renoveringshistoriken i steg 2 först — då aktiveras komponentlistan
            här.
          </p>
        )}

        <div
          className={`mt-6 flex flex-wrap items-center gap-3 ${!renoveringarSaved ? "pointer-events-none opacity-50" : ""}`}
        >
          <button
            type="button"
            onClick={saveKomponenter}
            disabled={!renoveringarSaved || activeComponents.length === 0}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
          >
            Spara komponentregister
          </button>
          {komponenterSaved && (
            <p className="text-sm font-medium text-primary-dark">
              Sparat — gå vidare till besiktningar (steg 4).
            </p>
          )}
          {komponenterSaved && (
            <button
              type="button"
              onClick={() => stangOchOppnaSteg("besiktningar")}
              className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary/40"
            >
              Öppna steg 4
            </button>
          )}
        </div>
      </StegPanel>

      <StegPanel
        id="besiktningar"
        stegNummer={4}
        titel="Schema besiktningar"
        isOpen={openSteg === "besiktningar"}
        onToggle={toggleSteg}
        {...stegPanelNavProps("besiktningar")}
        summary={
          besiktningarSaved
            ? "Sparat — gå vidare till bildstöd (steg 5) eller underlag till årsbudgeten (steg 6)."
            : "Intervall, nästa år och pris — senast utfört fylls i steg 2."
        }
      >
        <Besiktningar
          unlocked={komponenterSaved}
          antalLagenheter={antalLagenheter}
          planStartAr={planStartAr}
          planLangdAr={planLangdAr}
          ventilationssystem={grund.ventilationssystem}
          lista={besiktningar}
          onChange={updateBesiktningar}
          saved={besiktningarSaved}
          onSave={() => {
            saveBesiktningar();
            setOpenSteg(null);
          }}
        />
      </StegPanel>

      <StegPanel
        id="bildstod"
        stegNummer={5}
        titel="Bildstöd"
        isOpen={openSteg === "bildstod"}
        onToggle={toggleSteg}
        {...stegPanelNavProps("bildstod")}
        summary={
          komponenterSaved
            ? "Bilder, Google Earth och ytmätning — jämför tak och fasad mot registret."
            : "Spara komponentregistret i steg 3 först — därefter öppnas bildstödet."
        }
      >
        <BildstodAnalys
          unlocked={komponenterSaved}
          activeComponents={activeComponents}
          grund={grund}
          komponentDetaljer={komponentDetaljer}
          planStartAr={planStartAr}
          onOverforYtaTillRegister={(komponent, kvm) => {
            const data = komponentDetaljer[komponent];
            if (!data) return;
            const next =
              komponent === "Tak"
                ? sattTakYtaIKomponent(data, kvm)
                : sattFasadYtaIKomponent(data, kvm);
            uppdateraKomponentDetalj(komponent, next);
            setKomponenterSaved(false);
          }}
        />
        <div className="mt-6">
          <button
            type="button"
            onClick={() => stangOchOppnaSteg("arsbudget")}
            className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary/40"
          >
            Öppna steg 6 (budgetunderlag)
          </button>
        </div>
      </StegPanel>

      <StegPanel
        id="arsbudget"
        stegNummer={6}
        titel={PLAN_BEGREPP.arsbudgetSteg}
        isOpen={openSteg === "arsbudget"}
        onToggle={toggleSteg}
        {...stegPanelNavProps("arsbudget")}
        summary="Underlag till budgeten: avsättning, besiktningar och periodiskt underhåll (kostnadsförs direkt). Planerat underhåll — investeringar i fastigheten — visas separat."
      >
        <UnderhallsplanBudget
          unlocked={besiktningarSaved}
          planStartAr={planStartAr}
          planLangdAr={planLangdAr}
          boareaM2={avsattningsYtaM2}
          antalLagenheter={antalLagenheter}
          activeComponents={activeComponents}
          besiktningar={besiktningar}
          samfallighetsavgift={samfallighetsavgift}
          komponentDetaljer={komponentDetaljer}
          krPerKvmAr={krPerKvmAr}
          onKrPerKvmArChange={setKrPerKvmAr}
          renoveringar={renoveringarLista}
          planKostnader={planKostnader}
        />
        <div className="mt-6">
          <button
            type="button"
            onClick={() => stangOchOppnaSteg("slutsida")}
            className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary/40"
          >
            Öppna steg 7 (slutsida)
          </button>
        </div>
      </StegPanel>

      <StegPanel
        id="slutsida"
        stegNummer={7}
        titel="Slutsida"
        isOpen={openSteg === "slutsida"}
        onToggle={toggleSteg}
        {...stegPanelNavProps("slutsida")}
        summary="Presentation, planerade tider och erfarenhetsbaserade råd — utskriftsvänlig."
      >
        <UnderhallsplanSlutsida
          unlocked={grundSaved || skrivskyddad}
          planKomplett={besiktningarSaved}
          planNamn={planNamn}
          planNotering={planNotering}
          grund={grund}
          activeComponents={activeComponents}
          komponentDetaljer={komponentDetaljer}
          besiktningar={besiktningar}
          samfallighetsavgift={samfallighetsavgift}
          planStartAr={planStartAr}
          planLangdAr={planLangdAr}
          krPerKvmAr={krPerKvmAr}
          renoveringar={renoveringSammanfattning}
          renoveringarLista={renoveringarLista}
          planKostnader={planKostnader}
          varderingsUnderlag={varderingsUnderlag}
          onKostnadJustering={skrivskyddad ? undefined : justeraTillfalleKostnad}
          onImporteraFranExcel={skrivskyddad ? undefined : importeraFranExcel}
          visaSomCentralGrundmall={skrivskyddad || arCentralGrundmall}
        />
        <div className="mt-6 print:hidden">
          {skrivskyddad ? (
            <button
              type="button"
              onClick={() => {
                visaForeningsplan();
                stangOchOppnaSteg("slutsida");
              }}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Tillbaka till föreningens slutsida
            </button>
          ) : (
            <button
              type="button"
              onClick={() => stangOchOppnaSteg("kommandeProjekt")}
              className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary/40"
            >
              Öppna steg 8 (kommande projekt)
            </button>
          )}
          {!skrivskyddad && (
            <p className="mt-2 text-xs text-muted">
              Styrelseinternt — ingår inte i PDF eller utskrift.
            </p>
          )}
        </div>
      </StegPanel>

      <StegPanel
        id="kommandeProjekt"
        stegNummer={8}
        titel="Kommande projekt"
        isOpen={openSteg === "kommandeProjekt"}
        hideInPrint
        onToggle={toggleSteg}
        {...stegPanelNavProps("kommandeProjekt")}
        summary="Större projekt 1–3 år framåt med länk från planerade åtgärder — syns inte i utskrifter."
      >
        <KommandeProjektSteg
          unlocked={grundSaved}
          planStartAr={planStartAr}
          komponentDetaljer={komponentDetaljer}
          onKomponentDetaljerChange={(register) => {
            setKomponentDetaljer(register);
            setKomponenterSaved(false);
            setBesiktningarSaved(false);
          }}
        />
      </StegPanel>
    </div>
  );
}
