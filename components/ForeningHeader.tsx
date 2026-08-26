"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ForeningVaxlare } from "@/components/forening/ForeningVaxlare";
import { useAktivForeningsNamn } from "@/components/forening/useAktivForeningsNamn";
import { GRUNDMALL_NAMN } from "@/lib/forening-registry";
import { rensaInloggningsSession } from "@/lib/kund-inloggning";

const nav = [
  { href: "/forening#moduler", label: "Moduler", aktivPa: (p: string) => p === "/forening" },
  {
    href: "/forening/underhallsplan",
    label: "Underhåll",
    aktivPa: (p: string) => p.startsWith("/forening/underhallsplan"),
  },
  {
    href: "/forening/upphandling",
    label: "Upphandling",
    aktivPa: (p: string) => p.startsWith("/forening/upphandling"),
  },
  {
    href: "/forening/rondering#manadssignering-schema",
    label: "Rondering",
    aktivPa: (p: string) => p.startsWith("/forening/rondering"),
  },
  {
    href: "/forening/arshjul",
    label: "Årshjul",
    aktivPa: (p: string) => p.startsWith("/forening/arshjul"),
  },
  {
    href: "/forening/medlemmar",
    label: "Medlemmar",
    aktivPa: (p: string) => p.startsWith("/forening/medlemmar"),
  },
  {
    href: "/forening/dokumentbank",
    label: "Dokument",
    aktivPa: (p: string) => p.startsWith("/forening/dokumentbank"),
  },
  {
    href: "/forening/entreprenorer",
    label: "Entreprenörer",
    aktivPa: (p: string) => p.startsWith("/forening/entreprenorer"),
  },
  {
    href: "/forening/fastighets-skador",
    label: "Fastighetsskador",
    aktivPa: (p: string) => p.startsWith("/forening/fastighets-skador"),
  },
  {
    href: "/forening/kommunikation",
    label: "Kommunikation",
    aktivPa: (p: string) => p.startsWith("/forening/kommunikation"),
  },
  {
    href: "/forening/uppgifter",
    label: "Uppgifter",
    aktivPa: (p: string) => p.startsWith("/forening/uppgifter"),
  },
];

export function ForeningHeader() {
  const pathname = usePathname();
  const foreningsNamn = useAktivForeningsNamn();
  const initial =
    foreningsNamn === GRUNDMALL_NAMN
      ? "G"
      : foreningsNamn.replace(/^brf\s+/i, "").charAt(0).toUpperCase() || "F";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/forening" className="flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white"
            aria-hidden
          >
            {initial}
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            {foreningsNamn}
          </span>
        </Link>
        <nav
          className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm font-medium text-muted sm:gap-6"
          aria-label="Föreningsmeny"
        >
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`transition-colors hover:text-primary-dark ${
                item.aktivPa(pathname)
                  ? "font-semibold text-primary-dark"
                  : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ForeningVaxlare />
          <Link
            href="/styrelse-login"
            onClick={() => rensaInloggningsSession()}
            className="hidden rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-muted transition-colors hover:border-primary/50 hover:text-primary-dark sm:inline-flex"
            title="Logga ut"
          >
            Logga ut
          </Link>
        </div>
      </div>
    </header>
  );
}
