import type { Metadata } from "next";
import Link from "next/link";
import { ModulePage } from "@/components/ModulePage";
import { MessanSkickaLankForm } from "@/components/styrelsemassa/MessanSkickaLankForm";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";

export const metadata: Metadata = {
  title: "Mejla länk — Styrelse-Navet",
  description:
    "Få en länk mejlad så ni kan prova Styrelse-Navet i lugn och ro efter mässan.",
  robots: { index: false, follow: false },
};

/** Styrelsemässa — kort URL att visa som QR eller dela muntligt. */
export default function MassaPage() {
  return (
    <ModulePage
      title="Prova Styrelse-Navet"
      icon="📬"
      intro="Vill ni fundera hemma? Lämna föreningens namn och e-post — vi mejlar en länk så ni kan skapa er testförening när det passar."
    >
      <MessanSkickaLankForm />

      <p className="mt-8 text-center text-sm text-muted">
        Redo att börja direkt?{" "}
        <Link
          href={PROVA_GRATIS_PATH}
          className="font-medium text-primary-dark underline hover:no-underline"
        >
          Skapa testförening nu
        </Link>
      </p>
    </ModulePage>
  );
}
