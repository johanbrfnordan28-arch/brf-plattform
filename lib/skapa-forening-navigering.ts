import {
  markeraPendingAktivForening,
  type ForeningProfil,
} from "@/lib/forening-registry";

/** Bygger URL till nyss skapad förening — namn i URL så sidan fungerar även utan localStorage. */
export function byggNyForeningUrl(foreningId: string, namn: string): string {
  const params = new URLSearchParams({
    ny: "1",
    foreningId,
    namn,
  });
  return `/forening?${params.toString()}`;
}

/** Lätt aktiveringssida före huvudsidan — Safari hinner spara mellan sidor. */
export function byggAktiveraForeningUrl(foreningId: string, namn: string): string {
  const params = new URLSearchParams({ foreningId, namn });
  return `/forening/aktivera?${params.toString()}`;
}

/** Full sidladdning via aktivera-sidan (därefter /forening med ny=1). */
export function navigeraTillNyForening(profil: ForeningProfil): void {
  if (typeof window === "undefined") return;
  markeraPendingAktivForening(profil.id);
  const url = byggAktiveraForeningUrl(profil.id, profil.namn);
  window.location.assign(url);
}

/** Tar bort tekniska query-parametrar efter lyckad aktivering (ren adressrad). */
export function rensaSkapaParametrarFranUrl(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  if (
    !params.has("ny") &&
    !params.has("foreningId") &&
    !params.has("namn")
  ) {
    return;
  }
  window.history.replaceState(null, "", window.location.pathname);
}
