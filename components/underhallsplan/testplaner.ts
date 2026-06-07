import {
  skapaStandardBesiktningar,
  type Besiktning,
} from "@/components/underhallsplan/besiktningar";
import {
  skapaTomDorrPost,
  skapaTomFonsterDorrPost,
} from "@/components/underhallsplan/fonster-dorrar";
import { skapaTomBalkongPost } from "@/components/underhallsplan/balkonger";
import { skapaTomHissPost } from "@/components/underhallsplan/hissar";
import { skapaTomStambyteSanitet } from "@/components/underhallsplan/vvs-stambyte";
import {
  skapaTomVvsStambyteData,
  type VvsStambyteData,
} from "@/components/underhallsplan/vvs-stambyte";
import {
  skapaTomTakfonsterKombinationPost,
  skapaTomTakfonsterSingelPost,
} from "@/components/underhallsplan/takfonster";
import {
  skapaTomKomponentDetalj,
  synkaKomponentRegister,
  type KomponentDetaljData,
} from "@/components/underhallsplan/komponentregister";
import {
  standardPlaninstallningar,
  standardPlanLangdAr,
  type Planinstallningar,
} from "@/components/underhallsplan/planinstallningar";
import { sammanstallRenoveringar } from "@/components/underhallsplan/renoveringar";
import type { UtfördRenovering } from "@/components/underhallsplan/renoveringar";
import { hamtaTestplanRenoveringar } from "@/components/underhallsplan/testplan-renoveringar";
import type {
  Grunduppgifter,
  RenoveringSammanfattning,
} from "@/components/underhallsplan/types";

export type TestplanId =
  | "test-1900"
  | "test-50"
  | "test-70"
  | "test-90"
  | "test-sailor"
  | "test-nordan-28"
  | "test-nordan-30";

export type TestplanDefinition = {
  id: TestplanId;
  /** Kort etikett i testväljaren */
  kortNamn: string;
  namn: string;
  beskrivning: string;
  planNotering?: string;
  grund: Grunduppgifter;
  activeComponents: string[];
  komponentDetaljer?: Record<string, KomponentDetaljData>;
  besiktningar: Besiktning[];
  krPerKvmAr: number;
  planinstallningar: Planinstallningar;
  renoveringarLista: UtfördRenovering[];
  renoveringar: RenoveringSammanfattning;
};

const planStartAr = new Date().getFullYear();

function testplaninstallningar(): Planinstallningar {
  return standardPlaninstallningar();
}

function renoveringarPaket(id: TestplanId): {
  renoveringarLista: UtfördRenovering[];
  renoveringar: RenoveringSammanfattning;
} {
  const renoveringarLista = hamtaTestplanRenoveringar(id);
  return {
    renoveringarLista,
    renoveringar: sammanstallRenoveringar(renoveringarLista),
  };
}

function stambyteData(lgh: number, patch?: Partial<VvsStambyteData>): VvsStambyteData {
  const sanitet = skapaTomStambyteSanitet().map((r) => {
    if (r.delId === "wc" || r.delId === "handfat")
      return { ...r, aktiv: true, antal: String(lgh) };
    if (r.delId === "dusch")
      return { ...r, aktiv: true, antal: String(Math.max(1, lgh - 2)) };
    if (r.delId === "golvvärme")
      return { ...r, aktiv: lgh >= 20, antal: String(lgh) };
    return r;
  });
  const vert = String(Math.round(lgh * 7));
  const horis = String(Math.round(lgh * 3.5));
  return {
    ...skapaTomVvsStambyteData(),
    antalBadrum: String(lgh),
    golvKvm: "4.2",
    vaggarKvm: "18",
    takKvm: "4.2",
    stommeKvm: "12",
    sanitet,
    vattenMaterial: "koppar",
    vattenMaterialAnnanText: "",
    vattenVertikalKallvattenLpm: vert,
    vattenVertikalVarmvattenLpm: vert,
    vattenVertikalCirkulationLpm: vert,
    vattenHorisontellKallvattenLpm: horis,
    vattenHorisontellVarmvattenLpm: horis,
    vattenHorisontellCirkulationLpm: horis,
    stamventilerAntal: String(Math.max(2, Math.ceil(lgh / 12))),
    stamventilLagenhetAntal: String(lgh),
    teknikskapAntal: lgh >= 40 ? "2" : "1",
    avloppVertikalStamLpm: String(Math.round(lgh * 16)),
    avloppHorisontellStamLpm: String(Math.round(lgh * 11)),
    avloppAvstickAntal: String(lgh),
    avloppGrenBadrumAntal: String(lgh),
    avloppGrenWcAntal: String(lgh),
    avloppMaterial: "gjutjarn",
    avloppMaterialAnnanText: "",
    brandmanschettAntal: String(Math.max(0, lgh - 1)),
    ...patch,
  };
}

type BesiktningProfil = {
  lgh: number;
  hiss?: boolean;
  antalHissar?: number;
  sotning?: boolean;
  eldstader?: number;
  ovkKr?: number;
  ovkIntervall?: number;
  ovkOffset?: number;
};

function besiktningarFor(p: BesiktningProfil): Besiktning[] {
  const lista = skapaStandardBesiktningar();
  return lista.map((b) => {
    if (b.id === "ovk")
      return {
        ...b,
        kostnadPerLagenhetKr: p.ovkKr ?? 320,
        intervallAr: p.ovkIntervall ?? 6,
        ovkIntervallVerksamhetAr: 3,
        nastaBesiktningAr: planStartAr + (p.ovkOffset ?? 0),
      };
    if (b.id === "sotning")
      return {
        ...b,
        aktiv: p.sotning ?? false,
        kostnadPerLagenhetKr: 48,
        kostnadPerEldstadKr: 820,
        antalEldstäder: p.eldstader ?? 0,
      };
    if (b.id === "hiss")
      return {
        ...b,
        aktiv: p.hiss ?? false,
        antalHissar: p.antalHissar ?? (p.hiss ? 1 : 0),
      };
    if (b.id === "radon")
      return {
        ...b,
        kostnadFastKr: 12_000,
        nastaBesiktningAr: planStartAr + 2,
      };
    if (b.id === "energideklaration")
      return {
        ...b,
        kostnadFastKr: 18_000,
        nastaBesiktningAr: planStartAr + 4,
      };
    return b;
  });
}

/** Sekelskifte — 15 lägenheter, ca 1908 */
export const testplan1900: TestplanDefinition = {
  id: "test-1900",
  kortNamn: "1900-tal · 15 lgh",
  namn: "Brf Hagalund — sekelskifte (15 lägenheter)",
  beskrivning:
    "Tegelhus från 1908 med träfönster och självdrag. Liten förening för att testa enkel skala och äldre byggnadsdelar.",
  planNotering:
    "Fasad: tegel med putsband. Planerat: fönsterrenovering och takomläggning. Ingen hiss — trapphus med original stuckatur.",
  grund: {
    boarea: "975",
    lokalyta: "95",
    antalLagenheter: "15",
    byggar: "1908",
    tomtstorlek: "1 100",
    antalVaningar: "4",
    antalByggnader: "1",
    adresser: ["Hagalundsgatan 14"],
    uppvarmning: "Fjärrvärme (byte 1986)",
    ventilationssystem: "S — självdragsventilation",
    fastighetsbeteckning: "Stockholm Hagalund 1:42",
  },
  activeComponents: [
    "Fasad",
    "Tak",
    "Trapphus",
    "Källare",
    "VVS",
    "Värmecentral",
    "Ventilation",
  ],
  komponentDetaljer: synkaKomponentRegister(
    ["Fasad", "Tak", "Trapphus", "Källare", "VVS", "Värmecentral", "Ventilation"],
    {
      Fasad: {
        ...skapaTomKomponentDetalj("Fasad"),
        valdaDeltyper: ["tegel"],
        underkomponenter: skapaTomKomponentDetalj("Fasad").underkomponenter.map(
          (r) => {
            if (r.id === "fasadmaterial")
              return { ...r, aktiv: true, värde: "720" };
            if (r.id === "fonster" || r.id === "dorrar")
              return { ...r, aktiv: true };
            return r;
          },
        ),
        fonsterDorrRegister: {
          fonster: [
            {
              ...skapaTomFonsterDorrPost(),
              modulmatt: "12×14",
              material: "tra",
              antal: "30",
              traUnderhall: "renovering",
            },
            {
              ...skapaTomFonsterDorrPost(),
              modulmatt: "9×12",
              material: "tra",
              antal: "15",
              traUnderhall: "malning",
            },
          ],
          dorrar: [
            {
              ...skapaTomDorrPost(),
              modulmatt: "9×21",
              dorrMaterial: "malad-tra",
              antal: "2",
              dorrTraUnderhall: "renovering",
              harKodlas: false,
            },
          ],
        },
      },
      Tak: {
        ...skapaTomKomponentDetalj("Tak"),
        valdaDeltyper: ["tegel"],
        underkomponenter: skapaTomKomponentDetalj("Tak").underkomponenter.map(
          (rad) => {
            if (rad.id === "skorsten")
              return { ...rad, aktiv: true, måttenhet: "antal", värde: "3" };
            if (rad.id === "ventilationshuv")
              return { ...rad, aktiv: true, måttenhet: "antal", värde: "6" };
            return rad;
          },
        ),
      },
      VVS: {
        ...skapaTomKomponentDetalj("VVS"),
        valdaDeltyper: ["fjarrvarme"],
        underkomponenter: skapaTomKomponentDetalj("VVS").underkomponenter.map(
          (rad) => (rad.id === "stambyte" ? { ...rad, aktiv: true } : rad),
        ),
        vvsStambyteRegister: {
          stambyte: stambyteData(15, {
            vattenMaterial: "koppar",
            avloppMaterial: "gjutjarn",
          }),
        },
      },
      Värmecentral: {
        ...skapaTomKomponentDetalj("Värmecentral"),
        valdaDeltyper: ["fjarrvarme"],
        underkomponenter: skapaTomKomponentDetalj("Värmecentral").underkomponenter.map(
          (rad) => {
            if (rad.id === "undercentral")
              return { ...rad, aktiv: true, värde: "1" };
            if (rad.id === "radiatorer") return { ...rad, aktiv: true };
            return rad;
          },
        ),
        vvsRadiatorRegister: {
          radiatorer: {
            rorsystem: "tva-ror",
            aldre: {
              termostatAntal: "30",
              radiatorventilAntal: "15",
              radiatorkoppelAntal: "",
              packboxAntal: "10",
              helRadiatorAntal: "8",
            },
            nyare: {
              termostatAntal: "",
              radiatorventilAntal: "",
              radiatorkoppelAntal: "",
              packboxAntal: "",
              helRadiatorAntal: "",
            },
            varmerorMeter: "120",
          },
        },
      },
      Källare: {
        ...skapaTomKomponentDetalj("Källare"),
        valdaDeltyper: ["oupvarmd"],
        underkomponenter: skapaTomKomponentDetalj("Källare").underkomponenter.map(
          (rad) => {
            if (rad.id === "ytskikt")
              return {
                ...rad,
                aktiv: true,
                ytskikt: "malning",
                värde: "180",
              };
            if (rad.id === "forrad")
              return {
                ...rad,
                aktiv: true,
                forradMaterial: "tra",
                måttenhet: "löpmeter",
                värde: "45",
                forradAntalDorrar: "15",
              };
            if (rad.id === "belysning")
              return { ...rad, aktiv: true, värde: "12" };
            return rad;
          },
        ),
      },
    },
  ),
  besiktningar: besiktningarFor({
    lgh: 15,
    sotning: true,
    eldstader: 2,
    ovkKr: 380,
    ovkIntervall: 3,
  }),
  krPerKvmAr: 58,
  planinstallningar: testplaninstallningar(),
  ...renoveringarPaket("test-1900"),
};

/** 50-tal — 25 lägenheter, ca 1955 */
export const testplan50: TestplanDefinition = {
  id: "test-50",
  kortNamn: "50-tal · 25 lgh",
  namn: "Brf Tallvinden — 1950-tal (25 lägenheter)",
  beskrivning:
    "Typisk folkhemsfastighet med putsad fasad, balkonger i betong och mekanisk frånluft. Stambyte genomfört på 90-talet.",
  planNotering:
    "Fasad: puts. Balkonger i betong från 1962. Planerat: ommålning fasad och balkongtätning.",
  grund: {
    boarea: "1 375",
    lokalyta: "115",
    antalLagenheter: "25",
    byggar: "1955",
    tomtstorlek: "2 600",
    antalVaningar: "3",
    antalByggnader: "1",
    adresser: ["Tallvägen 8", "Tallvägen 10"],
    uppvarmning: "Fjärrvärme",
    ventilationssystem: "F — frånluftsfläkt och fönsterventiler (vanligast)",
    fastighetsbeteckning: "Göteborg Tallvinden 1:7",
  },
  activeComponents: [
    "Fasad",
    "Tak",
    "Trapphus",
    "Källare",
    "VVS",
    "Värmecentral",
    "Ventilation",
    "Mark och gård",
  ],
  komponentDetaljer: synkaKomponentRegister(
    [
      "Fasad",
      "Tak",
      "Trapphus",
      "Källare",
      "VVS",
      "Värmecentral",
      "Ventilation",
      "Mark och gård",
    ],
    {
      Fasad: {
        ...skapaTomKomponentDetalj("Fasad"),
        valdaDeltyper: ["puts"],
        underkomponenter: skapaTomKomponentDetalj("Fasad").underkomponenter.map(
          (r) => {
            if (r.id === "fasadmaterial")
              return { ...r, aktiv: true, värde: "420" };
            if (r.id === "fonster" || r.id === "dorrar" || r.id === "balkonger")
              return { ...r, aktiv: true };
            return r;
          },
        ),
        balkongRegister: {
          balkonger: [
            {
              ...skapaTomBalkongPost("Balkonger väster", "utvandig-balkong"),
              konstruktion: "helgjuten",
              rakeMaterial: "stal",
              rakeLopmeter: "95",
              golvMaterial: "betong",
              golvKvm: "190",
              delar: [
                { delId: "balkongplatta", aktiv: true, mangd: "190" },
                { delId: "tatskikt", aktiv: true, mangd: "190" },
                { delId: "sockel", aktiv: true, mangd: "42" },
                { delId: "avvattning", aktiv: true, mangd: "25" },
              ],
            },
          ],
        },
        fonsterDorrRegister: {
          fonster: [
            {
              ...skapaTomFonsterDorrPost(),
              adress: "Tallvägen 8",
              lage: "vaster",
              modulmatt: "9×21",
              material: "tra",
              antal: "14",
              traUnderhall: "malning",
            },
            {
              ...skapaTomFonsterDorrPost(),
              adress: "Tallvägen 8",
              lage: "oster",
              modulmatt: "9×21",
              material: "tra",
              antal: "12",
              traUnderhall: "malning",
            },
            {
              ...skapaTomFonsterDorrPost(),
              adress: "Tallvägen 10",
              lage: "soder",
              modulmatt: "9×21",
              material: "tra",
              antal: "12",
              traUnderhall: "malning",
            },
            {
              ...skapaTomFonsterDorrPost(),
              adress: "Tallvägen 10",
              lage: "norr",
              modulmatt: "9×21",
              material: "tra",
              antal: "12",
              traUnderhall: "malning",
            },
          ],
          dorrar: [
            {
              ...skapaTomDorrPost(),
              modulmatt: "9×21",
              dorrMaterial: "malad-tra",
              antal: "3",
              harKodlas: true,
            },
          ],
        },
      },
      VVS: {
        ...skapaTomKomponentDetalj("VVS"),
        valdaDeltyper: ["fjarrvarme"],
        underkomponenter: skapaTomKomponentDetalj("VVS").underkomponenter.map(
          (rad) =>
            rad.id === "stambyte"
              ? {
                  ...rad,
                  aktiv: true,
                  underhallNastaAr: String(planStartAr + 8),
                  underhallIntervallAr: "40",
                  underhallKostnadKr: "4500000",
                }
              : rad,
        ),
        vvsStambyteRegister: {
          stambyte: stambyteData(25, {
            vattenMaterial: "rostfritt-stal",
            avloppMaterial: "plast-ljudklassad",
          }),
        },
      },
      Värmecentral: {
        ...skapaTomKomponentDetalj("Värmecentral"),
        valdaDeltyper: ["fjarrvarme"],
        underkomponenter: skapaTomKomponentDetalj("Värmecentral").underkomponenter.map(
          (rad) => {
            if (rad.id === "undercentral")
              return { ...rad, aktiv: true, värde: "1" };
            if (rad.id === "radiatorer") return { ...rad, aktiv: true };
            return rad;
          },
        ),
      },
      Källare: {
        ...skapaTomKomponentDetalj("Källare"),
        valdaDeltyper: ["uppvarmd"],
        underkomponenter: skapaTomKomponentDetalj("Källare").underkomponenter.map(
          (rad) =>
            rad.id === "tvattstuga" ? { ...rad, aktiv: true } : rad,
        ),
        tvattstugaRegister: {
          tvattstuga: [
            {
              id: "tvatt-50-1",
              namn: "Tvättstuga källare",
              utformning: "gemensam",
              tvattmaskin: "2",
              torktumlare: "2",
              torkskap: "1",
              mangel: "1",
              belysning: "8",
              golvYtskikt: "klinker",
              golvKvm: "22",
              vaggarYtskikt: "kakel",
              vaggarKvm: "38",
            },
          ],
        },
      },
      "Mark och gård": {
        ...skapaTomKomponentDetalj("Mark och gård"),
        valdaDeltyper: ["gras", "asfalt"],
        underkomponenter: skapaTomKomponentDetalj("Mark och gård").underkomponenter.map(
          (rad) =>
            rad.id === "gard" ? { ...rad, aktiv: true, värde: "280" } : rad,
        ),
      },
    },
  ),
  besiktningar: besiktningarFor({ lgh: 25, sotning: true, eldstader: 1 }),
  krPerKvmAr: 48,
  planinstallningar: testplaninstallningar(),
  ...renoveringarPaket("test-50"),
};

/** 70-tal — 45 lägenheter, ca 1974 */
export const testplan70: TestplanDefinition = {
  id: "test-70",
  kortNamn: "70-tal · 45 lgh",
  namn: "Brf Parklyckan — 1970-tal (45 lägenheter)",
  beskrivning:
    "Flerbostadshus med hiss, balkonger och planerat stambyte. Bra för att testa medelstor skala och prissättning.",
  planNotering:
    "Fasad: puts. Hiss i trapphus. Stambyte planerat inom 10 år. Takfönster på vindsplan.",
  grund: {
    boarea: "2 925",
    lokalyta: "210",
    antalLagenheter: "45",
    byggar: "1974",
    tomtstorlek: "4 500",
    antalVaningar: "6",
    antalByggnader: "1",
    adresser: ["Parklyckan 3", "Parklyckan 5"],
    uppvarmning: "Fjärrvärme",
    ventilationssystem: "F — frånluftsfläkt och fönsterventiler (vanligast)",
    fastighetsbeteckning: "Täby Parklyckan 1:18",
  },
  activeComponents: [
    "Fasad",
    "Tak",
    "Trapphus",
    "Källare",
    "VVS",
    "Värmecentral",
    "Ventilation",
  ],
  komponentDetaljer: synkaKomponentRegister(
    ["Fasad", "Tak", "Trapphus", "Källare", "VVS", "Värmecentral", "Ventilation"],
    {
      Tak: {
        ...skapaTomKomponentDetalj("Tak"),
        valdaDeltyper: ["papp"],
        underkomponenter: skapaTomKomponentDetalj("Tak").underkomponenter.map(
          (rad) => {
            if (rad.id === "skorsten")
              return { ...rad, aktiv: true, måttenhet: "antal", värde: "2" };
            if (rad.id === "ventilationshuv")
              return { ...rad, aktiv: true, måttenhet: "antal", värde: "4" };
            if (rad.id === "takfonster") return { ...rad, aktiv: true };
            return rad;
          },
        ),
        takfonsterRegister: {
          takfonster: {
            singel: [
              {
                ...skapaTomTakfonsterSingelPost("Vindsfönster"),
                storlekId: "780x980",
                breddMm: "780",
                hojdMm: "980",
                antal: "18",
                enhetsprisKr: "18500",
              },
            ],
            kombinationer: [
              {
                ...skapaTomTakfonsterKombinationPost("Takband trapphus"),
                fonsterIRad: "3",
                modulStorlekId: "780x980",
                breddMm: "2340",
                hojdMm: "980",
                antal: "2",
                enhetsprisKr: "52000",
              },
            ],
          },
        },
      },
      Fasad: {
        ...skapaTomKomponentDetalj("Fasad"),
        valdaDeltyper: ["puts"],
        underkomponenter: skapaTomKomponentDetalj("Fasad").underkomponenter.map(
          (r) => {
            if (r.id === "fasadmaterial")
              return { ...r, aktiv: true, värde: "880" };
            if (r.id === "fonster" || r.id === "dorrar" || r.id === "balkonger")
              return { ...r, aktiv: true };
            return r;
          },
        ),
        balkongRegister: {
          balkonger: [
            {
              ...skapaTomBalkongPost("Utvändiga balkonger", "utvandig-balkong"),
              konstruktion: "helgjuten",
              rakeLopmeter: "165",
              golvKvm: "380",
              delar: [
                { delId: "balkongplatta", aktiv: true, mangd: "380" },
                { delId: "tatskikt", aktiv: true, mangd: "380" },
                { delId: "sockel", aktiv: true, mangd: "88" },
                { delId: "avvattning", aktiv: true, mangd: "45" },
              ],
            },
            {
              ...skapaTomBalkongPost("Franska balkonger", "fransk-balkong"),
              rakeLopmeter: "220",
              golvMaterial: "ingen-platta",
            },
          ],
        },
        fonsterDorrRegister: {
          fonster: [
            {
              ...skapaTomFonsterDorrPost(),
              modulmatt: "12×14",
              material: "tra",
              antal: "90",
              traUnderhall: "renovering",
            },
          ],
          dorrar: [
            {
              ...skapaTomDorrPost(),
              modulmatt: "9×21",
              dorrMaterial: "malad-tra",
              antal: "4",
              harKodlas: true,
              harElsutbleck: true,
            },
          ],
        },
      },
      Trapphus: {
        ...skapaTomKomponentDetalj("Trapphus"),
        valdaDeltyper: ["tr2"],
        underkomponenter: skapaTomKomponentDetalj("Trapphus").underkomponenter.map(
          (rad) => {
            if (rad.id === "hiss") return { ...rad, aktiv: true };
            if (rad.id === "lagenhetsdorrar")
              return { ...rad, aktiv: true, värde: "45" };
            return rad;
          },
        ),
        hissRegister: {
          hiss: [
            {
              ...skapaTomHissPost("Hiss 1"),
              marke: "kone",
              hissTyp: "motvikt",
            },
          ],
        },
      },
      VVS: {
        ...skapaTomKomponentDetalj("VVS"),
        valdaDeltyper: ["fjarrvarme"],
        underkomponenter: skapaTomKomponentDetalj("VVS").underkomponenter.map(
          (rad) => (rad.id === "stambyte" ? { ...rad, aktiv: true } : rad),
        ),
        vvsStambyteRegister: {
          stambyte: stambyteData(45, {
            vattenMaterial: "rostfritt-stal",
            avloppMaterial: "plast-ljudklassad",
          }),
        },
      },
      Värmecentral: {
        ...skapaTomKomponentDetalj("Värmecentral"),
        valdaDeltyper: ["fjarrvarme"],
        underkomponenter: skapaTomKomponentDetalj("Värmecentral").underkomponenter.map(
          (rad) => {
            if (rad.id === "undercentral")
              return { ...rad, aktiv: true, värde: "2" };
            if (rad.id === "radiatorer") return { ...rad, aktiv: true };
            return rad;
          },
        ),
      },
      Källare: {
        ...skapaTomKomponentDetalj("Källare"),
        valdaDeltyper: ["uppvarmd"],
        underkomponenter: skapaTomKomponentDetalj("Källare").underkomponenter.map(
          (rad) => {
            if (rad.id === "tvattstuga") return { ...rad, aktiv: true };
            if (rad.id === "forrad")
              return {
                ...rad,
                aktiv: true,
                forradMaterial: "galler",
                måttenhet: "löpmeter",
                värde: "165",
                forradAntalDorrar: "45",
              };
            return rad;
          },
        ),
        tvattstugaRegister: {
          tvattstuga: [
            {
              id: "tvatt-70-1",
              namn: "Tvättstuga A",
              utformning: "gemensam",
              tvattmaskin: "3",
              torktumlare: "3",
              torkskap: "2",
              mangel: "",
              belysning: "12",
              golvYtskikt: "klinker",
              golvKvm: "28",
              vaggarYtskikt: "kakel",
              vaggarKvm: "42",
            },
          ],
        },
      },
    },
  ),
  besiktningar: besiktningarFor({
    lgh: 45,
    hiss: true,
    antalHissar: 1,
    sotning: true,
    eldstader: 2,
  }),
  krPerKvmAr: 44,
  planinstallningar: testplaninstallningar(),
  ...renoveringarPaket("test-70"),
};

/** 90-tal — 60 lägenheter, ca 1993 */
export const testplan90: TestplanDefinition = {
  id: "test-90",
  kortNamn: "90-tal · 60 lgh",
  namn: "Brf Strandskatan — 1990-tal (60 lägenheter)",
  beskrivning:
    "Nyare flerbostadshus med FTX, hiss och två huskroppar. Få större renoveringar — bra för nyare bestånd och större förening.",
  planNotering:
    "Fasad: tunnputs. FTX i alla lägenheter. Tre hissar. Planerat: underhåll takterrass och OVK.",
  grund: {
    boarea: "4 200",
    lokalyta: "265",
    antalLagenheter: "60",
    byggar: "1993",
    tomtstorlek: "5 800",
    antalVaningar: "4",
    antalByggnader: "2",
    adresser: ["Strandskatan 12", "Strandskatan 14", "Strandskatan 16"],
    uppvarmning: "Fjärrvärme",
    ventilationssystem: "FTX — mekanisk till- och frånluft med värmeåtervinning",
    fastighetsbeteckning: "Malmö Strandskatan 2:9",
  },
  activeComponents: [
    "Fasad",
    "Tak",
    "Trapphus",
    "Källare",
    "VVS",
    "Ventilation",
    "Värmecentral",
    "Mark och gård",
    "Komplement byggnad och P-platser",
  ],
  komponentDetaljer: synkaKomponentRegister(
    [
      "Fasad",
      "Tak",
      "Trapphus",
      "Källare",
      "VVS",
      "Ventilation",
      "Värmecentral",
      "Mark och gård",
      "Komplement byggnad och P-platser",
    ],
    {
      Fasad: {
        ...skapaTomKomponentDetalj("Fasad"),
        valdaDeltyper: ["tunnputs"],
        underkomponenter: skapaTomKomponentDetalj("Fasad").underkomponenter.map(
          (r) => {
            if (r.id === "fasadmaterial")
              return { ...r, aktiv: true, värde: "1200" };
            if (r.id === "fonster" || r.id === "dorrar")
              return { ...r, aktiv: true };
            return r;
          },
        ),
        fonsterDorrRegister: {
          fonster: [
            {
              ...skapaTomFonsterDorrPost(),
              modulmatt: "9×21",
              material: "alu-kldd",
              antal: "180",
            },
            {
              ...skapaTomFonsterDorrPost(),
              modulmatt: "8×19",
              material: "pvc",
              antal: "60",
            },
          ],
          dorrar: [
            {
              ...skapaTomDorrPost(),
              modulmatt: "10×21",
              dorrMaterial: "aluminium",
              antal: "8",
              harKodlas: true,
            },
          ],
        },
      },
      Trapphus: {
        ...skapaTomKomponentDetalj("Trapphus"),
        valdaDeltyper: ["tr2"],
        underkomponenter: skapaTomKomponentDetalj("Trapphus").underkomponenter.map(
          (rad) => {
            if (rad.id === "hiss") return { ...rad, aktiv: true };
            if (rad.id === "lagenhetsdorrar")
              return { ...rad, aktiv: true, värde: "60" };
            if (rad.id === "vaggar-malning")
              return { ...rad, aktiv: true, värde: "920" };
            if (rad.id === "golv")
              return {
                ...rad,
                aktiv: true,
                golvMaterial: "linoleum",
                värde: "380",
              };
            return rad;
          },
        ),
        hissRegister: {
          hiss: [
            { ...skapaTomHissPost("Hiss hus A"), marke: "kone", hissTyp: "motvikt" },
            { ...skapaTomHissPost("Hiss hus B"), marke: "otis", hissTyp: "motvikt" },
            {
              ...skapaTomHissPost("Hiss garage"),
              marke: "schindler",
              hissTyp: "hydraul",
            },
          ],
        },
      },
      Källare: {
        ...skapaTomKomponentDetalj("Källare"),
        valdaDeltyper: ["uppvarmd"],
        underkomponenter: skapaTomKomponentDetalj("Källare").underkomponenter.map(
          (rad) => (rad.id === "tvattstuga" ? { ...rad, aktiv: true } : rad),
        ),
        tvattstugaRegister: {
          tvattstuga: [
            {
              id: "tvatt-90-1",
              namn: "Tvättstuga hus A",
              utformning: "gemensam",
              tvattmaskin: "4",
              torktumlare: "4",
              torkskap: "2",
              mangel: "",
              belysning: "16",
              golvYtskikt: "klinker",
              golvKvm: "36",
              vaggarYtskikt: "kakel",
              vaggarKvm: "52",
            },
            {
              id: "tvatt-90-2",
              namn: "Tvättstuga hus B",
              utformning: "gemensam",
              tvattmaskin: "4",
              torktumlare: "4",
              torkskap: "2",
              mangel: "",
              belysning: "16",
              golvYtskikt: "klinker",
              golvKvm: "34",
              vaggarYtskikt: "kakel",
              vaggarKvm: "50",
            },
          ],
        },
      },
      Värmecentral: {
        ...skapaTomKomponentDetalj("Värmecentral"),
        valdaDeltyper: ["fjarrvarme"],
        underkomponenter: skapaTomKomponentDetalj("Värmecentral").underkomponenter.map(
          (rad) => {
            if (rad.id === "undercentral")
              return { ...rad, aktiv: true, värde: "1" };
            if (rad.id === "radiatorer") return { ...rad, aktiv: true };
            return rad;
          },
        ),
        vvsRadiatorRegister: {
          radiatorer: {
            rorsystem: "tva-ror",
            aldre: {
              termostatAntal: "",
              radiatorventilAntal: "",
              radiatorkoppelAntal: "",
              packboxAntal: "",
              helRadiatorAntal: "",
            },
            nyare: {
              termostatAntal: "60",
              radiatorventilAntal: "60",
              radiatorkoppelAntal: "",
              packboxAntal: "",
              helRadiatorAntal: "12",
            },
            varmerorMeter: "180",
          },
        },
      },
      Tak: {
        ...skapaTomKomponentDetalj("Tak"),
        valdaDeltyper: ["bandlaggd-plat"],
        underkomponenter: skapaTomKomponentDetalj("Tak").underkomponenter.map(
          (rad) => {
            if (rad.id === "ventilationshuv")
              return { ...rad, aktiv: true, måttenhet: "antal", värde: "8" };
            if (rad.id === "takterrass") return { ...rad, aktiv: true };
            return rad;
          },
        ),
        takterrassRegister: {
          takterrass: {
            vaggarMaterial: "bandtackt-plat",
            vaggarAnnanText: "",
            vaggarLopmeter: "48",
            golvsockelLopmeter: "42",
            golvMaterial: "klinker",
            golvAnnanText: "",
            golvKvm: "24",
            tatskiktMaterial: "mapelastic-mapei",
            tatskiktAnnanText: "",
            tatskiktKvm: "24",
            golvbrunnAntal: "2",
            breddavloppAntal: "1",
            belysningAntal: "8",
            elkontaktAntal: "4",
            golvarmeKvm: "24",
            priser: {
              vaggar: "850",
              golvsockel: "420",
              golv: "1200",
              tatskikt: "650",
              golvbrunn: "4500",
              breddavlopp: "12000",
              belysning: "2800",
              elkontakt: "1500",
              golvarme: "950",
            },
          },
        },
      },
      "Mark och gård": {
        ...skapaTomKomponentDetalj("Mark och gård"),
        valdaDeltyper: ["asfalt", "gras"],
        underkomponenter: skapaTomKomponentDetalj("Mark och gård").underkomponenter.map(
          (rad) =>
            rad.id === "gard" ? { ...rad, aktiv: true, värde: "520" } : rad,
        ),
      },
    },
  ),
  besiktningar: besiktningarFor({
    lgh: 60,
    hiss: true,
    antalHissar: 3,
    ovkKr: 385,
    ovkIntervall: 6,
    ovkOffset: 1,
  }),
  krPerKvmAr: 36,
  planinstallningar: testplaninstallningar(),
  ...renoveringarPaket("test-90"),
};

/** Nyproduktion 2013 — Brf Sailor, Publika vägen 25–29 */
export const testplanSailor: TestplanDefinition = {
  id: "test-sailor",
  kortNamn: "2013 · Brf Sailor",
  namn: "Brf Sailor — nyproduktion 2013 (36 lägenheter)",
  beskrivning:
    "Tre hus vid Publika vägen med FTX, aluminiumklädda fönster och underjordiskt garage. Nyare bestånd med begränsad renoveringshistorik — bra för att fylla i egna uppgifter.",
  planNotering:
    "Fasad: tunnputs. Tre huskroppar (nr 25, 27, 29). FTX från byggår. Planerat: OVK, underhåll tak och balkongkontroll.",
  grund: {
    boarea: "2 580",
    lokalyta: "145",
    antalLagenheter: "36",
    byggar: "2013",
    tomtstorlek: "3 400",
    antalVaningar: "4",
    antalByggnader: "3",
    adresser: ["Publika vägen 25", "Publika vägen 27", "Publika vägen 29"],
    uppvarmning: "Fjärrvärme",
    ventilationssystem: "FTX — mekanisk till- och frånluft med värmeåtervinning",
    fastighetsbeteckning: "Nacka Sailor 1:15",
  },
  activeComponents: [
    "Fasad",
    "Tak",
    "Trapphus",
    "Källare",
    "VVS",
    "Värmecentral",
    "Ventilation",
    "Mark och gård",
    "Komplement byggnad och P-platser",
  ],
  komponentDetaljer: synkaKomponentRegister(
    [
      "Fasad",
      "Tak",
      "Trapphus",
      "Källare",
      "VVS",
      "Värmecentral",
      "Ventilation",
      "Mark och gård",
      "Komplement byggnad och P-platser",
    ],
    {
      Fasad: {
        ...skapaTomKomponentDetalj("Fasad"),
        valdaDeltyper: ["tunnputs"],
        underkomponenter: skapaTomKomponentDetalj("Fasad").underkomponenter.map(
          (r) => {
            if (r.id === "fasadmaterial")
              return { ...r, aktiv: true, värde: "380" };
            if (r.id === "fonster" || r.id === "dorrar" || r.id === "balkonger")
              return { ...r, aktiv: true };
            return r;
          },
        ),
        fonsterDorrRegister: {
          fonster: [
            {
              ...skapaTomFonsterDorrPost(),
              modulmatt: "Publika 25",
              material: "alu-kldd",
              antal: "36",
            },
            {
              ...skapaTomFonsterDorrPost(),
              modulmatt: "Publika 27",
              material: "alu-kldd",
              antal: "36",
            },
            {
              ...skapaTomFonsterDorrPost(),
              modulmatt: "Publika 29",
              material: "alu-kldd",
              antal: "36",
            },
          ],
          dorrar: [
            {
              ...skapaTomDorrPost(),
              modulmatt: "Entré",
              dorrMaterial: "aluminium",
              antal: "3",
              harKodlas: true,
            },
          ],
        },
        balkongRegister: {
          balkonger: [
            {
              ...skapaTomBalkongPost("Balkonger väster", "utvandig-balkong"),
              konstruktion: "konsol",
              golvMaterial: "betong",
              golvKvm: "72",
            },
            {
              ...skapaTomBalkongPost("Balkonger syd", "utvandig-balkong"),
              konstruktion: "konsol",
              golvMaterial: "betong",
              golvKvm: "68",
            },
          ],
        },
      },
      Tak: {
        ...skapaTomKomponentDetalj("Tak"),
        valdaDeltyper: ["bandlaggd-plat"],
        underkomponenter: skapaTomKomponentDetalj("Tak").underkomponenter.map(
          (rad) =>
            rad.id === "ventilationshuv"
              ? { ...rad, aktiv: true, måttenhet: "antal", värde: "6" }
              : rad,
        ),
      },
      Trapphus: {
        ...skapaTomKomponentDetalj("Trapphus"),
        valdaDeltyper: ["tr2"],
        underkomponenter: skapaTomKomponentDetalj("Trapphus").underkomponenter.map(
          (rad) => {
            if (rad.id === "hiss") return { ...rad, aktiv: true };
            if (rad.id === "lagenhetsdorrar")
              return { ...rad, aktiv: true, värde: "36" };
            if (rad.id === "vaggar-malning")
              return { ...rad, aktiv: true, värde: "520" };
            return rad;
          },
        ),
        hissRegister: {
          hiss: [
            { ...skapaTomHissPost("Hiss Publika 25"), marke: "kone", hissTyp: "motvikt" },
            { ...skapaTomHissPost("Hiss Publika 27"), marke: "otis", hissTyp: "motvikt" },
            { ...skapaTomHissPost("Hiss Publika 29"), marke: "schindler", hissTyp: "motvikt" },
          ],
        },
      },
      Källare: {
        ...skapaTomKomponentDetalj("Källare"),
        valdaDeltyper: ["uppvarmd"],
        underkomponenter: skapaTomKomponentDetalj("Källare").underkomponenter.map(
          (rad) => (rad.id === "tvattstuga" ? { ...rad, aktiv: true } : rad),
        ),
        tvattstugaRegister: {
          tvattstuga: [
            {
              id: "tvatt-sailor-1",
              namn: "Tvättstuga Publika 25–29",
              utformning: "gemensam",
              tvattmaskin: "3",
              torktumlare: "3",
              torkskap: "1",
              mangel: "",
              belysning: "12",
              golvYtskikt: "klinker",
              golvKvm: "28",
              vaggarYtskikt: "kakel",
              vaggarKvm: "42",
            },
          ],
        },
      },
      VVS: {
        ...skapaTomKomponentDetalj("VVS"),
        valdaDeltyper: ["fjarrvarme"],
        underkomponenter: skapaTomKomponentDetalj("VVS").underkomponenter.map(
          (rad) => (rad.id === "stambyte" ? { ...rad, aktiv: true } : rad),
        ),
        vvsStambyteRegister: {
          stambyte: stambyteData(36, {
            vattenMaterial: "rostfritt-stal",
            avloppMaterial: "plast-ljudklassad",
          }),
        },
      },
      Värmecentral: {
        ...skapaTomKomponentDetalj("Värmecentral"),
        valdaDeltyper: ["fjarrvarme"],
        underkomponenter: skapaTomKomponentDetalj("Värmecentral").underkomponenter.map(
          (rad) => {
            if (rad.id === "undercentral")
              return { ...rad, aktiv: true, värde: "1" };
            if (rad.id === "radiatorer") return { ...rad, aktiv: true };
            return rad;
          },
        ),
        vvsRadiatorRegister: {
          radiatorer: {
            rorsystem: "blandat",
            aldre: {
              termostatAntal: "",
              radiatorventilAntal: "",
              radiatorkoppelAntal: "",
              packboxAntal: "",
              helRadiatorAntal: "",
            },
            nyare: {
              termostatAntal: "36",
              radiatorventilAntal: "36",
              radiatorkoppelAntal: "",
              packboxAntal: "",
              helRadiatorAntal: "8",
            },
            varmerorMeter: "110",
          },
        },
      },
      Ventilation: {
        ...skapaTomKomponentDetalj("Ventilation"),
        valdaDeltyper: ["ftx"],
      },
      "Mark och gård": {
        ...skapaTomKomponentDetalj("Mark och gård"),
        valdaDeltyper: ["asfalt", "gras"],
        underkomponenter: skapaTomKomponentDetalj("Mark och gård").underkomponenter.map(
          (rad) =>
            rad.id === "gard" ? { ...rad, aktiv: true, värde: "380" } : rad,
        ),
      },
      "Komplement byggnad och P-platser": {
        ...skapaTomKomponentDetalj("Komplement byggnad och P-platser"),
        valdaDeltyper: ["kallare"],
        underkomponenter: skapaTomKomponentDetalj(
          "Komplement byggnad och P-platser",
        ).underkomponenter.map((rad) => {
          if (rad.id === "p-platser") return { ...rad, aktiv: true };
          if (rad.id === "cykelrum") return { ...rad, aktiv: true, värde: "1" };
          return rad;
        }),
        pPlatserRegister: {
          "p-platser": {
            motordvarmare: "",
            elbilsladdare: "8",
            "p-plats": "10",
            garage: "24",
            carport: "",
          },
        },
      },
    },
  ),
  besiktningar: besiktningarFor({
    lgh: 36,
    hiss: true,
    antalHissar: 3,
    ovkKr: 340,
    ovkIntervall: 6,
    ovkOffset: 0,
  }),
  krPerKvmAr: 32,
  planinstallningar: testplaninstallningar(),
  ...renoveringarPaket("test-sailor"),
};

/** Tidigt 1900-tal — Brf Nordan 28 */
export const testplanNordan28: TestplanDefinition = {
  id: "test-nordan-28",
  kortNamn: "1900-tal · Nordan 28",
  namn: "Brf Nordan 28 — tidigt 1900-tal (18 lägenheter)",
  beskrivning:
    "Tegelhus från tidigt 1900-tal med träfönster och självdrag. Används för att testa klumpsummor för tak och stambyte.",
  planNotering:
    "Fasad: tegel med putsband. Tak: tegel. Balkonger mot innergård — flera typer. Planerat: takomläggning och stambyte.",
  grund: {
    boarea: "1 150",
    lokalyta: "70",
    antalLagenheter: "18",
    byggar: "1906",
    tomtstorlek: "1 250",
    antalVaningar: "4",
    antalByggnader: "1",
    adresser: ["Nordan 28"],
    uppvarmning: "Fjärrvärme",
    ventilationssystem: "S — självdragsventilation",
    fastighetsbeteckning: "Stockholm Nordan 28:1",
  },
  activeComponents: [
    "Fasad",
    "Fönster",
    "Balkonger",
    "Tak",
    "Trapphus",
    "Källare",
    "VVS",
    "Ventilation",
  ],
  komponentDetaljer: synkaKomponentRegister(
    ["Fasad", "Fönster", "Balkonger", "Tak", "Trapphus", "Källare", "VVS", "Ventilation"],
    {
      Fasad: {
        ...skapaTomKomponentDetalj("Fasad"),
        valdaDeltyper: ["tegel"],
        underkomponenter: skapaTomKomponentDetalj("Fasad").underkomponenter.map((r) => {
          if (r.id === "fasadmaterial")
            return { ...r, aktiv: true, värde: "540" };
          if (r.id === "dorrar") return { ...r, aktiv: true };
          return r;
        }),
        fonsterDorrRegister: {
          dorrar: [
            {
              ...skapaTomDorrPost(),
              modulmatt: "10×21",
              dorrMaterial: "ek",
              antal: "2",
              harKodlas: false,
            },
          ],
        },
      },
      "Fönster": {
        ...skapaTomKomponentDetalj("Fönster"),
        valdaDeltyper: ["tra"],
        underkomponenter: skapaTomKomponentDetalj("Fönster").underkomponenter.map((r) =>
          r.id === "fonster" ? { ...r, aktiv: true } : r,
        ),
        fonsterDorrRegister: {
          fonster: [
            {
              ...skapaTomFonsterDorrPost(),
              modulmatt: "Kopplade 10×15",
              material: "tra",
              antal: "72",
              traUnderhall: "renovering",
            },
          ],
        },
      },
      Balkonger: {
        ...skapaTomKomponentDetalj("Balkonger"),
        valdaDeltyper: ["betong"],
        underkomponenter: skapaTomKomponentDetalj("Balkonger").underkomponenter.map((r) =>
          r.id === "balkonger" ? { ...r, aktiv: true } : r,
        ),
        balkongRegister: {
          balkonger: [
            {
              ...skapaTomBalkongPost("Utvändiga balkonger gård", "utvandig-balkong"),
              konstruktion: "konsol",
              rakeLopmeter: "48",
              golvKvm: "96",
              delar: [
                { delId: "balkongplatta", aktiv: true, mangd: "96" },
                { delId: "tatskikt", aktiv: true, mangd: "96" },
                { delId: "fallspackel", aktiv: true, mangd: "96" },
              ],
            },
            {
              ...skapaTomBalkongPost("Innerhörnsbalkonger norr", "innerhornsbalkong"),
              konstruktion: "helgjuten",
              rakeLopmeter: "22",
              golvKvm: "38",
              delar: [
                { delId: "balkongplatta", aktiv: true, mangd: "38" },
                { delId: "tatskikt", aktiv: true, mangd: "38" },
                { delId: "fallspackel", aktiv: true, mangd: "38" },
              ],
            },
            {
              ...skapaTomBalkongPost("Innerhörnsbalkonger syd", "innerhornsbalkong"),
              konstruktion: "helgjuten",
              rakeLopmeter: "18",
              golvKvm: "32",
              delar: [
                { delId: "balkongplatta", aktiv: true, mangd: "32" },
                { delId: "tatskikt", aktiv: true, mangd: "32" },
              ],
            },
          ],
        },
      },
      Tak: {
        ...skapaTomKomponentDetalj("Tak"),
        valdaDeltyper: ["tegel"],
        underkomponenter: skapaTomKomponentDetalj("Tak").underkomponenter.map((rad) =>
          rad.id === "skorsten" ? { ...rad, aktiv: true, värde: "2" } : rad,
        ),
      },
      VVS: {
        ...skapaTomKomponentDetalj("VVS"),
        valdaDeltyper: ["fjarrvarme"],
        underkomponenter: skapaTomKomponentDetalj("VVS").underkomponenter.map((rad) =>
          rad.id === "stambyte" ? { ...rad, aktiv: true } : rad,
        ),
        vvsStambyteRegister: {
          stambyte: stambyteData(18, { vattenMaterial: "koppar", avloppMaterial: "gjutjarn" }),
        },
      },
      Trapphus: {
        ...skapaTomKomponentDetalj("Trapphus"),
        valdaDeltyper: ["tr1"],
      },
      Källare: {
        ...skapaTomKomponentDetalj("Källare"),
        valdaDeltyper: ["uppvarmd"],
      },
      Ventilation: {
        ...skapaTomKomponentDetalj("Ventilation"),
        valdaDeltyper: ["s"],
      },
    },
  ),
  besiktningar: besiktningarFor({ lgh: 18, hiss: false, ovkKr: 320, ovkIntervall: 6, ovkOffset: 1 }),
  krPerKvmAr: 46,
  planinstallningar: testplaninstallningar(),
  ...renoveringarPaket("test-nordan-28"),
};

/** Tidigt 1900-tal — Brf Nordan 30 */
export const testplanNordan30: TestplanDefinition = {
  id: "test-nordan-30",
  kortNamn: "1900-tal · Nordan 30",
  namn: "Brf Nordan 30 — tidigt 1900-tal (24 lägenheter)",
  beskrivning:
    "Större tegelhus från tidigt 1900-tal. Testar klumpsummor (tak + stambyte) och även balkonger som egen komponent.",
  planNotering:
    "Fasad: tegel/putsband. Balkonger mot gård. Planerat: tak och stambyte enligt historik.",
  grund: {
    boarea: "1 520",
    lokalyta: "95",
    antalLagenheter: "24",
    byggar: "1909",
    tomtstorlek: "1 520",
    antalVaningar: "5",
    antalByggnader: "1",
    adresser: ["Nordan 30"],
    uppvarmning: "Fjärrvärme",
    ventilationssystem: "S — självdragsventilation",
    fastighetsbeteckning: "Stockholm Nordan 30:1",
  },
  activeComponents: [
    "Fasad",
    "Fönster",
    "Balkonger",
    "Tak",
    "Trapphus",
    "Källare",
    "VVS",
    "Ventilation",
  ],
  komponentDetaljer: synkaKomponentRegister(
    ["Fasad", "Fönster", "Balkonger", "Tak", "Trapphus", "Källare", "VVS", "Ventilation"],
    {
      Fasad: {
        ...skapaTomKomponentDetalj("Fasad"),
        valdaDeltyper: ["tegel"],
        underkomponenter: skapaTomKomponentDetalj("Fasad").underkomponenter.map((r) => {
          if (r.id === "fasadmaterial")
            return { ...r, aktiv: true, värde: "540" };
          if (r.id === "dorrar") return { ...r, aktiv: true };
          return r;
        }),
        fonsterDorrRegister: {
          dorrar: [
            {
              ...skapaTomDorrPost(),
              modulmatt: "10×21",
              dorrMaterial: "ek",
              antal: "3",
              harKodlas: false,
            },
          ],
        },
      },
      "Fönster": {
        ...skapaTomKomponentDetalj("Fönster"),
        valdaDeltyper: ["tra"],
        underkomponenter: skapaTomKomponentDetalj("Fönster").underkomponenter.map((r) =>
          r.id === "fonster" ? { ...r, aktiv: true } : r,
        ),
        fonsterDorrRegister: {
          fonster: [
            {
              ...skapaTomFonsterDorrPost(),
              modulmatt: "Kopplade 10×15",
              material: "tra",
              antal: "96",
              traUnderhall: "renovering",
            },
          ],
        },
      },
      Balkonger: {
        ...skapaTomKomponentDetalj("Balkonger"),
        valdaDeltyper: ["betong"],
        underkomponenter: skapaTomKomponentDetalj("Balkonger").underkomponenter.map((r) =>
          r.id === "balkonger" ? { ...r, aktiv: true } : r,
        ),
        balkongRegister: {
          balkonger: [
            {
              ...skapaTomBalkongPost("Balkonger gård", "utvandig-balkong"),
              konstruktion: "tillbyggd",
              golvMaterial: "betong",
              golvKvm: "68",
            },
          ],
        },
      },
      Tak: {
        ...skapaTomKomponentDetalj("Tak"),
        valdaDeltyper: ["tegel"],
        underkomponenter: skapaTomKomponentDetalj("Tak").underkomponenter.map((rad) =>
          rad.id === "skorsten" ? { ...rad, aktiv: true, värde: "3" } : rad,
        ),
      },
      VVS: {
        ...skapaTomKomponentDetalj("VVS"),
        valdaDeltyper: ["fjarrvarme"],
        underkomponenter: skapaTomKomponentDetalj("VVS").underkomponenter.map((rad) =>
          rad.id === "stambyte" ? { ...rad, aktiv: true } : rad,
        ),
        vvsStambyteRegister: {
          stambyte: stambyteData(24, { vattenMaterial: "koppar", avloppMaterial: "gjutjarn" }),
        },
      },
      Trapphus: {
        ...skapaTomKomponentDetalj("Trapphus"),
        valdaDeltyper: ["tr1"],
      },
      Källare: {
        ...skapaTomKomponentDetalj("Källare"),
        valdaDeltyper: ["uppvarmd"],
      },
      Ventilation: {
        ...skapaTomKomponentDetalj("Ventilation"),
        valdaDeltyper: ["s"],
      },
    },
  ),
  besiktningar: besiktningarFor({ lgh: 24, hiss: false, ovkKr: 320, ovkIntervall: 6, ovkOffset: 1 }),
  krPerKvmAr: 46,
  planinstallningar: testplaninstallningar(),
  ...renoveringarPaket("test-nordan-30"),
};

export const testplaner: TestplanDefinition[] = [
  testplan1900,
  testplan50,
  testplan70,
  testplan90,
  testplanSailor,
  testplanNordan28,
  testplanNordan30,
];

const testplanMap: Record<TestplanId, TestplanDefinition> = {
  "test-1900": testplan1900,
  "test-50": testplan50,
  "test-70": testplan70,
  "test-90": testplan90,
  "test-sailor": testplanSailor,
  "test-nordan-28": testplanNordan28,
  "test-nordan-30": testplanNordan30,
};

export function hamtaTestplan(id: TestplanId): TestplanDefinition {
  return testplanMap[id];
}
