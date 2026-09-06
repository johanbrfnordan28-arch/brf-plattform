import type { OffertForfragan } from "@/components/offert/offert-forfragan-lager";

async function anropaOffertMejlApi(body: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch("/api/offert/mejla", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Mejlar teamet när någon skickar offertförfrågan (inkl. dold reservmottagare). */
export async function mejlaOffertForfraganTillTeam(
  forfragan: OffertForfragan,
): Promise<boolean> {
  return anropaOffertMejlApi({
    typ: "forfragan",
    foreningsNamn: forfragan.foreningsNamn,
    kontaktperson: forfragan.kontaktperson,
    epost: forfragan.epost,
    telefon: forfragan.telefon,
    antalLagenheter: forfragan.antalLagenheter,
    tjanster: forfragan.tjanster,
    meddelande: forfragan.meddelande,
  });
}

/** Mejlar teamet när personal förbereder en offert till kund. */
export async function mejlaOffertTillTeam(opts: {
  forfragan: OffertForfragan;
  prisText: string;
  brodtextTillKund: string;
}): Promise<boolean> {
  return anropaOffertMejlApi({
    typ: "offert",
    foreningsNamn: opts.forfragan.foreningsNamn,
    kontaktperson: opts.forfragan.kontaktperson,
    kundEpost: opts.forfragan.epost,
    tjanster: opts.forfragan.tjanster,
    prisText: opts.prisText,
    brodtextTillKund: opts.brodtextTillKund,
  });
}
