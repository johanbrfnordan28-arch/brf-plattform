import { prisma } from "@/lib/db";
import { skapaId } from "@/lib/auth/session";

export type MejlMeddelande = {
  till: string;
  amne: string;
  brodtext: string;
  /** Svar går till denna adress (t.ex. kundens e-post vid offertförfrågan). */
  replyTo?: string;
};

export type MejlSkickatResultat = {
  via: "resend" | "outbox" | "ingen";
  id: string;
};

/**
 * Skickar mejl via Resend utan databas — för demoläge/mässa.
 */
export async function skickaMejlDirekt(
  meddelande: MejlMeddelande,
): Promise<{ via: "resend" | "ingen"; id: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fran =
    process.env.MEJL_FRAN?.trim() || "Styrelse-Navet <onboarding@resend.dev>";

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[mejl/demo] RESEND_API_KEY saknas — till=${meddelande.till} amne=${meddelande.amne}\n${meddelande.brodtext}`,
      );
    }
    return { via: "ingen", id: skapaId("mejl") };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fran,
        to: [meddelande.till],
        ...(meddelande.replyTo?.trim()
          ? { reply_to: meddelande.replyTo.trim() }
          : {}),
        subject: meddelande.amne,
        text: meddelande.brodtext,
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as { id?: string };
      return { via: "resend", id: data.id || skapaId("mejl") };
    }
    console.error("[mejl] Resend svarade inte OK:", await res.text());
  } catch (error) {
    console.error("[mejl] Resend-anrop misslyckades:", error);
  }

  return { via: "ingen", id: skapaId("mejl") };
}

/**
 * Skickar mejl om RESEND_API_KEY finns, annars sparas i outbox (synlig för plattformsadmin).
 * Returnerar hur mejlet hanterades.
 */
export async function skickaMejl(
  meddelande: MejlMeddelande,
): Promise<MejlSkickatResultat> {
  const direkt = await skickaMejlDirekt(meddelande);
  if (direkt.via === "resend") {
    try {
      await prisma.mejlOutbox.create({
        data: {
          id: skapaId("outbox"),
          till: meddelande.till,
          amne: meddelande.amne,
          brodtext: meddelande.brodtext,
          skickadVia: "resend",
        },
      });
    } catch {
      /* loggning i outbox är valfri */
    }
    return direkt;
  }

  const id = skapaId("outbox");
  try {
    await prisma.mejlOutbox.create({
      data: {
        id,
        till: meddelande.till,
        amne: meddelande.amne,
        brodtext: meddelande.brodtext,
        skickadVia: "outbox",
      },
    });
  } catch (error) {
    console.error("[mejl] Kunde inte spara i outbox:", error);
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[mejl/fallback] till=${meddelande.till} amne=${meddelande.amne}\n${meddelande.brodtext}`,
      );
    }
    return { via: "ingen", id };
  }

  if (process.env.NODE_ENV !== "production") {
    console.info(
      `[mejl/outbox] till=${meddelande.till} amne=${meddelande.amne}\n${meddelande.brodtext}`,
    );
  }

  return { via: "outbox", id };
}

export function byggLosenordMejl(opts: {
  foreningsNamn: string;
  mottagarNamn: string;
  epost: string;
  losenord: string;
  loginUrl: string;
  arSkickaIgen?: boolean;
}): MejlMeddelande {
  const rubrik = opts.arSkickaIgen
    ? `Nytt tillfälligt lösenord till ${opts.foreningsNamn}`
    : `Inloggning till ${opts.foreningsNamn} — Styrelse-Navet`;
  const intro = opts.arSkickaIgen
    ? `Här är ett nytt tillfälligt lösenord till «${opts.foreningsNamn}».`
    : `Föreningen «${opts.foreningsNamn}» har skapats i Styrelse-Navet.`;

  return {
    till: opts.epost,
    amne: rubrik,
    brodtext: [
      `Hej ${opts.mottagarNamn || "styrelsen"},`,
      "",
      intro,
      "",
      `Inloggning: ${opts.loginUrl}`,
      `E-post: ${opts.epost}`,
      `Tillfälligt lösenord: ${opts.losenord}`,
      "",
      "När du loggar in kan du spara lösenordet eller byta till ett eget.",
      "Du hittar också «Spara/visa» och «Byt lösenord» under Konto i menyn.",
      "Glömt lösenordet senare? Använd «Glömt lösenord» på inloggningssidan.",
      "",
      "Vänliga hälsningar",
      "Styrelse-Navet",
    ].join("\n"),
  };
}

export function byggAterstallningsMejl(opts: {
  epost: string;
  namn: string;
  länk: string;
}): MejlMeddelande {
  return {
    till: opts.epost,
    amne: "Återställ lösenord — Styrelse-Navet",
    brodtext: [
      `Hej ${opts.namn || ""},`,
      "",
      "Någon har begärt återställning av lösenordet till Styrelse-Navet.",
      `Öppna länken inom en timme: ${opts.länk}`,
      "",
      "Om du inte begärde detta kan du ignorera mejlet.",
      "",
      "Styrelse-Navet",
    ].join("\n"),
  };
}
