import Link from "next/link";
import {
  KUND_LOGIN_KNAPP_RUBRIK,
  KUND_LOGIN_KNAPP_UNDERTEXT,
  KUND_LOGIN_PATH,
} from "@/lib/forening-kund";

/**
 * Kundinloggning — visar aldrig hur många föreningar som finns.
 */
export function HeaderKundLogin() {
  return (
    <Link
      href={KUND_LOGIN_PATH}
      className="brf-knapp-gron flex flex-col items-start px-4 py-1.5 text-left leading-tight sm:items-center sm:text-center"
    >
      <span className="text-sm font-semibold">{KUND_LOGIN_KNAPP_RUBRIK}</span>
      <span className="text-[11px] font-medium text-white/90">
        {KUND_LOGIN_KNAPP_UNDERTEXT}
      </span>
    </Link>
  );
}
