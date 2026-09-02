"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ForeningVaxlare } from "@/components/forening/ForeningVaxlare";
import { useAktivForeningsNamn } from "@/components/forening/useAktivForeningsNamn";
import { arAktivKundForening } from "@/lib/forening-kund";
import { FORENING_AKTIV_EVENT, GRUNDMALL_NAMN } from "@/lib/forening-registry";

const nav = [
  { href: "/forening#moduler", label: "Moduler", aktivPa: (p: string) => p === "/forening" },
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
    href: "/forening/uppgifter",
    label: "Uppgifter",
    aktivPa: (p: string) => p.startsWith("/forening/uppgifter"),
  },
  {
    href: "/forening/konto",
    label: "Konto",
    aktivPa: (p: string) => p.startsWith("/forening/konto"),
  },
];

export function ForeningHeader() {
  const pathname = usePathname();
  const foreningsNamn = useAktivForeningsNamn();
  const [arKund, setArKund] = useState(false);
  const [loggarUt, setLoggarUt] = useState(false);
  const initial =
    foreningsNamn === GRUNDMALL_NAMN
      ? "G"
      : foreningsNamn.replace(/^brf\s+/i, "").charAt(0).toUpperCase() || "F";

  useEffect(() => {
    function ladda() {
      setArKund(arAktivKundForening());
    }
    ladda();
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
  }, []);

  async function loggaUt() {
    setLoggarUt(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* fortsätt till startsidan ändå */
    }
    window.location.href = "/";
  }

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
        <div className="flex flex-wrap items-center justify-end gap-2">
          <ForeningVaxlare />
          <span className="hidden rounded-full border border-primary/30 bg-[#e2f0e6] px-3 py-1 text-xs font-medium text-primary-dark lg:inline-flex">
            {arKund ? "Kund · er förening" : "Inloggad styrelse"}
          </span>
          <Link
            href="/forening/konto"
            className="hidden rounded-lg border border-primary/40 bg-[#eef6f0] px-3 py-2 text-sm font-medium text-primary-dark transition-colors hover:border-primary sm:inline-flex"
          >
            Byt lösenord
          </Link>
          <Link
            href="/"
            className="hidden rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-muted transition-colors hover:border-primary/50 hover:text-primary-dark lg:inline-flex"
          >
            Styrelse-Navet
          </Link>
          <button
            type="button"
            disabled={loggarUt}
            onClick={() => void loggaUt()}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-muted transition-colors hover:border-primary/50 hover:text-primary-dark disabled:opacity-50"
          >
            {loggarUt ? "Loggar ut…" : "Logga ut"}
          </button>
        </div>
      </div>
    </header>
  );
}
