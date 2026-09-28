import type { Metadata } from "next";
import Link from "next/link";
import { ModulePage } from "@/components/ModulePage";
import { MessanSkickaLankForm } from "@/components/styrelsemassa/MessanSkickaLankForm";
import { HUVUDSIDA_MASSA_QUERY } from "@/lib/massa-lank";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";

export const metadata: Metadata = {
  title: "Styrelsemässa — Styrelse-Navet",
  description:
    "Träffade oss på mässan? Titta på huvudsidan eller få en länk mejlad.",
  robots: { index: false, follow: false },
};

/** Styrelsemässa — kort URL (QR) som leder vidare till huvudsidan. */
export default function MassaPage() {
  return (
    <ModulePage
      title="Tack för att ni tittade förbi"
      icon="📬"
      intro="Träffade ni oss på styrelsemässan? Gå till huvudsidan och se hur Styrelse-Navet fungerar — eller be om en länk mejlad till er."
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={HUVUDSIDA_MASSA_QUERY}
          className="brf-knapp-gron inline-flex justify-center px-6 py-3 text-sm font-semibold"
        >
          Till huvudsidan
        </Link>
        <Link
          href={PROVA_GRATIS_PATH}
          className="brf-knapp-neutral inline-flex justify-center px-6 py-3 text-sm font-semibold"
        >
          Skapa testförening direkt
        </Link>
      </div>

      <div className="mt-10 border-t border-border pt-8">
        <h2 className="text-lg font-semibold text-foreground">
          Mejla länk till huvudsidan
        </h2>
        <p className="mt-1 text-sm text-muted">
          Vill ni fundera hemma? Vi skickar en länk så ni kan titta i lugn och
          ro.
        </p>
        <MessanSkickaLankForm />
      </div>
    </ModulePage>
  );
}
