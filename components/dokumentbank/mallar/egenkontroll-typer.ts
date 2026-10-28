export type EgenkontrollBransch =
  | "vvs"
  | "el"
  | "malning"
  | "bygg"
  | "fasad"
  | "tak"
  | "badrum_stam";

export type EgenkontrollPunktMall = {
  rubrik: string;
  beskrivning: string;
  amaNot?: string;
  kravSpecifikPlats?: boolean;
};

export const EGENKONTROLL_BRANSCH_ETIKETTER: Record<EgenkontrollBransch, string> =
  {
    vvs: "VVS",
    el: "El",
    malning: "Målning",
    bygg: "Bygg",
    fasad: "Fasad",
    tak: "Tak",
    badrum_stam: "Badrum och stambyte",
  };

export const ALLA_EGENKONTROLL_BRANSCHER: EgenkontrollBransch[] = [
  "vvs",
  "el",
  "malning",
  "bygg",
  "fasad",
  "tak",
  "badrum_stam",
];

export function arGiltigEgenkontrollBransch(
  raw: unknown,
): raw is EgenkontrollBransch {
  return (
    typeof raw === "string" &&
    (ALLA_EGENKONTROLL_BRANSCHER as string[]).includes(raw)
  );
}
