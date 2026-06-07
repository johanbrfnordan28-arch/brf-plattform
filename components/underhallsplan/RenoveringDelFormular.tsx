"use client";

import { useMemo } from "react";
import type { UnderhallBesiktningStatus } from "@/components/underhallsplan/komponentregister";
import { PlaneradeNastaArRedigering } from "@/components/underhallsplan/PlaneradeNastaArRedigering";
import type { PlaneradAtgardPreview } from "@/components/underhallsplan/renovering-planering";
import { BalkongRenoveringFalt } from "@/components/underhallsplan/BalkongRenoveringFalt";
import type { BalkongPost } from "@/components/underhallsplan/balkonger";
import type { RenoveringDelFormState } from "@/components/underhallsplan/renovering-del-form";
import type { PlanKostnaderNormaliserade } from "@/components/underhallsplan/plan-kostnader";
import type {
  KommandeAtgardOverride,
  UtfördRenovering,
} from "@/components/underhallsplan/renoveringar";
import { RenoveringInkluderadeDelar } from "@/components/underhallsplan/RenoveringInkluderadeDelar";
import {
  filtreraPlaneradeForKommandeAtgard,
  visaInkluderadePanel,
} from "@/components/underhallsplan/renovering-inkludering";

type RenoveringDelFormularProps = {
  rubrik: string;
  komponentNamn: string;
  form: RenoveringDelFormState;
  onFormChange: (updater: (current: RenoveringDelFormState) => RenoveringDelFormState) => void;
  /** Visa klumpsumma-fält (stambyte). */
  visaStambyteKlumpsumma?: boolean;
  /** Visa balkongtyp och åtgärd (utförda arbeten under Balkonger). */
  visaBalkongFalt?: boolean;
  balkongRegisterPoster?: BalkongPost[];
  besiktningRadioName: string;
  planerade: PlaneradAtgardPreview[];
  nastaArInputs: Record<string, string>;
  onNastaArChange: (renoveringId: string, ar: string) => void;
  kommandeAtgardOverrides: Record<string, KommandeAtgardOverride>;
  onKommandeAtgardOverrideChange: (
    renoveringId: string,
    override: KommandeAtgardOverride,
  ) => void;
  underkomponentId?: string;
  inkluderadeUnderkomponenter: string[];
  onInkluderadeChange: (ids: string[]) => void;
  /** Utkast för filtrering av planerade rader (t.ex. endast takyta). */
  utkastRenovering?: UtfördRenovering | null;
  planKostnader?: PlanKostnaderNormaliserade;
  redigerar: boolean;
  onSubmit: (event: React.FormEvent) => void;
  onAvbryt: () => void;
};

export function RenoveringDelFormular({
  rubrik,
  komponentNamn,
  form,
  onFormChange,
  visaStambyteKlumpsumma = false,
  visaBalkongFalt = false,
  balkongRegisterPoster,
  besiktningRadioName,
  planerade,
  nastaArInputs,
  onNastaArChange,
  kommandeAtgardOverrides,
  onKommandeAtgardOverrideChange,
  underkomponentId,
  inkluderadeUnderkomponenter,
  onInkluderadeChange,
  utkastRenovering,
  planKostnader,
  redigerar,
  onSubmit,
  onAvbryt,
}: RenoveringDelFormularProps) {
  const visaTakKlumpsumma =
    komponentNamn === "Tak" && !visaStambyteKlumpsumma;
  const visaInkluderade = visaInkluderadePanel(komponentNamn);
  const planeradeKommande = useMemo(() => {
    if (!utkastRenovering) return planerade;
    return filtreraPlaneradeForKommandeAtgard(utkastRenovering, planerade);
  }, [utkastRenovering, planerade]);

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 border-t border-dashed border-border pt-3"
    >
      <p className="text-xs font-medium text-primary-dark">{rubrik}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">År</span>
          <input
            type="number"
            required
            value={form.ar}
            onChange={(e) => onFormChange((c) => ({ ...c, ar: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">Kostnad (kr)</span>
          <input
            value={form.kostnadKr}
            onChange={(e) =>
              onFormChange((c) => ({ ...c, kostnadKr: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-xs font-medium text-muted">Rubrik</span>
          <input
            required
            value={form.titel}
            onChange={(e) => onFormChange((c) => ({ ...c, titel: e.target.value }))}
            placeholder="t.ex. Hissmodernisering"
            className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-xs font-medium text-muted">Omfattning</span>
          <textarea
            value={form.omfattning}
            onChange={(e) =>
              onFormChange((c) => ({ ...c, omfattning: e.target.value }))
            }
            rows={2}
            className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">Avdrag engång (%)</span>
          <input
            type="number"
            min={0}
            max={100}
            value={form.avdragProcent}
            onChange={(e) =>
              onFormChange((c) => ({ ...c, avdragProcent: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">Anledning avdrag</span>
          <input
            value={form.avdragAnledning}
            onChange={(e) =>
              onFormChange((c) => ({ ...c, avdragAnledning: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">Garanti (år)</span>
          <input
            type="number"
            min={0}
            max={30}
            value={form.garantiAr}
            onChange={(e) =>
              onFormChange((c) => ({ ...c, garantiAr: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">Ansvar (år)</span>
          <input
            type="number"
            min={0}
            max={50}
            value={form.ansvarAr}
            onChange={(e) =>
              onFormChange((c) => ({ ...c, ansvarAr: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
          />
        </label>
      </div>
      <fieldset className="text-sm">
        <legend className="text-xs font-medium text-muted">Besiktning efter åtgärd</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            [
              { id: "ja", etikett: "Ja" },
              { id: "nej", etikett: "Nej" },
              { id: "syn-styrelse", etikett: "Syn av styrelse" },
            ] as const
          ).map((alt) => (
            <label
              key={alt.id}
              className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs ${
                form.underhallBesiktning === alt.id
                  ? "border-primary bg-[#e2f0e6] font-medium text-primary-dark"
                  : "border-border"
              }`}
            >
              <input
                type="radio"
                name={besiktningRadioName}
                checked={form.underhallBesiktning === alt.id}
                onChange={() =>
                  onFormChange((c) => ({
                    ...c,
                    underhallBesiktning: alt.id as UnderhallBesiktningStatus,
                  }))
                }
                className="sr-only"
              />
              {alt.etikett}
            </label>
          ))}
        </div>
      </fieldset>

      {visaBalkongFalt && (
        <BalkongRenoveringFalt
          balkongTyp={form.balkongTyp}
          balkongAtgard={form.balkongAtgard}
          balkongRadId={form.balkongRadId}
          registerPoster={balkongRegisterPoster}
          onChange={(patch) =>
            onFormChange((c) => ({ ...c, ...patch }))
          }
        />
      )}

      {visaTakKlumpsumma && (
        <div className="rounded-lg border border-amber-200/80 bg-amber-50/50 p-3">
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={form.klumpsumma}
              onChange={(e) =>
                onFormChange((c) => ({
                  ...c,
                  klumpsumma: e.target.checked,
                }))
              }
              className="mt-0.5 h-4 w-4 rounded border-border text-primary"
            />
            <span className="text-sm text-foreground">
              <span className="font-medium">Klumpsumma (samlad faktura)</span>
              <span className="mt-0.5 block text-xs text-muted">
                T.ex. takomläggning, plåt och skorstenar på en faktura — kostnaden
                planeras på takytor; kryssa in övriga delar nedan.
              </span>
            </span>
          </label>
        </div>
      )}

      {visaInkluderade && (
        <RenoveringInkluderadeDelar
          komponent={komponentNamn}
          underkomponentId={underkomponentId}
          valda={inkluderadeUnderkomponenter}
          onChange={onInkluderadeChange}
        />
      )}

      {visaStambyteKlumpsumma && (
        <div className="rounded-lg border border-amber-200/80 bg-amber-50/50 p-3">
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={form.klumpsumma}
              onChange={(e) =>
                onFormChange((c) => ({
                  ...c,
                  klumpsumma: e.target.checked,
                }))
              }
              className="mt-0.5 h-4 w-4 rounded border-border text-primary"
            />
            <span className="text-sm text-foreground">
              <span className="font-medium">Klumpsumma (stambyte)</span>
              <span className="mt-0.5 block text-xs text-muted">
                Ange hur många badrum, kök och WC den redovisade kostnaden avser.
              </span>
            </span>
          </label>
          {form.klumpsumma && (
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <label className="block text-sm">
                <span className="text-xs font-medium text-muted">Badrum</span>
                <input
                  type="number"
                  min={0}
                  required
                  value={form.klumpsummaAntalBadrum}
                  onChange={(e) =>
                    onFormChange((c) => ({
                      ...c,
                      klumpsummaAntalBadrum: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs font-medium text-muted">Kök</span>
                <input
                  type="number"
                  min={0}
                  required
                  value={form.klumpsummaAntalKok}
                  onChange={(e) =>
                    onFormChange((c) => ({
                      ...c,
                      klumpsummaAntalKok: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs font-medium text-muted">WC</span>
                <input
                  type="number"
                  min={0}
                  required
                  value={form.klumpsummaAntalWc}
                  onChange={(e) =>
                    onFormChange((c) => ({
                      ...c,
                      klumpsummaAntalWc: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
                />
              </label>
            </div>
          )}
        </div>
      )}

      {planeradeKommande.length > 0 && (
        <PlaneradeNastaArRedigering
          planerade={planeradeKommande}
          arInputs={nastaArInputs}
          overrides={kommandeAtgardOverrides}
          underkomponentId={underkomponentId}
          onArChange={onNastaArChange}
          onOverrideChange={onKommandeAtgardOverrideChange}
          planKostnader={planKostnader}
        />
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark"
        >
          {redigerar ? "Spara ändringar" : "Spara renovering"}
        </button>
        <button
          type="button"
          onClick={onAvbryt}
          className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted"
        >
          Avbryt
        </button>
      </div>
    </form>
  );
}
