/**
 * Klient: skapa förening lokalt + konto/lösenord på servern.
 * Om databasen saknas på servern skapas föreningen ändå lokalt.
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
import {
  genereraLokalLosenord,
  hamtaLokalKonto,
  sparaLokalKonto,
} from "@/lib/auth/lokal-konto";
import { markeraStyrelsemassaLeadLokalSomSkapadeTest } from "@/lib/styrelsemassa-lager";

export type SkapaForeningMedKontoResultat = {
  profil: ForeningProfil;
  tillfalligtLosenord: string;
  mejlVia: "resend" | "outbox" | "lokal";
  meddelande: string;
  epost: string;
};

function skapaLokalProfil(opts: {
  namn: string;
  foreningId: string;
  skapareNamn: string;
  skapareEpost: string;
  skapareRoll: string;
}): ForeningProfil {
  const ledamot = skapaTomStyrelseLedamot({
    namn: opts.skapareNamn,
    roll: opts.skapareRoll,
    epost: opts.skapareEpost,
  });
  return skapaNyForening(opts.namn, {
    id: opts.foreningId,
    synkaServer: false,
    epost: opts.skapareEpost,
    kontaktperson: opts.skapareNamn,
    styrelseledamoter: [ledamot],
  });
}

export async function skapaForeningMedKontoKlient(opts: {
  foreningsNamn: string;
  skapareNamn: string;
  skapareEpost: string;
  skapareRoll: StyrelseRoll | string;
}): Promise<SkapaForeningMedKontoResultat> {
  const namn = opts.foreningsNamn.trim();
  const skapareNamn = opts.skapareNamn.trim();
  const skapareEpost = opts.skapareEpost.trim();
  const skapareRoll = opts.skapareRoll;
  const foreningId = skapaForeningIdFranNamn(namn);

  let res: Response | null = null;
  let data: {
    fel?: string;
    accessNyckel?: string;
    tillfalligtLosenord?: string;
    mejlVia?: "resend" | "outbox";
    meddelande?: string;
    epost?: string;
  } = {};

  try {
    res = await fetch("/api/auth/skapa-forening", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        foreningId,
        foreningsNamn: namn,
        skapareNamn,
        skapareEpost,
        skapareRoll,
      }),
    });
    data = (await res.json()) as typeof data;
  } catch {
    res = null;
  }

  const databasSaknas =
    !res ||
    res.status === 503 ||
    (typeof data.fel === "string" &&
      /databas/i.test(data.fel));

  if (databasSaknas) {
    const tillfalligtLosenord = genereraLokalLosenord(12);
    const profil = skapaLokalProfil({
      namn,
      foreningId,
      skapareNamn,
      skapareEpost,
      skapareRoll,
    });
    sparaLokalKonto({
      epost: skapareEpost,
      losenord: tillfalligtLosenord,
      foreningId: profil.id,
      namn: skapareNamn,
      roll: String(skapareRoll),
    });
    markeraStyrelsemassaLeadLokalSomSkapadeTest({
      epost: skapareEpost,
      foreningId: profil.id,
    });

    let mejlVia: "resend" | "outbox" | "lokal" = "lokal";
    let meddelande =
      "Föreningen sparades i den här webbläsaren. Spara lösenordet nedan — det behövs för inloggning.";

    try {
      const mejlRes = await fetch("/api/auth/skicka-losenord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          epost: skapareEpost,
          losenord: tillfalligtLosenord,
          foreningsNamn: namn,
          mottagarNamn: skapareNamn,
        }),
      });
      const mejlData = (await mejlRes.json()) as {
        mejlVia?: "resend" | "ingen";
        tillfalligtLosenord?: string;
        meddelande?: string;
      };
      if (mejlRes.ok) {
        if (mejlData.mejlVia === "resend") {
          mejlVia = "resend";
          meddelande =
            "Föreningen sparades i webbläsaren och lösenordet har mejlats. Spara det också här som backup.";
        } else if (mejlData.meddelande) {
          meddelande = mejlData.meddelande;
        }
        if (
          mejlData.tillfalligtLosenord &&
          mejlData.tillfalligtLosenord !== tillfalligtLosenord
        ) {
          sparaLokalKonto({
            epost: skapareEpost,
            losenord: mejlData.tillfalligtLosenord,
            foreningId: profil.id,
            namn: skapareNamn,
            roll: String(skapareRoll),
          });
        }
      }
    } catch {
      /* mejl är valfritt i demoläge */
    }

    const slutligtLosenord =
      hamtaLokalKonto(skapareEpost)?.losenord ?? tillfalligtLosenord;

    return {
      profil,
      tillfalligtLosenord: slutligtLosenord,
      mejlVia,
      meddelande,
      epost: skapareEpost.toLowerCase(),
    };
  }

  if (!res?.ok) {
    throw new Error(data.fel || "Kunde inte skapa föreningen på servern.");
  }

  const profil = skapaLokalProfil({
    namn,
    foreningId,
    skapareNamn,
    skapareEpost,
    skapareRoll,
  });

  if (data.accessNyckel) {
    sparaServerAccessNyckel(profil.id, data.accessNyckel);
  }

  if (data.tillfalligtLosenord) {
    sparaLokalKonto({
      epost: skapareEpost,
      losenord: data.tillfalligtLosenord,
      foreningId: profil.id,
      namn: skapareNamn,
      roll: String(skapareRoll),
    });
  }

  markeraStyrelsemassaLeadLokalSomSkapadeTest({
    epost: skapareEpost,
    foreningId: profil.id,
  });

  return {
    profil,
    tillfalligtLosenord: data.tillfalligtLosenord || "",
    mejlVia: data.mejlVia || "outbox",
    meddelande: data.meddelande || "",
    epost: data.epost || skapareEpost.toLowerCase(),
  };
}
