"use client";

import {
  sbaBesiktningMall,
  type BrandskyddSbaData,
} from "@/components/underhallsplan/brandskydd";

type BrandskyddSbaPanelProps = {
  data: BrandskyddSbaData;
  onChange: (data: BrandskyddSbaData) => void;
};

/** SBA — kontrollmall och anteckningar i underhållsplanen. */
export function BrandskyddSbaPanel({ data, onChange }: BrandskyddSbaPanelProps) {
  const grupper = [...new Set(sbaBesiktningMall.map((p) => p.kategori))];

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted">
        Systematiskt brandskyddsarbete (SBA) — mall för egenkontroll. Schemat och
        kostnad för årlig rond samt brandkonsult ställs in under Besiktningar (steg 4).
      </p>

      <div className="rounded-lg border border-[#e2f0e6] bg-[#eef6f0]/40 p-3">
        <p className="text-xs font-semibold text-primary-dark">
          Kontrollmall — vad som ska besiktigas
        </p>
        <div className="mt-3 space-y-3">
          {grupper.map((kategori) => (
            <div key={kategori}>
              <p className="text-xs font-medium text-foreground">{kategori}</p>
              <ul className="mt-1 space-y-1">
                {sbaBesiktningMall
                  .filter((p) => p.kategori === kategori)
                  .map((punkt) => (
                    <li
                      key={punkt.id}
                      className="flex gap-2 text-xs leading-relaxed text-muted"
                    >
                      <span className="mt-0.5 text-primary" aria-hidden>
                        •
                      </span>
                      {punkt.text}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">
            Senast genomförd SBA-kontroll (år)
          </span>
          <input
            type="number"
            min={1900}
            max={2100}
            value={data.senastKontrollAr ?? ""}
            onChange={(event) =>
              onChange({ ...data, senastKontrollAr: event.target.value })
            }
            className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-xs font-medium text-muted">Anteckning</span>
          <textarea
            rows={2}
            value={data.anteckning ?? ""}
            onChange={(event) =>
              onChange({ ...data, anteckning: event.target.value })
            }
            placeholder="T.ex. avvikelser, åtgärdade branddörrar, planerat underhåll rökgasfläkt"
            className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
          />
        </label>
      </div>
    </div>
  );
}
