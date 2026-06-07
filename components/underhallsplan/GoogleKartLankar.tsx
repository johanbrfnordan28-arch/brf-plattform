"use client";

import {
  hamtaKartLankarForKontext,
  kartMatningsInstruktioner,
  type KartKontext,
} from "@/components/underhallsplan/kart-lankar";

type GoogleKartLankarProps = {
  adress: string;
  kontext: KartKontext;
  kompakt?: boolean;
};

export function GoogleKartLankar({
  adress,
  kontext,
  kompakt = false,
}: GoogleKartLankarProps) {
  const lankar = hamtaKartLankarForKontext(adress, kontext);
  const instruktioner =
    kontext === "tak"
      ? kartMatningsInstruktioner.tak
      : kontext === "fasad"
        ? kartMatningsInstruktioner.fasad
        : kartMatningsInstruktioner.allmant;

  return (
    <div className={kompakt ? "space-y-3" : "space-y-4"}>
      {!kompakt && (
        <div>
          <p className="text-sm font-semibold text-primary-dark">
            Google Earth, Maps och Street View
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Öppnas i ny flik utan kostnad. Mät ytor i Earth eller kontrollera fasad
            i Street View — skriv sedan av m² här i plattformen.
          </p>
        </div>
      )}

      {!adress.trim() && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          Lägg till adress i grunduppgifterna (steg 1) så öppnas kartorna på rätt
          fastighet.
        </p>
      )}

      {adress.trim() && (
        <p className="text-xs text-muted">
          Söker på: <span className="font-medium text-foreground">{adress}</span>
        </p>
      )}

      <ul className="space-y-2">
        {lankar.map((l) => (
          <li
            key={l.id}
            className={`flex flex-wrap items-start justify-between gap-2 rounded-lg border bg-white px-3 py-2.5 ${
              l.rekommenderad
                ? "border-primary/40 ring-1 ring-primary/20"
                : "border-border"
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {l.etikett}
                {l.rekommenderad && (
                  <span className="ml-2 text-xs font-normal text-primary-dark">
                    Rekommenderas här
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-muted">{l.beskrivning}</p>
            </div>
            <a
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${
                l.rekommenderad
                  ? "bg-primary text-white hover:bg-primary-dark"
                  : "border border-primary text-primary-dark hover:bg-[#e2f0e6]"
              }`}
            >
              Öppna
            </a>
          </li>
        ))}
      </ul>

      {!kompakt && (
        <ol className="list-decimal space-y-1 pl-5 text-xs text-muted">
          {instruktioner.map((steg) => (
            <li key={steg}>{steg}</li>
          ))}
        </ol>
      )}
    </div>
  );
}
