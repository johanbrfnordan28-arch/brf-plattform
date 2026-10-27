/** Gemensam avloppsinformation för takterrasser. */

export const takterrassAvloppMinstTvaInfo =
  "Planera minst två avlopp per terrass (golvbrunn och/eller breddavlopp) — risk för vattenskador om ett avlopp stoppar.";

export const takterrassAvloppSnöIsInfo =
  "Håll avloppen fria från snö, is och löv så att vattnet kan rinna av, särskilt vintertid.";

export const takterrassGolvbrunnBeskrivning =
  "Golvbrunn samlar vatten på terrassgolvet och leder det till avloppsstammen eller till stuprör.";

export const takterrassBreddavloppBeskrivning =
  "Breddavlopp leder vattnet ut genom väggen och vidare ut via fasaden.";

export type GolvbrunnKopplingId = "avloppsstam" | "stupror" | "";

export const golvbrunnKopplingAlternativ: {
  id: GolvbrunnKopplingId;
  etikett: string;
}[] = [
  { id: "", etikett: "— välj koppling —" },
  { id: "avloppsstam", etikett: "Till avloppsstam" },
  { id: "stupror", etikett: "Till stuprör" },
];

export function raknaTakterrassAvlopp(args: {
  golvbrunnAntal: string;
  breddavloppAntal: string;
}): number {
  const g = Number.parseInt(args.golvbrunnAntal, 10);
  const b = Number.parseInt(args.breddavloppAntal, 10);
  return (
    (Number.isFinite(g) && g > 0 ? g : 0) +
    (Number.isFinite(b) && b > 0 ? b : 0)
  );
}

export function takterrassHarTillrackligtAvlopp(args: {
  golvbrunnAntal: string;
  breddavloppAntal: string;
}): boolean {
  return raknaTakterrassAvlopp(args) >= 2;
}
