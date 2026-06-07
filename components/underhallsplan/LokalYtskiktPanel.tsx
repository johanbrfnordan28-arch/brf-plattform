"use client";

import {
  formateraLokalYtskikt,
  hamtaLokalYtskiktMaterial,
  lokalYtskiktDelar,
  standardAtgardForMaterial,
  type LokalYtskiktDelId,
  type LokalYtskiktDelRad,
} from "@/components/underhallsplan/lokal-ytskikt";

type LokalYtskiktPanelProps = {
  rader: LokalYtskiktDelRad[];
  onChange: (rader: LokalYtskiktDelRad[]) => void;
};

export function LokalYtskiktPanel({ rader, onChange }: LokalYtskiktPanelProps) {
  function uppdateraRad(
    delId: LokalYtskiktDelId,
    patch: Partial<LokalYtskiktDelRad>,
  ) {
    onChange(
      rader.map((r) => (r.delId === delId ? { ...r, ...patch } : r)),
    );
  }

  function bytMaterial(delId: LokalYtskiktDelId, materialId: string) {
    uppdateraRad(delId, {
      materialId,
      atgardId: standardAtgardForMaterial(delId, materialId),
    });
  }

  const sammanfattning = formateraLokalYtskikt(rader);

  return (
    <div className="space-y-4 rounded-xl border-2 border-primary/20 bg-[#fafcfa] p-4">
      <div>
        <p className="text-sm font-semibold text-primary-dark">
          Väggar, golv och tak
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Välj material och planerad åtgärd per del. Yta i m² är valfritt men
          underlättar kostnadsplanering.
        </p>
      </div>

      <ul className="space-y-4">
        {lokalYtskiktDelar.map((delMall) => {
          const rad =
            rader.find((r) => r.delId === delMall.id) ??
            ({
              delId: delMall.id,
              aktiv: false,
              materialId: delMall.material[0]?.id ?? "",
              atgardId: delMall.material[0]?.atgarder[0]?.id ?? "",
              kvm: "",
            } satisfies LokalYtskiktDelRad);

          const material = hamtaLokalYtskiktMaterial(
            delMall.id,
            rad.materialId,
          );
          const atgarder = material?.atgarder ?? [];

          return (
            <li
              key={delMall.id}
              className="rounded-lg border border-border bg-white p-4"
            >
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={rad.aktiv}
                  onChange={(e) =>
                    uppdateraRad(delMall.id, { aktiv: e.target.checked })
                  }
                  className="mt-1 h-4 w-4 rounded border-border text-primary"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">
                    {delMall.etikett}
                  </span>
                  <span className="block text-xs text-muted">{delMall.hint}</span>
                </span>
              </label>

              {rad.aktiv && (
                <div className="mt-4 space-y-4 border-t border-dashed border-border pt-4">
                  <fieldset>
                    <legend className="text-xs font-medium text-muted">
                      Material
                    </legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {delMall.material.map((mat) => (
                        <button
                          key={mat.id}
                          type="button"
                          onClick={() => bytMaterial(delMall.id, mat.id)}
                          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                            rad.materialId === mat.id
                              ? "border-primary bg-[#e2f0e6] text-primary-dark"
                              : "border-border bg-background text-foreground hover:border-primary/50"
                          }`}
                        >
                          {mat.etikett}
                        </button>
                      ))}
                    </div>
                    {material?.beskrivning && (
                      <p className="mt-2 text-xs text-muted">
                        {material.beskrivning}
                      </p>
                    )}
                  </fieldset>

                  {atgarder.length > 0 && (
                    <fieldset>
                      <legend className="text-xs font-medium text-muted">
                        Planerad åtgärd
                      </legend>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {atgarder.map((atg) => (
                          <button
                            key={atg.id}
                            type="button"
                            onClick={() =>
                              uppdateraRad(delMall.id, { atgardId: atg.id })
                            }
                            className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                              rad.atgardId === atg.id
                                ? "border-primary bg-[#e2f0e6] font-medium text-primary-dark"
                                : "border-border bg-background text-foreground hover:border-primary/40"
                            }`}
                          >
                            {atg.etikett}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  <label className="block max-w-xs text-sm">
                    <span className="text-xs font-medium text-muted">
                      Yta (m², valfritt)
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={rad.kvm}
                      onChange={(e) =>
                        uppdateraRad(delMall.id, { kvm: e.target.value })
                      }
                      placeholder="t.ex. 45"
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                    />
                  </label>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {sammanfattning && (
        <p className="rounded-lg border border-[#d4e8da] bg-[#eef6f0]/60 px-3 py-2 text-xs text-primary-dark">
          {sammanfattning}
        </p>
      )}
    </div>
  );
}
