import type { KomponentDetaljData } from "@/components/underhallsplan/komponentregister";
import {
  BALKONGER_UNDERKOMPONENT_ID,
  balkongTyper,
  normaliseraBalkongPost,
  type BalkongTypId,
} from "@/components/underhallsplan/balkonger";
import {
  klassificeraRenovering,
  type RenoveringAtgardTyp,
} from "@/components/underhallsplan/renovering-klassificering";
import {
  normaliseraRenoveringKomponent,
  type UtfördRenovering,
} from "@/components/underhallsplan/renoveringar";

export type RenoveringFordelningKontext = {
  komponentDetaljer?: Record<string, KomponentDetaljData>;
};

export type FordeladRenoveringsdel = {
  renoveringId: string;
  komponent: string;
  del: string;
  atgardTyp: RenoveringAtgardTyp;
  underkomponentId?: string;
  basKostnadKr: number;
  /** Ursprunglig kostnad (före ev. engångsavdrag). */
  ursprungKostnadKr?: number;
  /** Avdrag i procent på engångskostnader som inte ska upprepas. */
  avdragProcent?: number;
  /** Valfri motivering till avdraget. */
  avdragAnledning?: string;
  utförtAr: number;
  andel: number;
  fordelningsNotering: string;
};

const VADERSTRECK = [
  { id: "nord", etikett: "Nord", nycklar: ["nord", "norrfasad", "norrläge", "norrlage"] },
  { id: "syd", etikett: "Syd", nycklar: ["syd", "sydfasad", "sydläge", "sydlage"] },
  {
    id: "ost",
    etikett: "Öst",
    nycklar: ["öst", "ost", "östfasad", "ostfasad", "öster", "oster"],
  },
  {
    id: "vast",
    etikett: "Väster",
    nycklar: ["väst", "vast", "väster", "vaster", "västerfasad", "vasterfasad"],
  },
] as const;

/** Rimlig fördelning av ett stambytes klumpsumma på VVS-delar. */
const STAMBYTE_DELAR: {
  del: string;
  andel: number;
  underkomponentId: string;
}[] = [
  { del: "Tappvatten och stammar", andel: 0.38, underkomponentId: "stambyte" },
  { del: "Avlopp och spillvatten", andel: 0.37, underkomponentId: "stambyte" },
  { del: "Radiatorer och injustering", andel: 0.12, underkomponentId: "radiatorer" },
  { del: "Etablering och sanitet", andel: 0.13, underkomponentId: "stambyte" },
];

/** Standardvikt när flera åtgärdstyper ingår i samma faktura. */
const KOMBINATION_VIKTER: Partial<Record<RenoveringAtgardTyp, number>> = {
  stambyte: 0.55,
  fonster: 0.2,
  fasad: 0.15,
  balkonger: 0.1,
  tak: 0.35,
  ventilation: 0.08,
  trapphus: 0.08,
  tvattstuga: 0.1,
  hiss: 0.15,
  stamspolning: 0.25,
};

type AtgardMatch = {
  typ: RenoveringAtgardTyp;
  delEtikett: string;
  underkomponentId?: string;
  komponent: string;
};

function normaliseraText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ");
}

function arKlumpsumma(renovering: UtfördRenovering): boolean {
  if (renovering.klumpsumma) return true;
  const text = normaliseraText(`${renovering.titel} ${renovering.omfattning}`);
  return (
    text.includes("klumpsumma") ||
    text.includes("totalentreprenad") ||
    text.includes("samlad faktura") ||
    text.includes("samlat projekt")
  );
}

function matchaAtgardTyper(text: string): AtgardMatch[] {
  const regel = klassificeraRenovering({
    id: "",
    komponent: "Fasad",
    ar: 2000,
    titel: text,
    omfattning: text,
    kalla: "styrelse",
  });
  const primar: AtgardMatch = {
    typ: regel.typ,
    delEtikett: regel.delEtikett,
    underkomponentId: regel.underkomponentId,
    komponent: "Fasad",
  };

  const extra: AtgardMatch[] = [];
  const nyckelord: { typ: RenoveringAtgardTyp; ord: string[]; del: string; uk?: string; komponent: string }[] = [
    { typ: "stambyte", ord: ["stambyte", "rörbyte"], del: "Stambyte", uk: "stambyte", komponent: "VVS" },
    { typ: "tak", ord: ["tak", "takomläggning", "takbeläggning"], del: "Tak", uk: "takyta", komponent: "Tak" },
    { typ: "fonster", ord: ["fönster", "fonster"], del: "Fönster", uk: "fonster", komponent: "Fönster" },
    {
      typ: "fasad",
      ord: ["fasad", "puts", "ommålning"],
      del: "Fasad",
      uk: "fasadmaterial",
      komponent: "Fasad",
    },
    { typ: "balkonger", ord: ["balkong"], del: "Balkonger", uk: "balkonger", komponent: "Balkonger" },
  ];

  for (const rad of nyckelord) {
    if (rad.ord.some((o) => text.includes(o)) && !extra.some((e) => e.typ === rad.typ)) {
      if (rad.typ === primar.typ) continue;
      extra.push({
        typ: rad.typ,
        delEtikett: rad.del,
        underkomponentId: rad.uk,
        komponent: rad.komponent,
      });
    }
  }

  const alla = [primar, ...extra];
  const unika = new Map<RenoveringAtgardTyp, AtgardMatch>();
  for (const m of alla) {
    if (m.typ !== "ovrigt") unika.set(m.typ, m);
  }
  return [...unika.values()];
}

function hittaVaderstreckIText(text: string): { id: string; etikett: string }[] {
  const träffar: { id: string; etikett: string }[] = [];
  for (const vs of VADERSTRECK) {
    if (vs.nycklar.some((n) => text.includes(n))) {
      träffar.push({ id: vs.id, etikett: vs.etikett });
    }
  }
  return träffar;
}

function fonsterVikterFranRegister(
  kontext?: RenoveringFordelningKontext,
): { etikett: string; vikt: number }[] {
  const fonster = kontext?.komponentDetaljer?.["Fönster"];
  const poster = fonster?.fonsterDorrRegister?.fonster ?? [];
  if (poster.length === 0) return [];

  const vikter: { etikett: string; vikt: number }[] = [];
  for (const post of poster) {
    const antal = Number.parseInt(post.antal.replace(/\s/g, ""), 10);
    if (!Number.isFinite(antal) || antal <= 0) continue;
    const etikett = post.modulmatt.trim() || "Fönster";
    vikter.push({ etikett: `Fönster ${etikett}`, vikt: antal });
  }
  if (vikter.length <= 1) return vikter;
  const summa = vikter.reduce((s, v) => s + v.vikt, 0);
  return vikter.map((v) => ({ etikett: v.etikett, vikt: v.vikt / summa }));
}

function fordelEtapper(
  renovering: UtfördRenovering,
  totalKr: number,
): FordeladRenoveringsdel[] {
  const etapper = renovering.etapper ?? [];
  const sumAndel = etapper.reduce((s, e) => s + e.andel, 0);
  const faktor = sumAndel > 0 ? 1 / sumAndel : 1 / etapper.length;

  return etapper.map((etapp, index) => {
    const andel = etapp.andel * faktor;
    const regel = klassificeraRenovering({
      ...renovering,
      omfattning: etapp.omfattning ?? renovering.omfattning,
      titel: etapp.del ?? renovering.titel,
    });
    const komponent = normaliseraRenoveringKomponent(
      etapp.komponent ?? renovering.komponent,
    );
    return {
      renoveringId: `${renovering.id}-etapp-${index + 1}`,
      komponent,
      del: etapp.del ?? regel.delEtikett,
      atgardTyp: regel.typ,
      underkomponentId: regel.underkomponentId,
      basKostnadKr: Math.round(totalKr * andel),
      utförtAr: etapp.ar ?? renovering.ar,
      andel,
      fordelningsNotering: `Etapp ${index + 1} (${Math.round(andel * 100)} %)`,
    };
  });
}

function fordelExplicitaDelposter(
  renovering: UtfördRenovering,
  totalKr: number,
): FordeladRenoveringsdel[] {
  const poster = renovering.delposter ?? [];
  const sumAndel = poster.reduce((s, p) => s + p.andel, 0);
  const faktor = sumAndel > 0 ? 1 / sumAndel : 1 / poster.length;

  return poster.map((post, index) => {
    const andel = post.andel * faktor;
    const regel = post.atgardTyp
      ? klassificeraRenovering({
          ...renovering,
          komponent: post.komponent,
          titel: post.del,
          omfattning: post.omfattning ?? post.del,
        })
      : klassificeraRenovering({
          ...renovering,
          komponent: post.komponent,
          omfattning: post.omfattning ?? renovering.omfattning,
        });
    const atgardTyp = (post.atgardTyp as RenoveringAtgardTyp | undefined) ?? regel.typ;

    return {
      renoveringId: `${renovering.id}-del-${index + 1}`,
      komponent: normaliseraRenoveringKomponent(post.komponent),
      del: post.del,
      atgardTyp,
      underkomponentId: post.underkomponentId ?? regel.underkomponentId,
      basKostnadKr: Math.round(totalKr * andel),
      utförtAr: renovering.ar,
      andel,
      fordelningsNotering: `Angiven delpost (${Math.round(andel * 100)} %)`,
    };
  });
}

function fordelStambyte(totalKr: number, renovering: UtfördRenovering): FordeladRenoveringsdel[] {
  const komponent = "VVS";
  return STAMBYTE_DELAR.map((del, index) => ({
    renoveringId: `${renovering.id}-stam-${index + 1}`,
    komponent,
    del: del.del,
    atgardTyp: "stambyte" as const,
    underkomponentId: del.underkomponentId,
    basKostnadKr: Math.round(totalKr * del.andel),
    utförtAr: renovering.ar,
    andel: del.andel,
    fordelningsNotering: `Stambyte — ${del.del} (${Math.round(del.andel * 100)} %)`,
  }));
}

function balkongVikterFranRegister(
  kontext?: RenoveringFordelningKontext,
  filter?: { radId?: string; typ?: BalkongTypId },
): { etikett: string; vikt: number }[] {
  const balkonger = kontext?.komponentDetaljer?.Balkonger;
  let poster =
    balkonger?.balkongRegister?.[BALKONGER_UNDERKOMPONENT_ID] ?? [];
  if (filter?.radId) {
    poster = poster.filter((p) => p.id === filter.radId);
  } else if (filter?.typ) {
    poster = poster.filter(
      (p) => normaliseraBalkongPost(p).balkongTyp === filter.typ,
    );
  }
  if (poster.length === 0) return [];

  const vikter: { etikett: string; vikt: number }[] = [];
  for (const post of poster) {
    const p = normaliseraBalkongPost(post);
    const typEtikett =
      balkongTyper.find((t) => t.id === p.balkongTyp)?.etikett ?? p.balkongTyp;
    const etikett = p.namn.trim() || typEtikett;
    const kvm = Number.parseFloat(p.golvKvm.replace(/\s/g, "").replace(",", "."));
    const rake = Number.parseFloat(p.rakeLopmeter.replace(/\s/g, "").replace(",", "."));
    const vikt =
      Number.isFinite(kvm) && kvm > 0
        ? kvm
        : Number.isFinite(rake) && rake > 0
          ? rake
          : 1;
    vikter.push({ etikett, vikt });
  }
  if (vikter.length <= 1) return vikter;
  const summa = vikter.reduce((s, v) => s + v.vikt, 0);
  return vikter.map((v) => ({ etikett: v.etikett, vikt: v.vikt / summa }));
}

function fordelBalkongRegister(
  renovering: UtfördRenovering,
  totalKr: number,
  kontext?: RenoveringFordelningKontext,
): FordeladRenoveringsdel[] | null {
  const filter = {
    radId: renovering.balkongRadId,
    typ: renovering.balkongTyp,
  };
  const franRegister = balkongVikterFranRegister(kontext, filter);
  if (franRegister.length === 0) return null;
  if (franRegister.length === 1) {
    const rad = franRegister[0];
    return [
      {
        renoveringId: `${renovering.id}-balkong-reg-1`,
        komponent: "Balkonger",
        del: rad.etikett,
        atgardTyp: "balkonger" as const,
        underkomponentId: "balkonger",
        basKostnadKr: totalKr,
        utförtAr: renovering.ar,
        andel: 1,
        fordelningsNotering: renovering.balkongRadId
          ? "Kopplad till vald balkongrad i registret"
          : `Fördelat efter balkongregister (100 %)`,
      },
    ];
  }

  return franRegister.map((rad, i) => ({
    renoveringId: `${renovering.id}-balkong-reg-${i + 1}`,
    komponent: "Balkonger",
    del: rad.etikett,
    atgardTyp: "balkonger" as const,
    underkomponentId: "balkonger",
    basKostnadKr: Math.round(totalKr * rad.vikt),
    utförtAr: renovering.ar,
    andel: rad.vikt,
    fordelningsNotering: `Fördelat efter balkongregister (${Math.round(rad.vikt * 100)} %)`,
  }));
}

function fordelFonsterVaderstreck(
  renovering: UtfördRenovering,
  totalKr: number,
  text: string,
  kontext?: RenoveringFordelningKontext,
): FordeladRenoveringsdel[] | null {
  const iText = hittaVaderstreckIText(text);
  const franRegister = fonsterVikterFranRegister(kontext);

  if (iText.length >= 2) {
    const andel = 1 / iText.length;
    return iText.map((vs, index) => ({
      renoveringId: `${renovering.id}-fonster-${vs.id}`,
      komponent: "Fönster",
      del: `Fönster ${vs.etikett}`,
      atgardTyp: "fonster" as const,
      underkomponentId: "fonster",
      basKostnadKr: Math.round(totalKr * andel),
      utförtAr: renovering.ar,
      andel,
      fordelningsNotering: `Fönster ${vs.etikett} (${Math.round(andel * 100)} %)`,
    }));
  }

  if (franRegister.length >= 2) {
    return franRegister.map((rad, i) => ({
      renoveringId: `${renovering.id}-fonster-reg-${i + 1}`,
      komponent: "Fönster",
      del: rad.etikett,
      atgardTyp: "fonster" as const,
      underkomponentId: "fonster",
      basKostnadKr: Math.round(totalKr * rad.vikt),
      utförtAr: renovering.ar,
      andel: rad.vikt,
      fordelningsNotering: `Fördelat efter antal i registret (${Math.round(rad.vikt * 100)} %)`,
    }));
  }

  return null;
}

function fordelKombineradeAtgarder(
  renovering: UtfördRenovering,
  totalKr: number,
  matcher: AtgardMatch[],
): FordeladRenoveringsdel[] {
  const vikter = matcher.map((m) => KOMBINATION_VIKTER[m.typ] ?? 0.1);
  const summa = vikter.reduce((s, v) => s + v, 0);

  return matcher.map((match, index) => {
    const andel = vikter[index] / summa;
    return {
      renoveringId: `${renovering.id}-${match.typ}`,
      komponent: match.komponent,
      del: match.delEtikett,
      atgardTyp: match.typ,
      underkomponentId: match.underkomponentId,
      basKostnadKr: Math.round(totalKr * andel),
      utförtAr: renovering.ar,
      andel,
      fordelningsNotering: `Klumpsumma — ${match.delEtikett} (${Math.round(andel * 100)} %)`,
    };
  });
}

function justeraAvrundning(
  delar: FordeladRenoveringsdel[],
  totalKr: number,
): FordeladRenoveringsdel[] {
  if (delar.length === 0) return delar;
  const summa = delar.reduce((s, d) => s + d.basKostnadKr, 0);
  const diff = totalKr - summa;
  if (diff === 0) return delar;
  const kopia = [...delar];
  const sista = kopia[kopia.length - 1];
  kopia[kopia.length - 1] = {
    ...sista,
    basKostnadKr: sista.basKostnadKr + diff,
  };
  return kopia;
}

/**
 * Delar upp en renoveringspost i planeringsdelar med fördelad kostnad.
 * Används av budget och förhandsvisning i historiken.
 */
export function fordelRenovering(
  renovering: UtfördRenovering,
  kontext?: RenoveringFordelningKontext,
): FordeladRenoveringsdel[] {
  const ursprungKr = renovering.kostnadKr ?? 0;
  const avdragProcent = Math.min(
    100,
    Math.max(0, renovering.avdragProcent ?? 0),
  );
  const totalKr =
    avdragProcent > 0
      ? Math.round(ursprungKr * (1 - avdragProcent / 100))
      : ursprungKr;
  if (totalKr <= 0) return [];

  const avdragAnledning = renovering.avdragAnledning?.trim() || undefined;
  const meta = {
    ursprungKostnadKr: ursprungKr,
    avdragProcent: avdragProcent > 0 ? avdragProcent : undefined,
    avdragAnledning,
  } satisfies Pick<
    FordeladRenoveringsdel,
    "ursprungKostnadKr" | "avdragProcent" | "avdragAnledning"
  >;

  const angivenDel =
    renovering.underkomponentId?.trim() && renovering.del?.trim()
      ? [
          {
            renoveringId: renovering.id,
            komponent: normaliseraRenoveringKomponent(renovering.komponent),
            del: renovering.del.trim(),
            atgardTyp: klassificeraRenovering(renovering).typ,
            underkomponentId: renovering.underkomponentId.trim(),
            basKostnadKr: totalKr,
            utförtAr: renovering.ar,
            andel: 1,
            fordelningsNotering: "Vald underkomponent i steg 2",
            ...meta,
          } satisfies FordeladRenoveringsdel,
        ]
      : null;

  if (
    angivenDel &&
    !renovering.klumpsumma &&
    !(renovering.delposter && renovering.delposter.length > 0)
  ) {
    return angivenDel;
  }

  if (renovering.etapper && renovering.etapper.length > 0) {
    return justeraAvrundning(fordelEtapper(renovering, totalKr), totalKr).map((d) => ({
      ...d,
      ...meta,
    }));
  }

  if (renovering.delposter && renovering.delposter.length > 0) {
    return justeraAvrundning(fordelExplicitaDelposter(renovering, totalKr), totalKr).map(
      (d) => ({
        ...d,
        ...meta,
      }),
    );
  }

  const text = normaliseraText(`${renovering.titel} ${renovering.omfattning}`);
  const regel = klassificeraRenovering(renovering);
  const klump = arKlumpsumma(renovering);
  const matcher = matchaAtgardTyper(text);

  if (klump || matcher.length > 1) {
    if (matcher.length === 1 && matcher[0].typ === "stambyte") {
      return justeraAvrundning(fordelStambyte(totalKr, renovering), totalKr).map((d) => ({
        ...d,
        ...meta,
      }));
    }

    if (matcher.some((m) => m.typ === "fonster")) {
      const fonsterDel = fordelFonsterVaderstreck(renovering, totalKr, text, kontext);
      if (fonsterDel && matcher.length === 1) {
        return justeraAvrundning(fonsterDel, totalKr).map((d) => ({ ...d, ...meta }));
      }
    }

    if (matcher.some((m) => m.typ === "balkonger")) {
      const balkongDel = fordelBalkongRegister(renovering, totalKr, kontext);
      if (balkongDel && matcher.length === 1) {
        return justeraAvrundning(balkongDel, totalKr).map((d) => ({ ...d, ...meta }));
      }
    }

    if (matcher.length > 1) {
      return justeraAvrundning(fordelKombineradeAtgarder(renovering, totalKr, matcher), totalKr).map(
        (d) => ({ ...d, ...meta }),
      );
    }
  }

  if (regel.typ === "fonster") {
    const fonsterDel = fordelFonsterVaderstreck(renovering, totalKr, text, kontext);
    if (fonsterDel) return justeraAvrundning(fonsterDel, totalKr).map((d) => ({ ...d, ...meta }));
  }

  if (regel.typ === "balkonger") {
    const balkongDel = fordelBalkongRegister(renovering, totalKr, kontext);
    if (balkongDel) return justeraAvrundning(balkongDel, totalKr).map((d) => ({ ...d, ...meta }));
  }

  if (regel.typ === "stambyte" && klump) {
    return justeraAvrundning(fordelStambyte(totalKr, renovering), totalKr).map((d) => ({
      ...d,
      ...meta,
    }));
  }

  return [
    {
      renoveringId: renovering.id,
      komponent: normaliseraRenoveringKomponent(renovering.komponent),
      del: regel.delEtikett,
      atgardTyp: regel.typ,
      underkomponentId: regel.underkomponentId,
      basKostnadKr: totalKr,
      ...meta,
      utförtAr: renovering.ar,
      andel: 1,
      fordelningsNotering: "Hela beloppet på en del",
    },
  ];
}

export function renoveringHarFordelning(renovering: UtfördRenovering): boolean {
  const delar = fordelRenovering(renovering);
  return delar.length > 1 || (delar[0]?.andel ?? 1) < 1;
}
