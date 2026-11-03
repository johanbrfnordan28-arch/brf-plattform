"use client";

import { usePathname } from "next/navigation";
import { ForeningSakerhetskopiaFastBanner } from "@/components/forening/ForeningSakerhetskopiaFastBanner";

/** Visar säkerhetskopieringsbanner i alla /forening/-moduler. */
export function ForeningModulBackupBannerGate() {
  const pathname = usePathname();
  if (!pathname.startsWith("/forening/")) {
    return null;
  }
  return (
    <ForeningSakerhetskopiaFastBanner className="mb-6" />
  );
}
