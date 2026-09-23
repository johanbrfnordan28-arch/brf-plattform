import { redirect } from "next/navigation";

/** Energi & drift är ersatt av Felanmälan. */
export default function EnergiRedirect() {
  redirect("/felanmalan");
}
