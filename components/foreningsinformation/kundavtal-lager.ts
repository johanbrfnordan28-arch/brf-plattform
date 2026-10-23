import { foreningStorageKey } from "@/lib/foreningStorage";
import { safeSetLocalStorage } from "@/lib/localStorage";

export type KundavtalStatus = "utkast" | "signerat";

export type SparatKundavtal = {
  foreningsNamn: string;
  text: string;
  status: KundavtalStatus;
  uppdaterad: string;
  undertecknare: { namn: string; epost: string }[];
};

const STORAGE_KEY_BASE = "brf-kundavtal";
export const KUNDAVTAL_EVENT = "brf-kundavtal-uppdaterat";

export function lasSparatKundavtal(): SparatKundavtal | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(foreningStorageKey(STORAGE_KEY_BASE));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SparatKundavtal>;
    if (!parsed || typeof parsed.text !== "string" || !parsed.text.trim()) {
      return null;
    }
    const undertecknare = Array.isArray(parsed.undertecknare)
      ? parsed.undertecknare
          .filter(
            (p): p is { namn: string; epost: string } =>
              Boolean(p) &&
              typeof p.namn === "string" &&
              typeof p.epost === "string",
          )
          .slice(0, 2)
      : [];
    return {
      foreningsNamn:
        typeof parsed.foreningsNamn === "string" && parsed.foreningsNamn.trim()
          ? parsed.foreningsNamn.trim()
          : "Föreningen",
      text: parsed.text,
      status: parsed.status === "signerat" ? "signerat" : "utkast",
      uppdaterad:
        typeof parsed.uppdaterad === "string" ? parsed.uppdaterad : "",
      undertecknare,
    };
  } catch {
    return null;
  }
}

/** Sparar kundavtalet på föreningen. Ett signerat avtal skrivs inte tillbaka till utkast. */
export function sparaKundavtal(input: Omit<SparatKundavtal, "uppdaterad">): void {
  if (typeof window === "undefined") return;
  const finns = lasSparatKundavtal();
  const status: KundavtalStatus =
    input.status === "signerat" || finns?.status === "signerat"
      ? "signerat"
      : "utkast";
  const avtal: SparatKundavtal = {
    foreningsNamn: input.foreningsNamn.trim() || "Föreningen",
    text: input.text,
    status,
    uppdaterad: new Date().toISOString(),
    undertecknare: input.undertecknare
      .map((p) => ({ namn: p.namn.trim(), epost: p.epost.trim() }))
      .filter((p) => p.epost.includes("@"))
      .slice(0, 2),
  };
  safeSetLocalStorage(
    foreningStorageKey(STORAGE_KEY_BASE),
    JSON.stringify(avtal),
  );
  window.dispatchEvent(new CustomEvent(KUNDAVTAL_EVENT));
}
