/** Delad konstant — undvik cirkulära importer mellan registry och kopiera-grundmall. */
export const GRUNDMALL_FORENING_ID = "grundmall";

/** Fasta id för de fem standard-testföreningarna (inloggning). */
export const STANDARD_TESTFORENING_IDS = [
  "test-forening-1",
  "test-forening-2",
  "test-forening-3",
  "test-forening-4",
  "test-forening-5",
] as const;

export function arStandardTestForening(foreningId: string): boolean {
  return (STANDARD_TESTFORENING_IDS as readonly string[]).includes(foreningId);
}

/** Inloggad styrelses förstasida (/forening). */
export const STYRELSEFLOW_NAMN = "Styrelseflow";
