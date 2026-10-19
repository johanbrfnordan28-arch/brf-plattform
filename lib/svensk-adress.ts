/** Svenskt adressblock: gatadress på egen rad, postnummer och ort på nästa. */

export type SvenskAdress = {
  gata?: string;
  /** Flera gatadresser (fastigheter) — var och en på egen rad. */
  gator?: string[];
  postnummer?: string;
  ort?: string;
};

export function svenskAdressRader(adress: SvenskAdress): string[] {
  const gator = (adress.gator?.length ? adress.gator : [adress.gata ?? ""])
    .map((g) => g.trim())
    .filter(Boolean);
  const postOrt = [adress.postnummer?.trim(), adress.ort?.trim()]
    .filter(Boolean)
    .join(" ");
  return [...gator, ...(postOrt ? [postOrt] : [])];
}
