export type VerksamhetsLokal = {
  id: string;
  namn: string;
  ytaM2: string;
};

export type Grunduppgifter = {
  boarea: string;
  lokalyta: string;
  /** Lokaler (butik, kontor m.m.) — syns i planen och styr OVK verksamhet. */
  lokaler?: VerksamhetsLokal[];
  antalLagenheter: string;
  byggar: string;
  tomtstorlek: string;
  antalVaningar: string;
  antalByggnader: string;
  adresser: string[];
  uppvarmning: string;
  ventilationssystem: string;
  fastighetsbeteckning: string;
  /** Hus och ytor per vädersträck — används i fasad/tak (steg 3) och AI-hjälp. */
  fastighetsYtor?: import("@/components/underhallsplan/fastighets-ytor").FastighetsYtorData;
};

export type RenoveringSammanfattning = {
  antal: number;
  summaKr: number;
  senaste: { ar: number; titel: string; komponent: string; kostnadKr: number }[];
};
