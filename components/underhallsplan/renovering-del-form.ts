import type { UnderhallBesiktningStatus } from "@/components/underhallsplan/komponentregister";
import type {
  KommandeAtgardOverride,
  UtfördRenovering,
} from "@/components/underhallsplan/renoveringar";

export type RenoveringDelFormState = {
  ar: string;
  titel: string;
  omfattning: string;
  kostnadKr: string;
  avdragProcent: string;
  avdragAnledning: string;
  entreprenor: string;
  underhallBesiktning: UnderhallBesiktningStatus | "";
  garantiAr: string;
  ansvarAr: string;
  klumpsumma: boolean;
  klumpsummaAntalBadrum: string;
  klumpsummaAntalKok: string;
  klumpsummaAntalWc: string;
  balkongRadId: string;
  balkongTyp: string;
  balkongAtgard: string;
};

export function tomRenoveringDelForm(): RenoveringDelFormState {
  return {
    ar: "",
    titel: "",
    omfattning: "",
    kostnadKr: "",
    avdragProcent: "",
    avdragAnledning: "",
    entreprenor: "",
    underhallBesiktning: "",
    garantiAr: "2",
    ansvarAr: "10",
    klumpsumma: false,
    klumpsummaAntalBadrum: "",
    klumpsummaAntalKok: "",
    klumpsummaAntalWc: "",
    balkongRadId: "",
    balkongTyp: "",
    balkongAtgard: "renovering",
  };
}

export function renoveringTillDelForm(post: UtfördRenovering): RenoveringDelFormState {
  return {
    ar: String(post.ar),
    titel: post.titel,
    omfattning: post.omfattning === "—" ? "" : post.omfattning,
    kostnadKr: post.kostnadKr != null ? String(post.kostnadKr) : "",
    avdragProcent:
      post.avdragProcent != null ? String(post.avdragProcent) : "",
    avdragAnledning: post.avdragAnledning ?? "",
    entreprenor: post.entreprenor ?? "",
    underhallBesiktning: post.underhallBesiktning ?? "",
    garantiAr:
      post.garantiAr != null ? String(post.garantiAr) : tomRenoveringDelForm().garantiAr,
    ansvarAr:
      post.ansvarAr != null ? String(post.ansvarAr) : tomRenoveringDelForm().ansvarAr,
    klumpsumma: Boolean(post.klumpsumma),
    klumpsummaAntalBadrum:
      post.klumpsummaAntalBadrum != null ? String(post.klumpsummaAntalBadrum) : "",
    klumpsummaAntalKok:
      post.klumpsummaAntalKok != null ? String(post.klumpsummaAntalKok) : "",
    klumpsummaAntalWc:
      post.klumpsummaAntalWc != null ? String(post.klumpsummaAntalWc) : "",
    balkongRadId: post.balkongRadId ?? "",
    balkongTyp: post.balkongTyp ?? "",
    balkongAtgard: post.balkongAtgard ?? "renovering",
  };
}

function parseAntal(text: string): number | undefined {
  const n = Number.parseInt(text.trim(), 10);
  return Number.isNaN(n) || n < 0 ? undefined : n;
}

export function delFormTillRenovering(args: {
  form: RenoveringDelFormState;
  komponent: string;
  underkomponentId: string;
  del: string;
  id: string;
  kalla?: UtfördRenovering["kalla"];
  nastaAtgardArOverrides?: Record<string, number>;
  kommandeAtgardOverrides?: Record<string, KommandeAtgardOverride>;
  inkluderadeUnderkomponenter?: string[];
}): UtfördRenovering | null {
  const ar = Number.parseInt(args.form.ar, 10);
  if (!args.form.titel.trim() || Number.isNaN(ar)) return null;

  const kostnad = args.form.kostnadKr.trim()
    ? Number.parseInt(args.form.kostnadKr.replace(/\s/g, ""), 10)
    : undefined;
  const avdragProcent = args.form.avdragProcent.trim()
    ? Number.parseFloat(args.form.avdragProcent.replace(",", "."))
    : undefined;

  const ärStambyteKlumpsumma =
    args.form.klumpsumma && args.underkomponentId === "stambyte";
  if (ärStambyteKlumpsumma) {
    if (
      parseAntal(args.form.klumpsummaAntalBadrum) === undefined ||
      parseAntal(args.form.klumpsummaAntalKok) === undefined ||
      parseAntal(args.form.klumpsummaAntalWc) === undefined
    ) {
      return null;
    }
  }

  return {
    id: args.id,
    komponent: args.komponent,
    underkomponentId: args.underkomponentId,
    del: args.del,
    ar,
    titel: args.form.titel.trim(),
    omfattning: args.form.omfattning.trim() || "—",
    kostnadKr: Number.isNaN(kostnad ?? NaN) ? undefined : kostnad,
    avdragProcent:
      avdragProcent !== undefined && Number.isFinite(avdragProcent)
        ? Math.min(100, Math.max(0, avdragProcent))
        : undefined,
    avdragAnledning: args.form.avdragAnledning.trim() || undefined,
    entreprenor: args.form.entreprenor.trim() || undefined,
    underhallBesiktning: args.form.underhallBesiktning || undefined,
    garantiAr: args.form.garantiAr.trim()
      ? Number.parseInt(args.form.garantiAr, 10)
      : undefined,
    ansvarAr: args.form.ansvarAr.trim()
      ? Number.parseInt(args.form.ansvarAr, 10)
      : undefined,
    nastaAtgardArOverrides: args.nastaAtgardArOverrides,
    kommandeAtgardOverrides: args.kommandeAtgardOverrides,
    inkluderadeUnderkomponenter:
      args.inkluderadeUnderkomponenter &&
      args.inkluderadeUnderkomponenter.length > 0
        ? args.inkluderadeUnderkomponenter
        : undefined,
    kalla: args.kalla ?? "styrelse",
    klumpsumma: args.form.klumpsumma || undefined,
    klumpsummaAntalBadrum: args.form.klumpsumma
      ? parseAntal(args.form.klumpsummaAntalBadrum)
      : undefined,
    klumpsummaAntalKok: args.form.klumpsumma
      ? parseAntal(args.form.klumpsummaAntalKok)
      : undefined,
    klumpsummaAntalWc: args.form.klumpsumma
      ? parseAntal(args.form.klumpsummaAntalWc)
      : undefined,
    balkongRadId: args.form.balkongRadId.trim() || undefined,
    balkongTyp: (args.form.balkongTyp.trim() || undefined) as UtfördRenovering["balkongTyp"],
    balkongAtgard: (args.form.balkongAtgard.trim() || undefined) as UtfördRenovering["balkongAtgard"],
  };
}

export function nastaArOverridesFranInputs(
  planerade: { renoveringId: string; nastaAr: number }[],
  inputs: Record<string, string>,
): Record<string, number> | undefined {
  const result: Record<string, number> = {};
  for (const p of planerade) {
    const raw = inputs[p.renoveringId]?.trim();
    const ar = raw ? Number.parseInt(raw, 10) : p.nastaAr;
    if (!Number.isNaN(ar) && ar > 0) result[p.renoveringId] = ar;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

export function nastaArInputsFranOverrides(
  planerade: { renoveringId: string; nastaAr: number }[],
  overrides?: Record<string, number>,
): Record<string, string> {
  const inputs: Record<string, string> = {};
  for (const p of planerade) {
    const ar = overrides?.[p.renoveringId] ?? p.nastaAr;
    inputs[p.renoveringId] = String(ar);
  }
  return inputs;
}

export function kommandeAtgardOverridesFranState(
  planerade: { renoveringId: string }[],
  overrides: Record<string, KommandeAtgardOverride>,
): Record<string, KommandeAtgardOverride> | undefined {
  const result: Record<string, KommandeAtgardOverride> = {};
  for (const p of planerade) {
    const o = overrides[p.renoveringId];
    if (o?.läge === "avvikande") {
      result[p.renoveringId] = o;
    } else if (o?.läge === "standard") {
      result[p.renoveringId] = { läge: "standard" };
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}
