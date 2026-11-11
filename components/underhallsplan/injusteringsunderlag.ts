import {
  formatSummeringTal,
  parseNummerSumma,
} from "@/components/underhallsplan/lista-summering";
import {
  formateraUndercentral,
  normaliseraUndercentralData,
  uppvarmningHuvudsystemEtikett,
  type UndercentralData,
} from "@/components/underhallsplan/undercentral";
import {
  radiatorRorsystemAlternativ,
  normaliseraVvsRadiatorData,
  type VvsRadiatorData,
} from "@/components/underhallsplan/vvs-radiatorer";
import {
  byggVarmeStamOversikt,
  formateraVarmeStamOversiktRader,
  normaliseraVarmestammarData,
  varmestamRadiatorElement,
  varmestamRumVolymKbm,
  varmestamRumYtaKvm,
  varmestamVaningsLangder,
  varmestamVertikalMeter,
  type VarmestammarData,
  type VarmestamPost,
} from "@/components/underhallsplan/varmestammar";

export const INJUSTERINGSUNDERLAG_ID = "injusteringsunderlag";

export type InjusteringsunderlagKalla = {
  undercentral: UndercentralData;
  varmestammar: VarmestammarData;
  radiatorer?: VvsRadiatorData | null;
  foreningNamn?: string;
  skapad?: string;
  /** Radiatortyper från grunduppgifter — för korrekta storleksnamn. */
  radiatorTyper?: import("@/components/underhallsplan/radiator-typer").RadiatorTypPost[];
};

export type InjusteringsunderlagSnapshot = {
  id: string;
  sparadDatum: string;
  foreningNamn: string;
  text: string;
};

function formateraStamSektion(
  post: VarmestamPost,
  radiatorTyper?: import("@/components/underhallsplan/radiator-typer").RadiatorTypPost[],
): string[] {
  const rader = formateraVarmeStamOversiktRader(
    byggVarmeStamOversikt(post, radiatorTyper),
  );
  const vaningar = varmestamVaningsLangder(post);
  if (vaningar.length === 0) return rader;

  const vaningsRader = [
    "Längd per våningsplan:",
    ...vaningar.map(
      (v) =>
        `  · Våning ${v.vaning}: ${formatSummeringTal(v.inomVaningMeter)} m inom våning (kumulativt ${formatSummeringTal(v.kumulativMeter)} m från start)`,
    ),
  ];
  const radiatorIndex = rader.findIndex((r) => r.startsWith("Radiatorer"));
  if (radiatorIndex >= 0) {
    rader.splice(radiatorIndex, 0, ...vaningsRader);
  } else {
    rader.push(...vaningsRader);
  }
  return rader;
}

/** Bygger textunderlag för den som ska ta fram injusteringshandling. */
export function byggInjusteringsunderlagText(
  kalla: InjusteringsunderlagKalla,
): string {
  const uc = normaliseraUndercentralData(kalla.undercentral);
  const stammar = normaliseraVarmestammarData(kalla.varmestammar);
  const radiatorer = kalla.radiatorer
    ? normaliseraVvsRadiatorData(kalla.radiatorer)
    : null;
  const datum =
    kalla.skapad?.trim() || new Date().toLocaleDateString("sv-SE");

  const rader: string[] = [
    "INJUSTERINGSUNDERLAG — VÄRMESYSTEM",
    "Underlag till den som tar fram injusteringshandling / beräkning.",
    `Datum: ${datum}`,
  ];
  if (kalla.foreningNamn?.trim()) {
    rader.push(`Förening: ${kalla.foreningNamn.trim()}`);
  }
  rader.push("");

  rader.push("## 1. Undercentral");
  if (uc.huvudsystem) {
    rader.push(
      `Huvudsystem: ${uppvarmningHuvudsystemEtikett(uc.huvudsystem, uc.huvudsystemAnnat)}`,
    );
  }
  const ucText = formateraUndercentral(uc);
  if (ucText) rader.push(ucText);
  if (!uc.huvudsystem && !ucText) {
    rader.push("Uppgifter om undercentral saknas.");
  }
  rader.push("");

  rader.push("## 2. Horisontell stamledning värme (källare)");
  const tillopp = parseNummerSumma([stammar.stamledningTilloppLopmeter]);
  const retur = parseNummerSumma([stammar.stamledningReturLopmeter]);
  if (tillopp > 0) {
    rader.push(`Tillopp: ${formatSummeringTal(tillopp)} m`);
  } else {
    rader.push("Tillopp: ej angiven");
  }
  if (retur > 0) {
    rader.push(`Retur: ${formatSummeringTal(retur)} m`);
  } else {
    rader.push("Retur: ej angiven");
  }
  rader.push(
    "Från den horisontella ledningen går värmestammarna upp i fastigheten.",
  );
  rader.push("");

  if (radiatorer?.rorsystem) {
    const etikett =
      radiatorRorsystemAlternativ.find((a) => a.id === radiatorer.rorsystem)
        ?.etikett ?? radiatorer.rorsystem;
    rader.push("## 3. Rörsystem");
    rader.push(etikett);
    rader.push("");
  }

  rader.push("## 4. Värmestammar");
  rader.push(
    "Per stam: höjd upp genom huset, längd per våning, ventiler, golvyta/rumvolym och radiatorstorlek.",
  );
  rader.push(
    "Obs: Effektbehov beräknas oftast från golvyta (W/m²) eller rumvolym (W/m³). Volym = golvyta × takhöjd.",
  );
  rader.push("");

  if (stammar.poster.length === 0) {
    rader.push("Inga värmestammar registrerade.");
  } else {
    for (const stam of stammar.poster) {
      rader.push(...formateraStamSektion(stam, kalla.radiatorTyper));
      rader.push("");
    }
  }

  rader.push("## 5. Sammanfattning");
  rader.push(`Antal stammar: ${stammar.poster.length} st`);
  const stamhojd = stammar.poster.reduce(
    (sum, p) => sum + varmestamVertikalMeter(p),
    0,
  );
  if (stamhojd > 0) {
    rader.push(`Stamhöjd totalt: ${formatSummeringTal(stamhojd)} m`);
  }
  if (tillopp > 0 || retur > 0) {
    rader.push(
      `Horisontell stamledning: tillopp ${formatSummeringTal(tillopp)} m, retur ${formatSummeringTal(retur)} m`,
    );
  }
  const ytaTot = stammar.poster.reduce(
    (sum, p) => sum + varmestamRumYtaKvm(p),
    0,
  );
  const volymTot = stammar.poster.reduce(
    (sum, p) => sum + varmestamRumVolymKbm(p),
    0,
  );
  if (ytaTot > 0) rader.push(`Golvyta totalt: ${formatSummeringTal(ytaTot)} m²`);
  if (volymTot > 0) {
    rader.push(`Rumvolym totalt: ${formatSummeringTal(volymTot)} m³`);
  }
  const elementTot = stammar.poster.reduce(
    (sum, p) => sum + varmestamRadiatorElement(p),
    0,
  );
  if (elementTot > 0) {
    rader.push(`Radiatorelement totalt: ${elementTot} st`);
  }

  rader.push("");
  rader.push(
    "Detta underlag ersätter inte injusteringshandling eller flödesberäkning — det är inventeringsunderlag till konsult/entreprenör.",
  );

  return rader.join("\n");
}

export function skapaInjusteringsunderlagSnapshot(
  kalla: InjusteringsunderlagKalla,
): InjusteringsunderlagSnapshot {
  const sparadDatum = new Date().toISOString();
  return {
    id: `injustering-${Date.now().toString(36)}`,
    sparadDatum,
    foreningNamn: kalla.foreningNamn?.trim() || "",
    text: byggInjusteringsunderlagText({
      ...kalla,
      skapad: new Date(sparadDatum).toLocaleDateString("sv-SE"),
    }),
  };
}

export function formateraSnapshotDatum(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("sv-SE");
}
