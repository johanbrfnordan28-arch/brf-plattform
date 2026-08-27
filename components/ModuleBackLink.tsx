"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHubbNamn } from "@/components/forening/useHubbNamn";

export function ModuleBackLink() {
  const pathname = usePathname();
  const isForening = pathname.startsWith("/forening");
  const hubbNamn = useHubbNamn();

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <Link
        href={isForening ? "/forening" : "/"}
        className="brf-lank-gron text-sm"
      >
        {isForening ? `← Till ${hubbNamn}` : "← Åter till Huvudsidan"}
      </Link>
      {isForening && (
        <Link href="/" className="text-sm font-medium text-muted hover:text-primary-dark">
          Åter till Huvudsidan
        </Link>
      )}
    </div>
  );
}
