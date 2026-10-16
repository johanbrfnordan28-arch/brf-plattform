"use client";

import { useMemo } from "react";
import type { SigneringRoll } from "@/components/rondering/signering";
import { SigneringSchemaPunktLista } from "@/components/rondering/SigneringSchemaPunktLista";
import {
  hamtaAktivaSchemaPunkter,
  type SigneringSchemaPunkt,
} from "@/components/rondering/signering-schema";

type SigneringSchemaGenomforProps = {
  roll: SigneringRoll;
  genomforda: string[];
  onToggle: (punktId: string) => void;
  readonly?: boolean;
  foreningId?: string;
  /** Fryst schema från avtal — används vid uppdragskvittens. */
  punkter?: SigneringSchemaPunkt[];
};

export function SigneringSchemaGenomfor({
  roll,
  genomforda,
  onToggle,
  readonly = false,
  foreningId,
  punkter: frystaPunkter,
}: SigneringSchemaGenomforProps) {
  const punkter = useMemo(
    () => frystaPunkter ?? hamtaAktivaSchemaPunkter(roll, foreningId),
    [frystaPunkter, roll, foreningId],
  );
  const genomfordaSet = useMemo(() => new Set(genomforda), [genomforda]);

  if (punkter.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        Styrelsen har inte valt några moment i schemat ännu. Be föreningen lägga
        till moment i ronderings- eller städschemat innan du kvitterar.
      </div>
    );
  }

  const allaKlara = punkter.every((p) => genomfordaSet.has(p.id));

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">
        Schema för uppdraget — markera utförda moment
      </p>
      <p className="text-xs text-muted">
        Öppna varje sektion och bocka i det som är utfört vid det här tillfället.
        Alla moment måste vara markerade innan kvittens.
      </p>
      <SigneringSchemaPunktLista
        roll={roll}
        punkter={punkter}
        valdaIds={genomfordaSet}
        onToggle={onToggle}
        readonly={readonly}
        forstaOppen
        enITaget={!readonly}
      />
      {!readonly && !allaKlara && (
        <p className="text-xs text-muted">
          {genomfordaSet.size} av {punkter.length} markerade som utförda.
        </p>
      )}
    </div>
  );
}

export function allaSchemaMomentGenomforda(
  roll: SigneringRoll,
  genomforda: string[],
  foreningId?: string,
): boolean {
  const punkter = hamtaAktivaSchemaPunkter(roll, foreningId);
  if (punkter.length === 0) return false;
  const set = new Set(genomforda);
  return punkter.every((p) => set.has(p.id));
}
