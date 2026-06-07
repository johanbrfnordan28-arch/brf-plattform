import {
  hamtaKomponentMall,
  type KomponentDetaljData,
  type UnderkomponentRad,
} from "@/components/underhallsplan/komponentregister";
import { effektivUnderhallKostnadKr } from "@/components/underhallsplan/underhall-kostnad";

/** Referens till en planerad åtgärd som flyttats till projekt. */
export type PlaneradAtgardRef = {
  komponent: string;
  underkomponentId: string;
  etikett: string;
  planeratAr: number;
  kostnadKr?: number;
};

export type KommandeProjekt = {
  id: string;
  titel: string;
  beskrivning: string;
  planeratAr: number;
  uppskattadKostnadKr?: number;
  atgarder: PlaneradAtgardRef[];
  skapad: string;
  uppdaterad: string;
};

export type AtgardForProjektLank = PlaneradAtgardRef & {
  redanFlyttad: boolean;
  projektId?: string;
  projektTitel?: string;
};

export function skapaKommandeProjektId(): string {
  return `projekt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Kommande projekt: 1–3 år från planstart (minst innevarande år). */
export function hamtaProjektArspann(planStartAr: number): {
  minAr: number;
  maxAr: number;
} {
  const nu = new Date().getFullYear();
  const bas = Math.max(planStartAr, nu);
  return { minAr: bas + 1, maxAr: bas + 3 };
}

export function atgardRefNyckel(komponent: string, underkomponentId: string): string {
  return `${komponent}|${underkomponentId}`;
}

export function sammanstallAtgarderForProjektLank(
  register: Record<string, KomponentDetaljData>,
  planStartAr: number,
): AtgardForProjektLank[] {
  const { minAr, maxAr } = hamtaProjektArspann(planStartAr);
  const rader: AtgardForProjektLank[] = [];

  for (const [komponent, data] of Object.entries(register)) {
    const mall = hamtaKomponentMall(komponent);
    for (const rad of data.underkomponenter) {
      if (!rad.aktiv) continue;
      const nasta = Number.parseInt(rad.underhallNastaAr ?? "", 10);
      if (Number.isNaN(nasta) || nasta < minAr || nasta > maxAr) continue;

      const effektiv = effektivUnderhallKostnadKr(rad);
      const kostnad = effektiv > 0 ? effektiv : undefined;
      const def = mall.underkomponenter.find((u) => u.id === rad.id);
      const ref: AtgardForProjektLank = {
        komponent,
        underkomponentId: rad.id,
        etikett: def?.etikett ?? rad.etikett,
        planeratAr: nasta,
        kostnadKr: Number.isNaN(kostnad ?? NaN) ? undefined : kostnad,
        redanFlyttad: Boolean(rad.underhallFlyttadTillProjektId),
        projektId: rad.underhallFlyttadTillProjektId,
      };
      rader.push(ref);
    }
  }

  return rader.sort(
    (a, b) =>
      a.planeratAr - b.planeratAr ||
      a.komponent.localeCompare(b.komponent) ||
      a.etikett.localeCompare(b.etikett),
  );
}

export function uppdateraKomponentFlyttadTillProjekt(
  data: KomponentDetaljData,
  underkomponentId: string,
  projektId: string | undefined,
): KomponentDetaljData {
  return {
    ...data,
    underkomponenter: data.underkomponenter.map((rad) =>
      rad.id === underkomponentId
        ? { ...rad, underhallFlyttadTillProjektId: projektId }
        : rad,
    ),
  };
}

export function flyttaAtgardTillProjekt(
  register: Record<string, KomponentDetaljData>,
  projekt: KommandeProjekt,
  ref: PlaneradAtgardRef,
): { register: Record<string, KomponentDetaljData>; projekt: KommandeProjekt } {
  const data = register[ref.komponent];
  if (!data) return { register, projekt };

  const nyRegister = {
    ...register,
    [ref.komponent]: uppdateraKomponentFlyttadTillProjekt(
      data,
      ref.underkomponentId,
      projekt.id,
    ),
  };

  const nyckel = atgardRefNyckel(ref.komponent, ref.underkomponentId);
  const atgarder = projekt.atgarder.filter(
    (a) => atgardRefNyckel(a.komponent, a.underkomponentId) !== nyckel,
  );
  atgarder.push(ref);

  return {
    register: nyRegister,
    projekt: {
      ...projekt,
      atgarder,
      uppdaterad: new Date().toISOString(),
    },
  };
}

export function frigörAtgardFranProjekt(
  register: Record<string, KomponentDetaljData>,
  ref: PlaneradAtgardRef,
): Record<string, KomponentDetaljData> {
  const data = register[ref.komponent];
  if (!data) return register;
  return {
    ...register,
    [ref.komponent]: uppdateraKomponentFlyttadTillProjekt(
      data,
      ref.underkomponentId,
      undefined,
    ),
  };
}

export function frigörAllaProjektAtgarder(
  register: Record<string, KomponentDetaljData>,
  projekt: KommandeProjekt,
): Record<string, KomponentDetaljData> {
  let next = register;
  for (const ref of projekt.atgarder) {
    next = frigörAtgardFranProjekt(next, ref);
  }
  return next;
}

export function arUnderhallFlyttad(rad: UnderkomponentRad): boolean {
  return Boolean(rad.underhallFlyttadTillProjektId?.trim());
}
