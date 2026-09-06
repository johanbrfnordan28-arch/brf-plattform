"use client";

/** Etikett ovanför hubb-rubriken — föreningsnamnet står i H1. */
export function ForeningHeroEtikett() {
  return (
    <p className="inline-flex rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-primary-dark">
      Inloggad · er föreningssida
    </p>
  );
}
