import { upload } from "@vercel/blob/client";
import { GRUNDMALL_FORENING_ID } from "@/lib/forening-konstanter";
import { hamtaAktivForeningId } from "@/lib/forening-registry";
import { hamtaServerAccessNyckel } from "@/lib/forening-server-sync";

export const MAX_MOLN_FIL_BYTE = 200 * 1024 * 1024;

/** Filtyper som tas emot i molnet; SVG/HTML utesluts eftersom de kan köra skript. */
export const MOLN_FIL_ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.webp,.heic,.heif";

/** Pekar ut en fil i föreningens molnlagring. */
export type MolnFilRef = {
  foreningId: string;
  pathname: string;
};

export type MolnUppladdning =
  | { ok: true; ref: MolnFilRef }
  /** `lokalt` = molnet är inte tillgängligt här (demo/lokal utveckling). */
  | { ok: false; fel: string; lokalt: boolean };

function headers(foreningId: string): Record<string, string> {
  const nyckel = hamtaServerAccessNyckel(foreningId);
  return nyckel ? { "x-access-nyckel": nyckel } : {};
}

function filerUrl(foreningId: string, pathname?: string): string {
  const bas = `/api/foreningar/${encodeURIComponent(foreningId)}/filer`;
  return pathname ? `${bas}?pathname=${encodeURIComponent(pathname)}` : bas;
}

function sakertFilnamn(namn: string): string {
  const rent = namn
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return rent.slice(-120) || "fil";
}

export async function laddaUppForeningFil(opts: {
  modul: string;
  dokId: string;
  fil: File;
  onProgress?: (procent: number) => void;
}): Promise<MolnUppladdning> {
  const foreningId = hamtaAktivForeningId();
  if (!foreningId || foreningId === GRUNDMALL_FORENING_ID) {
    return { ok: false, fel: "Demoföreningen sparar bara lokalt.", lokalt: true };
  }
  if (opts.fil.size > MAX_MOLN_FIL_BYTE) {
    return {
      ok: false,
      fel: `Filen är för stor (max ${MAX_MOLN_FIL_BYTE / (1024 * 1024)} MB).`,
      lokalt: false,
    };
  }

  try {
    const koll = await fetch(filerUrl(foreningId), { headers: headers(foreningId) });
    if (koll.status === 503) {
      return { ok: false, fel: "Molnlagringen är inte konfigurerad.", lokalt: true };
    }
    if (!koll.ok) {
      const data = (await koll.json().catch(() => ({}))) as { fel?: string };
      return {
        ok: false,
        fel: data.fel ?? "Kunde inte nå föreningens fillagring.",
        lokalt: false,
      };
    }

    const pathname = `foreningar/${foreningId}/${opts.modul}/${opts.dokId}/${sakertFilnamn(opts.fil.name)}`;
    const blob = await upload(pathname, opts.fil, {
      access: "private",
      handleUploadUrl: filerUrl(foreningId),
      headers: headers(foreningId),
      contentType: opts.fil.type || undefined,
      multipart: opts.fil.size > 8 * 1024 * 1024,
      onUploadProgress: (e) => opts.onProgress?.(Math.round(e.percentage)),
    });
    return { ok: true, ref: { foreningId, pathname: blob.pathname } };
  } catch (e) {
    const meddelande = e instanceof Error ? e.message : "";
    return {
      ok: false,
      fel: /content type|contentType/i.test(meddelande)
        ? "Filtypen stöds inte. Ladda upp PDF, Word, Excel eller bild (JPG/PNG)."
        : "Uppladdningen misslyckades. Kontrollera uppkopplingen och försök igen.",
      lokalt: false,
    };
  }
}

/** Hämtar filen och ger en blob-URL; anroparen ansvarar för att släppa den. */
export async function hamtaForeningFilUrl(ref: MolnFilRef): Promise<string | null> {
  try {
    const res = await fetch(filerUrl(ref.foreningId, ref.pathname), {
      headers: headers(ref.foreningId),
    });
    if (!res.ok) return null;
    return URL.createObjectURL(await res.blob());
  } catch {
    return null;
  }
}

export async function taBortForeningFil(ref: MolnFilRef): Promise<void> {
  try {
    await fetch(filerUrl(ref.foreningId, ref.pathname), {
      method: "DELETE",
      headers: headers(ref.foreningId),
    });
  } catch {
    // Filen blir kvar i molnet men syns inte längre i listan.
  }
}

/** Öppnar en fil i ny flik; fliken öppnas direkt så att popup-spärren inte slår till. */
export async function oppnaFilIFlik(hamtaUrl: () => Promise<string | null>): Promise<boolean> {
  const flik = window.open("", "_blank");
  const url = await hamtaUrl();
  if (!url) {
    flik?.close();
    return false;
  }
  if (flik) flik.location.href = url;
  else window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return true;
}
