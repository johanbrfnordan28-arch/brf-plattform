import type { SigneringRoll } from "@/components/rondering/signering";
import type { SigneringSchemaPunkt } from "@/components/rondering/signering-schema";
import type { BankIdSignatur } from "@/lib/bankid-signering";

export type DriftAvtalStatus = "skickat" | "foretag_signerat" | "godkant";

export type DriftAvtal = {
  id: string;
  roll: SigneringRoll;
  status: DriftAvtalStatus;
  /** Schemat som frystes när avtalet skapades — bindande underlag. */
  schemaPunkter: SigneringSchemaPunkt[];
  /** Föreningen beslutar om BankID krävs vid varje uppdragskvittens. */
  kravBankIdKvittens: boolean;
  entreprenorNamn: string;
  entreprenorEpost: string;
  offertMeddelande: string;
  token: string;
  skapadTidpunkt: string;
  godkantTidpunkt?: string;
  godkantNamn?: string;
  /** Två personer i företaget signerar först. */
  foretagSignaturer?: BankIdSignatur[];
  /** Därefter två personer i föreningen. */
  foreningSignaturer?: BankIdSignatur[];
};

export type DriftOffert = {
  id: string;
  roll: SigneringRoll;
  entreprenorNamn: string;
  entreprenorEpost: string;
  meddelande: string;
  skapadTidpunkt: string;
};

export type DriftUppdrag = {
  id: string;
  avtalId: string;
  roll: SigneringRoll;
  utforandedatum: string;
  anteckning: string;
  status: "vantar" | "utfort";
  token: string;
  skapadTidpunkt: string;
  genomfordaPunktIds?: string[];
  metod?: "bankid" | "namn";
  signeradTidpunkt?: string;
  signeradNamn?: string;
  signeradPersonnummerMaskerat?: string;
  /** Personal på plats vid besöket, ett namn per rad. */
  personalNamn?: string[];
  /** Om någon i personalen bytts ut mot den som står i anbudet. */
  personalByte?: string;
  anvanderUnderentreprenor?: boolean;
  underentreprenorNamn?: string;
};

export type DriftState = {
  version: 1;
  avtal: DriftAvtal[];
  offerter: DriftOffert[];
  uppdrag: DriftUppdrag[];
  kravBankIdStandard: Record<SigneringRoll, boolean>;
};

export const DRIFT_AVTAL_EVENT = "rondering-drift-avtal-uppdaterad";

export function tomDriftState(): DriftState {
  return {
    version: 1,
    avtal: [],
    offerter: [],
    uppdrag: [],
    kravBankIdStandard: {
      fastighetsskotare: true,
      stadning: true,
    },
  };
}

export function arDriftState(value: unknown): value is DriftState {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<DriftState>;
  return (
    v.version === 1 &&
    Array.isArray(v.avtal) &&
    Array.isArray(v.offerter) &&
    Array.isArray(v.uppdrag)
  );
}
