/**
 * Klient: skapa förening lokalt + konto/lösenord på servern.
 * Om databasen saknas på servern skapas föreningen ändå lokalt.
 */

import {
  finnForeningMedNamn,
  skapaForeningIdFranNamn,
  skapaNyForening,
  type ForeningProfil,
} from "@/lib/forening-registry";
import { sparaServerAccessNyckel } from "@/lib/forening-server-sync";
import { mejlSkickades } from "@/lib/auth/mejl-konfiguration";
import {
  skapaTomStyrelseLedamot,
  type StyrelseRoll,
} from "@/lib/styrelse-ledamot";
import {
  genereraLokalLosenord,
  hamtaLokalKonto,
  sparaLokalKonto,
} from "@/lib/auth/lokal-konto";
import { sparaLokalSession } from "@/lib/auth/lokal-session";
import { markeraStyrelsemassaLeadLokalSomSkapadeTest } from "@/lib/styrelsemassa-lager";

async function etableraKontoEfterSkapa(opts: {
  epost: string;
  losenord: string;
  foreningId: string;
  namn: string;
  roll: string;
}): Promise<void> {
  const epost = opts.epost.trim().toLowerCase();
  sparaLokalSession({
    epost,
    foreningId: opts.foreningId,
    namn: opts.namn,
    inloggadTidpunkt: new Date().toISOString(),
  });
  if (opts.losenord) {
    sparaLokalKonto({
      epost,
      losenord: opts.losenord,
      foreningId: opts.foreningId,
      namn: opts.namn,
      roll: opts.roll,
    });
    try {
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ epost, losenord: opts.losenord }),
      });
    } catch {
      /* lokalt konto räcker för Konto-sidan */
    }
  }
}

export type SkapaForeningMedKontoResultat = {
  profil: ForeningProfil;
  tillfalligtLosenord: string;
  mejlVia: "resend" | "smtp" | "outbox" | "lokal";
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

function hamtaEllerSkapaLokalProfil(opts: {
  namn: string;
  foreningId: string;
  skapareNamn: string;
  skapareEpost: string;
  skapareRoll: string;
}): ForeningProfil {
  const befintlig = finnForeningMedNamn(opts.namn);
  if (befintlig) return befintlig;
  return skapaLokalProfil(opts);
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
    aterkopplad?: boolean;
    forening?: { id: string; namn: string };
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
    markeraStyrelsemassaLeadLokalSomSkapadeTest({
      epost: skapareEpost,
      foreningId: profil.id,
    });

    let mejlVia: SkapaForeningMedKontoResultat["mejlVia"] = "lokal";
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
        mejlVia?: "resend" | "smtp" | "outbox" | "ingen";
        tillfalligtLosenord?: string;
        meddelande?: string;
      };
      if (mejlRes.ok) {
        if (mejlSkickades(mejlData.mejlVia || "")) {
          mejlVia = mejlData.mejlVia === "smtp" ? "smtp" : "resend";
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
      hamtaLokalKonto(skapareEpost, profil.id)?.losenord ?? tillfalligtLosenord;

    await etableraKontoEfterSkapa({
      epost: skapareEpost,
      losenord: slutligtLosenord,
      foreningId: profil.id,
      namn: skapareNamn,
      roll: String(skapareRoll),
    });

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

  const serverForeningId = data.forening?.id || foreningId;
  const profil = hamtaEllerSkapaLokalProfil({
    namn,
    foreningId: serverForeningId,
    skapareNamn,
    skapareEpost,
    skapareRoll,
  });

  if (data.accessNyckel) {
    sparaServerAccessNyckel(profil.id, data.accessNyckel);
  }

  const klientMeddelande =
    data.meddelande ||
    (data.aterkopplad
      ? `Föreningen «${namn}» är hämtad till den här webbläsaren.`
      : "");

  if (data.tillfalligtLosenord) {
    await etableraKontoEfterSkapa({
      epost: skapareEpost,
      losenord: data.tillfalligtLosenord,
      foreningId: profil.id,
      namn: skapareNamn,
      roll: String(skapareRoll),
    });
  } else {
    await etableraKontoEfterSkapa({
      epost: skapareEpost,
      losenord: hamtaLokalKonto(skapareEpost, profil.id)?.losenord || "",
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
    meddelande: klientMeddelande,
    epost: data.epost || skapareEpost.toLowerCase(),
  };
}
