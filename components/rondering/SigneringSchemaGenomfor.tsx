"use client";

import { useMemo } from "react";
import type { SigneringRoll } from "@/components/rondering/signering";
import { SigneringSchemaPunktLista } from "@/components/rondering/SigneringSchemaPunktLista";
import { hamtaAktivaSchemaPunkter } from "@/components/rondering/signering-schema";

type SigneringSchemaGenomforProps = {
  roll: SigneringRoll;
  genomforda: string[];
  onToggle: (punktId: string) => void;
  readonly?: boolean;
  foreningId?: string;
};

export function SigneringSchemaGenomfor({
  roll,
  genomforda,
  onToggle,
  readonly = false,
  foreningId,
}: SigneringSchemaGenomforProps) {
  const punkter = useMemo(
    () => hamtaAktivaSchemaPunkter(roll, foreningId),
    [roll, foreningId],
  );
  const genomfordaSet = useMemo(() => new Set(genomforda), [genomforda]);

  if (punkter.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        Styrelsen har inte valt några moment i schemat ännu. Be föreningen bocka i
        moment under månadssignering innan du signerar.
      </div>
    );
  }

  const allaKlara = punkter.every((p) => genomfordaSet.has(p.id));

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">
        Månadsschema — markera utförda moment
      </p>
      <p className="text-xs text-muted">
        Öppna varje sektion och bocka i det som är utfört denna månad. Alla valda
        moment måste vara markerade innan signering.
      </p>
      <SigneringSchemaPunktLista
        roll={roll}
        punkter={punkter}
        valdaIds={genomfordaSet}
        onToggle={onToggle}
        readonly={readonly}
        oppnaAlla={!readonly}
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
