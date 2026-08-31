/**
 * Klient: skapa förening lokalt + konto/lösenord på servern.
 */

import {
  skapaForeningIdFranNamn,
  skapaNyForening,
  type ForeningProfil,
} from "@/lib/forening-registry";
import { sparaServerAccessNyckel } from "@/lib/forening-server-sync";
import {
  skapaTomStyrelseLedamot,
  type StyrelseRoll,
} from "@/lib/styrelse-ledamot";

export type SkapaForeningMedKontoResultat = {
  profil: ForeningProfil;
  tillfalligtLosenord: string;
  mejlVia: "resend" | "outbox";
  meddelande: string;
  epost: string;
};

export async function skapaForeningMedKontoKlient(opts: {
  foreningsNamn: string;
  skapareNamn: string;
  skapareEpost: string;
  skapareRoll: StyrelseRoll | string;
}): Promise<SkapaForeningMedKontoResultat> {
  const namn = opts.foreningsNamn.trim();
  const foreningId = skapaForeningIdFranNamn(namn);
  const ledamot = skapaTomStyrelseLedamot({
    namn: opts.skapareNamn.trim(),
    roll: opts.skapareRoll,
    epost: opts.skapareEpost.trim(),
  });

  const res = await fetch("/api/auth/skapa-forening", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      foreningId,
      foreningsNamn: namn,
      skapareNamn: opts.skapareNamn.trim(),
      skapareEpost: opts.skapareEpost.trim(),
      skapareRoll: opts.skapareRoll,
    }),
  });

  const data = (await res.json()) as {
    fel?: string;
    accessNyckel?: string;
    tillfalligtLosenord?: string;
    mejlVia?: "resend" | "outbox";
    meddelande?: string;
    epost?: string;
  };

  if (!res.ok) {
    throw new Error(data.fel || "Kunde inte skapa föreningen på servern.");
  }

  const profil = skapaNyForening(namn, {
    id: foreningId,
    synkaServer: false,
    epost: opts.skapareEpost.trim(),
    kontaktperson: opts.skapareNamn.trim(),
    styrelseledamoter: [ledamot],
  });

  if (data.accessNyckel) {
    sparaServerAccessNyckel(profil.id, data.accessNyckel);
  }

  return {
    profil,
    tillfalligtLosenord: data.tillfalligtLosenord || "",
    mejlVia: data.mejlVia || "outbox",
    meddelande: data.meddelande || "",
    epost: data.epost || opts.skapareEpost.trim(),
  };
}
