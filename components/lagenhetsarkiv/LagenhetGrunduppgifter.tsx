"use client";

import { useState } from "react";
import { OppnaStangKnapp } from "@/components/OppnaStangKnapp";
import {
  formatLagenhetEtikett,
  type ApartmentFolder,
} from "@/components/lagenhetsarkiv/lagenhetsarkiv";

type GrundFalt = {
  key: keyof ApartmentFolder;
  etikett: string;
  /** Kort rubrik i sammanställningstabellen. */
  kort: string;
  enhet?: string;
  /** Andelstal och yta lyfts fram tydligare. */
  viktig?: boolean;
  /** Numeriska fält som summeras i totalraden. */
  summerbar?: boolean;
};

/** Grunduppgifter per lägenhet — andelstal och yta är viktigast. */
export const GRUNDUPPGIFT_FALT: GrundFalt[] = [
  { key: "andelstal", etikett: "Andelstal", kort: "Andelstal", viktig: true, summerbar: true },
  { key: "boyta", etikett: "Boyta (BOA)", kort: "BOA", enhet: "m²", viktig: true, summerbar: true },
  { key: "uppmattYta", etikett: "Uppmätt yta", kort: "Uppmätt", enhet: "m²", summerbar: true },
  { key: "biyta", etikett: "Biyta (BIA)", kort: "BIA", enhet: "m²", summerbar: true },
  { key: "vaning", etikett: "Våning", kort: "Våning" },
  { key: "antalRum", etikett: "Antal rum", kort: "Rum" },
  { key: "antalBadrum", etikett: "Antal badrum", kort: "Badrum" },
  { key: "antalWC", etikett: "Antal WC", kort: "WC" },
  { key: "balkong", etikett: "Balkong", kort: "Balkong" },
  { key: "kallareForrad", etikett: "Förråd", kort: "Förråd" },
  { key: "pPlats", etikett: "P-plats", kort: "P-plats" },
  { key: "adress", etikett: "Adress", kort: "Adress" },
];

function ravarde(apartment: ApartmentFolder, key: keyof ApartmentFolder): string {
  const v = apartment[key];
  return typeof v === "string" ? v.trim() : "";
}

function parseTal(varde: string): number | null {
  if (!varde) return null;
  const n = parseFloat(varde.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function formateraTal(n: number): string {
  return n.toLocaleString("sv-SE", { maximumFractionDigits: 2 });
}

function medEnhet(varde: string, enhet?: string): string {
  if (!varde) return "—";
  return enhet ? `${varde} ${enhet}` : varde;
}

// ── Alltid synlig grunduppgiftsruta högst upp i lägenhetskortet ────────────────

function ViktigStat({ etikett, varde }: { etikett: string; varde: string }) {
  return (
    <div className="rounded-lg border border-primary/30 bg-white px-3 py-2">
      <p className="text-[11px] font-medium text-muted">{etikett}</p>
      <p className="mt-0.5 text-base font-bold text-foreground">{varde || "—"}</p>
    </div>
  );
}

export function LagenhetGrunduppgifterKort({
  apartment,
}: {
  apartment: ApartmentFolder;
}) {
  const [oppen, setOppen] = useState(false);
  const andelstal = ravarde(apartment, "andelstal");
  const boyta = ravarde(apartment, "boyta");
  const ovriga = GRUNDUPPGIFT_FALT.filter((f) => !f.viktig);

  return (
    <div className="mt-3 rounded-xl border border-primary/20 bg-[#eef6f0]/50 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOppen((v) => !v)}
          aria-expanded={oppen}
          className="text-left text-[11px] font-semibold uppercase tracking-wide text-primary-dark"
        >
          Grunduppgifter
        </button>
        <OppnaStangKnapp
          oppen={oppen}
          onClick={() => setOppen((v) => !v)}
          storlek="sm"
          ariaLabel={oppen ? "Stäng grunduppgifter" : "Öppna grunduppgifter"}
        />
      </div>

      {oppen && (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:max-w-md">
            <ViktigStat etikett="Andelstal" varde={andelstal} />
            <ViktigStat
              etikett="Boyta (BOA)"
              varde={boyta ? `${boyta} m²` : ""}
            />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
            {ovriga.map((f) => (
              <div key={String(f.key)} className="min-w-0">
                <dt className="text-[11px] text-muted">{f.etikett}</dt>
                <dd className="truncate text-sm text-foreground">
                  {medEnhet(ravarde(apartment, f.key), f.enhet)}
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </div>
  );
}

// ── Sammanställning över alla lägenheter högst upp i modulen ───────────────────

export function LagenhetsarkivSammanstallning({
  apartments,
}: {
  apartments: ApartmentFolder[];
}) {
  const [oppen, setOppen] = useState(false);

  if (apartments.length === 0) return null;

  const summor = new Map<string, number>();
  for (const f of GRUNDUPPGIFT_FALT) {
    if (!f.summerbar) continue;
    let sum = 0;
    let harVarde = false;
    for (const a of apartments) {
      const n = parseTal(ravarde(a, f.key));
      if (n !== null) {
        sum += n;
        harVarde = true;
      }
    }
    if (harVarde) summor.set(String(f.key), sum);
  }

  return (
    <div className="border-b border-border p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setOppen((v) => !v)}
          aria-expanded={oppen}
          className="min-w-0 text-left"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-dark">
            Sammanställning
          </p>
          <p className="mt-1 text-sm text-muted">
            {apartments.length} lägenheter — alla grunduppgifter, med andelstal
            och yta i fokus.
          </p>
        </button>
        <OppnaStangKnapp
          oppen={oppen}
          onClick={() => setOppen((v) => !v)}
          storlek="sm"
          ariaLabel={oppen ? "Stäng sammanställning" : "Öppna sammanställning"}
        />
      </div>
      {oppen && (
      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-[#eef6f0] text-left text-xs">
              <th className="sticky left-0 z-10 bg-[#eef6f0] px-3 py-2 font-semibold text-foreground">
                Lägenhet
              </th>
              {GRUNDUPPGIFT_FALT.map((f) => (
                <th
                  key={String(f.key)}
                  className={`whitespace-nowrap px-3 py-2 font-semibold ${
                    f.viktig ? "text-primary-dark" : "text-muted"
                  }`}
                >
                  {f.kort}
                  {f.enhet ? ` (${f.enhet})` : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {apartments.map((a) => (
              <tr key={a.id} className="border-b border-border last:border-0">
                <td className="sticky left-0 z-10 bg-white px-3 py-2 font-medium text-foreground">
                  {formatLagenhetEtikett(a.lagenhetsnummer)}
                </td>
                {GRUNDUPPGIFT_FALT.map((f) => {
                  const varde = ravarde(a, f.key);
                  return (
                    <td
                      key={String(f.key)}
                      className={`whitespace-nowrap px-3 py-2 ${
                        f.viktig
                          ? "font-semibold text-foreground"
                          : "text-muted"
                      }`}
                    >
                      {varde || "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          {summor.size > 0 && (
            <tfoot>
              <tr className="border-t-2 border-border bg-[#fafcfa]">
                <td className="sticky left-0 z-10 bg-[#fafcfa] px-3 py-2 font-semibold text-foreground">
                  Totalt
                </td>
                {GRUNDUPPGIFT_FALT.map((f) => {
                  const s = summor.get(String(f.key));
                  return (
                    <td
                      key={String(f.key)}
                      className={`whitespace-nowrap px-3 py-2 ${
                        f.viktig
                          ? "font-bold text-primary-dark"
                          : "font-medium text-muted"
                      }`}
                    >
                      {s !== undefined ? formateraTal(s) : ""}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      )}
    </div>
  );
}
