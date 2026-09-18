import type { OffertForfragan } from "@/components/offert/offert-forfragan-lager";
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

/** Mejlar teamet när någon skickar offertförfrågan. */
export async function mejlaOffertForfraganTillTeam(
  forfragan: OffertForfragan,
): Promise<void> {
  const resultat = await anropaOffertMejlApi({
    typ: "forfragan",
    foreningsNamn: forfragan.foreningsNamn,
    kontaktperson: forfragan.kontaktperson,
    epost: forfragan.epost,
    telefon: forfragan.telefon,
    antalLagenheter: forfragan.antalLagenheter,
    tjanster: forfragan.tjanster,
    meddelande: forfragan.meddelande,
    oonskadKontaktId: forfragan.oonskadKontaktId ?? "offert",
  });

  if (!resultat.ok) {
    throw new Error(
      resultat.fel ||
        "Mejlet kunde inte skickas. Mejla oss direkt på offert@styrelse-navet.se.",
    );
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
