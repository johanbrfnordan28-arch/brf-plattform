"use client";

import type { ReactNode } from "react";

/** Gemensam accordion-struktur: komponent (+/−) → underkomponenter som kort. */

export function KomponentAccordionLista({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <ul className={`space-y-2 ${className}`.trim()}>{children}</ul>;
}

type KomponentAccordionRadProps = {
  namn: string;
  undertitel?: string;
  isOpen: boolean;
  onToggle: () => void;
  children?: ReactNode;
};

export function KomponentAccordionRad({
  namn,
  undertitel,
  isOpen,
  onToggle,
  children,
}: KomponentAccordionRadProps) {
  return (
    <li className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#eef6f0]/50"
        aria-expanded={isOpen}
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white"
          aria-hidden
        >
          {isOpen ? "−" : "+"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">{namn}</span>
          {undertitel && (
            <span className="mt-0.5 block text-xs text-muted">{undertitel}</span>
          )}
        </span>
      </button>
      {isOpen && children != null && (
        <div className="border-t border-border bg-[#fafcfa] px-3 py-3 sm:px-4">
          {children}
        </div>
      )}
    </li>
  );
}

export function UnderkomponentKortLista({ children }: { children: ReactNode }) {
  return <ul className="space-y-3">{children}</ul>;
}

type UnderkomponentKortProps = {
  etikett: string;
  hint?: string;
  sammanfattning?: string | null;
  aktiv?: boolean;
  onAktivChange?: (aktiv: boolean) => void;
  visaAktivVäxel?: boolean;
  headerAction?: ReactNode;
  taBortAction?: ReactNode;
  children?: ReactNode;
  inaktivMeddelande?: string;
};

export function UnderkomponentKort({
  etikett,
  hint,
  sammanfattning,
  aktiv = true,
  onAktivChange,
  visaAktivVäxel = true,
  headerAction,
  taBortAction,
  children,
  inaktivMeddelande = "Kryssa i Aktiv om underkomponenten ingår i föreningen.",
}: UnderkomponentKortProps) {
  const visaInnehåll = aktiv && children != null;

  return (
    <li className="rounded-lg border border-border bg-white p-3 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{etikett}</p>
          {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
          {sammanfattning && (
            <p className="mt-1 text-xs font-medium text-primary-dark line-clamp-2">
              {sammanfattning}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {headerAction}
          {visaAktivVäxel && onAktivChange && (
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-2.5 py-1 text-xs text-muted">
              <input
                type="checkbox"
                checked={aktiv}
                onChange={(e) => onAktivChange(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary"
              />
              Aktiv
            </label>
          )}
          {taBortAction}
        </div>
      </div>

      {visaInnehåll && (
        <div className="mt-3 space-y-3 border-t border-dashed border-border pt-3">
          {children}
        </div>
      )}

      {!aktiv && (
        <p className="mt-2 text-xs text-muted">{inaktivMeddelande}</p>
      )}
    </li>
  );
}
