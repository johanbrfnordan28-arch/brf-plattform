import {
  localStorageFelMeddelande,
  safeSetLocalStorage,
} from "@/lib/localStorage";
import type { UpphandlingsGruppId } from "@/components/upphandling/kategorier";

const STORAGE_KEY = "brf-navet-upphandling-lager";
export const NAVET_UPPHANDLING_EVENT = "navet-upphandling-lager-uppdaterad";

/** Publik teaser — ingen kontakt, inga underlagsdokument. */
export type NavetPubliceradTeaser = {
  id: string;
  kategoriId: string;
  kategoriNamn: string;
  gruppId: UpphandlingsGruppId;
  titel: string;
  ort: string;
  sistaAnbudsdag: string;
  publicerad: string;
  /** Intern referens — visas inte publikt. */
  foreningIntern: string;
  kortBeskrivning: string;
};

export type NavetUnderlagDokument = {
  etikett: string;
  filnamn: string;
  /** Valfri data-URL för mindre filer i demo (localStorage). */
  dataUrl?: string;
  uppladdad?: string;
};

export type NavetUnderlag = {
  upphandlingId: string;
  dokument: NavetUnderlagDokument[];
  internAnteckning: string;
};

export type NavetEntreprenorStatus = "godkand" | "vantar" | "avvisad";

export type NavetEntreprenor = {
  id: string;
  epost: string;
  foretagsnamn: string;
  status: NavetEntreprenorStatus;
  skapad: string;
};

export type NavetInbjudan = {
  id: string;
  token: string;
  upphandlingId: string;
  epost: string;
  entreprenorId: string;
  skapad: string;
  forstaOppning?: string;
};

export type NavetAnbud = {
  id: string;
  upphandlingId: string;
  entreprenorId: string;
  entreprenorNamn: string;
  epost: string;
  anbudSummaKr: number;
  meddelande: string;
  inlamnad: string;
};

/** Intresseanmälan från entreprenör — synlig endast internt inför inbjudan. */
export type NavetIntresse = {
  id: string;
  upphandlingId: string;
  epost: string;
  foretagsnamn: string;
  telefon: string;
  meddelande: string;
  skapad: string;
  status: "ny" | "inbjuden" | "avvisad";
};

export type NavetUpphandlingLager = {
  publicerade: NavetPubliceradTeaser[];
  underlag: NavetUnderlag[];
  entreprenorer: NavetEntreprenor[];
  inbjudningar: NavetInbjudan[];
  anbud: NavetAnbud[];
  intressen: NavetIntresse[];
};

function tomtLager(): NavetUpphandlingLager {
  return {
    publicerade: [],
    underlag: [],
    entreprenorer: [],
    inbjudningar: [],
    anbud: [],
    intressen: [],
  };
}

export function navetUpphandlingStorageKey(): string {
  return STORAGE_KEY;
}

function meddela(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(NAVET_UPPHANDLING_EVENT));
  }
}

export function lasNavetUpphandlingLager(): NavetUpphandlingLager {
  if (typeof window === "undefined") return tomtLager();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return tomtLager();
    const parsed = JSON.parse(raw) as Partial<NavetUpphandlingLager>;
    return {
      publicerade: Array.isArray(parsed.publicerade) ? parsed.publicerade : [],
      underlag: Array.isArray(parsed.underlag) ? parsed.underlag : [],
      entreprenorer: Array.isArray(parsed.entreprenorer)
        ? parsed.entreprenorer
        : [],
      inbjudningar: Array.isArray(parsed.inbjudningar)
        ? parsed.inbjudningar
        : [],
      anbud: Array.isArray(parsed.anbud) ? parsed.anbud : [],
      intressen: Array.isArray(parsed.intressen) ? parsed.intressen : [],
    };
  } catch {
    return tomtLager();
  }
}

function sparaLager(lager: NavetUpphandlingLager): void {
  const result = safeSetLocalStorage(STORAGE_KEY, JSON.stringify(lager));
  if (!result.ok) {
    throw new Error(localStorageFelMeddelande(result.error));
  }
  meddela();
}

export function hamtaNavetPublicerade(): NavetPubliceradTeaser[] {
  return [...lasNavetUpphandlingLager().publicerade].sort(
    (a, b) => new Date(b.publicerad).getTime() - new Date(a.publicerad).getTime(),
  );
}

export function hamtaNavetTeaser(id: string): NavetPubliceradTeaser | undefined {
  return lasNavetUpphandlingLager().publicerade.find((u) => u.id === id);
}

export function hamtaNavetUnderlag(upphandlingId: string): NavetUnderlag | undefined {
  return lasNavetUpphandlingLager().underlag.find(
    (u) => u.upphandlingId === upphandlingId,
  );
}

/** Synka/publicera teaser + underlag till Navet (från förening eller intern). */
export function publiceraTillNavet(input: {
  id: string;
  kategoriId: string;
  kategoriNamn: string;
  gruppId: UpphandlingsGruppId;
  titel: string;
  ort: string;
  sistaAnbudsdag: string;
  foreningIntern: string;
  kortBeskrivning: string;
  dokument: NavetUnderlagDokument[];
  internAnteckning?: string;
}): NavetPubliceradTeaser {
  const lager = lasNavetUpphandlingLager();
  const befintlig = lager.publicerade.find((u) => u.id === input.id);
  const teaser: NavetPubliceradTeaser = {
    id: input.id,
    kategoriId: input.kategoriId,
    kategoriNamn: input.kategoriNamn,
    gruppId: input.gruppId,
    titel: input.titel.trim(),
    ort: input.ort.trim(),
    sistaAnbudsdag: input.sistaAnbudsdag,
    publicerad: befintlig?.publicerad ?? new Date().toISOString(),
    foreningIntern: input.foreningIntern.trim(),
    kortBeskrivning: input.kortBeskrivning.trim(),
  };

  lager.publicerade = [
    ...lager.publicerade.filter((u) => u.id !== teaser.id),
    teaser,
  ];
  lager.underlag = [
    ...lager.underlag.filter((u) => u.upphandlingId !== teaser.id),
    {
      upphandlingId: teaser.id,
      dokument: input.dokument,
      internAnteckning: (input.internAnteckning ?? "").trim(),
    },
  ];
  sparaLager(lager);
  return teaser;
}

function skapaToken(): string {
  return `inv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function skapaId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Bjud in entreprenör via e-post — skapar godkänd entreprenör + tokenlänk. */
export function bjudInEntreprenor(input: {
  upphandlingId: string;
  epost: string;
  foretagsnamn: string;
}): { inbjudan: NavetInbjudan; entreprenor: NavetEntreprenor; lank: string } {
  const epost = input.epost.trim().toLowerCase();
  const foretagsnamn = input.foretagsnamn.trim() || epost;
  if (!epost || !input.upphandlingId) {
    throw new Error("Ange e-post och upphandling.");
  }

  const lager = lasNavetUpphandlingLager();
  if (!lager.publicerade.some((u) => u.id === input.upphandlingId)) {
    throw new Error("Upphandlingen finns inte publicerad på Navet.");
  }

  let entreprenor = lager.entreprenorer.find(
    (e) => e.epost.toLowerCase() === epost,
  );
  if (!entreprenor) {
    entreprenor = {
      id: skapaId("ent"),
      epost,
      foretagsnamn,
      status: "godkand",
      skapad: new Date().toISOString(),
    };
    lager.entreprenorer = [...lager.entreprenorer, entreprenor];
  } else {
    entreprenor = {
      ...entreprenor,
      foretagsnamn: foretagsnamn || entreprenor.foretagsnamn,
      status: "godkand",
    };
    lager.entreprenorer = lager.entreprenorer.map((e) =>
      e.id === entreprenor!.id ? entreprenor! : e,
    );
  }

  const befintlig = lager.inbjudningar.find(
    (i) =>
      i.upphandlingId === input.upphandlingId &&
      i.epost.toLowerCase() === epost,
  );
  const inbjudan: NavetInbjudan = befintlig ?? {
    id: skapaId("inb"),
    token: skapaToken(),
    upphandlingId: input.upphandlingId,
    epost,
    entreprenorId: entreprenor.id,
    skapad: new Date().toISOString(),
  };
  if (!befintlig) {
    lager.inbjudningar = [inbjudan, ...lager.inbjudningar];
  } else {
    lager.inbjudningar = lager.inbjudningar.map((i) =>
      i.id === inbjudan.id
        ? { ...inbjudan, entreprenorId: entreprenor!.id }
        : i,
    );
  }

  sparaLager(lager);
  const lank = `/entreprenor/underlag/${inbjudan.token}`;
  return { inbjudan, entreprenor, lank };
}

export function hamtaInbjudanViaToken(token: string): NavetInbjudan | undefined {
  return lasNavetUpphandlingLager().inbjudningar.find((i) => i.token === token);
}

export function hamtaEntreprenor(id: string): NavetEntreprenor | undefined {
  return lasNavetUpphandlingLager().entreprenorer.find((e) => e.id === id);
}

export type UnderlagAccess =
  | { ok: true; teaser: NavetPubliceradTeaser; underlag: NavetUnderlag; entreprenor: NavetEntreprenor; inbjudan: NavetInbjudan }
  | { ok: false; orsak: "ogiltig" | "ej_godkand" | "saknar_underlag"; teaser?: NavetPubliceradTeaser };

/** Fullt underlag endast med giltig inbjudan + godkänd entreprenör. */
export function hamtaUnderlagMedToken(token: string): UnderlagAccess {
  const lager = lasNavetUpphandlingLager();
  const inbjudan = lager.inbjudningar.find((i) => i.token === token);
  if (!inbjudan) return { ok: false, orsak: "ogiltig" };

  const teaser = lager.publicerade.find((u) => u.id === inbjudan.upphandlingId);
  if (!teaser) return { ok: false, orsak: "ogiltig" };

  const entreprenor = lager.entreprenorer.find((e) => e.id === inbjudan.entreprenorId);
  if (!entreprenor || entreprenor.status !== "godkand") {
    return { ok: false, orsak: "ej_godkand", teaser };
  }

  const underlag = lager.underlag.find((u) => u.upphandlingId === teaser.id);
  if (!underlag) return { ok: false, orsak: "saknar_underlag", teaser };

  if (!inbjudan.forstaOppning) {
    lager.inbjudningar = lager.inbjudningar.map((i) =>
      i.id === inbjudan.id
        ? { ...i, forstaOppning: new Date().toISOString() }
        : i,
    );
    sparaLager(lager);
  }

  return { ok: true, teaser, underlag, entreprenor, inbjudan };
}

export function arAnbudstidStangd(sistaAnbudsdag: string): boolean {
  if (!sistaAnbudsdag) return false;
  return Date.now() > new Date(`${sistaAnbudsdag}T23:59:59`).getTime();
}

export function hamtaNavetAnbudFor(upphandlingId: string): NavetAnbud[] {
  return lasNavetUpphandlingLager().anbud.filter(
    (a) => a.upphandlingId === upphandlingId,
  );
}

/** Endast eget anbud via inbjudningstoken — exponerar aldrig andras anbud. */
export function hamtaEgetAnbudViaToken(token: string): NavetAnbud | undefined {
  const access = hamtaUnderlagMedToken(token);
  if (!access.ok) return undefined;
  return lasNavetUpphandlingLager().anbud.find(
    (a) =>
      a.upphandlingId === access.teaser.id &&
      a.entreprenorId === access.entreprenor.id,
  );
}

export function hamtaInbjudningarFor(upphandlingId: string): NavetInbjudan[] {
  return lasNavetUpphandlingLager().inbjudningar.filter(
    (i) => i.upphandlingId === upphandlingId,
  );
}

/** Skapa namngiven upphandling från intern yta (underlag kan fyllas på senare). */
export function skapaNavetUpphandling(input: {
  titel: string;
  ort?: string;
  sistaAnbudsdag?: string;
  foreningIntern?: string;
  kortBeskrivning?: string;
  kategoriNamn?: string;
}): NavetPubliceradTeaser {
  const titel = input.titel.trim();
  if (!titel) throw new Error("Ange namn på upphandlingen.");

  const kategoriNamn = (input.kategoriNamn ?? "Upphandling").trim() || "Upphandling";
  const id = skapaId("navet");
  return publiceraTillNavet({
    id,
    kategoriId: kategoriNamn
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") || "upphandling",
    kategoriNamn,
    gruppId: "entreprenad",
    titel,
    ort: (input.ort ?? "").trim() || "—",
    sistaAnbudsdag: (input.sistaAnbudsdag ?? "").trim(),
    foreningIntern: (input.foreningIntern ?? "").trim() || "Intern",
    kortBeskrivning:
      (input.kortBeskrivning ?? "").trim() ||
      "Upphandling via Styrelse-Navet. Förfrågningsunderlag endast för inbjudna entreprenörer.",
    dokument: [],
    internAnteckning: "",
  });
}

export function uppdateraNavetTeaser(
  id: string,
  patch: Partial<
    Pick<
      NavetPubliceradTeaser,
      | "titel"
      | "ort"
      | "sistaAnbudsdag"
      | "foreningIntern"
      | "kortBeskrivning"
      | "kategoriNamn"
    >
  >,
): NavetPubliceradTeaser {
  const lager = lasNavetUpphandlingLager();
  const befintlig = lager.publicerade.find((u) => u.id === id);
  if (!befintlig) throw new Error("Upphandlingen hittades inte.");
  const underlag = lager.underlag.find((u) => u.upphandlingId === id);
  return publiceraTillNavet({
    id,
    kategoriId: befintlig.kategoriId,
    kategoriNamn: patch.kategoriNamn?.trim() || befintlig.kategoriNamn,
    gruppId: befintlig.gruppId,
    titel: patch.titel ?? befintlig.titel,
    ort: patch.ort ?? befintlig.ort,
    sistaAnbudsdag: patch.sistaAnbudsdag ?? befintlig.sistaAnbudsdag,
    foreningIntern: patch.foreningIntern ?? befintlig.foreningIntern,
    kortBeskrivning: patch.kortBeskrivning ?? befintlig.kortBeskrivning,
    dokument: underlag?.dokument ?? [],
    internAnteckning: underlag?.internAnteckning,
  });
}

export function laggTillNavetDokument(
  upphandlingId: string,
  dokument: NavetUnderlagDokument,
): NavetUnderlag {
  const lager = lasNavetUpphandlingLager();
  if (!lager.publicerade.some((u) => u.id === upphandlingId)) {
    throw new Error("Upphandlingen hittades inte.");
  }
  const befintlig = lager.underlag.find((u) => u.upphandlingId === upphandlingId);
  const nasta: NavetUnderlag = {
    upphandlingId,
    internAnteckning: befintlig?.internAnteckning ?? "",
    dokument: [
      ...(befintlig?.dokument ?? []),
      {
        ...dokument,
        filnamn: dokument.filnamn.trim(),
        etikett: dokument.etikett.trim() || dokument.filnamn.trim(),
        uppladdad: dokument.uppladdad ?? new Date().toISOString(),
      },
    ],
  };
  lager.underlag = [
    ...lager.underlag.filter((u) => u.upphandlingId !== upphandlingId),
    nasta,
  ];
  sparaLager(lager);
  return nasta;
}

export function taBortNavetDokument(
  upphandlingId: string,
  filnamn: string,
  etikett: string,
): void {
  const lager = lasNavetUpphandlingLager();
  const befintlig = lager.underlag.find((u) => u.upphandlingId === upphandlingId);
  if (!befintlig) return;
  lager.underlag = [
    ...lager.underlag.filter((u) => u.upphandlingId !== upphandlingId),
    {
      ...befintlig,
      dokument: befintlig.dokument.filter(
        (d) => !(d.filnamn === filnamn && d.etikett === etikett),
      ),
    },
  ];
  sparaLager(lager);
}

export function mailtoInbjudan(input: {
  epost: string;
  titel: string;
  lank: string;
}): string {
  const amne = encodeURIComponent(`Inbjudan till upphandling: ${input.titel}`);
  const kropp = encodeURIComponent(
    `Hej,\n\nNi inbjuds att ta del av förfrågningsunderlaget och lämna anbud för "${input.titel}" via Styrelse-Navet.\n\nÖppna underlaget här (länken är personlig — dela den inte):\n${input.lank}\n\nÖvriga anbudsgivare ser varken er inbjudan eller ert anbud.\n\nMed vänlig hälsning\nStyrelse-Navet`,
  );
  return `mailto:${encodeURIComponent(input.epost)}?subject=${amne}&body=${kropp}`;
}

export function lamnaNavetAnbud(input: {
  token: string;
  anbudSummaKr: number;
  meddelande: string;
}): NavetAnbud {
  const access = hamtaUnderlagMedToken(input.token);
  if (!access.ok) {
    throw new Error("Du saknar behörighet att lämna anbud.");
  }
  if (arAnbudstidStangd(access.teaser.sistaAnbudsdag)) {
    throw new Error("Anbudstiden har gått ut.");
  }
  if (!Number.isFinite(input.anbudSummaKr) || input.anbudSummaKr <= 0) {
    throw new Error("Ange ett giltigt anbudsbelopp.");
  }

  const lager = lasNavetUpphandlingLager();
  const anbud: NavetAnbud = {
    id: skapaId("anbud"),
    upphandlingId: access.teaser.id,
    entreprenorId: access.entreprenor.id,
    entreprenorNamn: access.entreprenor.foretagsnamn,
    epost: access.entreprenor.epost,
    anbudSummaKr: Math.round(input.anbudSummaKr),
    meddelande: input.meddelande.trim(),
    inlamnad: new Date().toISOString(),
  };

  lager.anbud = [
    anbud,
    ...lager.anbud.filter(
      (a) =>
        !(
          a.upphandlingId === anbud.upphandlingId &&
          a.entreprenorId === anbud.entreprenorId
        ),
    ),
  ];
  sparaLager(lager);
  return anbud;
}

export function anmalIntresse(input: {
  upphandlingId: string;
  epost: string;
  foretagsnamn: string;
  telefon?: string;
  meddelande?: string;
}): NavetIntresse {
  const epost = input.epost.trim().toLowerCase();
  const foretagsnamn = input.foretagsnamn.trim();
  if (!input.upphandlingId || !epost || !foretagsnamn) {
    throw new Error("Ange företagsnamn och e-post.");
  }
  const lager = lasNavetUpphandlingLager();
  if (!lager.publicerade.some((u) => u.id === input.upphandlingId)) {
    throw new Error("Upphandlingen hittades inte.");
  }

  const befintlig = lager.intressen.find(
    (i) =>
      i.upphandlingId === input.upphandlingId &&
      i.epost.toLowerCase() === epost &&
      i.status === "ny",
  );
  if (befintlig) return befintlig;

  const intresse: NavetIntresse = {
    id: skapaId("int"),
    upphandlingId: input.upphandlingId,
    epost,
    foretagsnamn,
    telefon: (input.telefon ?? "").trim(),
    meddelande: (input.meddelande ?? "").trim(),
    skapad: new Date().toISOString(),
    status: "ny",
  };
  lager.intressen = [intresse, ...lager.intressen];
  sparaLager(lager);
  return intresse;
}

export function hamtaIntressenFor(upphandlingId: string): NavetIntresse[] {
  return lasNavetUpphandlingLager()
    .intressen.filter((i) => i.upphandlingId === upphandlingId)
    .sort((a, b) => b.skapad.localeCompare(a.skapad));
}

export function markeraIntresseInbjuden(intresseId: string): void {
  const lager = lasNavetUpphandlingLager();
  lager.intressen = lager.intressen.map((i) =>
    i.id === intresseId ? { ...i, status: "inbjuden" as const } : i,
  );
  sparaLager(lager);
}

export function formatNavetDatum(isoEllerDatum: string): string {
  if (!isoEllerDatum) return "—";
  try {
    const d = new Date(
      isoEllerDatum.includes("T") ? isoEllerDatum : `${isoEllerDatum}T12:00:00`,
    );
    return d.toLocaleDateString("sv-SE");
  } catch {
    return isoEllerDatum;
  }
}
