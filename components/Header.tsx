import Link from "next/link";
import { HeaderMobilMeny } from "@/components/HeaderMobilMeny";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";
import { MEDLEM_FELANMALAN_PATH } from "@/lib/forening-medlem";
import { KUND_LOGIN_PATH } from "@/lib/forening-kund";

const nav = [
  { href: "#moduler", label: "Moduler" },
  { href: "/upphandling", label: "Upphandlingar" },
  { href: "#intro-film", label: "Film & pris" },
  { href: MEDLEM_FELANMALAN_PATH, label: "Medlem" },
];

const knappBas =
  "h-9 items-center whitespace-nowrap rounded-lg px-3.5 text-sm font-semibold";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-4 py-3.5 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 whitespace-nowrap">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white"
            style={{ backgroundColor: "var(--primary)" }}
            aria-hidden
          >
            B
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Styrelse-Navet
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted lg:flex">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="whitespace-nowrap transition-colors hover:text-primary-dark"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={MEDLEM_FELANMALAN_PATH}
            className={`${knappBas} hidden border border-border bg-white text-foreground hover:border-primary/50 sm:inline-flex`}
          >
            Felanmälan
          </Link>
          <Link
            href={KUND_LOGIN_PATH}
            className={`${knappBas} inline-flex border border-border bg-white text-foreground hover:border-primary/50`}
          >
            Logga in
          </Link>
          <Link
            href={PROVA_GRATIS_PATH}
            className={`${knappBas} hidden bg-primary text-white hover:bg-primary-dark sm:inline-flex`}
          >
            Pröva gratis
          </Link>
          <HeaderMobilMeny
            lankar={[...nav, { href: PROVA_GRATIS_PATH, label: "Pröva gratis 30 dagar" }]}
          />
        </div>
      </div>
    </header>
  );
}
