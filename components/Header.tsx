import Link from "next/link";
import { PROVA_GRATIS_PATH } from "@/lib/skapa-testforening-lank";

const nav = [
  { href: "#fokus", label: "Underhåll & upphandling" },
  { href: "#intro-film", label: "Film & pris" },
  { href: "#priser", label: "Priser" },
  { href: "#moduler", label: "Moduler" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white"
            style={{ backgroundColor: "var(--primary)" }}
            aria-hidden
          >
            B
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            BRF Företag
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition-colors hover:text-primary-dark"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/testande-foreningar"
            className="hidden rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-muted transition-colors hover:border-primary/50 hover:text-primary-dark md:inline-flex"
          >
            Testande föreningar
          </Link>
          <Link
            href={PROVA_GRATIS_PATH}
            className="hidden rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-muted transition-colors hover:border-primary/50 hover:text-primary-dark sm:inline-flex"
          >
            Pröva gratis
          </Link>
          <Link
            href="/styrelse-login"
            className="brf-knapp-gron px-4 py-2 text-sm"
          >
            Logga in
          </Link>
        </div>
      </div>
    </header>
  );
}
