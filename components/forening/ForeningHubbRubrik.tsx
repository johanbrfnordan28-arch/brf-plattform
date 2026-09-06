"use client";

import { useHubbNamn } from "@/components/forening/useHubbNamn";

/** Hero-rubrik på föreningens förstasida — föreningens eget namn. */
export function ForeningHubbRubrik() {
  const namn = useHubbNamn();
  return <>{namn}</>;
}
