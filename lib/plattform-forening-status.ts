import {
  arProvoperiodUtgangen,
  dagarKvarAvProvoperiod,
} from "@/lib/forening-avtal";

export type InternForeningStatus = "kund" | "test" | "utgangen";

export type InternForeningStatusInfo = {
  status: InternForeningStatus;
  etikett: string;
  beskrivning: string;
  dagarKvar: number | null;
};

/** Klassificerar förening för intern översikt (test vs accepterat avtal). */
export function klassificeraInternForeningStatus(opts: {
  avtalGodkant: boolean;
  skapadTidpunkt: string;
  nu?: Date;
}): InternForeningStatusInfo {
  if (opts.avtalGodkant) {
    return {
      status: "kund",
      etikett: "Accepterat avtal",
      beskrivning: "Tecknat årsavtal (offert/avtal godkänt)",
      dagarKvar: null,
    };
  }

  const utgangen = arProvoperiodUtgangen({
    skapadTidpunkt: opts.skapadTidpunkt,
    avtalGodkant: false,
    nu: opts.nu,
  });

  if (utgangen) {
    return {
      status: "utgangen",
      etikett: "Test — utgången",
      beskrivning: "Prövoperiod slut utan tecknat avtal",
      dagarKvar: 0,
    };
  }

  const dagarKvar = dagarKvarAvProvoperiod(
    opts.skapadTidpunkt,
    opts.nu ?? new Date(),
  );

  return {
    status: "test",
    etikett: "Testförening",
    beskrivning: "Prövoperiod — avtal ej accepterat",
    dagarKvar,
  };
}
