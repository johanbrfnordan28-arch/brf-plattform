import { prisma } from "@/lib/db";
import { skapaId } from "@/lib/auth/session";

export type MejlMeddelande = {
  till: string;
  amne: string;
  brodtext: string;
};

/**
 * Skickar mejl om RESEND_API_KEY finns, annars sparas i outbox (synlig för plattformsadmin).
 * Returnerar hur mejlet hanterades.
 */
export async function skickaMejl(
  meddelande: MejlMeddelande,
): Promise<{ via: "resend" | "outbox"; id: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fran =
    process.env.MEJL_FRAN?.trim() || "Styrelse-Navet <onboarding@resend.dev>";

  if (apiKey) {
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
          subject: meddelande.amne,
          text: meddelande.brodtext,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { id?: string };
        const id = data.id || skapaId("mejl");
        await prisma.mejlOutbox.create({
          data: {
            id: skapaId("outbox"),
            till: meddelande.till,
            amne: meddelande.amne,
            brodtext: meddelande.brodtext,
            skickadVia: "resend",
          },
        });
        return { via: "resend", id };
      }
    } catch {
      /* falla tillbaka till outbox */
    }
  }

  const id = skapaId("outbox");
  await prisma.mejlOutbox.create({
    data: {
      id,
      till: meddelande.till,
      amne: meddelande.amne,
      brodtext: meddelande.brodtext,
      skickadVia: "outbox",
    },
  });

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
}): MejlMeddelande {
  return {
    till: opts.epost,
    amne: `Inloggning till ${opts.foreningsNamn} — Styrelse-Navet`,
    brodtext: [
      `Hej ${opts.mottagarNamn || "styrelsen"},`,
      "",
      `Föreningen «${opts.foreningsNamn}» har skapats i Styrelse-Navet.`,
      "",
      `Inloggning: ${opts.loginUrl}`,
      `E-post: ${opts.epost}`,
      `Tillfälligt lösenord: ${opts.losenord}`,
      "",
      "Byt lösenord efter första inloggningen under Konto → Byt lösenord.",
      "Glömt lösenordet? Använd «Glömt lösenord» på inloggningssidan.",
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
