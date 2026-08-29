/**
 * Inloggning till test- och skapade föreningar från publika Styrelse-Navet.
 */

import { GRUNDMALL_FORENING_ID } from "@/lib/forening-konstanter";
import { cookieHamtaSenastProfil } from "@/lib/forening-lagring";
import {
  listaForeningar,
  normaliseraForeningsNamn,
  repareraForeningRegistry,
  SENAST_SKAPAD_PROFIL_KEY,
  sparaForeningProfil,
  type ForeningProfil,
} from "@/lib/forening-registry";
import {
  listaInloggningsTestForeningar,
  arStandardTestForening,
} from "@/lib/testforeningar";

/** Prefill i sökfältet på inloggningssidan. */
export const INLOGGNING_BRF_PREFIX = "Brf ";

/**
 * Minsta antal bokstäver efter «Brf » innan listan filtreras strikt.
 * (Behålls för tipstexter — skapade föreningar visas direkt.)
 */
export const MIN_SOK_BOKSTAVER_EFTER_BRF = 2;

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

  // Matcha mot enskilda ord (t.ex. «21» eller «stora»)
  const ord = namnUtanBrf.split(/\s+/).filter(Boolean);
  return ord.some(
    (o) =>
      o.startsWith(qUtanBrf) || o.includes(qUtanBrf) || qUtanBrf.includes(o),
  );
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
 * Inloggningslista:
 * - Finns skapade testföreningar → endast dem (inga övriga demoföreningar).
 * - Annars → fasta demoföreningar (tom webbläsare / plattformstest).
 */
export function listaInloggningsForeningar(): ForeningProfil[] {
  const egna = listaEgnaTestForeningar();
  if (egna.length > 0) return egna;
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
 * Föreslå kort söktext baserat på föreningsnamn (t.ex. «Brf St»).
 */
export function föreslaSokExempel(namn: string): string {
  const trimmat = namn.trim();
  if (!trimmat) return "Brf St";
  const utanBrf = trimmat.replace(/^brf\s+/i, "").trim();
  const del = utanBrf.slice(0, Math.min(4, Math.max(2, utanBrf.length))) || "St";
  return trimmat.toLowerCase().startsWith("brf")
    ? `${INLOGGNING_BRF_PREFIX}${del}`
    : del;
}

/**
 * Tidigare: skapade föreningar doldes tills minst 2 bokstäver skrivits.
 * Det gjorde att Testföreningar såg tomt ut. Skapade visas nu direkt.
 */
export function sokKräverFlerBokstaver(
  _soktext: string,
  _foreningar: ForeningProfil[],
): boolean {
  return false;
}

/**
 * Filtrerar på bokstäver efter «Brf ».
 * Tomt / enbart «Brf» → hela listan.
 * Matchar även namn med/utan mellanslag (Stora huset ≈ Storahuset).
 */
export function filtreraForeningarPaSok(
  foreningar: ForeningProfil[],
  soktext: string,
): ForeningProfil[] {
  const q = soktext.trim();
  if (!q || normaliseraForeningsNamn(q) === "brf") {
    return foreningar;
  }

  return foreningar.filter((f) => matcharNamn(f.namn, q));
}

/** Säkerställer att söktexten börjar med «Brf » (behåller användarens fortsättning). */
export function normaliseraBrfSoktext(varde: string): string {
  const utanPrefix = varde.replace(/^brf\s*/i, "");
  return `${INLOGGNING_BRF_PREFIX}${utanPrefix}`;
}
