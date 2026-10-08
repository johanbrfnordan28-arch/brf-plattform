"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HEADER_NAV } from "@/lib/header-nav";
import { MEDLEM_FELANMALAN_PATH } from "@/lib/forening-medlem";
import { KUND_LOGIN_PATH, TEST_LOGIN_PATH } from "@/lib/forening-kund";

export function HeaderMobilMeny() {
  const [oppen, setOppen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOppen(false);
  }, [pathname]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOppen((v) => !v)}
        aria-expanded={oppen}
        aria-controls="mobilmeny"
        aria-label={oppen ? "Stäng meny" : "Öppna meny"}
        className="flex h-10 w-10 items-center justify-center rounded-[9px] border border-border bg-white text-foreground"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          {oppen ? (
            <path d="M6 6l12 12M18 6 6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {oppen ? (
        <div
          id="mobilmeny"
          className="absolute inset-x-0 top-full border-b border-border bg-surface shadow-lg"
        >
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-3 sm:px-6">
            {HEADER_NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOppen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-[#eef6f0]"
              >
                {item.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-border" />
            <Link
              href={KUND_LOGIN_PATH}
              onClick={() => setOppen(false)}
              className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-[#eef6f0]"
            >
              Logga in (styrelse)
            </Link>
            <Link
              href={TEST_LOGIN_PATH}
              onClick={() => setOppen(false)}
              className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-[#eef6f0]"
            >
              Testförening: sök er förening
            </Link>
            <Link
              href={MEDLEM_FELANMALAN_PATH}
              onClick={() => setOppen(false)}
              className="rounded-lg px-3 py-3 text-base font-medium text-primary-dark hover:bg-[#eef6f0]"
            >
              Boende: gör en felanmälan →
            </Link>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
