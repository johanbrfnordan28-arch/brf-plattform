"use client";

import { useState, type ReactNode } from "react";
import { OppnaStangKnapp } from "@/components/OppnaStangKnapp";

type OppnaStangSektionProps = {
  id?: string;
  titel: string;
  intro: string;
  children: ReactNode;
  defaultOppen?: boolean;
};

/** Rubrik med grönt + och rött − så ett avsnitt kan fällas ihop. */
export function OppnaStangSektion({
  id,
  titel,
  intro,
  children,
  defaultOppen = false,
}: OppnaStangSektionProps) {
  const [oppen, setOppen] = useState(defaultOppen);

  return (
    <section id={id} className="scroll-mt-24">
      <article className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-foreground">{titel}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{intro}</p>
          </div>
          <OppnaStangKnapp
            oppen={oppen}
            onClick={() => setOppen((current) => !current)}
            ariaLabel={oppen ? `Stäng ${titel}` : `Öppna ${titel}`}
          />
        </div>
        {oppen && <div className="mt-8">{children}</div>}
      </article>
    </section>
  );
}
