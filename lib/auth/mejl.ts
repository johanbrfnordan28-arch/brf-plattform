import nodemailer from "nodemailer";
import { prisma } from "@/lib/db";
import { skapaId } from "@/lib/auth/session";
import {
  hamtaMejlFranAdress,
  hamtaMejlTransportStatus,
} from "@/lib/auth/mejl-konfiguration";

export type MejlMeddelande = {
  till: string;
  amne: string;
  brodtext: string;
  /** Svar går till denna adress (t.ex. kundens e-post vid offertförfrågan). */
  replyTo?: string;
};

export type MejlLeveransVia = "resend" | "smtp" | "outbox" | "ingen";

export type MejlSkickatResultat = {
  via: MejlLeveransVia;
  id: string;
  fel?: string;
};

async function skickaViaResend(
  meddelande: MejlMeddelande,
  apiKey: string,
  fran: string,
): Promise<{ ok: boolean; id?: string; fel?: string }> {
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
      return { ok: true, id: data.id };
    }

    const feltext = await res.text();
    console.error("[mejl/resend] API-fel:", res.status, feltext);
    return {
      ok: false,
      fel: `Resend ${res.status}: ${feltext.slice(0, 200)}`,
    };
  } catch (error) {
    console.error("[mejl/resend] Anrop misslyckades:", error);
    return {
      ok: false,
      fel: error instanceof Error ? error.message : "Resend-anrop misslyckades",
    };
  }
}

async function skickaViaSmtp(
  meddelande: MejlMeddelande,
): Promise<{ ok: boolean; fel?: string }> {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!host || !user || !pass) {
    return { ok: false, fel: "SMTP saknas" };
  }

  const port = Number.parseInt(process.env.SMTP_PORT || "587", 10);
  const secure =
    process.env.SMTP_SECURE === "true" ||
    process.env.SMTP_SECURE === "1" ||
    port === 465;
  const fran = hamtaMejlFranAdress();

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: fran,
      to: meddelande.till,
      ...(meddelande.replyTo?.trim()
        ? { replyTo: meddelande.replyTo.trim() }
        : {}),
      subject: meddelande.amne,
      text: meddelande.brodtext,
    });

    return { ok: true };
  } catch (error) {
    console.error("[mejl/smtp] Utskick misslyckades:", error);
    return {
      ok: false,
      fel: error instanceof Error ? error.message : "SMTP misslyckades",
    };
  }
}

/**
 * Skickar mejl via Resend eller SMTP — utan databaskrav.
 */
export async function skickaMejlDirekt(
  meddelande: MejlMeddelande,
): Promise<MejlSkickatResultat> {
  const status = hamtaMejlTransportStatus();
  const fran = hamtaMejlFranAdress();
  let senasteFel: string | undefined;

  if (status.resend) {
    const resultat = await skickaViaResend(
      meddelande,
      process.env.RESEND_API_KEY!.trim(),
      fran,
    );
    if (resultat.ok) {
      return {
        via: "resend",
        id: resultat.id || skapaId("mejl"),
      };
    }
    senasteFel = resultat.fel;
  }

  if (status.smtp) {
    const resultat = await skickaViaSmtp(meddelande);
    if (resultat.ok) {
      return { via: "smtp", id: skapaId("mejl") };
    }
    senasteFel = resultat.fel || senasteFel;
  }

  if (process.env.NODE_ENV !== "production") {
    console.info(
      `[mejl/ingen transport] till=${meddelande.till} amne=${meddelande.amne}\n${meddelande.brodtext}`,
    );
  }

  if (!status.resend && !status.smtp) {
    senasteFel =
      "Ingen mejltjänst konfigurerad — sätt RESEND_API_KEY eller SMTP_* i Vercel.";
  }

  return {
    via: "ingen",
    id: skapaId("mejl"),
    fel: senasteFel,
  };
}

function arLevererat(via: MejlLeveransVia): boolean {
  return via === "resend" || via === "smtp";
}

/**
 * Skickar mejl via Resend/SMTP om möjligt, annars sparas i outbox.
 */
export async function skickaMejl(
  meddelande: MejlMeddelande,
): Promise<MejlSkickatResultat> {
  const direkt = await skickaMejlDirekt(meddelande);
  if (arLevererat(direkt.via)) {
    try {
      await prisma.mejlOutbox.create({
        data: {
          id: skapaId("outbox"),
          till: meddelande.till,
          amne: meddelande.amne,
          brodtext: meddelande.brodtext,
          skickadVia: direkt.via,
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
    return { via: "ingen", id, fel: direkt.fel };
  }

  if (process.env.NODE_ENV !== "production") {
    console.info(
      `[mejl/outbox] till=${meddelande.till} amne=${meddelande.amne}\n${meddelande.brodtext}`,
    );
  }

  return { via: "outbox", id, fel: direkt.fel };
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
