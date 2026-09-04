/**
 * Kundavtal Styrelse-Navet — villkor för prövoperiod och årsavtal.
 */

import { ARSAVTAL_RABATT_PROCENT } from "@/lib/prislista";

/** Prövoperiod utan bindning / uppsägningstid. */
export const PROVOPERIODE_DAGAR = 30;

/** Avtalstid efter signering. */
export const AVTAL_LANGD_AR = 1;

/** Uppsägningstid för tecknat årsavtal. */
export const AVTAL_UPPSAGNING_MANADER = 6;

/** Prisjustering enligt konsumentprisindex. */
export const AVTAL_KPI_TEXT =
  "Årsavgiften justeras årligen enligt Statistiska centralbyråns konsumentprisindex (KPI), med basmånad oktober året före justeringen. Justering sker vid respektive förlängning.";

export type AvtalsPart = {
  foreningsNamn: string;
  organisationsnummer?: string;
  ort?: string;
};

export type AvtalsSektion = {
  rubrik: string;
  punkter: string[];
};

export function provoperiodSlutDatum(skapadTidpunkt: string): Date | null {
  if (!skapadTidpunkt) return null;
  const start = new Date(skapadTidpunkt);
  if (Number.isNaN(start.getTime())) return null;
  const slut = new Date(start);
  slut.setDate(slut.getDate() + PROVOPERIODE_DAGAR);
  return slut;
}

/** True om prövoperioden gått ut och avtal inte tecknats. */
export function arProvoperiodUtgangen(opts: {
  skapadTidpunkt: string;
  avtalGodkant: boolean;
  nu?: Date;
}): boolean {
  if (opts.avtalGodkant) return false;
  const slut = provoperiodSlutDatum(opts.skapadTidpunkt);
  if (!slut) return false;
  return (opts.nu ?? new Date()).getTime() > slut.getTime();
}

export function dagarKvarAvProvoperiod(
  skapadTidpunkt: string,
  nu = new Date(),
): number | null {
  const slut = provoperiodSlutDatum(skapadTidpunkt);
  if (!slut) return null;
  const ms = slut.getTime() - nu.getTime();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

export function formatAvtalsDatum(isoOrDate: string | Date): string {
  try {
    const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("sv-SE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/** Sektioner i kundavtalet — föreningens namn binds in. */
export function byggAvtalsSektioner(part: AvtalsPart): AvtalsSektion[] {
  const namn = part.foreningsNamn.trim() || "Föreningen";
  const org = part.organisationsnummer?.trim();

  return [
    {
      rubrik: "1. Parter",
      punkter: [
        `Leverantör: Styrelse-Navet (nedan »Leverantören«).`,
        `Kund: ${namn}${org ? `, org.nr ${org}` : ""}${
          part.ort?.trim() ? `, ${part.ort.trim()}` : ""
        } (nedan »Föreningen«).`,
        "Avtalet tecknas av behörig företrädare för Föreningen och signeras med BankID.",
      ],
    },
    {
      rubrik: "2. Tjänsten",
      punkter: [
        "Leverantören tillhandahåller plattformen Styrelse-Navet för styrelsearbete i bostadsrättsföreningar — bland annat årshjul, underhållsplan, upphandling, lägenhetsarkiv och dokumentstöd.",
        "Föreningen får tillgång till de funktioner som ingår i gällande tjänstepaket under avtalstiden.",
      ],
    },
    {
      rubrik: "3. Prövoperiod",
      punkter: [
        `Föreningen får prova tjänsten gratis i ${PROVOPERIODE_DAGAR} dagar från det att föreningens sida skapas.`,
        "Under prövoperioden gäller ingen uppsägningstid och ingen betalningsskyldighet.",
        `Om Föreningen inte tecknar årsavtal med BankID-signering innan prövoperioden löper ut, raderas föreningens konto och tillhörande uppgifter automatiskt.`,
      ],
    },
    {
      rubrik: "4. Avtalstid och förlängning",
      punkter: [
        `När avtalet signerats gäller det i ${AVTAL_LANGD_AR} år från signeringsdatum.`,
        "Avtalet förlängs därefter automatiskt med ett (1) år i taget om det inte sagts upp i tid.",
      ],
    },
    {
      rubrik: "5. Uppsägning",
      punkter: [
        `Uppsägningstid för tecknat årsavtal: ${AVTAL_UPPSAGNING_MANADER} månader före avtalstidens utgång.`,
        "Uppsägning ska ske skriftligen till Leverantören.",
        "Under prövoperioden krävs ingen uppsägning — utebliven signering innebär att tillgången upphör och uppgifterna raderas.",
      ],
    },
    {
      rubrik: "6. Pris och fakturering",
      punkter: [
        `Årsavtal ger ${ARSAVTAL_RABATT_PROCENT} % rabatt mot ordinarie månadsdebitering.`,
        "Fakturering sker kvartalsvis i förskott enligt gällande prislista baserad på antal lägenheter.",
        "Alla priser anges exklusive moms.",
        AVTAL_KPI_TEXT,
      ],
    },
    {
      rubrik: "7. Signering",
      punkter: [
        "Avtalet blir bindande när behörig företrädare för Föreningen signerar med BankID.",
        `Avtalet gäller för ${namn} och kan inte överlåtas utan Leverantörens skriftliga medgivande.`,
      ],
    },
  ];
}

export function avtalsVillkorKortMedProvoperiod(): string[] {
  return [
    `Prövoperiod ${PROVOPERIODE_DAGAR} dagar — ingen uppsägningstid`,
    `Utan tecknat avtal raderas föreningen efter prövoperioden`,
    `Årsavtal ${AVTAL_LANGD_AR} år · uppsägningstid ${AVTAL_UPPSAGNING_MANADER} månader`,
    `Årsavtal: ${ARSAVTAL_RABATT_PROCENT} % rabatt · kvartalsfaktura i förskott`,
    "Prisjustering enligt KPI (konsumentprisindex) vid förlängning",
    "Alla priser exkl. moms · signering med BankID",
  ];
}
