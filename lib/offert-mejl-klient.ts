import type { OffertForfragan } from "@/lib/offert-forfragan";
import type { OffertKontaktpersonId } from "@/lib/kontakt-epost";

type OffertMejlSvar = {
  ok?: boolean;
  fel?: string;
  levererade?: number;
  varning?: string;
};

async function anropaOffertMejlApi(
  body: Record<string, unknown>,
): Promise<OffertMejlSvar> {
  try {
    const res = await fetch("/api/offert/mejla", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as OffertMejlSvar;
    if (!res.ok) {
      return {
        ok: false,
        fel: data.fel || "Kunde inte skicka mejl.",
        ...data,
      };
    }
    return { ok: true, ...data };
  } catch {
    return { ok: false, fel: "Kunde inte nå servern." };
  }
}

/** Mejlar teamet när personal förbereder en offert till kund. */
export async function mejlaOffertTillTeam(opts: {
  forfragan: OffertForfragan;
  prisText: string;
  brodtextTillKund: string;
}): Promise<boolean> {
  const resultat = await anropaOffertMejlApi({
    typ: "offert",
    foreningsNamn: opts.forfragan.foreningsNamn,
    kontaktperson: opts.forfragan.kontaktperson,
    kundEpost: opts.forfragan.epost,
    tjanster: opts.forfragan.tjanster,
    prisText: opts.prisText,
    brodtextTillKund: opts.brodtextTillKund,
  });
  return resultat.ok === true;
}

export type { OffertKontaktpersonId };
