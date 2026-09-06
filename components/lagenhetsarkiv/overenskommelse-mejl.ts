import { safeSetLocalStorage } from "@/lib/localStorage";
import { foreningStorageKey } from "@/lib/foreningStorage";
import { lasAktivForeningId } from "@/lib/forening-registry";

const OVERENSKOMMELSE_MEJL_BASE = "brf-overenskommelse-mejl";

export type OverenskommelseMejlPost = {
  id: string;
  till: string;
  amne: string;
  brodtext: string;
  skapad: string;
  via: "api" | "lokal";
};

function storageKey(): string {
  return foreningStorageKey(
    `${OVERENSKOMMELSE_MEJL_BASE}-${lasAktivForeningId()}`,
  );
}

function lasLokala(): OverenskommelseMejlPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function sparaLokala(poster: OverenskommelseMejlPost[]) {
  if (typeof window === "undefined") return;
  safeSetLocalStorage(storageKey(), JSON.stringify(poster.slice(0, 50)));
}

export function byggOverenskommelseBrodtext(opts: {
  lagenhetsnummer: string;
  mappNamn: string;
  mallEtikett: string;
  punkter: { text: string; sektionEtikett: string }[];
  steg: "styrelse" | "medlem";
  signeringLank?: string;
}): string {
  const rader: string[] = [];

  if (opts.steg === "styrelse") {
    rader.push(
      "Hej,",
      "",
      "Här är överenskommelsen mellan styrelsen och medlemmen inför renovering.",
      "Granska punkterna. När styrelsen är överens skickas samma överenskommelse till medlemmen för BankID-signering.",
      "",
    );
  } else {
    rader.push(
      "Hej,",
      "",
      "Styrelsen har godkänt överenskommelsen för din renovering.",
      "Öppna länken nedan, läs kraven och signera med BankID.",
      "",
    );
  }

  rader.push(
    `Lägenhet: ${opts.lagenhetsnummer}`,
    `Renovering: ${opts.mappNamn} (${opts.mallEtikett})`,
    "",
    "Överenskommelsens punkter:",
  );

  let forraSektion = "";
  for (const p of opts.punkter) {
    if (p.sektionEtikett !== forraSektion) {
      rader.push("", `— ${p.sektionEtikett}`);
      forraSektion = p.sektionEtikett;
    }
    rader.push(`• ${p.text}`);
  }

  if (opts.signeringLank) {
    rader.push("", `Signera här: ${opts.signeringLank}`);
  }

  rader.push("", "Vänliga hälsningar", "Styrelsen");
  return rader.join("\n");
}

/**
 * Försöker skicka via API (Resend/outbox). Faller tillbaka till lokal logg
 * så flödet fungerar även utan databas.
 */
export async function registreraOverenskommelseMejl(meddelande: {
  till: string;
  amne: string;
  brodtext: string;
}): Promise<OverenskommelseMejlPost> {
  let via: "api" | "lokal" = "lokal";

  try {
    const res = await fetch("/api/forening/skicka-mejl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(meddelande),
    });
    if (res.ok) via = "api";
  } catch {
    /* lokal fallback */
  }

  const post: OverenskommelseMejlPost = {
    id: `okm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    till: meddelande.till,
    amne: meddelande.amne,
    brodtext: meddelande.brodtext,
    skapad: new Date().toISOString(),
    via,
  };

  const befintliga = lasLokala();
  sparaLokala([post, ...befintliga]);
  return post;
}
