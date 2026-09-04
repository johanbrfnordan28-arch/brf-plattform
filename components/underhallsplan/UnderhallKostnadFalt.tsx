"use client";

import { formatKr } from "@/components/underhallsplan/besiktningar";
import {
  måttenhetEtiketter,
  type UnderkomponentRad,
} from "@/components/underhallsplan/komponentregister";
import { KostnadPrisVarning } from "@/components/underhallsplan/KostnadPrisVarning";
import { UnderhallBlandadPrisFalt } from "@/components/underhallsplan/UnderhallBlandadPrisFalt";
import {
  hamtaRiktprisForUnderkomponent,
} from "@/components/underhallsplan/underhall-atgard-riktpris";
import { MomsAvdragKnapp } from "@/components/underhallsplan/MomsAvdragKnapp";
import {
  beraknaUnderhallKostnadFranEnhet,
  hamtaUnderhallPrisEnhet,
  hamtaUnderhallPrisMangd,
  infereraUnderhallPrisEnhetVidInmatning,
  synkaUnderhallKostnadKr,
  type UnderhallPrisEnhet,
} from "@/components/underhallsplan/underhall-kostnad";

type UnderhallKostnadFaltProps = {
  rad: UnderkomponentRad;
  onChange: (patch: Partial<UnderkomponentRad>) => void;
  /** T.ex. fasadmaterial / takyta — blandad prissättning. */
  visaAlltidEnhetspris?: boolean;
  komponentNamn?: string;
  underkomponentId?: string;
};

export function UnderhallKostnadFalt({
  rad,
  onChange,
  visaAlltidEnhetspris = false,
  komponentNamn,
  underkomponentId,
}: UnderhallKostnadFaltProps) {
  const prisEnhet = hamtaUnderhallPrisEnhet(rad);
  const rikt =
    komponentNamn && underkomponentId
      ? hamtaRiktprisForUnderkomponent(komponentNamn, underkomponentId)
      : null;
  const visaEnhet =
    visaAlltidEnhetspris ||
    rad.måttenhet === "kvm" ||
    rad.måttenhet === "antal" ||
    rad.id === "fasadmaterial" ||
    rad.id === "takyta";

  const beraknat = beraknaUnderhallKostnadFranEnhet(rad);

  const prisAlternativ: { id: UnderhallPrisEnhet; label: string }[] =
    rad.id === "fasadmaterial" || rad.id === "takyta"
      ? [
          { id: "blandad", label: "Yta + styck + total" },
          { id: "kvm", label: "Endast kr/m²" },
          { id: "styck", label: "Endast kr/st" },
          { id: "total", label: "Endast total" },
        ]
      : [
          { id: "total", label: "Total kostnad" },
          { id: "kvm", label: "Pris per m²" },
          { id: "styck", label: "Pris per styck" },
        ];

  function bytPrisEnhet(ny: UnderhallPrisEnhet) {
    const patch: Partial<UnderkomponentRad> = { underhallPrisEnhet: ny };
    if (ny === "kvm" && !rad.underhallPrisAntal) {
      patch.underhallPrisAntal = "";
    }
    const merged = { ...rad, ...patch };
    if (ny !== "blandad" && ny !== "total") {
      patch.underhallKostnadKr = synkaUnderhallKostnadKr(merged);
    }
    onChange(patch);
  }

  function uppdateraMedSynk(patch: Partial<UnderkomponentRad>) {
    const medEnhet = infereraUnderhallPrisEnhetVidInmatning(rad, patch);
    const merged = { ...rad, ...medEnhet };
    const out: Partial<UnderkomponentRad> = { ...medEnhet };
    if (
      hamtaUnderhallPrisEnhet(merged) !== "total" &&
      hamtaUnderhallPrisEnhet(merged) !== "blandad"
    ) {
      out.underhallKostnadKr = synkaUnderhallKostnadKr(merged);
    }
    onChange(out);
  }

  const mangdLabel = prisEnhet === "kvm" ? "Yta (m²)" : "Antal (st)";
  const kostnadLabel =
    prisEnhet === "kvm"
      ? "Kostnad (kr/m²)"
      : prisEnhet === "styck"
        ? "Kostnad (kr/st)"
        : "Kostnad";

  const ytaHint =
    rad.id === "fasadmaterial"
      ? "Yta (m²) kan fyllas i «Total fasadyta» ovan — samma värde används här."
      : rad.id === "takyta"
        ? "Yta (m²) kan fyllas i takytfältet ovan eller från grunduppgifter (steg 1)."
        : undefined;

  function anvandRiktpris() {
    if (!rikt) return;
    if (rikt.enhet === "total") {
      onChange({
        underhallPrisEnhet: "total",
        underhallKostnadKr: String(rikt.prisKr),
        underhallEnhetsprisKr: "",
      });
      return;
    }
    if (rikt.enhet === "styck") {
      const antal =
        rad.underhallPrisAntal?.trim() ||
        (rad.måttenhet === "antal" ? rad.värde : "") ||
        "1";
      onChange({
        underhallPrisEnhet: "styck",
        underhallEnhetsprisKr: String(rikt.prisKr),
        underhallPrisAntal: antal,
        underhallKostnadKr: synkaUnderhallKostnadKr({
          ...rad,
          underhallPrisEnhet: "styck",
          underhallEnhetsprisKr: String(rikt.prisKr),
          underhallPrisAntal: antal,
        }),
      });
      return;
    }
    const kvm = rad.värde.trim();
    onChange({
      underhallPrisEnhet: "kvm",
      underhallEnhetsprisKr: String(rikt.prisKr),
      värde: kvm,
      underhallKostnadKr: synkaUnderhallKostnadKr({
        ...rad,
        underhallPrisEnhet: "kvm",
        underhallEnhetsprisKr: String(rikt.prisKr),
        värde: kvm,
      }),
    });
  }

  const riktprisText =
    rikt &&
    (rikt.enhet === "kvm"
      ? `Riktpris ca ${rikt.prisKr.toLocaleString("sv-SE")} kr/m²`
      : rikt.enhet === "styck"
        ? `Riktpris ca ${rikt.prisKr.toLocaleString("sv-SE")} kr/st`
        : `Riktpris ca ${rikt.prisKr.toLocaleString("sv-SE")} kr totalt`);

  return (
    <div className="space-y-3">
      {visaEnhet && (
        <fieldset>
          <legend className="text-xs font-medium text-muted">
            Prissätt underhåll
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {prisAlternativ.map(({ id, label }) => (
              <label
                key={id}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium ${
                  prisEnhet === id
                    ? "border-primary bg-[#e2f0e6] text-primary-dark"
                    : "border-border bg-white text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name={`pris-enhet-${rad.id}`}
                  value={id}
                  checked={prisEnhet === id}
                  onChange={() => bytPrisEnhet(id)}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {prisEnhet === "blandad" && visaEnhet && (
        <UnderhallBlandadPrisFalt
          rad={rad}
          onChange={onChange}
          ytaHint={ytaHint}
        />
      )}

      {prisEnhet !== "total" && prisEnhet !== "blandad" && visaEnhet && (
        <div className="rounded-lg border border-primary/25 bg-white p-3">
          {riktprisText && (
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] text-muted">{riktprisText}</p>
              <button
                type="button"
                onClick={anvandRiktpris}
                className="text-[11px] font-medium text-primary-dark underline hover:no-underline"
              >
                Använd riktpris
              </button>
            </div>
          )}
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(5.5rem,auto)] items-end gap-2 sm:gap-3">
            <label className="block text-sm">
              <span className="text-xs font-medium text-muted">{mangdLabel}</span>
              <input
                type="number"
                min={0}
                step={prisEnhet === "kvm" ? 0.1 : 1}
                value={
                  prisEnhet === "kvm"
                    ? rad.värde
                    : (rad.underhallPrisAntal ??
                      (rad.måttenhet === "antal" ? rad.värde : ""))
                }
                onChange={(e) => {
                  if (prisEnhet === "kvm") {
                    uppdateraMedSynk({ värde: e.target.value });
                  } else {
                    uppdateraMedSynk({ underhallPrisAntal: e.target.value });
                  }
                }}
                placeholder={prisEnhet === "kvm" ? "380" : "st"}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-medium text-muted">{kostnadLabel}</span>
              <input
                type="number"
                min={0}
                step={prisEnhet === "styck" ? 1 : 10}
                value={rad.underhallEnhetsprisKr ?? ""}
                onChange={(e) =>
                  uppdateraMedSynk({ underhallEnhetsprisKr: e.target.value })
                }
                placeholder={prisEnhet === "kvm" ? "450" : "8500"}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <div className="pb-2 text-right">
              <span className="block text-xs font-medium text-muted">Summa</span>
              <p className="mt-1 text-base font-bold text-primary-dark sm:text-lg">
                {beraknat > 0 ? formatKr(beraknat) : "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      {prisEnhet === "total" && (
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">Uppskattad kostnad (kr)</span>
          <input
            type="number"
            min={0}
            step={1000}
            value={rad.underhallKostnadKr ?? ""}
            onChange={(e) =>
              onChange({
                underhallKostnadKr: e.target.value,
                underhallPrisEnhet: "total",
                underhallEnhetsprisKr: "",
                underhallMomsAvdragenKr: "",
                underhallKostnadInklMomsKr: "",
              })
            }
            placeholder="Tomt = lägg till senare"
            className="mt-1 w-full max-w-xs rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
          <MomsAvdragKnapp
            kostnadKr={rad.underhallKostnadKr}
            momsAvdragenKr={rad.underhallMomsAvdragenKr}
            kostnadInklMomsKr={rad.underhallKostnadInklMomsKr}
            onApply={({ kostnadExklMoms, momsAvdragen, kostnadInklMoms }) =>
              onChange({
                underhallKostnadKr: String(kostnadExklMoms),
                underhallMomsAvdragenKr: String(momsAvdragen),
                underhallKostnadInklMomsKr: String(kostnadInklMoms),
                underhallPrisEnhet: "total",
              })
            }
            onAterstall={() => {
              const inkl = rad.underhallKostnadInklMomsKr?.trim();
              if (!inkl) return;
              onChange({
                underhallKostnadKr: inkl,
                underhallMomsAvdragenKr: "",
                underhallKostnadInklMomsKr: "",
                underhallPrisEnhet: "total",
              });
            }}
          />
          <p className="mt-1 text-[10px] text-muted">
            Välj «Yta + styck + total» om du vill fördela på m² och styck med
            reservation för ställning m.m.
          </p>
        </label>
      )}

      {(visaEnhet || rikt) && (
        <div className="mt-3">
          <KostnadPrisVarning kompakt />
        </div>
      )}
    </div>
  );
}
