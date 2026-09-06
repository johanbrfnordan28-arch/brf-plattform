/** Vägg, golv och tak i soprum, cykelrum och förråd — material och planerad åtgärd. */

export type LokalYtskiktDelId = "golv" | "vaggar" | "tak";

export type LokalYtskiktAtgard = {
  id: string;
  etikett: string;
};

export type LokalYtskiktMaterial = {
  id: string;
  etikett: string;
  beskrivning?: string;
  atgarder: LokalYtskiktAtgard[];
};

export type LokalYtskiktDelMall = {
  id: LokalYtskiktDelId;
  etikett: string;
  hint: string;
  material: LokalYtskiktMaterial[];
};

export const lokalYtskiktDelar: LokalYtskiktDelMall[] = [
  {
    id: "golv",
    etikett: "Golv",
    hint: "Välj underlag och planerad åtgärd — t.ex. betong som målas eller dammhärdas.",
    material: [
      {
        id: "betong",
        etikett: "Betong",
        beskrivning: "Obehandlat eller tidigare behandlat betonggolv.",
        atgarder: [
          { id: "malning", etikett: "Målning" },
          { id: "dammbindning", etikett: "Dammbindning / dammhärdning" },
          { id: "epoxi", etikett: "Epoxibeläggning" },
          { id: "slipning", etikett: "Slipning / underhåll" },
        ],
      },
      {
        id: "betongplattor",
        etikett: "Släta betongplattor",
        beskrivning: "Golv av släta betongplattor — vanligt i oisolerade komplementbyggnader.",
        atgarder: [
          { id: "underhall", etikett: "Underhåll / kontroll" },
          { id: "malning", etikett: "Målning" },
          { id: "dammbindning", etikett: "Dammbindning" },
        ],
      },
      {
        id: "klinker",
        etikett: "Klinker / sten",
        atgarder: [
          { id: "underhall", etikett: "Underhåll / fogning" },
          { id: "omlaggning", etikett: "Omläggning" },
        ],
      },
      {
        id: "tra",
        etikett: "Trä / parkett",
        atgarder: [
          { id: "slipning-lack", etikett: "Slipning och lack" },
          { id: "olja", etikett: "Oljning" },
        ],
      },
    ],
  },
  {
    id: "vaggar",
    etikett: "Väggar",
    hint: "Trä kan målas eller oljas; betong och puts målas ofta.",
    material: [
      {
        id: "tra",
        etikett: "Trä",
        atgarder: [
          { id: "malning", etikett: "Målning" },
          { id: "olja", etikett: "Oljning" },
          { id: "lasur", etikett: "Lasur" },
        ],
      },
      {
        id: "betong",
        etikett: "Betong / puts",
        atgarder: [
          { id: "malning", etikett: "Målning" },
          { id: "spackling-malning", etikett: "Spackling och målning" },
        ],
      },
      {
        id: "kakel",
        etikett: "Kakel",
        atgarder: [
          { id: "underhall", etikett: "Underhåll / fogning" },
          { id: "omlaggning", etikett: "Omläggning" },
        ],
      },
      {
        id: "gips",
        etikett: "Gips / skivvägg",
        atgarder: [
          { id: "malning", etikett: "Målning" },
          { id: "tapet", etikett: "Tapetsering" },
        ],
      },
    ],
  },
  {
    id: "tak",
    etikett: "Tak",
    hint: "Takbeläggning eller undertak — tegel, plåt eller sedum enligt konstruktion.",
    material: [
      {
        id: "tegel",
        etikett: "Tegel",
        atgarder: [
          { id: "underhall", etikett: "Underhåll / kontroll" },
          { id: "omlaggning", etikett: "Omläggning" },
        ],
      },
      {
        id: "bandlagd-plat",
        etikett: "Bandlagd plåttak",
        atgarder: [
          { id: "underhall", etikett: "Underhåll / tätning" },
          { id: "omlaggning", etikett: "Omläggning" },
        ],
      },
      {
        id: "korrugerad-plat",
        etikett: "Korrugerad plåt",
        atgarder: [
          { id: "underhall", etikett: "Underhåll / tätning" },
          { id: "omlaggning", etikett: "Omläggning" },
        ],
      },
      {
        id: "sedum",
        etikett: "Sedumtak",
        atgarder: [
          { id: "underhall", etikett: "Underhåll / beskärning" },
          { id: "renovering", etikett: "Renovering av växtlager" },
        ],
      },
      {
        id: "betong-platta",
        etikett: "Betongplatta / undertak",
        atgarder: [
          { id: "malning", etikett: "Målning undertak" },
          { id: "underhall", etikett: "Underhåll" },
        ],
      },
    ],
  },
];

export type LokalYtskiktDelRad = {
  delId: LokalYtskiktDelId;
  aktiv: boolean;
  materialId: string;
  atgardId: string;
  kvm: string;
};

export function skapaTomLokalYtskikt(): LokalYtskiktDelRad[] {
  return lokalYtskiktDelar.map((del) => {
    const material = del.material[0];
    return {
      delId: del.id,
      aktiv: false,
      materialId: material?.id ?? "",
      atgardId: material?.atgarder[0]?.id ?? "",
      kvm: "",
    };
  });
}

export function hamtaLokalYtskiktDel(delId: LokalYtskiktDelId): LokalYtskiktDelMall | undefined {
  return lokalYtskiktDelar.find((d) => d.id === delId);
}

export function hamtaLokalYtskiktMaterial(
  delId: LokalYtskiktDelId,
  materialId: string,
): LokalYtskiktMaterial | undefined {
  return hamtaLokalYtskiktDel(delId)?.material.find((m) => m.id === materialId);
}

export function standardAtgardForMaterial(
  delId: LokalYtskiktDelId,
  materialId: string,
): string {
  return hamtaLokalYtskiktMaterial(delId, materialId)?.atgarder[0]?.id ?? "";
}

export function lokalYtskiktDelEtikett(delId: string): string {
  return lokalYtskiktDelar.find((d) => d.id === delId)?.etikett ?? delId;
}

export function formateraLokalYtskiktDel(rad: LokalYtskiktDelRad): string | null {
  if (!rad.aktiv) return null;
  const del = hamtaLokalYtskiktDel(rad.delId);
  const mat = hamtaLokalYtskiktMaterial(rad.delId, rad.materialId);
  if (!del || !mat) return del?.etikett ?? rad.delId;

  const atgard = mat.atgarder.find((a) => a.id === rad.atgardId);
  const yta = rad.kvm.trim() ? ` ${rad.kvm.trim()} m²` : "";
  return `${mat.etikett} — ${atgard?.etikett ?? rad.atgardId}${yta}`;
}

export function formateraLokalYtskikt(rader: LokalYtskiktDelRad[]): string {
  const delar = rader
    .map((r) => {
      const text = formateraLokalYtskiktDel(r);
      if (!text) return null;
      return `${lokalYtskiktDelEtikett(r.delId)}: ${text}`;
    })
    .filter((s): s is string => s != null);
  return delar.join(" · ");
}
