import { normaliseraForeningsNamn } from "@/lib/forening-registry";

/** Jämförelsetext utan «brf» och utan mellanslag (Stora huset ≈ Storahuset). */
function kollapsaNamn(text: string): string {
  return normaliseraForeningsNamn(text)
    .replace(/^brf\s+/, "")
    .replace(/\s+/g, "");
}

/**
 * Matchar söktext mot föreningsnamn — samma logik på klient och server.
 */
export function matcharForeningsNamn(
  foreningsNamn: string,
  soktext: string,
): boolean {
  const namn = normaliseraForeningsNamn(foreningsNamn);
  const namnUtanBrf = namn.replace(/^brf\s+/, "");
  const namnKollaps = kollapsaNamn(foreningsNamn);

  const q = normaliseraForeningsNamn(soktext);
  const qUtanBrf = q.replace(/^brf\s+/, "").trim();
  if (!qUtanBrf) return true;
  const qKollaps = kollapsaNamn(soktext);

  if (
    namn.includes(q) ||
    namnUtanBrf.includes(qUtanBrf) ||
    namnUtanBrf.startsWith(qUtanBrf) ||
    namnKollaps.includes(qKollaps) ||
    namnKollaps.startsWith(qKollaps)
  ) {
    return true;
  }

  const ord = namnUtanBrf.split(/\s+/).filter(Boolean);
  return ord.some(
    (o) => o.startsWith(qUtanBrf) || namnKollaps.startsWith(qKollaps),
  );
}

/** Minsta antal tecken efter «Brf » för serversökning och listning. */
export function minstaSokLangd(soktext: string): number {
  const q = soktext.replace(/^brf\s*/i, "").trim();
  return q.length;
}
