"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Lank = { href: string; label: string };

export function HeaderMobilMeny({ lankar }: { lankar: Lank[] }) {
  const [oppen, setOppen] = useState(false);
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOppen(false);
  }, [pathname]);

  useEffect(() => {
    if (!oppen) return;
    const stang = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) {
        setOppen(false);
      }
    };
    document.addEventListener("mousedown", stang);
    document.addEventListener("keydown", stang);
    return () => {
      document.removeEventListener("mousedown", stang);
      document.removeEventListener("keydown", stang);
    };
  }, [oppen]);

  return (
    <div ref={ref} className="relative lg:hidden">
      <button
        type="button"
        aria-label={oppen ? "Stäng menyn" : "Öppna menyn"}
        aria-expanded={oppen}
        aria-controls="header-mobilmeny"
        onClick={() => setOppen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-foreground hover:border-primary/50"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          {oppen ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>
      {oppen ? (
        <nav
          id="header-mobilmeny"
          className="absolute right-0 top-11 z-50 w-56 rounded-xl border border-border bg-white p-2 shadow-lg"
        >
          {lankar.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setOppen(false)}
              className="block whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[#e2f0e6]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
