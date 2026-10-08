import Link from "next/link";
import { HeaderMobilMeny } from "@/components/HeaderMobilMeny";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";
import { MEDLEM_FELANMALAN_PATH } from "@/lib/forening-medlem";
import { KUND_LOGIN_PATH, TEST_LOGIN_PATH } from "@/lib/forening-kund";
import { KONTAKT_EPOST } from "@/lib/kontakt-epost";
import { HEADER_NAV } from "@/lib/header-nav";

export function Header() {
  return (
    <>
      <div className="bg-foreground text-[13px] text-[#e7f1ea]">
        <div className="mx-auto flex h-9 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href={MEDLEM_FELANMALAN_PATH}
            className="truncate opacity-90 transition-opacity hover:opacity-100"
          >
            <span className="hidden sm:inline">
              Bor du i en förening som använder Styrelse-Navet?{" "}
            </span>
            <span className="font-semibold text-white">
              Gör en felanmälan →
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-5">
            <Link
              href={TEST_LOGIN_PATH}
              className="opacity-90 transition-opacity hover:opacity-100"
            >
              <span className="hidden sm:inline">Testförening: </span>sök er
              förening
            </Link>
            <a
              href={`mailto:${KONTAKT_EPOST.info}`}
              className="hidden opacity-90 transition-opacity hover:opacity-100 sm:inline"
            >
              Kontakt
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center gap-10 px-4 sm:px-6">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 whitespace-nowrap"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-primary"
              aria-hidden
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 11.5 12 4l9 7.5" />
                <path d="M5.5 10v9.5h13V10" />
                <circle cx="12" cy="14.5" r="2" />
              </svg>
            </span>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Styrelse-Navet
            </span>
          </Link>

          <nav className="hidden flex-1 items-center gap-7 whitespace-nowrap text-[14.5px] font-medium text-muted lg:flex">
            {HEADER_NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="transition-colors hover:text-primary-dark"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2.5">
            <Link
              href={KUND_LOGIN_PATH}
              className="hidden whitespace-nowrap rounded-[9px] border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 sm:inline-flex"
            >
              Logga in
            </Link>
            <Link
              href={PROVA_GRATIS_PATH}
              className="inline-flex whitespace-nowrap rounded-[9px] bg-primary-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-foreground"
            >
              <span className="sm:hidden">Prova gratis</span>
              <span className="hidden sm:inline">Prova gratis i 30 dagar</span>
            </Link>
            <HeaderMobilMeny />
          </div>
        </div>
      </header>
    </>
  );
}
