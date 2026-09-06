import Link from "next/link";
import { PLATTFORM_LOGIN_PATH } from "@/lib/auth/projekt-admin";

/**
 * Diskret personalinloggning längst ner på den publika startsidan.
 * Själva plattformsytan kräver behörigt konto.
 */
export function PersonalInloggningFot() {
  return (
    <section
      id="personal"
      className="scroll-mt-24 border-t border-border bg-[#f4f6f5]"
      aria-label="Personalinloggning"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Personal · Styrelse-Navet
          </p>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Inloggning för oss som arbetar med sidan. Översikten över föreningar
            är inte publik — endast behöriga personer kan logga in.
          </p>
        </div>
        <Link
          href={PLATTFORM_LOGIN_PATH}
          className="inline-flex shrink-0 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-[#eef6f0]"
        >
          Logga in som personal
        </Link>
      </div>
    </section>
  );
}
