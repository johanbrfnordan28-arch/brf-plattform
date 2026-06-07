/** Krav vid VVS-arbeten i samband med lägenhetsrenovering. */
export const vvsRenoveringChecklistaPunkter: { id: string; text: string }[] = [
  {
    id: "vvs-saker-vatten",
    text: "Säker Vatten branschregler ska följas vid all VVS-installation.",
  },
  {
    id: "vvs-avlopp-fall",
    text: "Ljudklassade avloppsrör ska användas. Fall ska dokumenteras med uppladdade bilder.",
  },
  {
    id: "vvs-provtryck",
    text: "Vattenledningar ska vara provtryckta — protokoll ska kunna uppvisas.",
  },
  {
    id: "vvs-isolering",
    text: "Inbyggda rör ska vara isolerade enligt gällande krav.",
  },
  {
    id: "vvs-material",
    text: "Allt monterat material ska vara avsett för och godkänt för användning i Sverige. Materialets egenskaper ska vara dokumenterade utifrån avsedd användning.",
  },
];

export const vvsRenoveringEgenkontrollPunkter = [
  {
    id: "vvs-saker-vatten",
    text: "Säker Vatten branschregler är följda — installation och dokumentation kontrollerad.",
  },
  {
    id: "vvs-avlopp-fall",
    text: "Ljudklassade avloppsrör monterade; fall dokumenterat med bilder.",
  },
  {
    id: "vvs-provtryck-isolering",
    text: "Vattenledningar provtryckta och inbyggda rör isolerade enligt krav.",
  },
  {
    id: "vvs-material",
    text: "Monterat material är godkänt för Sverige med dokumenterade egenskaper för avsedd användning.",
  },
] as const;

export const vvsForvantadeHandlingar = [
  "Säker Vatten — installationsintyg / egenkontroll",
  "Provtrycksprotokoll vattenledningar",
  "Produktintyg och DoP (deklaration av prestanda)",
];

export const vvsForvantadeOvrigt = [
  "Bilder — dokumenterat fall på avlopp",
];

export const vvsRenoveringMallIds = ["badrum", "kok", "flytt-kok-badrum"] as const;

export function arVvsRenoveringsMall(mallId: string): boolean {
  return (vvsRenoveringMallIds as readonly string[]).includes(mallId);
}
