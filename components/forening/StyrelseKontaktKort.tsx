"use client";

import Link from "next/link";
import {
  arStyrelseKontaktKomplett,
  type StyrelseKontakt,
} from "@/lib/styrelse-kontakt";
import { useStyrelseKontakt } from "@/components/forening/useStyrelseKontakt";

type Props = {
  kontakt?: StyrelseKontakt | null;
  kompakt?: boolean;
  className?: string;
};

function KontaktRad({
  etikett,
  varde,
  href,
}: {
  etikett: string;
  varde: string;
  href?: string;
}) {
  if (!varde) return null;
  return (
    <p className="text-sm text-foreground">
      <span className="text-muted">{etikett}: </span>
      {href ? (
        <a href={href} className="font-medium text-primary-dark underline hover:no-underline">
          {varde}
        </a>
      ) : (
        <span className="font-medium">{varde}</span>
      )}
    </p>
  );
}

export function StyrelseKontaktKort({
  kontakt: kontaktProp,
  kompakt = false,
  className = "",
}: Props) {
  const franHook = useStyrelseKontakt();
  const kontakt = kontaktProp ?? franHook;

  if (!kontakt) return null;

  const komplett = arStyrelseKontaktKomplett(kontakt);

  if (kompakt && komplett) {
    return (
      <div
        className={`flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border bg-[#eef6f0]/60 px-3 py-2 text-sm ${className}`}
      >
        <span className="font-medium text-foreground">{kontakt.foreningsnamn}</span>
        {kontakt.kontaktperson && (
          <span className="text-muted">{kontakt.kontaktperson}</span>
        )}
        {kontakt.epost && (
          <a
            href={`mailto:${kontakt.epost}`}
            className="font-medium text-primary-dark underline hover:no-underline"
          >
            {kontakt.epost}
          </a>
        )}
        <Link
          href="/forening/uppgifter"
          className="text-xs text-muted underline hover:text-foreground"
        >
          Redigera
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border ${
        komplett ? "border-primary/30 bg-[#eef6f0]/80" : "border-amber-200 bg-amber-50/90"
      } p-4 sm:p-5 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
            Styrelsens kontakt
          </p>
          <p className="mt-1 text-base font-semibold text-foreground">
            {kontakt.foreningsnamn || "Er förening"}
          </p>
        </div>
        <Link
          href="/forening/uppgifter"
          className="rounded-lg border border-primary/40 bg-white px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
        >
          {komplett ? "Uppdatera" : "Fyll i uppgifter"}
        </Link>
      </div>

      {!komplett && (
        <p className="mt-3 text-sm text-amber-950">
          Lägg in kontaktuppgifter så de syns i dokument, städschema, egenkontroller
          och upphandlingsunderlag.
        </p>
      )}

      <div className={`mt-3 space-y-1 ${kompakt ? "hidden sm:block" : ""}`}>
        <KontaktRad etikett="Org.nr" varde={kontakt.organisationsnummer} />
        <KontaktRad
          etikett="Adress"
          varde={[kontakt.postadress, kontakt.ort].filter(Boolean).join(", ")}
        />
        <KontaktRad etikett="Kontaktperson" varde={kontakt.kontaktperson} />
        <KontaktRad
          etikett="E-post"
          varde={kontakt.epost}
          href={kontakt.epost ? `mailto:${kontakt.epost}` : undefined}
        />
      </div>
    </div>
  );
}
