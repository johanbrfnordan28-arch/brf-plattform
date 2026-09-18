"use client";

import { Suspense } from "react";
import { MassaValkommenBanner } from "@/components/inbjudan/MassaValkommenBanner";

export function InbjudanHuvudsidaInnehall() {
  return (
    <Suspense fallback={null}>
      <MassaValkommenBanner />
    </Suspense>
  );
}
