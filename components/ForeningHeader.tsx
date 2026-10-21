"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LoggaUtKnapp } from "@/components/auth/LoggaUtKnapp";
import { useAktivForeningsNamn } from "@/components/forening/useAktivForeningsNamn";
import { arInloggadPaEgenForening } from "@/lib/forening-behorighet-klient";
import {
  arAktivKundForening,
  KUND_LOGIN_PATH,
  TECKNA_AVTAL_PATH,
  TEST_LOGIN_PATH,
} from "@/lib/forening-kund";
import { arEgenTestForening } from "@/lib/forening-inloggning";
import { dagarKvarAvProvoperiod } from "@/lib/forening-avtal";
import {
  FORENING_AKTIV_EVENT,
  GRUNDMALL_NAMN,
  lasAktivForeningId,
  lasForeningProfil,
} from "@/lib/forening-registry";

const nav = [
  {
    href: "/forening#moduler",
    label: "Moduler",
    aktivPa: (p: string) => p === "/forening",
  },
  {
    href: "/forening/entreprenorer",
    label: "Entreprenörer",
    aktivPa: (p: string) => p.startsWith("/forening/entreprenorer"),
  },
  {
    href: "/forening/guider",
    label: "Guider",
    aktivPa: (p: string) => p.startsWith("/forening/guider"),
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

function testperiodEtikett(dagarKvar: number | null): string {
  if (dagarKvar == null) return "Testperiod";
  if (dagarKvar <= 0) return "0 dagar kvar";
  if (dagarKvar === 1) return "1 dag kvar";
  return `${dagarKvar} dagar kvar`;
}

export function ForeningHeader() {
  const pathname = usePathname();
  const foreningsNamn = useAktivForeningsNamn();
  const [arKund, setArKund] = useState(false);
  const [inloggad, setInloggad] = useState(false);
  const [visaTecknaAvtal, setVisaTecknaAvtal] = useState(false);
  const [dagarKvar, setDagarKvar] = useState<number | null>(null);
  const visatNamn = foreningsNamn.trim() || "Föreningsportal";
  const initial =
    visatNamn === GRUNDMALL_NAMN
      ? "G"
      : visatNamn.replace(/^brf\s+/i, "").charAt(0).toUpperCase() || "F";

  useEffect(() => {
    function ladda() {
      const id = lasAktivForeningId();
      const kund = arAktivKundForening();
      const profil = lasForeningProfil(id);
      setArKund(kund);
      setInloggad(arInloggadPaEgenForening());
      setVisaTecknaAvtal(arEgenTestForening(id) && !kund);
      setDagarKvar(
        !kund && profil
          ? dagarKvarAvProvoperiod(profil.skapadTidpunkt)
          : null,
      );
    }
    ladda();
    window.addEventListener(FORENING_AKTIV_EVENT, ladda);
    return () => window.removeEventListener(FORENING_AKTIV_EVENT, ladda);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link href="/forening" className="flex min-w-0 shrink-0 items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white"
            aria-hidden
          >
            {initial}
          </span>
          <span className="max-w-[10rem] truncate text-lg font-semibold tracking-tight text-foreground sm:max-w-[16rem]">
            {visatNamn}
          </span>
        </Link>
        <nav
          className="flex min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm font-medium text-muted sm:gap-x-4"
          aria-label="Föreningsmeny"
        >
          {nav.map((item) => {
            const aktiv = item.aktivPa(pathname);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                  aktiv
                    ? "border-primary bg-[#eef6f0] text-primary-dark"
                    : "border-primary/45 bg-white text-primary-dark hover:border-primary hover:bg-[#eef6f0]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {visaTecknaAvtal && (
            <Link
              href={TECKNA_AVTAL_PATH}
              className="brf-knapp-gron px-3 py-2 text-sm"
            >
              Teckna avtal
            </Link>
          )}
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
              arKund
                ? "border-primary/30 bg-[#e2f0e6] text-primary-dark"
                : "border-amber-300 bg-amber-50 text-amber-950"
            }`}
          >
            {arKund ? "Kund" : testperiodEtikett(dagarKvar)}
          </span>
          {inloggad ? (
            <LoggaUtKnapp />
          ) : (
            <Link
              href={arKund ? KUND_LOGIN_PATH : TEST_LOGIN_PATH}
              className="inline-flex h-9 items-center whitespace-nowrap rounded-lg bg-primary px-3.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              {arKund ? "Logga in" : "Logga in på testförening"}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
