import { redirect } from "next/navigation";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";

/** Äldre länk → samma sida som /prova-gratis */
export default function SkapaTestForeningPage() {
  redirect(PROVA_GRATIS_PATH);
}
