"use client";

export type OppnaStangStorlek = "sm" | "md" | "lg";

const STORLEK_KLASS: Record<OppnaStangStorlek, string> = {
  sm: "h-10 w-10 text-xl",
  md: "h-11 w-11 text-2xl",
  lg: "h-12 w-12 text-2xl",
};

export function oppnaStangKnappKlass(
  oppen: boolean,
  storlek: OppnaStangStorlek = "md",
  extra = "",
) {
  return [
    "inline-flex shrink-0 items-center justify-center rounded-lg font-bold leading-none shadow-sm transition-colors",
    STORLEK_KLASS[storlek],
    oppen
      ? "bg-red-600 text-white hover:bg-red-700"
      : "bg-primary text-white hover:bg-primary-dark",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

type OppnaStangKnappProps = {
  oppen: boolean;
  onClick: () => void;
  storlek?: OppnaStangStorlek;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
};

/** Fristående +/- knapp — grön + (öppna), röd − (stäng). */
export function OppnaStangKnapp({
  oppen,
  onClick,
  storlek = "md",
  ariaLabel,
  className = "",
  disabled = false,
}: OppnaStangKnappProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-expanded={oppen}
      aria-label={ariaLabel ?? (oppen ? "Stäng" : "Öppna")}
      className={`${oppnaStangKnappKlass(oppen, storlek, className)} disabled:cursor-not-allowed disabled:opacity-45`}
    >
      <span aria-hidden>{oppen ? "−" : "+"}</span>
    </button>
  );
}

type OppnaStangIkonProps = {
  oppen: boolean;
  storlek?: OppnaStangStorlek;
  className?: string;
};

/** Visuell +/- indikator (span) — t.ex. inuti en rad som redan är klickbar. */
export function OppnaStangIkon({
  oppen,
  storlek = "md",
  className = "",
}: OppnaStangIkonProps) {
  return (
    <span aria-hidden className={oppnaStangKnappKlass(oppen, storlek, className)}>
      {oppen ? "−" : "+"}
    </span>
  );
}
