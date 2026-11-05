"use client";

import { useMemo, useState } from "react";
import type { ForeningsDokument } from "@/components/dokumentbank/forening-dokumenter-lager";
import {
  byggSignaturStatusText,
  normaliseraAvtalSignering,
} from "@/components/dokumentbank/forening-dokument-avtal";
import { BankIdAvtalSignering } from "@/components/bankid/BankIdAvtalSignering";
import {
  laggTillBankIdSignatur,
  type BankIdSignatur,
} from "@/lib/bankid-signering";
import { lasForeningProfil } from "@/lib/forening-registry";

type Props = {
  dokument: ForeningsDokument;
  onSpara: (patch: Partial<ForeningsDokument>) => void;
  kompakt?: boolean;
};

export function ForeningsDokumentAvtalSignering({
  dokument,
  onSpara,
  kompakt = false,
}: Props) {
  const signering = useMemo(
    () => normaliseraAvtalSignering(dokument),
    [dokument],
  );
  const profil = typeof window !== "undefined" ? lasForeningProfil() : null;
  const ledamoter = profil?.styrelseledamoter ?? [];
  const [meddelande, setMeddelande] = useState<string | null>(null);

  function signeraEntreprenor(signatur: BankIdSignatur) {
    const result = laggTillBankIdSignatur(
      signering.entreprenorSignaturer,
      { ...signatur, part: "foretag" },
    );
    if (!result.ok) {
      setMeddelande(result.fel);
      return;
    }
    onSpara({
      entreprenorSignaturer: result.signaturer,
      status: "utkast",
    });
    setMeddelande("Entreprenörssignatur registrerad.");
  }

  function signeraForening(signatur: BankIdSignatur) {
    const result = laggTillBankIdSignatur(
      signering.foreningSignaturer,
      { ...signatur, part: "forening" },
    );
    if (!result.ok) {
      setMeddelande(result.fel);
      return;
    }
    const next = result.signaturer;
    const ent = signering.entreprenorSignaturer;
    const klar = ent.length >= 2 && next.length >= 2;
    onSpara({
      foreningSignaturer: next,
      status: klar ? "klar" : "utkast",
    });
    setMeddelande("Föreningssignatur registrerad.");
  }

  return (
    <div
      className={
        kompakt
          ? "mt-3 rounded-xl border border-primary/30 bg-[#eef6f0]/50 p-3"
          : "rounded-xl border border-border bg-surface/80 p-4"
      }
    >
      <p className="text-sm font-semibold text-foreground">
        Signering med BankID
      </p>
      <p className="mt-1 text-xs text-muted">
        {byggSignaturStatusText(dokument)}
      </p>
      <div className="mt-4 space-y-4">
        <BankIdAvtalSignering
          part="foretag"
          partEtikett="entreprenören"
          signaturer={signering.entreprenorSignaturer}
          onSignera={async (s) => signeraEntreprenor(s)}
        />
        <BankIdAvtalSignering
          part="forening"
          partEtikett="föreningen"
          signaturer={signering.foreningSignaturer}
          disabled={!signering.entreprenorKlart}
          disabledOrsak="Entreprenören måste signera med två BankID först."
          ledamoter={ledamoter}
          onSignera={async (s) => signeraForening(s)}
        />
      </div>
      {meddelande && (
        <p className="mt-2 text-xs text-primary-dark" role="status">
          {meddelande}
        </p>
      )}
    </div>
  );
}
