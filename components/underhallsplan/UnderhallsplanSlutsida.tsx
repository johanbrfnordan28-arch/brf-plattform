"use client";

import { useMemo, type ReactNode } from "react";
import { hamtaStyrelseKontakt } from "@/lib/styrelse-kontakt";
import { hamtaAktivForeningsNamn, arGrundmallForening } from "@/lib/forening-registry";
import { formatKr } from "@/components/underhallsplan/besiktningar";
import { hamtaPlanSlutAr } from "@/components/underhallsplan/planinstallningar";
import type { PlanKostnaderNormaliserade } from "@/components/underhallsplan/plan-kostnader";
import { laddaNerUnderhallsplanExcel } from "@/components/underhallsplan/exportera-underhallsplan-excel";
import {
  beraknaPlanAvsattning,
  beraknaPlanUtgiftsRader,
} from "@/components/underhallsplan/plan-budget-sammanfattning";
import { samlaAllaUnderhallAtgarder } from "@/components/underhallsplan/underhall-budget";
import { PlanPresentationDiagram } from "@/components/underhallsplan/PlanPresentationDiagram";
import {
  FORKLARING_AVSATTNING,
  FORKLARING_ARSBUDGET_VS_PLAN,
  FORKLARING_K3,
  PLAN_BEGREPP,
} from "@/components/underhallsplan/plan-terminologi";
import { samlaK3Underlag } from "@/components/underhallsplan/k3-underlag";
import { K3_FORKLARING } from "@/components/underhallsplan/komponent-avskrivning";
import type { FastighetsVarderingsUnderlag } from "@/components/underhallsplan/fastighets-vardering";
import { summeraKomponentBeloppFranTidslista } from "@/components/underhallsplan/komponent-belopp-summering";
import {
  TYPISK_AVSATTNING_KR_PER_KVM,
} from "@/components/underhallsplan/plan-budget-sammanfattning";
import type { UtfördRenovering } from "@/components/underhallsplan/renoveringar";
import {
  formateraKomponentSammanfattning,
  hamtaKomponentMall,
  type KomponentDetaljData,
} from "@/components/underhallsplan/komponentregister";
import type {
  Grunduppgifter,
  RenoveringSammanfattning,
} from "@/components/underhallsplan/types";
import {
  hamtaAntalLagenheterFranGrund,
  hamtaAntalVerksamhetslokaler,
  hamtaPlanVisningstitel,
  normaliseraGrund,
} from "@/components/underhallsplan/grund-synk";
import {
  hamtaAvsattningsYtaM2,
  parseHeltalFranText,
} from "@/components/underhallsplan/parse-grundtal";
import type { Besiktning } from "@/components/underhallsplan/besiktningar";
import type { Samfallighetsavgift } from "@/components/underhallsplan/samfallighetsavgift";
import { samlaPlanUnderhallTidslista } from "@/components/underhallsplan/plan-underhall-tidslista";
import { KostnadPrisVarning } from "@/components/underhallsplan/KostnadPrisVarning";
import {
  PLAN_SLUTSIDA_CHECKLISTA,
  PLAN_SLUTSIDA_ERFARENHET,
  PLAN_SLUTSIDA_LEVANDE_PLAN,
  PLAN_SLUTSIDA_RAD,
} from "@/components/underhallsplan/plan-slutsida-rad";

type UnderhallsplanSlutsidaProps = {
  unlocked: boolean;
  planKomplett?: boolean;
  planNamn: string | null;
  planNotering?: string | null;
  grund: Grunduppgifter;
  activeComponents: string[];
  komponentDetaljer: Record<string, KomponentDetaljData>;
  besiktningar: Besiktning[];
  samfallighetsavgift?: Samfallighetsavgift;
  planStartAr: number;
  planLangdAr: number;
  krPerKvmAr: number;
  renoveringar: RenoveringSammanfattning | null;
  renoveringarLista?: UtfördRenovering[];
  planKostnader?: PlanKostnaderNormaliserade;
  /**
   * Internt underlag för beräkning av komponentvärden.
   * Får aldrig renderas (taxering/mark/anskaffning).
   */
  varderingsUnderlag?: FastighetsVarderingsUnderlag | null;
  /** Justera kostnad för ett tillfälle (sparas i registret). */
  onKostnadJustering?: (
    komponent: string,
    underkomponentId: string,
    tillfalleId: string,
    nyKostnadKr: number,
  ) => void;
  /** Visar central grundmall-rubrik (även när förening tittar skrivskyddat). */
  visaSomCentralGrundmall?: boolean;
};

function formatKrStor(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2).replace(".", ",")} mkr`;
  }
  return formatKr(value);
}

function PrintSida({
  sidnummer,
  titel,
  children,
  className = "",
}: {
  sidnummer: number;
  titel: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`plan-print-sida rounded-xl border border-border bg-white p-6 shadow-sm sm:p-8 print:shadow-none print:break-after-page ${className}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        Sida {sidnummer} · {titel}
      </p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function UnderhallsplanSlutsida({
  unlocked,
  planKomplett = false,
  planNamn,
  planNotering,
  grund,
  activeComponents,
  komponentDetaljer,
  besiktningar,
  samfallighetsavgift,
  planStartAr,
  planLangdAr,
  krPerKvmAr,
  renoveringar,
  renoveringarLista = [],
  planKostnader,
  varderingsUnderlag = null,
  onKostnadJustering,
  visaSomCentralGrundmall = false,
}: UnderhallsplanSlutsidaProps) {
  const planSlutAr = hamtaPlanSlutAr(planStartAr, planLangdAr);
  const grundNorm = normaliseraGrund(grund);
  const avsattningsYtaM2 = hamtaAvsattningsYtaM2(grundNorm);
  const antalLgh = hamtaAntalLagenheterFranGrund(grundNorm);
  const antalLokaler = hamtaAntalVerksamhetslokaler(grundNorm);

  const avsattning = useMemo(
    () => beraknaPlanAvsattning(avsattningsYtaM2, krPerKvmAr, planLangdAr),
    [avsattningsYtaM2, krPerKvmAr, planLangdAr],
  );

  const utgiftsRader = useMemo(
    () =>
      beraknaPlanUtgiftsRader({
        activeComponents,
        komponentDetaljer,
        besiktningar,
        samfallighetsavgift,
        renoveringarLista,
        antalLagenheter: antalLgh,
        planStartAr,
        planLangdAr,
        boareaM2: avsattningsYtaM2,
        krPerKvmAr,
        planKostnader,
      }),
    [
      activeComponents,
      komponentDetaljer,
      besiktningar,
      samfallighetsavgift,
      renoveringarLista,
      antalLgh,
      planStartAr,
      planLangdAr,
      avsattningsYtaM2,
      krPerKvmAr,
      planKostnader,
    ],
  );

  const maxKassaflode = Math.max(
    ...utgiftsRader.map((r) => r.totaltKassaflode),
    1,
  );
  const summaArsbudget = utgiftsRader.reduce((s, r) => s + r.utgifterArsbudget, 0);
  const summaBesiktning = utgiftsRader.reduce((s, r) => s + r.besiktningar, 0);
  const summaDirektkostnader = utgiftsRader.reduce(
    (s, r) => s + r.direktkostnader,
    0,
  );
  const summaInvestering = utgiftsRader.reduce((s, r) => s + r.investeringPlan, 0);
  const summaKassaflode = utgiftsRader.reduce((s, r) => s + r.totaltKassaflode, 0);
  const medelArsbudget = utgiftsRader.length
    ? Math.round(summaArsbudget / utgiftsRader.length)
    : 0;

  const arCentralGrundmall =
    visaSomCentralGrundmall || arGrundmallForening();
  const titel = hamtaPlanVisningstitel(
    planNamn,
    grundNorm,
    arCentralGrundmall
      ? null
      : hamtaStyrelseKontakt()?.foreningsnamn || hamtaAktivForeningsNamn(),
    { arCentralGrundmall },
  );
  const kontakt = hamtaStyrelseKontakt();

  const underhallTidslista = useMemo(
    () =>
      samlaPlanUnderhallTidslista(
        activeComponents,
        komponentDetaljer,
        planStartAr,
        planLangdAr,
      ),
    [activeComponents, komponentDetaljer, planStartAr, planLangdAr],
  );

  const k3Underlag = useMemo(
    () =>
      samlaK3Underlag(
        activeComponents,
        komponentDetaljer,
        varderingsUnderlag,
      ),
    [activeComponents, komponentDetaljer, varderingsUnderlag],
  );

  const komponentInstallationsSumma = useMemo(
    () =>
      k3Underlag.reduce((s, r) => s + (r.installationskostnadKr || 0), 0),
    [k3Underlag],
  );

  const komponentBelopp = useMemo(
    () => summeraKomponentBeloppFranTidslista(underhallTidslista),
    [underhallTidslista],
  );

  const lockedClass = !unlocked ? "pointer-events-none opacity-50" : "";

  const underhallAtgarder = useMemo(
    () =>
      samlaAllaUnderhallAtgarder(
        activeComponents,
        komponentDetaljer,
        renoveringarLista,
        planStartAr,
        planLangdAr,
        planKostnader,
      ),
    [
      activeComponents,
      komponentDetaljer,
      renoveringarLista,
      planStartAr,
      planLangdAr,
      planKostnader,
    ],
  );

  function exporteraPdf() {
    window.print();
  }

  function exporteraExcel() {
    const foreningsNamn =
      hamtaStyrelseKontakt()?.foreningsnamn ||
      hamtaAktivForeningsNamn() ||
      "Förening";
    laddaNerUnderhallsplanExcel(
      {
        foreningsNamn,
        planNamn: planNamn?.trim() || titel,
        planStartAr,
        planSlutAr,
        boareaM2: avsattningsYtaM2,
        antalLagenheter: antalLgh,
        krPerKvmAr,
        arligAvsattningKr: avsattning.arligAvsattningKr,
        planNotering,
        grundRader: [
          {
            etikett: "Adress",
            värde: grund.adresser.filter(Boolean).join(", ") || "—",
          },
          {
            etikett: "Boarea",
            värde:
              parseHeltalFranText(grundNorm.boarea) > 0
                ? `${parseHeltalFranText(grundNorm.boarea).toLocaleString("sv-SE")} m²`
                : "—",
          },
          {
            etikett: "Lägenheter",
            värde: antalLgh > 0 ? String(antalLgh) : "—",
          },
          {
            etikett: "Uppvärmning",
            värde: grund.uppvarmning || "—",
          },
          {
            etikett: "Ventilation",
            värde: grund.ventilationssystem || "—",
          },
          {
            etikett: "Fastighetsbeteckning",
            värde: grund.fastighetsbeteckning || "—",
          },
          {
            etikett: "Byggår",
            värde: grund.byggar || "—",
          },
        ],
        utgiftsRader,
        atgarder: underhallAtgarder,
        komponentVarden: k3Underlag.map((r) => ({
          komponent: `${r.komponent} — ${r.etikett}`,
          installationskostnadKr: r.installationskostnadKr,
          avskrivningAr: r.avskrivningAr,
        })),
      },
      `${foreningsNamn}-underhallsplan`,
    );
  }

  return (
    <section className="rounded-2xl border-2 border-primary bg-surface shadow-md print:border-0 print:shadow-none">
      <div className="rounded-t-2xl bg-primary px-6 py-8 text-white sm:px-10 print:rounded-none">
        <p className="text-sm font-medium text-white/80">
          Steg 7 ·{" "}
          {arCentralGrundmall
            ? "Central grundmall"
            : "Föreningens underhållsplan"}
        </p>
        <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{titel}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/90">
          {arCentralGrundmall
            ? "Sammanfattning av den centrala grunden. Ändringar här görs bara centralt — föreningar bygger egen plan och kan importera saknade delar."
            : "Sammanfattning av föreningens egen underhållsplan: avsättning, utgifter och planerade tider. Anpassad för er — lämpligt att skriva ut eller spara som PDF."}
        </p>
        {planNotering && (
          <p className="mt-4 max-w-2xl rounded-lg bg-white/10 px-4 py-3 text-sm leading-relaxed text-white/95">
            {planNotering}
          </p>
        )}
        {kontakt && (kontakt.kontaktperson || kontakt.epost) && (
          <p className="mt-4 text-sm text-white/90">
            Styrelse:{" "}
            {[kontakt.kontaktperson, kontakt.epost, kontakt.organisationsnummer]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-white/15 px-3 py-1">
            Planperiod {planStartAr}–{planSlutAr} ({planLangdAr} år)
          </span>
          {grund.byggar && (
            <span className="rounded-full bg-white/15 px-3 py-1">
              Byggår {grund.byggar}
            </span>
          )}
          {antalLgh > 0 && (
            <span className="rounded-full bg-white/15 px-3 py-1">
              {antalLgh} lägenheter
            </span>
          )}
          {antalLokaler > 0 && (
            <span className="rounded-full bg-white/15 px-3 py-1">
              {antalLokaler} {antalLokaler === 1 ? "lokal" : "lokaler"}
            </span>
          )}
          {avsattningsYtaM2 > 0 && (
            <span className="rounded-full bg-white/15 px-3 py-1">
              {avsattningsYtaM2.toLocaleString("sv-SE")} m² bo- och lokalyta
            </span>
          )}
        </div>
      </div>

      {!planKomplett && unlocked && (
        <p className="mx-6 mt-6 rounded-lg border border-amber-200/80 bg-amber-50/70 px-4 py-3 text-sm text-amber-950 sm:mx-10 print:hidden">
          Utkast — vissa steg är inte sparade ännu. Summeringen uppdateras löpande
          med det du fyllt i hittills.
        </p>
      )}

      {!unlocked && (
        <p className="mx-6 mt-6 rounded-lg border border-dashed border-border bg-background px-4 py-3 text-sm text-muted sm:mx-10">
          Spara grunduppgifterna i steg 1 först, sedan kan du öppna summeringen.
        </p>
      )}

      <div className={`space-y-8 px-6 py-8 sm:px-10 print:px-0 print:py-4 ${lockedClass}`}>
        <PrintSida sidnummer={1} titel="Avsättning och nyckeltal">
          <p className="rounded-lg border border-primary/20 bg-[#eef6f0]/60 px-4 py-3 text-sm leading-relaxed text-foreground">
            {FORKLARING_ARSBUDGET_VS_PLAN}
          </p>

          <h3 className="mt-6 text-xl font-semibold text-foreground">
            Avsättning per kvm och år
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {FORKLARING_AVSATTNING} Beräknat utifrån bo- och lokalyta (steg 1) och
            avsättning kr/m²/år (steg 6 — {PLAN_BEGREPP.arsbudgetStegKort}).
          </p>

          <div className="mt-6 rounded-2xl border-2 border-primary/30 bg-[#eef6f0] p-6 sm:p-8">
            {avsattningsYtaM2 > 0 && krPerKvmAr > 0 ? (
              <>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-foreground">
                  <span className="text-2xl font-bold tabular-nums sm:text-3xl">
                    {avsattningsYtaM2.toLocaleString("sv-SE")}
                  </span>
                  <span className="text-lg text-muted">m² bo- och lokalyta</span>
                  <span className="text-xl text-muted">×</span>
                  <span className="text-2xl font-bold tabular-nums text-primary-dark sm:text-3xl">
                    {krPerKvmAr.toLocaleString("sv-SE")}
                  </span>
                  <span className="text-lg text-muted">kr/m²/år</span>
                  <span className="text-xl text-muted">=</span>
                  <span className="text-2xl font-bold tabular-nums text-primary-dark sm:text-3xl">
                    {formatKr(avsattning.arligAvsattningKr)}
                  </span>
                  <span className="text-lg text-muted">per år</span>
                </div>
                <p className="mt-4 text-sm text-muted">
                  Över hela planperioden ({planLangdAr} år):{" "}
                  <span className="font-semibold text-foreground">
                    {formatKrStor(avsattning.summaAvsattningPlanperiodKr)}
                  </span>{" "}
                  i jämn avsättning.
                </p>
                {(krPerKvmAr < TYPISK_AVSATTNING_KR_PER_KVM.lage ||
                  krPerKvmAr > TYPISK_AVSATTNING_KR_PER_KVM.hog) && (
                  <p className="mt-3 rounded-lg border border-amber-300/70 bg-amber-50/80 px-3 py-2 text-xs text-amber-950">
                    Typisk avsättning ligger ofta kring{" "}
                    {TYPISK_AVSATTNING_KR_PER_KVM.lage}–
                    {TYPISK_AVSATTNING_KR_PER_KVM.hog} kr/m²/år. Justera i steg 6
                    och kontrollera komponentbeloppen nedan om siffran känns
                    orimlig.
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-amber-950">
                Ange boarea och lokalyta i steg 1 och avsättning (kr/m²/år) i steg 6 för att
                visa beräkningen.
              </p>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-border bg-background/80 p-5">
            <h3 className="font-semibold text-foreground">
              Uppskattade komponentvärden
            </h3>
            <p className="mt-1 text-xs text-muted">
              Ungefärliga installationsvärden från byggåret för er fastighets
              komponenter. Saknas uppgifter kompletteras med uppskattningar.
              Ta bort komponenter som inte är aktuella i steg 3.
            </p>
            {k3Underlag.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {k3Underlag.map((k) => (
                  <li
                    key={`${k.komponent}-${k.underkomponentId}`}
                    className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-border bg-white px-3 py-2.5"
                  >
                    <div>
                      <span className="font-medium text-foreground">
                        {k.etikett}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {k.kallaEtikett}
                        {k.avskrivningAr > 0
                          ? ` · avskrivning ${k.avskrivningAr} år`
                          : ""}
                      </span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-primary-dark">
                      {k.installationskostnadKr > 0
                        ? formatKr(k.installationskostnadKr)
                        : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">
                Aktivera komponenter i steg 3 för att se uppskattade värden.
              </p>
            )}
            {komponentInstallationsSumma > 0 && (
              <p className="mt-3 text-sm font-medium text-foreground">
                Summa uppskattade komponentvärden:{" "}
                {formatKrStor(komponentInstallationsSumma)}
              </p>
            )}
          </div>

          {komponentBelopp.length > 0 && (
            <div className="mt-6 rounded-xl border border-border bg-background/80 p-5">
              <h3 className="font-semibold text-foreground">
                Planerade underhållsbelopp
              </h3>
              <p className="mt-1 text-xs text-muted">
                Kostnader för kommande åtgärder (skilt från installationsvärden
                ovan). Justera på sidan «Planerade underhållstider».
              </p>
              <ul className="mt-4 space-y-3">
                {komponentBelopp.map((k) => (
                  <li
                    key={k.komponent}
                    className="rounded-lg border border-border bg-white px-3 py-2.5"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium text-foreground">
                        {k.komponent}
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-primary-dark">
                        {formatKr(k.summaKr)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-medium uppercase text-muted">Komponenter</p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {activeComponents.length}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-medium uppercase text-muted">
                Snitt {PLAN_BEGREPP.utgifterArsbudget.toLowerCase()} / år
              </p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {formatKr(medelArsbudget)}
              </p>
              <p className="text-xs text-muted">
                Avsättning + besiktningar + kostnadsfört underhåll
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-medium uppercase text-muted">
                Summa besiktningar
              </p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {formatKrStor(summaBesiktning)}
              </p>
            </div>
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4">
              <p className="text-xs font-medium uppercase text-amber-900/80">
                Summa kostnadsfört underhåll
              </p>
              <p className="mt-1 text-xl font-bold text-amber-950">
                {formatKrStor(summaDirektkostnader)}
              </p>
              <p className="text-xs text-muted">Kostnadsförs — aktiveras ej</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-medium uppercase text-muted">
                Summa {PLAN_BEGREPP.investeringarPlan.toLowerCase()}
              </p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {formatKrStor(summaInvestering)}
              </p>
              <p className="text-xs text-muted">Enligt underhållsplanen</p>
            </div>
          </div>

          <p className="mt-6 text-sm font-medium text-foreground">
            Summa utgifter i årsbudgeten ({planLangdAr} år):{" "}
            {formatKrStor(summaArsbudget)}
            {(summaInvestering > 0 || summaDirektkostnader > 0) && (
              <span className="mt-1 block font-normal text-muted">
                {summaDirektkostnader > 0 && (
                  <>
                    Kostnadsfört underhåll: {formatKrStor(summaDirektkostnader)}
                    {summaInvestering > 0 ? " · " : ""}
                  </>
                )}
                {summaInvestering > 0 && (
                  <>
                    Planerade investeringar (aktiveras/avskrivs):{" "}
                    {formatKrStor(summaInvestering)}
                  </>
                )}{" "}
                · Kassaflöde totalt: {formatKrStor(summaKassaflode)}
              </span>
            )}
          </p>
        </PrintSida>

        <PrintSida sidnummer={2} titel="Diagram och tidsaxel">
          {utgiftsRader.length > 0 ? (
            <PlanPresentationDiagram
              rader={utgiftsRader}
              planStartAr={planStartAr}
              planSlutAr={planSlutAr}
            />
          ) : (
            <p className="text-sm text-muted">
              Fyll i årsbudget (steg 6) och komponentregister för att visa diagram.
            </p>
          )}
        </PrintSida>

        <PrintSida sidnummer={3} titel="Utgifter och investeringar per år">
          <h3 className="text-lg font-semibold text-foreground">
            Årsvis översikt
          </h3>
          <p className="mt-1 text-sm text-muted">
            Kolumnen {PLAN_BEGREPP.utgifterArsbudget} är det som ska in i
            föreningens årsbudget det året. Investeringar enligt planen visas
            separat.
          </p>
          <div className="mt-4 max-h-[36rem] overflow-auto rounded-xl border border-border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="sticky top-0 bg-background text-xs uppercase text-muted shadow-sm">
                <tr>
                  <th className="px-3 py-2">År</th>
                  <th className="px-3 py-2 text-right">Avsättning</th>
                  <th className="px-3 py-2 text-right">Besiktning</th>
                  <th className="px-3 py-2 text-right">
                    {PLAN_BEGREPP.direktkostnaderKort}
                  </th>
                  <th className="px-3 py-2 text-right">Årsbudget</th>
                  <th className="px-3 py-2 text-right">Investering</th>
                  <th className="px-3 py-2 text-right">Kassaflöde</th>
                </tr>
              </thead>
              <tbody>
                {utgiftsRader.map((rad) => (
                  <tr key={rad.ar} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{rad.ar}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatKr(rad.avsattning)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {rad.besiktningar > 0 ? formatKr(rad.besiktningar) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-amber-900">
                      {rad.direktkostnader > 0
                        ? formatKr(rad.direktkostnader)
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-right font-medium tabular-nums text-primary-dark">
                      {formatKr(rad.utgifterArsbudget)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {rad.investeringPlan > 0
                        ? formatKr(rad.investeringPlan)
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-muted">
                      {formatKr(rad.totaltKassaflode)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-border bg-[#fafcfa] font-semibold">
                <tr>
                  <td className="px-3 py-2">Summa</td>
                  <td className="px-3 py-2 text-right">
                    {formatKrStor(avsattning.summaAvsattningPlanperiodKr)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {formatKrStor(summaBesiktning)}
                  </td>
                  <td className="px-3 py-2 text-right text-amber-900">
                    {formatKrStor(summaDirektkostnader)}
                  </td>
                  <td className="px-3 py-2 text-right text-primary-dark">
                    {formatKrStor(summaArsbudget)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {formatKrStor(summaInvestering)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {formatKrStor(summaKassaflode)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-6 space-y-2">
            {utgiftsRader
              .filter((r) => r.totaltKassaflode >= maxKassaflode * 0.85)
              .slice(0, 8)
              .map((rad) => (
                <div
                  key={rad.ar}
                  className="rounded-lg border border-border bg-background/80 px-3 py-2"
                >
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{rad.ar}</span>
                    <span className="font-bold text-primary-dark">
                      {formatKr(rad.utgifterArsbudget)}
                      <span className="ml-1 text-xs font-normal text-muted">
                        årsbudget
                      </span>
                    </span>
                  </div>
                  <div
                    className="mt-1.5 flex h-2 overflow-hidden rounded-full bg-border"
                    aria-hidden
                  >
                    <div
                      className="bg-[#2d6a4f]"
                      style={{
                        width: `${(rad.avsattning / rad.totaltKassaflode) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-[#b45309]"
                      style={{
                        width: `${(rad.besiktningar / rad.totaltKassaflode) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-[#ca8a04]"
                      style={{
                        width: `${(rad.direktkostnader / rad.totaltKassaflode) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-[#5b21b6]"
                      style={{
                        width: `${(rad.investeringPlan / rad.totaltKassaflode) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-8">
            <h3 className="text-base font-semibold text-foreground">
              Utgifter per komponent
            </h3>
            <p className="mt-1 text-sm text-muted">
              Besiktningar, kostnadsfört underhåll och investeringar med vilken
              komponent i planen som avses.
            </p>
            <div className="mt-4 space-y-3">
              {utgiftsRader
                .filter(
                  (r) =>
                    r.besiktningPoster.length > 0 ||
                    r.direktkostnadPoster.length > 0 ||
                    r.investeringPoster.length > 0,
                )
                .map((rad) => (
                  <div
                    key={`poster-${rad.ar}`}
                    className="rounded-lg border border-border bg-background/80 px-3 py-2.5"
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {rad.ar}
                    </p>
                    {rad.besiktningPoster.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5 text-sm text-muted">
                        {rad.besiktningPoster.map((p) => (
                          <li key={`${p.komponent}-${p.namn}`}>
                            <span className="font-medium text-foreground/85">
                              {p.komponent}
                            </span>
                            {" · "}
                            {p.namn}: {formatKr(p.belopp)}
                          </li>
                        ))}
                      </ul>
                    )}
                    {rad.direktkostnadPoster.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5 text-sm text-muted">
                        {rad.direktkostnadPoster.map((p, i) => (
                          <li key={`d-${p.komponent}-${p.namn}-${i}`}>
                            <span className="font-medium text-amber-900/90">
                              {p.komponent}
                            </span>
                            {" · "}
                            {p.namn}: {formatKr(p.belopp)}
                            <span className="ml-1 text-[10px] uppercase tracking-wide text-amber-800/80">
                              kostnadsfört
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {rad.investeringPoster.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5 text-sm text-muted">
                        {rad.investeringPoster.map((p, i) => (
                          <li key={`${p.komponent}-${p.namn}-${i}`}>
                            <span className="font-medium text-violet-900/90">
                              {p.komponent}
                            </span>
                            {" · "}
                            {p.namn}: {formatKr(p.belopp)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              {utgiftsRader.every(
                (r) =>
                  r.besiktningPoster.length === 0 &&
                  r.direktkostnadPoster.length === 0 &&
                  r.investeringPoster.length === 0,
              ) && (
                <p className="text-sm text-muted">
                  Inga besiktningar, kostnadsfört underhåll eller investeringar
                  schemalagda i perioden.
                </p>
              )}
            </div>
          </div>
        </PrintSida>

        <PrintSida sidnummer={4} titel="Grunddata och register">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-background/80 p-5">
              <h3 className="font-semibold text-foreground">Grunduppgifter</h3>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Adress</dt>
                  <dd className="text-right font-medium text-foreground">
                    {grund.adresser.filter(Boolean).join(", ") || "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Boarea</dt>
                  <dd className="font-medium text-foreground">
                    {parseHeltalFranText(grundNorm.boarea) > 0
                      ? `${parseHeltalFranText(grundNorm.boarea).toLocaleString("sv-SE")} m²`
                      : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Lokalyta</dt>
                  <dd className="font-medium text-foreground">
                    {parseHeltalFranText(grundNorm.lokalyta) > 0
                      ? `${parseHeltalFranText(grundNorm.lokalyta).toLocaleString("sv-SE")} m²`
                      : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Lägenheter</dt>
                  <dd className="font-medium text-foreground">
                    {antalLgh > 0 ? antalLgh : "—"}
                  </dd>
                </div>
                {antalLokaler > 0 && (
                  <div className="border-t border-border pt-2">
                    <dt className="text-muted">Verksamhetslokaler</dt>
                    <dd className="mt-2 space-y-1.5 text-right text-sm">
                      {grundNorm.lokaler
                        .filter((l) => l.namn.trim())
                        .map((l) => (
                          <div key={l.id} className="font-medium text-foreground">
                            {l.namn}
                            {parseHeltalFranText(l.ytaM2) > 0 && (
                              <span className="ml-1 font-normal text-muted">
                                ({parseHeltalFranText(l.ytaM2).toLocaleString("sv-SE")}{" "}
                                m²)
                              </span>
                            )}
                          </div>
                        ))}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Uppvärmning</dt>
                  <dd className="font-medium text-foreground">
                    {grund.uppvarmning || "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Ventilation</dt>
                  <dd className="font-medium text-foreground">
                    {grund.ventilationssystem || "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Fastighetsbeteckning</dt>
                  <dd className="font-medium text-foreground">
                    {grund.fastighetsbeteckning || "—"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-border bg-background/80 p-5">
              <h3 className="font-semibold text-foreground">Renoveringshistorik</h3>
              {renoveringar && renoveringar.antal > 0 ? (
                <>
                  <p className="mt-2 text-sm text-muted">
                    {renoveringar.antal} poster · investerat ca{" "}
                    {formatKrStor(renoveringar.summaKr)}
                  </p>
                  <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto">
                    {renoveringar.senaste.map((r) => (
                      <li
                        key={`${r.ar}-${r.titel}`}
                        className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-foreground">
                          {r.ar} — {r.titel}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">
                          {r.komponent} · {formatKrStor(r.kostnadKr)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="mt-3 text-sm text-muted">
                  Fyll i steg 2 eller lägg till renoveringar manuellt.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-background/80 p-5">
            <h3 className="font-semibold text-foreground">Komponentregister</h3>
            <p className="mt-1 text-xs text-muted">
              Grunden för planen och för K3-komponentindelning — aktiverade delar
              med mått, sammanfattning och planerat belopp.
            </p>
            <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto">
              {activeComponents.map((name) => {
                const data = komponentDetaljer[name];
                const mall = hamtaKomponentMall(name);
                const belopp = komponentBelopp.find((k) => k.komponent === name);
                return (
                  <li
                    key={name}
                    className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium">{name}</span>
                      {belopp && belopp.summaKr > 0 && (
                        <span className="text-xs font-semibold tabular-nums text-primary-dark">
                          {formatKr(belopp.summaKr)}
                        </span>
                      )}
                    </div>
                    {data && (
                      <p className="mt-1 text-xs text-muted">
                        {formateraKomponentSammanfattning(data, mall)}
                      </p>
                    )}
                    {belopp && belopp.delar.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5 text-xs text-muted">
                        {belopp.delar.map((d) => (
                          <li
                            key={d.etikett}
                            className="flex justify-between gap-2"
                          >
                            <span>{d.etikett}</span>
                            <span className="tabular-nums">
                              {formatKr(d.summaKr)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </PrintSida>

        <PrintSida sidnummer={5} titel="Komponentvärden och avskrivning">
          <p className="text-sm font-semibold text-foreground">
            {K3_FORKLARING.rubrik}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {FORKLARING_K3}
          </p>

          {k3Underlag.length > 0 ? (
            <div className="mt-4 overflow-x-auto rounded-xl border border-border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-background text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">Komponent</th>
                    <th className="px-3 py-2 font-medium">
                      Installationsvärde
                    </th>
                    <th className="px-3 py-2 font-medium">Avskrivning</th>
                  </tr>
                </thead>
                <tbody>
                  {k3Underlag.map((rad) => (
                    <tr
                      key={`${rad.komponent}-${rad.underkomponentId}`}
                      className="border-t border-border bg-white"
                    >
                      <td className="px-3 py-2.5">
                        <span className="font-medium text-foreground">
                          {rad.etikett}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">
                          {rad.kallaEtikett}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-medium tabular-nums text-foreground">
                        {rad.installationskostnadKr > 0
                          ? formatKr(rad.installationskostnadKr)
                          : "—"}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-foreground">
                        {rad.avskrivningAr > 0
                          ? `${rad.avskrivningAr} år`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-border bg-background px-4 py-3 text-sm text-muted">
              Aktivera komponenter i steg 3. Ta bort sådant som inte är aktuellt
              för er förening.
            </p>
          )}

          {komponentInstallationsSumma > 0 && (
            <p className="mt-3 text-sm font-medium text-foreground">
              Summa: {formatKrStor(komponentInstallationsSumma)}
            </p>
          )}

          <p className="mt-4 rounded-lg border border-primary/15 bg-[#fafcfa] px-3 py-2 text-xs leading-relaxed text-foreground">
            {K3_FORKLARING.underlag}
          </p>
        </PrintSida>

        <PrintSida sidnummer={6} titel="Planerade underhållstider">
          <p className="text-sm leading-relaxed text-muted">
            Tiderna bygger på underhållstillfällen i registret (steg 3). Justera
            varje kostnad här om riktpriserna blivit för höga eller låga — ändringen
            sparas i er förenings plan.
          </p>

          <div className="mt-3 print:hidden">
            <KostnadPrisVarning />
          </div>

          {underhallTidslista.length > 0 ? (
            <>
              <p className="mt-3 text-sm font-medium text-foreground print:hidden">
                Summa i listan:{" "}
                {formatKrStor(
                  underhallTidslista.reduce((s, r) => s + r.kostnadKr, 0),
                )}
              </p>
              <div className="mt-4 overflow-auto rounded-xl border border-border">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-background text-xs uppercase text-muted">
                    <tr>
                      <th className="px-3 py-2">År</th>
                      <th className="px-3 py-2">Komponent / del</th>
                      <th className="px-3 py-2">Åtgärd</th>
                      <th className="px-3 py-2 text-right">Intervall</th>
                      <th className="px-3 py-2 text-right">Planerad kostnad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {underhallTidslista.map((rad, i) => (
                      <tr
                        key={`${rad.ar}-${rad.komponent}-${rad.underkomponentId}-${rad.tillfalleId}-${i}`}
                        className="border-t border-border"
                      >
                        <td className="px-3 py-2 font-semibold tabular-nums">
                          {rad.ar}
                        </td>
                        <td className="px-3 py-2">
                          <span className="font-medium text-foreground">
                            {rad.komponent}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted">
                            {rad.underkomponentEtikett}
                            {rad.tillfalleTitel &&
                              rad.tillfalleTitel !==
                                rad.atgardEtiketter.join(" · ") && (
                                <> · {rad.tillfalleTitel}</>
                              )}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-foreground">
                          {rad.atgardEtiketter.join(" · ")}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-muted">
                          {rad.intervallAr > 0 ? `${rad.intervallAr} år` : "—"}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {onKostnadJustering ? (
                            <>
                              <label className="sr-only">
                                Kostnad {rad.komponent} {rad.ar}
                              </label>
                              <input
                                type="number"
                                min={0}
                                step={1000}
                                value={rad.kostnadKr > 0 ? rad.kostnadKr : ""}
                                onChange={(e) => {
                                  const v = Number.parseInt(e.target.value, 10);
                                  onKostnadJustering(
                                    rad.komponent,
                                    rad.underkomponentId,
                                    rad.tillfalleId,
                                    Number.isFinite(v) && v >= 0 ? v : 0,
                                  );
                                }}
                                className="ml-auto w-28 rounded border border-border bg-white px-2 py-1 text-right text-sm tabular-nums print:hidden"
                              />
                              <span className="hidden print:inline">
                                {rad.kostnadKr > 0 ? formatKr(rad.kostnadKr) : "—"}
                              </span>
                            </>
                          ) : rad.kostnadKr > 0 ? (
                            formatKr(rad.kostnadKr)
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-border bg-background px-4 py-3 text-sm text-muted">
              Inga tillfällen med år och intervall är inlagda ännu. Gå till steg 3
              (komponentregister) och fyll i underhållstillfällen — t.ex. takmålning
              och takomläggning med olika intervall.
            </p>
          )}

          <p className="mt-4 rounded-lg border border-primary/15 bg-[#fafcfa] px-3 py-2 text-xs leading-relaxed text-foreground">
            {PLAN_SLUTSIDA_LEVANDE_PLAN}
          </p>
        </PrintSida>

        <PrintSida
          sidnummer={7}
          titel="Tips och råd"
          className="print:break-after-auto"
        >
          <p className="rounded-lg border border-primary/20 bg-[#eef6f0]/60 px-4 py-3 text-sm leading-relaxed text-foreground">
            Planen visar siffror och tider — nedan kompletterar erfarenhetsbaserade
            råd ({PLAN_SLUTSIDA_ERFARENHET.bygg} och{" "}
            {PLAN_SLUTSIDA_ERFARENHET.styrelse}). Använd dem tillsammans med
            besiktningar och offerter för just er förening.
          </p>

          <div className="mt-6 space-y-6">
            {PLAN_SLUTSIDA_RAD.map((avsnitt) => (
              <div key={avsnitt.rubrik}>
                <h3 className="text-base font-semibold text-foreground">
                  {avsnitt.rubrik}
                </h3>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed">
                  {avsnitt.punkter.map((punkt) => (
                    <li key={punkt.slice(0, 56)} className="text-foreground/90">
                      {punkt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-border bg-background/80 p-5">
            <h3 className="text-base font-semibold text-foreground">
              Checklista — årlig genomgång av planen
            </h3>
            <p className="mt-1 text-xs text-muted">
              Skriv ut och bocka av vid styrelsemöte eller teknisk genomgång.
            </p>
            <ul className="mt-4 space-y-3">
              {PLAN_SLUTSIDA_CHECKLISTA.map((punkt) => (
                <li key={punkt} className="flex gap-3 text-sm leading-relaxed">
                  <span
                    className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded-sm border-2 border-foreground/50 print:border-black"
                    aria-hidden
                  />
                  <span className="text-foreground/90">{punkt}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-8 border-t border-border pt-4 text-sm leading-relaxed text-foreground">
            {PLAN_SLUTSIDA_LEVANDE_PLAN} Styrelsen ansvarar för att planen följs
            upp, uppdateras och att beslut stämmer med föreningens stadgar och
            medlemmarnas intresse på lång sikt.
          </p>
        </PrintSida>

        <div className="flex flex-wrap gap-3 border-t border-border pt-6 print:hidden">
          <button
            type="button"
            onClick={exporteraPdf}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Skriv ut / spara som PDF
          </button>
          <button
            type="button"
            onClick={exporteraExcel}
            className="rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-foreground hover:bg-surface"
          >
            Ladda ner Excel
          </button>
          <p className="self-center text-xs text-muted">
            PDF via utskriftsdialogen. Excel-filen innehåller grunddata, utgifter
            per år, poster med komponent samt åtgärder.
          </p>
        </div>
      </div>
    </section>
  );
}
