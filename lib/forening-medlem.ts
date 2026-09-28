/** Publik medlemsyta — felanmälan utan styrelseinloggning. */
export const MEDLEM_FELANMALAN_PATH = "/medlem";

export function byggMedlemFelanmalanLank(foreningId: string): string {
  return `${MEDLEM_FELANMALAN_PATH}?foreningId=${encodeURIComponent(foreningId)}`;
}
