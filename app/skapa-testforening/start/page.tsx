import { redirect } from "next/navigation";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";

/** Äldre ett-klicks-länk → formulärsidan (namn + bekräftelse). */
export default function SkapaTestForeningStartPage() {
  redirect(PROVA_GRATIS_PATH);
}
