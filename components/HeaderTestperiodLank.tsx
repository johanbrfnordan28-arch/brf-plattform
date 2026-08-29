import Link from "next/link";
import { TEST_LOGIN_PATH } from "@/lib/forening-kund";

/**
 * Testperiod — gul ton som märket på skapade föreningar.
 * Visar aldrig antal sparade testföreningar.
 */
export function HeaderTestperiodLank() {
  return (
    <Link
      href={TEST_LOGIN_PATH}
      className="brf-knapp-amber hidden flex-col items-start px-3 py-1.5 text-left leading-tight sm:flex sm:items-center sm:text-center"
    >
      <span className="text-sm font-semibold">Testperiod</span>
      <span className="text-[11px] font-medium opacity-90">Sök er förening</span>
    </Link>
  );
}
