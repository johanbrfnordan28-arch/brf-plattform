import { redirect } from "next/navigation";

/** Prislistor är borttagna — priser läggs in manuellt i underhållsplanen. */
export default function ForeningPrislistorPage() {
  redirect("/forening/underhallsplan");
}
