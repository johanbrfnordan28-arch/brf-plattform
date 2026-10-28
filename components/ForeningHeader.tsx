"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LoggaUtKnapp } from "@/components/auth/LoggaUtKnapp";
import { useAktivForeningsNamn } from "@/components/forening/useAktivForeningsNamn";
import { arInloggadIMenyn } from "@/lib/forening-behorighet-klient";
import {
  arAktivKundForening,
  KUND_LOGIN_PATH,
  TECKNA_AVTAL_PATH,
  TEST_LOGIN_PATH,
} from "@/lib/forening-kund";
import { arEgenTestForening } from "@/lib/forening-inloggning";
import { dagarKvarAvProvoperiod } from "@/lib/forening-avtal";
import { FORENING_MODULER } from "@/lib/forening-moduler";
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
    href: "/forening/dokumentbank",
    label: "Dokumentbank",
    aktivPa: (p: string) => p.startsWith("/forening/dokumentbank"),
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

const navKnapp =
  "rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors";
const navAktiv =
  "border-primary bg-primary text-white shadow-[0_0_0_3px_rgba(90,154,110,0.35)]";
const navVilande =
  "border-transparent bg-white/70 text-muted hover:border-primary/40 hover:bg-[#eef6f0] hover:text-primary-dark";

/** Modul som inte redan finns som egen menyknapp. */
function arbetsModul(pathname: string) {
  const traff = FORENING_MODULER.find((modul) => {
    const full = `/forening${modul.path}`;
    return pathname === full || pathname.startsWith(`${full}/`);
  });
  if (!traff || traff.visaPaHubb === false || traff.id === "guider") return null;
  return traff;
}

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
  const aktivModul = arbetsModul(pathname);
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
      void arInloggadIMenyn().then(setInloggad);
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
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex items-center justify-between gap-4 py-3">
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
              className="inline-flex h-9 items-center whitespace-nowrap rounded-lg border border-primary/45 bg-white px-3.5 text-sm font-semibold text-primary-dark hover:border-primary hover:bg-[#eef6f0]"
            >
              {arKund ? "Logga in" : "Pröva på förening"}
            </Link>
          )}
        </div>
      </div>
      <nav
        className="flex flex-wrap items-center gap-2 pb-3"
        aria-label="Föreningsmeny"
      >
        {nav.map((item) => {
          const aktiv = item.aktivPa(pathname);
          return (
            <span key={item.label} className="contents">
              <Link
                href={item.href}
                aria-current={aktiv ? "page" : undefined}
                className={`${navKnapp} ${aktiv ? navAktiv : navVilande}`}
                style={
                  aktiv
                    ? {
                        backgroundColor: "var(--primary)",
                        color: "#fff",
                        boxShadow: "0 0 0 3px rgba(90, 154, 110, 0.35)",
                      }
                    : undefined
                }
              >
                {item.label}
              </Link>
              {item.label === "Moduler" && aktivModul ? (
                <Link
                  href={`/forening${aktivModul.path}`}
                  aria-current="page"
                  className={`${navKnapp} ${navAktiv}`}
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "#fff",
                    boxShadow: "0 0 0 3px rgba(90, 154, 110, 0.35)",
                  }}
                >
                  {aktivModul.title}
                </Link>
              ) : null}
            </span>
          );
        })}
      </nav>
      </div>
    </header>
  );
}
