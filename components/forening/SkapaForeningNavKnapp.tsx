"use client";

import { usePathname } from "next/navigation";

type Props = {
  children: React.ReactNode;
  className?: string;
};

function fokuseraSkapaFormular() {
  const sektion = document.getElementById("skapa-forening");
  sektion?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => {
    document.getElementById("skapa-forening-namn")?.focus();
  }, 450);
}

/** Primär CTA — scrollar till skapa-formuläret på startsidan. */
export function SkapaForeningNavKnapp({ children, className }: Props) {
  const pathname = usePathname();

  function gaTillSkapa() {
    if (pathname !== "/") {
      window.location.href = "/prova-gratis";
      return;
    }
    fokuseraSkapaFormular();
  }

  return (
    <button type="button" onClick={gaTillSkapa} className={className}>
      {children}
    </button>
  );
}
