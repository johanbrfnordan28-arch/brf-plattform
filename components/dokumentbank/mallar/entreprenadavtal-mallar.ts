export type EntreprenadAvtalForm = "ABT-06" | "AB04" | "ABK-09";

export const ENTREPRENAD_AVTAL_MALL_ID: Record<EntreprenadAvtalForm, string> = {
  "ABT-06": "entreprenad-abt-06",
  AB04: "entreprenad-ab-04",
  "ABK-09": "entreprenad-abk-09",
};

export function arEntreprenadAvtalMallId(mallId: string): boolean {
  return Object.values(ENTREPRENAD_AVTAL_MALL_ID).includes(mallId);
}

export function hamtaAvtalFormForMall(mallId: string): EntreprenadAvtalForm | undefined {
  const entry = Object.entries(ENTREPRENAD_AVTAL_MALL_ID).find(
    ([, id]) => id === mallId,
  );
  return entry ? (entry[0] as EntreprenadAvtalForm) : undefined;
}
