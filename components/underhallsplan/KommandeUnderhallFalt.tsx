"use client";

import {
  hamtaUnderhallRekommendation,
  standardUnderhallIntervallAr,
} from "@/components/underhallsplan/underhall-intervall";
import {
  arDirektkostnadUnderhall,
  arK3AvskrivningsKomponent,
  DIREKTKOSTNAD_FORKLARING,
  hamtaAvskrivningRekommendation,
  standardAvskrivningAr,
} from "@/components/underhallsplan/komponent-avskrivning";
import type { UnderkomponentRad } from "@/components/underhallsplan/komponentregister";
import { hamtaPlanSlutAr } from "@/components/underhallsplan/planinstallningar";
import { UnderhallKostnadFalt } from "@/components/underhallsplan/UnderhallKostnadFalt";
import { UnderhallKostnadPerArTabell } from "@/components/underhallsplan/UnderhallKostnadPerArTabell";
import { effektivUnderhallKostnadKr } from "@/components/underhallsplan/underhall-kostnad";
import {
  beraknaUnderhallKostnadPerArForRad,
  type UnderhallKostnadPerArRad,
} from "@/components/underhallsplan/underhall-plan-ar";
import type { TillfallenKoppling } from "@/components/underhallsplan/underhall-tillfallen";

type KommandeUnderhallFaltProps = {
  komponentNamn: string;
  underkomponentId: string;
  rad: UnderkomponentRad;
  planStartAr: number;
  planLangdAr: number;
  onChange: (patch: Partial<UnderkomponentRad>) => void;
  /** Planeras via tillfällen nedan — dölj enkel kostnad/intervall här. */
  planeratViaTillfallen?: boolean;
  /** @deprecated Använd planeratViaTillfallen */
  fasadPlaneratViaTillfallen?: boolean;
  kostnadPerArOverride?: UnderhallKostnadPerArRad[];
  /** Ingår i annat tillfälle (t.ex. skorsten vid takomläggning). */
  tillfallenKoppling?: TillfallenKoppling | null;
};

/** Planerat underhåll — visas i komponentregistret (steg 3). */
export function KommandeUnderhallFalt({
  komponentNamn,
  underkomponentId,
  rad,
  planStartAr,
  planLangdAr,
  onChange,
  planeratViaTillfallen: planeratViaTillfallenProp,
  fasadPlaneratViaTillfallen = false,
  kostnadPerArOverride,
  tillfallenKoppling,
}: KommandeUnderhallFaltProps) {
  const planeratViaTillfallen =
    planeratViaTillfallenProp ?? fasadPlaneratViaTillfallen;
  const rek = hamtaUnderhallRekommendation(komponentNamn, underkomponentId);
  const avskrRek = hamtaAvskrivningRekommendation(komponentNamn, underkomponentId);
  const arDirektkostnad = arDirektkostnadUnderhall(
    komponentNamn,
    underkomponentId,
  );
  const visaK3Avskrivning =
    !arDirektkostnad &&
    (rad.ärEgen ||
      arK3AvskrivningsKomponent(komponentNamn, underkomponentId) ||
      Boolean(rad.avskrivningAr?.trim()));
  const planSlutAr = hamtaPlanSlutAr(planStartAr, planLangdAr);
  const intervallVal =
    rad.underhallIntervallAr?.trim() ||
    (rek ? String(rek.rekommenderatIntervallAr) : "");
  const avskrivningVal =
    rad.avskrivningAr?.trim() ||
    standardAvskrivningAr(komponentNamn, underkomponentId);
  const harKostnad = effektivUnderhallKostnadKr(rad) > 0;
  const kostnadPerAr =
    kostnadPerArOverride ??
    beraknaUnderhallKostnadPerArForRad(rad, planStartAr, planLangdAr);

  function aterstallRekommenderatIntervall() {
    const standard = standardUnderhallIntervallAr(komponentNamn, underkomponentId);
    onChange({
      underhallIntervallAr: standard,
      underhallNastaAr: rad.underhallNastaAr?.trim() || String(planStartAr),
    });
  }

  function aterstallRekommenderadAvskrivning() {
    onChange({
      avskrivningAr: standardAvskrivningAr(komponentNamn, underkomponentId),
    });
  }

  if (tillfallenKoppling) {
    return (
      <div className="rounded-lg border border-[#d4e8da] bg-[#eef6f0]/40 p-3">
        <p className="text-xs font-semibold text-primary-dark">Kommande underhåll</p>
        <p className="mt-1 text-xs leading-relaxed text-primary-dark">
          Ingår i projektet{" "}
          <strong className="font-medium">{tillfallenKoppling.tillfalleTitel}</strong>{" "}
          under {tillfallenKoppling.huvudEtikett} (planerat ca{" "}
          {tillfallenKoppling.nastaAr || "—"}). Åtgärder:{" "}
          {tillfallenKoppling.atgardEtiketter.join(", ") || "—"}.
        </p>
        <p className="mt-1 text-[10px] text-muted">
          Kostnad och intervall följer huvudåtgärden — justera under{" "}
          {tillfallenKoppling.huvudEtikett} om projektet ändras.
        </p>
      </div>
    );
  }

  if (planeratViaTillfallen) {
    const tillfallenAnchorId = `underhall-tillfallen-${underkomponentId}`;
    return (
      <div className="rounded-lg border border-[#d4e8da] bg-[#eef6f0]/40 p-3">
        <p className="text-xs font-semibold text-primary-dark">Kommande underhåll</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          För tak och fönster med renovering i steg 2 planeras det här via{" "}
          <strong className="font-medium">underhållstillfällen</strong> (rutan nedan),
          inte i fälten ovan. Där väljer du åtgärdstyp (t.ex. takmålning), första år,
          intervall och pris per tillfälle.
        </p>
        {visaK3Avskrivning && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-xs font-medium text-muted">
                Installationsvärde (kr)
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={rad.installationskostnadKr ?? ""}
                onChange={(e) =>
                  onChange({ installationskostnadKr: e.target.value })
                }
                placeholder="Uppskattat vid byggår"
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-medium text-muted">
                Avskrivning (år)
              </span>
              <input
                type="number"
                min={1}
                max={120}
                value={avskrivningVal}
                onChange={(e) => onChange({ avskrivningAr: e.target.value })}
                placeholder={
                  avskrRek
                    ? String(avskrRek.rekommenderadAvskrivningAr)
                    : "t.ex. 40"
                }
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </label>
          </div>
        )}
        <p className="mt-2 text-xs text-primary-dark">
          Vill du byta <em>vilken</em> lättare åtgärd som föreslås först (målning m.m.)?
          Gör det i <strong className="font-medium">steg 2</strong> under{" "}
          <strong className="font-medium">Föreslå annan åtgärd</strong> vid redigering av
          tak-/fönsterrenoveringen — spara steg 2 igen. Finjustera år, intervall och
          kostnad här i steg 3.
        </p>
        <a
          href={`#${tillfallenAnchorId}`}
          className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
        >
          Hoppa till underhållstillfällen ↓
        </a>
        {kostnadPerAr.length > 0 ? (
          <div className="mt-3">
            <UnderhallKostnadPerArTabell
              rader={kostnadPerAr}
              titel="Planerad kostnad per år (tillfällen)"
            />
          </div>
        ) : (
          <p className="mt-2 rounded-md border border-dashed border-amber-300/80 bg-amber-50/80 px-2.5 py-1.5 text-xs text-amber-950">
            Lägg till tillfälle nedan med åtgärder, år, intervall och pris.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#d4e8da] bg-[#eef6f0]/40 p-3">
      <p className="text-xs font-semibold text-primary-dark">Kommande underhåll</p>
      <p className="mt-0.5 text-xs text-muted">
        Sammanställning av planerade åtgärder. Utfört arbete och besiktning fylls i
        steg 2 — kostnad och nästa år kan justeras här.
      </p>

      {arDirektkostnad && (
        <p className="mt-2 rounded-md border border-amber-200 bg-amber-50/90 px-2.5 py-1.5 text-xs text-amber-950">
          Kostnadsförs direkt — {DIREKTKOSTNAD_FORKLARING} Aktivera delen,
          ange nästa år, intervall och kostnad.
        </p>
      )}

      {rad.underhallFranHistorik && rad.underhallHistorikAr && (
        <p className="mt-2 rounded-md border border-[#d4e8da] bg-white px-2.5 py-1.5 text-xs text-primary-dark">
          Förfylld från renovering {rad.underhallHistorikAr}
          {rad.underhallHistorikTitel ? ` (${rad.underhallHistorikTitel})` : ""}.
          Vill du planera en lättare åtgärd (t.ex. målning) med kortare intervall
          mellan större projekt? Välj{" "}
          <strong className="font-medium">Avvikande åtgärd</strong> i steg 2 vid
          redigering av renoveringen, eller lägg till tillfällen nedan.
        </p>
      )}

      {rad.aktiv && !rad.underhallFranHistorik && !harKostnad && (
        <p className="mt-2 rounded-md border border-dashed border-amber-300/80 bg-amber-50/80 px-2.5 py-1.5 text-xs text-amber-950">
          Ingen matchande renovering i steg 2 — fyll i intervall och kostnad här.
        </p>
      )}

      {rek && (
        <p className="mt-2 text-xs text-muted">
          Rekommenderat: vart {rek.rekommenderatIntervallAr}:e år. {rek.intervallHint}
        </p>
      )}

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">Nästa åtgärd (år)</span>
          <input
            type="number"
            min={planStartAr}
            max={planSlutAr}
            value={rad.underhallNastaAr ?? ""}
            onChange={(e) => onChange({ underhallNastaAr: e.target.value })}
            placeholder={String(planStartAr)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">Intervall (år)</span>
          <select
            value={intervallVal || ""}
            onChange={(e) => onChange({ underhallIntervallAr: e.target.value })}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="">— välj senare —</option>
            {Array.from({ length: Math.min(planLangdAr, 50) }, (_, i) => i + 1).map(
              (ar) => (
                <option key={ar} value={ar}>
                  Vart {ar}:e år
                  {rek?.rekommenderatIntervallAr === ar ? " (rekomm.)" : ""}
                </option>
              ),
            )}
          </select>
        </label>
        {visaK3Avskrivning && (
          <>
            <label className="block text-sm">
              <span className="text-xs font-medium text-muted">
                Installationsvärde (kr)
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={rad.installationskostnadKr ?? ""}
                onChange={(e) =>
                  onChange({ installationskostnadKr: e.target.value })
                }
                placeholder="Uppskattat vid byggår"
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-medium text-muted">
                Avskrivning (år)
              </span>
              <input
                type="number"
                min={1}
                max={120}
                value={avskrivningVal}
                onChange={(e) => onChange({ avskrivningAr: e.target.value })}
                placeholder={
                  avskrRek
                    ? String(avskrRek.rekommenderadAvskrivningAr)
                    : "t.ex. 40"
                }
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </label>
          </>
        )}
      </div>

      {visaK3Avskrivning && (
        <p className="mt-2 text-xs text-muted">
          Installationsvärde och avskrivningstid för K3 — skilt från underhållskostnad
          nedan.{" "}
          {standardAvskrivningAr(komponentNamn, underkomponentId) && (
            <button
              type="button"
              onClick={aterstallRekommenderadAvskrivning}
              className="font-medium text-primary hover:underline"
            >
              Återställ avskrivning
            </button>
          )}
        </p>
      )}

      <div className="mt-3">
        <UnderhallKostnadFalt
          rad={rad}
          onChange={onChange}
          komponentNamn={komponentNamn}
          underkomponentId={underkomponentId}
          visaAlltidEnhetspris={
            underkomponentId === "fasadmaterial" ||
            underkomponentId === "takyta" ||
            komponentNamn === "Ventilation" ||
            (komponentNamn === "Tak" &&
              ["ventilationshuv", "skorsten", "takkupa"].includes(
                underkomponentId,
              ))
          }
        />
      </div>

      {kostnadPerAr.length > 0 && (
        <div className="mt-3">
          <UnderhallKostnadPerArTabell rader={kostnadPerAr} />
        </div>
      )}

      {kostnadPerAr.length === 0 && harKostnad && !rad.underhallIntervallAr?.trim() && (
        <p className="mt-2 text-xs text-amber-950">
          Välj intervall ovan för att se kostnad fördelad per år i planen.
        </p>
      )}

      {rek && (
        <button
          type="button"
          onClick={aterstallRekommenderatIntervall}
          className="mt-2 text-xs font-medium text-primary hover:underline"
        >
          Återställ rekommenderat intervall
        </button>
      )}
    </div>
  );
}
