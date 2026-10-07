import Link from "next/link";
import { VILLKOR_VERSION_DATUM } from "@/lib/juridik";

type Props = {
  title: string;
  intro: string;
  children: React.ReactNode;
};

export function JuridiskSida({ title, intro, children }: Props) {
  return (
    <main>
      <section className="border-b border-border bg-surface/60">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-14">
          <Link
            href="/"
            className="text-sm font-medium text-primary-dark hover:underline"
          >
            ← Styrelse-Navet
          </Link>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-muted">{intro}</p>
          <p className="mt-3 text-xs text-muted">
            Gäller från {VILLKOR_VERSION_DATUM}
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6">
        {children}
      </section>
    </main>
  );
}

export function JuridiskLista({ punkter }: { punkter: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {punkter.map((p, i) => (
        <li key={i}>{p}</li>
      ))}
    </ul>
  );
}
