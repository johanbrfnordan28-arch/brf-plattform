"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAktivForeningsNamn } from "@/components/forening/useAktivForeningsNamn";
import { useStyrelseKontakt } from "@/components/forening/useStyrelseKontakt";
import { BRF_NAVET_NAMN } from "@/lib/forening-konstanter";

export function Footer() {
  const pathname = usePathname();
  const isForening = pathname.startsWith("/forening");
  const foreningsNamn = useAktivForeningsNamn();
  const kontakt = useStyrelseKontakt();
  const brand = isForening ? foreningsNamn : BRF_NAVET_NAMN;

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-foreground">{brand}</p>
            <p className="mt-1 max-w-md text-sm text-muted">
              {isForening
                ? "Er förenings sida — kopierad grundmall som anpassas med dokument, moduler och historik."
                : "Grundmall för styrelser — upphandling, underhåll, offert och mer på ett ställe."}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2">
            {isForening && kontakt?.epost ? (
              <p className="text-sm text-muted">
                Styrelse:{" "}
                <a
                  href={`mailto:${kontakt.epost}`}
                  className="font-medium text-primary-dark underline hover:no-underline"
                >
                  {kontakt.epost}
                </a>
                {kontakt.kontaktperson ? ` (${kontakt.kontaktperson})` : ""}
              </p>
            ) : !isForening ? (
              <p className="text-sm text-muted">
                Prototyp — integritet, villkor och kontakt kommer i produktversion.
              </p>
            ) : null}
            {isForening && (
              <Link
                href="/"
                className="text-sm font-medium text-primary-dark hover:underline"
              >
                {BRF_NAVET_NAMN}s huvudsida
              </Link>
            )}
          </div>
        </div>
        <p className="mt-8 text-xs text-muted">
          © {new Date().getFullYear()} {brand} — demoversion
        </p>
      </div>
    </footer>
  );
}
