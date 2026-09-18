"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type PublikaTexter = {
  massaNamn: string;
  massaHuvudsidaRubrik: string;
  massaHuvudsidaIntro: string;
};

export function MassaValkommenBanner() {
  const searchParams = useSearchParams();
  const kalla = searchParams.get("kalla");
  const [texter, setTexter] = useState<PublikaTexter | null>(null);

  const visaBanner = kalla === "massa" || kalla === "inbjudan";

  useEffect(() => {
    if (!visaBanner) return;
    void fetch("/api/inbjudan/texter")
      .then((r) => r.json())
      .then((data: PublikaTexter) => setTexter(data))
      .catch(() => null);
  }, [visaBanner]);

  if (!visaBanner) return null;

  const rubrik =
    kalla === "inbjudan"
      ? "Välkommen — titta gärna runt"
      : texter?.massaHuvudsidaRubrik ?? "Välkommen från styrelsemässan";

  const intro =
    kalla === "inbjudan"
      ? "Här kan ni se hur Styrelse-Navet fungerar och prova gratis i 30 dagar när ni vill."
      : texter?.massaHuvudsidaIntro ??
        "Tack för att ni tittade förbi. Här kan ni bedöma om plattformen passar er förening.";

  return (
    <section
      className="border-b border-primary/25 bg-[#eef6f0]"
      aria-label="Välkommen"
    >
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
          {kalla === "massa" && texter?.massaNamn
            ? texter.massaNamn
            : "Styrelse-Navet"}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          {rubrik}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          {intro}
        </p>
      </div>
    </section>
  );
}
