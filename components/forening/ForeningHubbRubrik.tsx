"use client";

import { useHubbNamn } from "@/components/forening/useHubbNamn";

/** Hero-rubrik på föreningens förstasida (Styrelseflow / Brf Sailor). */
export function ForeningHubbRubrik() {
  const namn = useHubbNamn();
  return <>{namn}</>;
}
