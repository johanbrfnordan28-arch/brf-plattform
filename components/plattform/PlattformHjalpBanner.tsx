"use client";

import { usePathname } from "next/navigation";
import {
  PLATTFORM_STOD_EPOST,
  plattformStodMailto,
} from "@/lib/plattform-stod";

type Props = {
  className?: string;
  /** Kortare variant för sidhuvud/moduler. */
  kompakt?: boolean;
};

/**
 * Tydlig hjälpväg till Styrelse-Navet — synlig för ovan styrelse.
 */
export function PlattformHjalpBanner({
  className = "",
  kompakt = false,
}: Props) {
  const pathname = usePathname();
  const amne = pathname.startsWith("/forening/")
    ? `Styrelse-Navet — hjälp (${pathname.replace("/forening/", "")})`
    : undefined;

  if (kompakt) {
    return (
      <p
        className={`rounded-lg border border-primary/20 bg-[#eef6f0]/70 px-3 py-2 text-sm text-foreground ${className}`}
      >
        Behöver ni hjälp?{" "}
        <a
          href={plattformStodMailto(amne)}
          className="font-medium text-primary-dark underline hover:no-underline"
        >
          Mejla {PLATTFORM_STOD_EPOST}
        </a>
        {" — "}
        vi svarar och guidar er.
      </p>
    );
  }

  return (
    <aside
      className={`rounded-xl border border-primary/25 bg-[#eef6f0] px-4 py-3 sm:px-5 ${className}`}
      aria-label="Hjälp från Styrelse-Navet"
    >
      <p className="text-sm font-semibold text-primary-dark">
        Ny i plattformen?
      </p>
      <p className="mt-1 text-sm leading-relaxed text-foreground">
        Börja i en modul, spara löpande och öppna samma uppgift igen via
        menyn. Fastnar ni — hör av er så hjälper vi till.
      </p>
      <a
        href={plattformStodMailto(
          amne,
          "Hej!\n\nVi behöver hjälp med:\n\n",
        )}
        className="mt-2 inline-flex text-sm font-medium text-primary-dark underline hover:no-underline"
      >
        Mejla {PLATTFORM_STOD_EPOST}
      </a>
    </aside>
  );
}
