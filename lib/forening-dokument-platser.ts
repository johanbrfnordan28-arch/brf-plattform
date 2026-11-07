import {
  deladFilPlats,
  taBortForeningFilFranPlats,
  type DeladFil,
} from "@/lib/forening-fil-lagring";
import {
  foreningsHuvudmappar,
  undermappNoderForHuvud,
} from "@/components/foreningsinformation/mappar";
import {
  lasBibliotekState,
  sparaBibliotekState,
} from "@/components/foreningsinformation/foreningsinformation-bibliotek-lager";
import {
  lasForeningsDokument,
  sparaForeningsDokument,
  type ForeningsDokument,
} from "@/components/dokumentbank/forening-dokumenter-lager";
import {
  arshjulStorageKey,
  normaliseraHandelse,
  type ArshjulHandelse,
} from "@/components/arshjul/arshjul";
import {
  lasProjektLista,
  sparaProjektLista,
} from "@/components/dokumentbank/dokument-projekt-koppling";
import { allaMappIds, hamtaMappTitel } from "@/components/projekt/projekt";
import {
  besiktningTjanst,
  type BesiktningTjanstId,
} from "@/components/foreningsinformation/besiktning-upphandling";
import { upphandlingensFiler } from "@/components/upphandling/upphandling-dokument-lager";
import { safeSetLocalStorage } from "@/lib/localStorage";

export type DokumentPlatsTyp = "styrning" | "dokumentbank" | "arshjul" | "projekt";

export type DokumentPlats =
  | { typ: "styrning"; huvudId: string; underPath: string }
  | { typ: "dokumentbank" }
  | { typ: "arshjul"; handelseId: string }
  | { typ: "projekt"; projektId: string; mappId: string };

export type PlatsVal = { nyckel: string; etikett: string; plats: DokumentPlats };

const ARSHJUL_MAX_BILAGOR = 6;

export function platsNyckel(plats: DokumentPlats): string {
  switch (plats.typ) {
    case "styrning":
      return `styrning:${plats.huvudId}/${plats.underPath}`;
    case "dokumentbank":
      return "dokumentbank";
    case "arshjul":
      return `arshjul:${plats.handelseId}`;
    case "projekt":
      return `projekt:${plats.projektId}/${plats.mappId}`;
  }
}

function nyttId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function idag(): string {
  return new Date().toLocaleDateString("sv-SE");
}

// ── Val att visa vid uppladdning ─────────────────────────────────────────────

export function styrningsMappVal(): PlatsVal[] {
  return foreningsHuvudmappar.flatMap((huvud) =>
    undermappNoderForHuvud(huvud)
      .filter((nod) => nod.isLeaf)
      .map((nod) => {
        const plats: DokumentPlats = {
          typ: "styrning",
          huvudId: huvud.id,
          underPath: nod.path,
        };
        return {
          nyckel: platsNyckel(plats),
          etikett: `${huvud.titel.replace(/^\d+\.\s*/, "")} → ${nod.under.titel}`,
          plats,
        };
      }),
  );
}

export function lasArshjulLista(): ArshjulHandelse[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(arshjulStorageKey());
    return raw ? (JSON.parse(raw) as ArshjulHandelse[]).map(normaliseraHandelse) : [];
  } catch {
    return [];
  }
}

export function arshjulVal(): PlatsVal[] {
  return lasArshjulLista()
    .filter((h) => h.titel?.trim())
    .map((h) => {
      const plats: DokumentPlats = { typ: "arshjul", handelseId: h.id };
      return { nyckel: platsNyckel(plats), etikett: h.titel.trim(), plats };
    })
    .sort((a, b) => a.etikett.localeCompare(b.etikett, "sv"));
}

export function projektMappVal(): PlatsVal[] {
  return lasProjektLista().flatMap((p) =>
    allaMappIds(p).map((mappId) => {
      const plats: DokumentPlats = { typ: "projekt", projektId: p.id, mappId };
      return {
        nyckel: platsNyckel(plats),
        etikett: `${p.titel} (${p.ar}) → ${hamtaMappTitel(p, mappId)}`,
        plats,
      };
    }),
  );
}

// ── Besiktningar: protokollen bor i Styrning och Dokument ───────────────────

/** Mappen i Styrning och Dokument där besiktningens protokoll hör hemma. */
export function styrningPlatsForBesiktning(tjanstId: BesiktningTjanstId): DokumentPlats | null {
  const mappId = besiktningTjanst(tjanstId).mappId;
  for (const huvud of foreningsHuvudmappar) {
    const nod = undermappNoderForHuvud(huvud).find((n) => n.isLeaf && n.under.id === mappId);
    if (nod) return { typ: "styrning", huvudId: huvud.id, underPath: nod.path };
  }
  return null;
}

// ── Länka till ett ställe (skriver direkt i modulens lagring) ────────────────

/**
 * Lägger in filen på ett ställe som inte är öppet just nu.
 * Den modul man laddar upp från lägger själv in filen i sitt eget tillstånd.
 */
export function lankaFilTillPlats(
  plats: DokumentPlats,
  fil: DeladFil,
): { ok: true } | { ok: false; fel: string } {
  switch (plats.typ) {
    case "styrning": {
      const state = lasBibliotekState() ?? {};
      const huvud = state[plats.huvudId] ?? { öppen: false, undermappar: {} };
      const under = huvud.undermappar[plats.underPath] ?? { öppen: false, dokument: [] };
      if (under.dokument.some((d) => d.fil?.filId === fil.filId)) return { ok: true };
      state[plats.huvudId] = {
        ...huvud,
        undermappar: {
          ...huvud.undermappar,
          [plats.underPath]: {
            ...under,
            dokument: [
              ...under.dokument,
              { id: nyttId("lank"), filnamn: fil.filnamn, uppladdad: idag(), fil },
            ],
          },
        },
      };
      return sparaBibliotekState(state)
        ? { ok: true }
        : { ok: false, fel: "Kunde inte spara i Styrning och Dokument." };
    }
    case "dokumentbank": {
      const lager = lasForeningsDokument();
      if (lager.dokument.some((d) => d.fil?.filId === fil.filId)) return { ok: true };
      const nu = new Date().toISOString();
      const dokument: ForeningsDokument = {
        id: nyttId("forening-doc"),
        mallId: "uppladdad-fil",
        mallTitel: "Eget uppladdat dokument",
        mallFilnamn: fil.filnamn,
        titel: fil.filnamn.replace(/\.[^.]+$/, ""),
        status: "klar",
        skapadDatum: nu,
        uppdateradDatum: nu,
        notering: "",
        omrade: "ovrig",
        dokumentKalla: "fil",
        fil,
        koppladeProjektId: [],
      };
      sparaForeningsDokument({ ...lager, dokument: [dokument, ...lager.dokument] });
      return { ok: true };
    }
    case "arshjul": {
      const lista = lasArshjulLista();
      const h = lista.find((x) => x.id === plats.handelseId);
      if (!h) return { ok: false, fel: "Årshjulshändelsen hittades inte." };
      const bilagor = h.bilagor ?? [];
      if (bilagor.some((b) => b.fil?.filId === fil.filId)) return { ok: true };
      if (bilagor.length >= ARSHJUL_MAX_BILAGOR) {
        return { ok: false, fel: `${h.titel} har redan ${ARSHJUL_MAX_BILAGOR} bilagor.` };
      }
      const ny = lista.map((x) =>
        x.id === h.id
          ? normaliseraHandelse({
              ...x,
              bilagor: [...bilagor, { id: nyttId("bil"), filnamn: fil.filnamn, dataUrl: "", fil }],
            })
          : x,
      );
      return safeSetLocalStorage(arshjulStorageKey(), JSON.stringify(ny)).ok
        ? { ok: true }
        : { ok: false, fel: "Kunde inte spara i årshjulet." };
    }
    case "projekt": {
      const lista = lasProjektLista();
      const p = lista.find((x) => x.id === plats.projektId);
      const mapp = p?.mappar[plats.mappId];
      if (!p || !mapp) return { ok: false, fel: "Projektmappen hittades inte." };
      if (mapp.dokument.some((d) => d.fil?.filId === fil.filId)) return { ok: true };
      const ny = lista.map((x) =>
        x.id === p.id
          ? {
              ...x,
              mappar: {
                ...x.mappar,
                [plats.mappId]: {
                  ...mapp,
                  dokument: [
                    ...mapp.dokument,
                    {
                      id: nyttId("projdok"),
                      filnamn: fil.filnamn,
                      uppladdad: idag(),
                      kalla: "upload" as const,
                      fil,
                    },
                  ],
                },
              },
            }
          : x,
      );
      return sparaProjektLista(ny)
        ? { ok: true }
        : { ok: false, fel: "Kunde inte spara i projektet." };
    }
  }
}

/** Länkar till alla valda ställen och ger tillbaka eventuella fel som en text. */
export function lankaFilTillPlatser(platser: DokumentPlats[], fil: DeladFil): string | null {
  const fel = platser
    .map((plats) => lankaFilTillPlats(plats, fil))
    .filter((r): r is { ok: false; fel: string } => !r.ok)
    .map((r) => r.fel);
  return fel.length > 0 ? fel.join(" ") : null;
}

// ── Borttagning ──────────────────────────────────────────────────────────────

/** Tar bort filen ur en mapp i Styrning och Dokument; filen raderas om den inte syns någon annanstans. */
export function taBortFilUrStyrningsMapp(
  huvudId: string,
  underPath: string,
  fil: DeladFil,
): void {
  const state = lasBibliotekState();
  const under = state?.[huvudId]?.undermappar?.[underPath];
  if (!state || !under) {
    slappDeladFil(fil, "");
    return;
  }
  const borttagna = under.dokument.filter((d) => d.fil?.filId === fil.filId);
  state[huvudId].undermappar[underPath] = {
    ...under,
    dokument: under.dokument.filter((d) => d.fil?.filId !== fil.filId),
  };
  sparaBibliotekState(state);
  slappDeladFil(fil, borttagna[0]?.id ?? "");
}

/** Räknar alla ställen där filen syns, utom posten med id `ignoreraPostId`. */
function antalReferenser(filId: string, ignoreraPostId: string): number {
  let antal = 0;
  const rakna = (postId: string, fil?: DeladFil) => {
    if (fil?.filId === filId && postId !== ignoreraPostId) antal += 1;
  };

  for (const huvud of Object.values(lasBibliotekState() ?? {})) {
    for (const under of Object.values(huvud.undermappar ?? {})) {
      for (const d of under.dokument ?? []) rakna(d.id, d.fil);
    }
  }
  for (const d of lasForeningsDokument().dokument) {
    if (d.fil && "filId" in d.fil) rakna(d.id, d.fil as DeladFil);
  }
  for (const h of lasArshjulLista()) {
    for (const b of h.bilagor ?? []) rakna(b.id, b.fil);
  }
  for (const p of lasProjektLista()) {
    for (const mapp of Object.values(p.mappar)) {
      for (const d of mapp.dokument) rakna(d.id, d.fil);
    }
  }
  for (const rad of upphandlingensFiler()) rakna(rad.postId, rad.fil);
  return antal;
}

/**
 * Anropas när en post tas bort på ett ställe. Själva filen raderas bara
 * om den inte längre visas någon annanstans.
 */
export function slappDeladFil(fil: DeladFil, borttagenPostId: string): void {
  if (antalReferenser(fil.filId, borttagenPostId) > 0) return;
  taBortForeningFilFranPlats(deladFilPlats(fil));
}
