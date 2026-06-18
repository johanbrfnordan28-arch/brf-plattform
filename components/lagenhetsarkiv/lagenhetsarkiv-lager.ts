import {
  lagenhetsBasSidor,
  skapaLagenhetsDokumentId,
  skapaRenoveringsMapp,
  type ApartmentFolder,
} from "@/components/lagenhetsarkiv/lagenhetsarkiv";
import { safeSetLocalStorage } from "@/lib/localStorage";
import { foreningStorageKey } from "@/lib/foreningStorage";

const LAGENHETSARKIV_BASE = "brf-lagenhetsarkiv-v2";

export const LAGENHETSARKIV_EVENT = "lagenhetsarkiv-uppdaterad";

export function lagenhetsarkivStorageKey(): string {
  return foreningStorageKey(LAGENHETSARKIV_BASE);
}

export type LagenhetsarkivState = {
  apartments: ApartmentFolder[];
  nextApartmentNumber: number;
};

export function skapaGrundmallDemoArkiv(): LagenhetsarkivState {
  const badrum2024 = skapaRenoveringsMapp("badrum", {
    id: 1,
    namn: "Badrumsrenovering 2024",
    ar: 2024,
  });
  const handlingar = badrum2024.undermappar.find((u) => u.typ === "handlingar");
  if (handlingar) {
    handlingar.dokument = [
      {
        id: skapaLagenhetsDokumentId(),
        filnamn: "Renoveringsanmälan.pdf",
        uppladdad: "2024-03-12",
      },
      {
        id: skapaLagenhetsDokumentId(),
        filnamn: "Intyg våtrum.pdf",
        uppladdad: "2024-06-01",
      },
    ];
  }

  const apartments: ApartmentFolder[] = [
    {
      id: 1,
      lagenhetsnummer: "1001",
      basePages: [...lagenhetsBasSidor],
      folders: [badrum2024],
      adress: "Storgatan 1, lgh 1001",
      vaning: "3",
      boyta: "78",
      antalBadrum: "1",
      antalWC: "1",
      lagenhetsRum: {
        hall: {
          besiktning: { status: "normalt", senastBesiktad: "2025-03-15" },
          uppvarmning: { typ: "radiator", antal: "2" },
        },
        kok: {
          senasteRenovering: { ar: "2019", harDokumentation: true },
          lackagekydd: { diskmaskin: true, kylFrys: true },
          besiktning: { status: "observera" },
          uppvarmning: { typ: "golvvarme-vatten", antal: "1" },
        },
        badrum: {
          senasteRenovering: { ar: "2024", harBilder: true },
          besiktning: { status: "bra" },
          kontrollpunkter: {
            tatskiktGolvbrunn: "ok",
            tappvatten: { plats: "rorschakt", lackageIndikering: true },
          },
          uppvarmning: { typ: "golvvarme-el", antal: "1" },
        },
        ovrigaRum: [],
      },
      eldstader: [
        {
          id: "eldstad-demo-1",
          godkand: true,
          eldningsforbud: false,
        },
      ],
    },
    ...["1002", "1003", "1004", "1005"].map((nr, index) => ({
      id: index + 2,
      lagenhetsnummer: nr,
      basePages: [...lagenhetsBasSidor],
      folders: [],
    })),
  ];

  return {
    apartments,
    nextApartmentNumber: 1006,
  };
}

export function skapaTomtLagenhetsarkiv(): LagenhetsarkivState {
  return {
    apartments: [
      {
        id: 1,
        lagenhetsnummer: "1001",
        basePages: [...lagenhetsBasSidor],
        folders: [],
      },
    ],
    nextApartmentNumber: 1002,
  };
}

function normaliseraState(raw: unknown): LagenhetsarkivState | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Partial<LagenhetsarkivState>;
  if (!Array.isArray(data.apartments) || data.apartments.length === 0) return null;
  const nextApartmentNumber =
    typeof data.nextApartmentNumber === "number" && data.nextApartmentNumber > 0
      ? data.nextApartmentNumber
      : 1002;
  return {
    apartments: data.apartments,
    nextApartmentNumber,
  };
}

export function lasLagenhetsarkiv(): LagenhetsarkivState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(lagenhetsarkivStorageKey());
    if (!raw) return null;
    return normaliseraState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function sparaLagenhetsarkiv(state: LagenhetsarkivState): boolean {
  if (typeof window === "undefined") return false;
  const ok = safeSetLocalStorage(
    lagenhetsarkivStorageKey(),
    JSON.stringify(state),
  ).ok;
  if (ok) {
    window.dispatchEvent(new Event(LAGENHETSARKIV_EVENT));
  }
  return ok;
}
