"use client";

import { useEffect, useState } from "react";
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
  { key: "golvyta", etikett: "Golvyta (vind)", kort: "Golvyta", enhet: "m²", summerbar: true },
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

const STRING_FALT = GRUNDUPPGIFT_FALT.map((f) => f.key);

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

const inputKlass =
  "w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

// ── Redigerbara grunduppgifter — sparas direkt till samma state som sammanställningen ─

export function LagenhetGrunduppgifterKort({
  apartment,
  onUppdatera,
}: {
  apartment: ApartmentFolder;
  onUppdatera: (patch: Partial<ApartmentFolder>) => void;
}) {
  const [oppen, setOppen] = useState(true);
  const [draft, setDraft] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      STRING_FALT.map((key) => [String(key), ravarde(apartment, key)]),
    ),
  );

  const syncKey = STRING_FALT.map((key) => ravarde(apartment, key)).join("\0");

  useEffect(() => {
    setDraft(
      Object.fromEntries(
        STRING_FALT.map((key) => [String(key), ravarde(apartment, key)]),
      ),
    );
    // Synka när lägenhet byts eller när värden uppdaterats utifrån (t.ex. InfoPanel).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- syncKey speglar apartment-fält
  }, [apartment.id, syncKey]);

  function setFalt(key: string, varde: string) {
    setDraft((prev) => ({ ...prev, [key]: varde }));
  }

  function sparaFalt(key: keyof ApartmentFolder, varde: string) {
    const trimmed = varde.trim();
    const nuvarande = ravarde(apartment, key);
    if (trimmed === nuvarande) return;
    onUppdatera({ [key]: trimmed || undefined } as Partial<ApartmentFolder>);
  }

  function sparaAlla() {
    const patch: Partial<ApartmentFolder> = {};
    for (const f of GRUNDUPPGIFT_FALT) {
      const trimmed = (draft[String(f.key)] ?? "").trim();
      const nuvarande = ravarde(apartment, f.key);
      if (trimmed !== nuvarande) {
        (patch as Record<string, string | undefined>)[String(f.key)] =
          trimmed || undefined;
      }
    }
    if (Object.keys(patch).length > 0) onUppdatera(patch);
  }

  return (
    <div className="rounded-xl border border-primary/25 bg-[#eef6f0]/50 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOppen((v) => !v)}
          aria-expanded={oppen}
          className="min-w-0 text-left"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-dark">
            Grunduppgifter
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Fyll i uppgifter här — de syns direkt i sammanställningen högst upp.
          </p>
        </button>
        <OppnaStangKnapp
          oppen={oppen}
          onClick={() => setOppen((v) => !v)}
          storlek="sm"
          ariaLabel={oppen ? "Stäng grunduppgifter" : "Öppna grunduppgifter"}
        />
      </div>

      {oppen && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {GRUNDUPPGIFT_FALT.map((f) => {
              const key = String(f.key);
              return (
                <label key={key} className="block min-w-0">
                  <span
                    className={`mb-1 block text-[11px] font-medium ${
                      f.viktig ? "text-primary-dark" : "text-muted"
                    }`}
                  >
                    {f.etikett}
                    {f.enhet ? ` (${f.enhet})` : ""}
                  </span>
                  <input
                    value={draft[key] ?? ""}
                    onChange={(e) => setFalt(key, e.target.value)}
                    onBlur={(e) => sparaFalt(f.key, e.target.value)}
                    placeholder={f.viktig ? "Obligatoriskt för sammanställning" : ""}
                    className={inputKlass}
                  />
                </label>
              );
            })}
          </div>
          <button
            type="button"
            onClick={sparaAlla}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark"
          >
            Spara grunduppgifter
          </button>
        </div>
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
  const [oppen, setOppen] = useState(true);

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

  const ifyllda = apartments.filter((a) =>
    GRUNDUPPGIFT_FALT.some((f) => ravarde(a, f.key)),
  ).length;

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
            {apartments.length} lägenheter
            {ifyllda > 0 ? ` · ${ifyllda} med ifyllda uppgifter` : ""} — uppdateras
            när du sparar grunduppgifter i respektive lägenhet.
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
