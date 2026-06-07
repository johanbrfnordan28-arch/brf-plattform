import { redirect } from "next/navigation";

/** Tidigare offert-modul — ersatt av Guider & tips i föreningsportalen. */
export default function ForeningOffertRedirect() {
  redirect("/forening/guider");
}
