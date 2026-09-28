import { redirect } from "next/navigation";

/** Energi & drift är ersatt av Felanmälan. */
export default function ForeningEnergiRedirect() {
  redirect("/forening/felanmalan");
}
