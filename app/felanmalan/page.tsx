import { redirect } from "next/navigation";

/** Informations-sida flyttad till medlemsportalen. */
export default function FelanmalanRedirect() {
  redirect("/medlem");
}
