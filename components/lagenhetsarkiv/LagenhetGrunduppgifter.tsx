"use client";

import { useEffect, useState } from "react";
import { OppnaStangKnapp } from "@/components/OppnaStangKnapp";
import {
  formatLagenhetEtikett,
  sorteraLagenheter,
  type ApartmentFolder,
} from "@/components/lagenhetsarkiv/lagenhetsarkiv";

type SummerTyp = "procent" | "kvm" | "styck";

type GrundFalt = {
  key: keyof ApartmentFolder;
  etikett: string;
  /** Kort rubrik i sammanställningstabellen. */
  kort: string;
  enhet?: string;
  /** Andelstal och yta lyfts fram tydligare. */
  viktig?: boolean;
  /** Hur totalraden summerar och formaterar värdet. */
  summerTyp?: SummerTyp;
};

/** Grunduppgifter per lägenhet — andelstal och yta är viktigast. */
export const GRUNDUPPGIFT_FALT: GrundFalt[] = [
  {
    key: "andelstal",
    etikett: "Andelstal (%)",
    kort: "Andelstal",
    enhet: "%",
    viktig: true,
    summerTyp: "procent",
  },
  {
    key: "boyta",
    etikett: "Boyta (BOA)",
    kort: "BOA",
    enhet: "kvm",
    viktig: true,
    summerTyp: "kvm",
  },
  {
    key: "uppmattYta",
    etikett: "Uppmätt yta",
    kort: "Uppmätt",
    enhet: "kvm",
    summerTyp: "kvm",
  },
  {
    key: "golvyta",
    etikett: "Golvyta (vind)",
    kort: "Golvyta",
    enhet: "kvm",
    summerTyp: "kvm",
  },
  {
    key: "biyta",
    etikett: "Biyta (BIA)",
    kort: "BIA",
    enhet: "kvm",
    summerTyp: "kvm",
  },
  { key: "vaning", etikett: "Våning", kort: "Våning" },
  { key: "antalRum", etikett: "Antal rum", kort: "Rum" },
  {
    key: "antalKok",
    etikett: "Antal kök",
    kort: "Kök",
    enhet: "st",
    summerTyp: "styck",
  },
  {
    key: "antalBadrum",
    etikett: "Antal badrum",
    kort: "Badrum",
    enhet: "st",
    summerTyp: "styck",
  },
  {
    key: "antalWC",
    etikett: "Antal WC",
    kort: "WC",
    enhet: "st",
    summerTyp: "styck",
  },
  { key: "balkong", etikett: "Balkong", kort: "Balkong" },
  { key: "kallareForrad", etikett: "Förråd", kort: "Förråd" },
  { key: "pPlats", etikett: "P-plats", kort: "P-plats" },
  { key: "adress", etikett: "Adress", kort: "Adress" },
];

/** Viktigast först i tabellen — övrigt sist för överskådlighet. */
export const GRUNDUPPGIFT_FALT_TABELL = [
  ...GRUNDUPPGIFT_FALT.filter((f) => f.viktig),
  ...GRUNDUPPGIFT_FALT.filter((f) => !f.viktig),
];

const STRING_FALT = GRUNDUPPGIFT_FALT.map((f) => f.key);

function ravarde(apartment: ApartmentFolder, key: keyof ApartmentFolder): string {
  const v = apartment[key];
  return typeof v === "string" ? v.trim() : "";
}

function parseTal(varde: string): number | null {
  if (!varde) return null;
  const n = parseFloat(
    varde
      .replace(/\s/g, "")
      .replace(",", ".")
      .replace(/%/g, "")
      .replace(/kvm/gi, "")
      .replace(/m²/gi, "")
      .replace(/st/gi, ""),
  );
  return Number.isFinite(n) ? n : null;
}

function formateraTal(n: number): string {
  return n.toLocaleString("sv-SE", { maximumFractionDigits: 2 });
}

export type GrunduppgiftSummor = {
  summor: Map<string, number>;
  andelstalSumma: number | null;
  andelstalAvvikerFran100: boolean;
};

export function beraknaGrunduppgiftSummor(
  apartments: ApartmentFolder[],
): GrunduppgiftSummor {
  const summor = new Map<string, number>();
  for (const f of GRUNDUPPGIFT_FALT) {
    if (!f.summerTyp) continue;
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
  const andelstalSumma = summor.get("andelstal") ?? null;
  const andelstalAvvikerFran100 =
    andelstalSumma != null && Math.abs(andelstalSumma - 100) > 0.05;
  return { summor, andelstalSumma, andelstalAvvikerFran100 };
}

function formateraSummering(f: GrundFalt, summa: number): string {
  if (f.summerTyp === "procent") {
    return `${formateraTal(summa)} %`;
  }
  if (f.summerTyp === "kvm") {
    return `${formateraTal(summa)} kvm`;
  }
  if (f.summerTyp === "styck") {
    return `${Math.round(summa)} st`;
  }
  return formateraTal(summa);
}

const inputKlass =
  "w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

// ── Redigerbara grunduppgifter — sparas direkt till samma state som sammanställningen ─

export function LagenhetGrunduppgifterKort({
  apartment,
  onUppdatera,
  onStangLagenhet,
}: {
  apartment: ApartmentFolder;
  onUppdatera: (patch: Partial<ApartmentFolder>) => void;
  /** Stänger lägenhetskortet efter «Spara och stäng». */
  onStangLagenhet?: () => void;
}) {
  const [oppen, setOppen] = useState(true);
  const [sparFeedback, setSparFeedback] = useState<string | null>(null);
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

  useEffect(() => {
    if (!sparFeedback) return;
    const t = window.setTimeout(() => setSparFeedback(null), 4500);
    return () => window.clearTimeout(t);
  }, [sparFeedback]);

  function setFalt(key: string, varde: string) {
    setDraft((prev) => ({ ...prev, [key]: varde }));
  }

  function sparaFalt(key: keyof ApartmentFolder, varde: string) {
    const trimmed = varde.trim();
    const nuvarande = ravarde(apartment, key);
    if (trimmed === nuvarande) return;
    onUppdatera({ [key]: trimmed || undefined } as Partial<ApartmentFolder>);
  }

  function byggGrunduppgiftPatch(): Partial<ApartmentFolder> | null {
    const patch: Partial<ApartmentFolder> = {};
    for (const f of GRUNDUPPGIFT_FALT) {
      const trimmed = (draft[String(f.key)] ?? "").trim();
      const nuvarande = ravarde(apartment, f.key);
      if (trimmed !== nuvarande) {
        (patch as Record<string, string | undefined>)[String(f.key)] =
          trimmed || undefined;
      }
    }
    return Object.keys(patch).length > 0 ? patch : null;
  }

  function sparaAlla(): boolean {
    const patch = byggGrunduppgiftPatch();
    if (!patch) return false;
    onUppdatera(patch);
    return true;
  }

  function hanteraSpara() {
    if (sparaAlla()) {
      setSparFeedback("Grunduppgifterna sparades i lägenhetsregistret.");
    } else {
      setSparFeedback("Inget nytt att spara — uppgifterna var redan sparade.");
    }
  }

  function hanteraSparaOchStang() {
    const sparade = sparaAlla();
    setSparFeedback(
      sparade
        ? "Sparat. Lägenheten stängs."
        : "Inget nytt att spara. Lägenheten stängs.",
    );
    window.setTimeout(() => onStangLagenhet?.(), sparade ? 900 : 350);
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
            Fyll i uppgifter här — de syns i sammanställningen ovan och totalerna
            längst ner i registret.
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
          {sparFeedback ? (
            <p
              role="status"
              aria-live="polite"
              className="rounded-lg border border-primary/25 bg-white px-3 py-2 text-xs font-medium text-primary-dark"
            >
              {sparFeedback}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={hanteraSpara}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark"
            >
              Spara grunduppgifter
            </button>
            {onStangLagenhet ? (
              <button
                type="button"
                onClick={hanteraSparaOchStang}
                className="rounded-lg border border-primary/40 bg-white px-3 py-1.5 text-xs font-semibold text-primary-dark hover:bg-[#eef6f0]"
              >
                Spara och stäng
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function SammanstallningsTabell({
  apartments,
  kolumner,
  summor,
}: {
  apartments: ApartmentFolder[];
  kolumner: GrundFalt[];
  summor: Map<string, number>;
}) {
  return (
    <table className="min-w-full text-sm">
      <thead>
        <tr className="border-b border-border bg-[#eef6f0] text-left text-xs">
          <th className="sticky left-0 z-10 bg-[#eef6f0] px-3 py-2 font-semibold text-foreground">
            Lägenhet
          </th>
          {kolumner.map((f) => (
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
            {kolumner.map((f) => {
              const varde = ravarde(a, f.key);
              return (
                <td
                  key={String(f.key)}
                  className={`whitespace-nowrap px-3 py-2 ${
                    f.viktig ? "font-semibold text-foreground" : "text-muted"
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
            {kolumner.map((f) => {
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
                  {s !== undefined ? formateraSummering(f, s) : ""}
                </td>
              );
            })}
          </tr>
        </tfoot>
      )}
    </table>
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

  const sorterade = sorteraLagenheter(apartments);
  const { summor, andelstalAvvikerFran100 } =
    beraknaGrunduppgiftSummor(sorterade);

  const andelstalSumma = summor.get("andelstal");
  const boaSumma = summor.get("boyta");

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
            Sammanställning — alla lägenheter
          </p>
          <p className="mt-1 text-sm text-muted">
            {oppen
              ? `Alla ${apartments.length} lägenheter i tabellen — tomma fält som —. Andelstal och yta först, övriga kolumner sist.`
              : `Hopfälld — tryck + för tabell över alla ${apartments.length} lägenheter i registret (inte bara de ni redan fyllt i).`}
          </p>
          {!oppen && (andelstalSumma != null || boaSumma != null) ? (
            <p className="mt-1.5 text-xs font-medium text-primary-dark">
              {andelstalSumma != null
                ? `Andelstal totalt ${formateraTal(andelstalSumma)} %`
                : null}
              {andelstalSumma != null && boaSumma != null ? " · " : null}
              {boaSumma != null ? `BOA totalt ${formateraTal(boaSumma)} kvm` : null}
            </p>
          ) : null}
        </button>
        <OppnaStangKnapp
          oppen={oppen}
          onClick={() => setOppen((v) => !v)}
          storlek="sm"
          ariaLabel={
            oppen
              ? "Fäll ihop sammanställningen"
              : "Öppna sammanställning för alla lägenheter"
          }
        />
      </div>
      {oppen && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-white p-1">
          <SammanstallningsTabell
            apartments={sorterade}
            kolumner={GRUNDUPPGIFT_FALT_TABELL}
            summor={summor}
          />
          {andelstalAvvikerFran100 ? (
            <p className="px-3 pb-2 text-xs text-amber-900">
              Summan andelstal är {formateraTal(summor.get("andelstal") ?? 0)} % —
              kontrollera att alla lägenheter tillsammans blir 100 %.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

/** Totaler längst ner i lägenhetsregistret — samma summering som i tabellen. */
export function LagenhetsarkivSammanstallningNederst({
  apartments,
}: {
  apartments: ApartmentFolder[];
}) {
  if (apartments.length === 0) return null;

  const { summor, andelstalSumma, andelstalAvvikerFran100 } =
    beraknaGrunduppgiftSummor(apartments);
  const summeringsFalt = GRUNDUPPGIFT_FALT.filter((f) => f.summerTyp);

  return (
    <div className="border-t border-border p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-dark">
        Sammanställning — totaler
      </p>
      <p className="mt-1 text-sm text-muted">
        {apartments.length} lägenheter i registret · andelstal ska summera till
        100 %, ytor i kvm, kök/badrum/WC i antal st.
      </p>
      {summor.size === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-border bg-white px-4 py-3 text-sm text-muted">
          Inga summerbara värden ännu — fyll i grunduppgifter per lägenhet eller
          använd tabellen ovan.
        </p>
      ) : null}
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {summeringsFalt.map((f) => {
          const s = summor.get(String(f.key));
          if (s === undefined) return null;
          return (
            <div
              key={String(f.key)}
              className={`rounded-xl border px-3 py-2.5 ${
                f.viktig
                  ? "border-primary/30 bg-[#eef6f0]"
                  : "border-border bg-surface"
              }`}
            >
              <dt className="text-xs font-medium text-muted">{f.etikett}</dt>
              <dd
                className={`mt-0.5 text-lg font-semibold ${
                  f.viktig ? "text-primary-dark" : "text-foreground"
                }`}
              >
                {formateraSummering(f, s)}
              </dd>
            </div>
          );
        })}
      </dl>
      {andelstalSumma != null && !andelstalAvvikerFran100 ? (
        <p className="mt-3 text-xs text-primary-dark">
          Andelstal summerar till {formateraTal(andelstalSumma)} %.
        </p>
      ) : null}
      {andelstalAvvikerFran100 ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          Andelstal summerar till {formateraTal(andelstalSumma ?? 0)} % — ska
          vara 100 % när alla lägenheter är ifyllda.
        </p>
      ) : null}
    </div>
  );
}
