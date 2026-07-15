"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRF_NAVET_NAMN, STYRELSEFLOW_NAMN } from "@/lib/forening-konstanter";

export function ModuleBackLink() {
  const pathname = usePathname();
  const isForening = pathname.startsWith("/forening");

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <Link
        href={isForening ? "/forening" : "/"}
        className="brf-lank-gron text-sm"
      >
        {isForening ? `← Till ${STYRELSEFLOW_NAMN}` : `← Tillbaka till ${BRF_NAVET_NAMN}`}
      </Link>
      {isForening && (
        <Link href="/" className="text-sm font-medium text-muted hover:text-primary-dark">
          {BRF_NAVET_NAMN}s huvudsida
        </Link>
      )}
    </div>
  );
}
