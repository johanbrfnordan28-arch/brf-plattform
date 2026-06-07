"use client";

import { KommandeUnderhallFalt } from "@/components/underhallsplan/KommandeUnderhallFalt";
import type { UnderkomponentRad } from "@/components/underhallsplan/komponentregister";

type UnderhallPlaneringFaltProps = {
  komponentNamn: string;
  underkomponentId: string;
  rad: UnderkomponentRad;
  planStartAr: number;
  planLangdAr: number;
  onChange: (patch: Partial<UnderkomponentRad>) => void;
};

/** @deprecated Använd KommandeUnderhallFalt — behålls för befintliga importer. */
export function UnderhallPlaneringFalt(props: UnderhallPlaneringFaltProps) {
  return <KommandeUnderhallFalt {...props} />;
}
