/** Delad konstant — undvik cirkulära importer mellan registry och kopiera-grundmall. */
export const GRUNDMALL_FORENING_ID = "grundmall";

/** Fasta id för demoföreningarna vid inloggning (Nordan 28 + Sailor). */
export const STANDARD_TESTFORENING_IDS = [
  "test-forening-4",
  "test-forening-5",
] as const;

/** Tidigare fasta testföreningar som tas bort vid uppstart. */
export const AVVECKLADE_TESTFORENING_IDS = [
  "test-forening-1",
  "test-forening-2",
  "test-forening-3",
] as const;

export function arStandardTestForening(foreningId: string): boolean {
  return (STANDARD_TESTFORENING_IDS as readonly string[]).includes(foreningId);
}

/** Publik landningssida (/). */
export const BRF_NAVET_NAMN = "Styrelse-Navet";

/** Inloggad styrelses förstasida (/forening). */
export const STYRELSEFLOW_NAMN = "Styrelseflow";
