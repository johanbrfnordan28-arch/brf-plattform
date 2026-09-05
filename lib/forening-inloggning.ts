/**
 * Inloggning till test- och skapade föreningar från publika Styrelse-Navet.
 */

import { GRUNDMALL_FORENING_ID } from "@/lib/forening-konstanter";
import {
  cookieHamtaSenastProfil,
  cookieRensaSenastProfil,
} from "@/lib/forening-lagring";
import {
  FORENING_AKTIV_EVENT,
  listaForeningar,
  normaliseraForeningsNamn,
  repareraForeningRegistry,
  SENAST_SKAPAD_PROFIL_KEY,
  sparaForeningProfil,
  taBortForeningFranRegistryOchLagring,
  type ForeningProfil,
} from "@/lib/forening-registry";
import {
  listaInloggningsTestForeningar,
  arStandardTestForening,
} from "@/lib/testforeningar";

/** Prefill i sökfältet på inloggningssidan. */
export const INLOGGNING_BRF_PREFIX = "Brf ";

/**
 * Minsta antal bokstäver efter «Brf » innan en skapad/kundförening visas.
 * Skyddar så att flera sparade föreningar inte listas upp samtidigt.
 */
export const MIN_SOK_BOKSTAVER_EFTER_BRF = 3;

export function arEgenTestForening(foreningId: string): boolean {
  return (
    !arStandardTestForening(foreningId) && foreningId !== GRUNDMALL_FORENING_ID
  );
}

/** Jämförelsetext utan «brf» och utan mellanslag (Stora huset ≈ Storahuset). */
function kollapsaNamn(text: string): string {
  return normaliseraForeningsNamn(text)
    .replace(/^brf\s+/, "")
    .replace(/\s+/g, "");
}

function matcharNamn(foreningsNamn: string, soktext: string): boolean {
  const namn = normaliseraForeningsNamn(foreningsNamn);
  const namnUtanBrf = namn.replace(/^brf\s+/, "");
  const namnKollaps = kollapsaNamn(foreningsNamn);

  const q = normaliseraForeningsNamn(soktext);
  const qUtanBrf = q.replace(/^brf\s+/, "").trim();
  if (!qUtanBrf) return true;
  const qKollaps = kollapsaNamn(soktext);

  if (
    namn.includes(q) ||
    namnUtanBrf.includes(qUtanBrf) ||
    namnUtanBrf.startsWith(qUtanBrf) ||
    namnKollaps.includes(qKollaps) ||
    namnKollaps.startsWith(qKollaps)
  ) {
    return true;
  }

  // Matcha mot början av ord (inte lösa delträffar som avslöjar andra namn)
  const ord = namnUtanBrf.split(/\s+/).filter(Boolean);
  return ord.some((o) => o.startsWith(qUtanBrf) || namnKollaps.startsWith(qKollaps));
}

function lasSenastSkapadProfilerFranLagring(): ForeningProfil[] {
  if (typeof window === "undefined") return [];
  const kandidater: ForeningProfil[] = [];
  const rawLista: Array<string | null> = [];

  try {
    rawLista.push(sessionStorage.getItem(SENAST_SKAPAD_PROFIL_KEY));
  } catch {
    /* ignore */
  }
  rawLista.push(cookieHamtaSenastProfil());

  for (const raw of rawLista) {
    if (!raw) continue;
    try {
      const profil = JSON.parse(raw) as ForeningProfil;
      if (
        profil?.id &&
        arEgenTestForening(profil.id) &&
        typeof profil.namn === "string" &&
        profil.namn.trim()
      ) {
        kandidater.push(profil);
      }
    } catch {
      /* ignore */
    }
  }
  return kandidater;
}

/**
 * Säkerställer att skapade profiler finns i registret innan listning.
 * Senast skapade kan saknas i registret efter sidbyte — återställ från
 * sessionStorage/cookie utan att kräva foreningId i URL.
 */
function synkaEgnaForeningarFranLagring(): void {
  if (typeof window === "undefined") return;
  repareraForeningRegistry();

  for (const profil of lasSenastSkapadProfilerFranLagring()) {
    const finns = listaForeningar().some((p) => p.id === profil.id);
    if (finns) continue;
    try {
      sparaForeningProfil(profil, { tyst: true });
    } catch {
      /* localStorage full — listan kan ändå visa profilen via fallback */
    }
  }
}

/** Endast föreningar som styrelsen skapat (prova gratis). */
export function listaEgnaTestForeningar(): ForeningProfil[] {
  synkaEgnaForeningarFranLagring();

  const sedda = new Set<string>();
  const resultat: ForeningProfil[] = [];

  for (const f of listaForeningar()) {
    if (!arEgenTestForening(f.id) || !f.namn.trim()) continue;
    if (sedda.has(f.id)) continue;
    sedda.add(f.id);
    resultat.push(f);
  }

  // Senast skapade kan saknas i registret tillfälligt — lägg till i listan.
  for (const profil of lasSenastSkapadProfilerFranLagring()) {
    if (sedda.has(profil.id)) continue;
    resultat.push(profil);
    sedda.add(profil.id);
  }

  return resultat.sort((a, b) => a.namn.localeCompare(b.namn, "sv"));
}

/**
 * Rensar historik över tidigare skapade testföreningar i den här webbläsaren.
 * Kundföreningar med tecknat avtal behålls.
 */
export function rensaEgnaTestForeningHistorik(): number {
  if (typeof window === "undefined") return 0;
  repareraForeningRegistry();

  const attTaBort = listaForeningar().filter(
    (f) => arEgenTestForening(f.id) && !f.avtalGodkant,
  );

  for (const f of attTaBort) {
    taBortForeningFranRegistryOchLagring(f.id);
  }

  try {
    sessionStorage.removeItem(SENAST_SKAPAD_PROFIL_KEY);
  } catch {
    /* ignore */
  }
  cookieRensaSenastProfil();

  if (attTaBort.length > 0) {
    window.dispatchEvent(new Event(FORENING_AKTIV_EVENT));
  }
  return attTaBort.length;
}

/**
 * Inloggningslista:
 * - Finns skapade testföreningar (utan avtal) → endast dem.
 * - Annars → fasta demoföreningar (tom webbläsare / plattformstest).
 * Kundföreningar (godkänt avtal) syns under /kund-login i stället.
 */
export function listaInloggningsForeningar(): ForeningProfil[] {
  const egnaTest = listaEgnaTestForeningar().filter((f) => !f.avtalGodkant);
  if (egnaTest.length > 0) return egnaTest;
  return listaInloggningsTestForeningar();
}

export function antalInloggningsForeningar(): number {
  return listaInloggningsForeningar().length;
}

export function antalEgnaTestForeningar(): number {
  return listaEgnaTestForeningar().length;
}

/** Text efter «Brf » (trimmat). */
export function hamtaSokSuffix(soktext: string): string {
  return soktext.replace(/^brf\s*/i, "").trimStart();
}

export function arEndastEgnaForeningar(foreningar: ForeningProfil[]): boolean {
  return (
    foreningar.length > 0 && foreningar.every((f) => arEgenTestForening(f.id))
  );
}

/**
 * Föreslå generiskt sökexempel (utan att avslöja sparade föreningsnamn).
 */
export function föreslaSokExempel(_namn?: string): string {
  return "Brf Sol";
}

/**
 * Skapade/kundföreningar visas först när styrelsen skrivit tillräckligt
 * många bokstäver — annars syns alla sparade samtidigt.
 */
export function sokKräverFlerBokstaver(
  soktext: string,
  foreningar: ForeningProfil[],
): boolean {
  if (!arEndastEgnaForeningar(foreningar)) return false;
  return hamtaSokSuffix(soktext).length < MIN_SOK_BOKSTAVER_EFTER_BRF;
}

/**
 * Filtrerar på bokstäver efter «Brf ».
 * För skapade/kund: tomt eller för kort → ingen lista (integritet).
 * För demos: tomt / enbart «Brf» → hela demolistan.
 */
export function filtreraForeningarPaSok(
  foreningar: ForeningProfil[],
  soktext: string,
): ForeningProfil[] {
  if (sokKräverFlerBokstaver(soktext, foreningar)) {
    return [];
  }

  const q = soktext.trim();
  if (!q || normaliseraForeningsNamn(q) === "brf") {
    // Visa aldrig hela listan med skapade/kund — bara demos.
    if (arEndastEgnaForeningar(foreningar)) return [];
    return foreningar;
  }

  return foreningar.filter((f) => matcharNamn(f.namn, q));
}

/** Säkerställer att söktexten börjar med «Brf » (behåller användarens fortsättning). */
export function normaliseraBrfSoktext(varde: string): string {
  const utanPrefix = varde.replace(/^brf\s*/i, "");
  return `${INLOGGNING_BRF_PREFIX}${utanPrefix}`;
}
