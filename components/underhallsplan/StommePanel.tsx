"use client";

import {
  anskaffningskallaEtikett,
  beraknaStommeKomponentvarde,
  beraknaUnderkomponentBelopp,
  FAR_STOMME_ANDEL_MAX,
  FAR_STOMME_ANDEL_MIN,
  FAR_STOMME_FORESLAGEN_PROCENT,
  formateraKr,
  materialEtikett,
  parseKrBelopp,
  STOMME_ANSKAFFNINGSKALLOR,
  STOMME_KONSTRUKTIONSDELAR,
  STOMME_MATERIAL,
  STOMME_SKICK,
  STOMME_UNDERKOMPONENTER,
  summeraUnderkomponentProcent,
  underkomponentFordelningOk,
  type StommeData,
  type StommeKonstruktionsdelId,
  type StommeMaterialId,
  type StommeSkickId,
  type StommeUnderkomponentId,
} from "@/components/underhallsplan/stomme";

type StommePanelProps = {
  data: StommeData;
  /** Föreslagen yta från grunduppgifter (boarea), m². */
  forslagKvm?: string;
  värdeKvm: string;
  onChange: (data: StommeData) => void;
  onVärdeKvmChange: (värde: string) => void;
};

function patch(
  data: StommeData,
  del: Partial<StommeData>,
  onChange: (data: StommeData) => void,
) {
  onChange({ ...data, ...del });
}

export function StommePanel({
  data,
  forslagKvm,
  värdeKvm,
  onChange,
  onVärdeKvmChange,
}: StommePanelProps) {
  const beraknat = beraknaStommeKomponentvarde(data);
  const underBelopp = beraknaUnderkomponentBelopp(data);
  const procentSumma = summeraUnderkomponentProcent(data);
  const fordOk = underkomponentFordelningOk(data);

  function sattDel(
    id: StommeKonstruktionsdelId,
    uppdatera: Partial<(typeof data.konstruktionsdelar)[number]>,
  ) {
    const konstruktionsdelar = data.konstruktionsdelar.map((d) =>
      d.id === id ? { ...d, ...uppdatera } : d,
    );
    patch(data, { konstruktionsdelar }, onChange);
  }

  function sattAndel(id: StommeUnderkomponentId, procent: string) {
    const underkomponentAndelar = (data.underkomponentAndelar ?? []).map((a) =>
      a.id === id ? { ...a, procent } : a,
    );
    patch(data, { underkomponentAndelar }, onChange);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-[#d4e8da] bg-[#eef6f0]/50 px-3 py-2.5">
        <p className="text-xs font-semibold text-primary-dark">
          Stomme och grund — samlad komponent
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Här registrerar ni den bärande stommen. Fasadbeklädnad och icke
          bärande innerväggar hör till andra delar i planen — undvik
          dubbelregistrering.
        </p>
      </div>

      <section className="space-y-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            Konstruktionsdelar som ingår
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Välj en eller flera delar och ange material för respektive del.
          </p>
        </div>
        <ul className="space-y-2">
          {STOMME_KONSTRUKTIONSDELAR.map((def) => {
            const rad = data.konstruktionsdelar.find((d) => d.id === def.id);
            const vald = Boolean(rad?.vald);
            return (
              <li
                key={def.id}
                className="rounded-lg border border-border/80 bg-white px-3 py-2.5"
              >
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={vald}
                    onChange={(e) =>
                      sattDel(def.id, {
                        vald: e.target.checked,
                        materialId: e.target.checked
                          ? rad?.materialId || ""
                          : "",
                      })
                    }
                    className="mt-0.5"
                  />
                  <span className="min-w-0 flex-1 text-sm text-foreground">
                    {def.etikett}
                  </span>
                </label>
                {vald && (
                  <div className="mt-2 ml-6 grid gap-2 sm:grid-cols-2">
                    <label className="block text-xs text-muted">
                      Material
                      <select
                        value={rad?.materialId ?? ""}
                        onChange={(e) =>
                          sattDel(def.id, {
                            materialId: e.target.value as StommeMaterialId | "",
                          })
                        }
                        className="mt-0.5 w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm text-foreground"
                      >
                        <option value="">— välj —</option>
                        {STOMME_MATERIAL.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.etikett}
                          </option>
                        ))}
                      </select>
                    </label>
                    {rad?.materialId === "annat" && (
                      <label className="block text-xs text-muted">
                        Ange material
                        <input
                          type="text"
                          value={rad.materialAnnat ?? ""}
                          onChange={(e) =>
                            sattDel(def.id, { materialAnnat: e.target.value })
                          }
                          className="mt-0.5 w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm"
                        />
                      </label>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">Kommentar</span>
          <textarea
            rows={2}
            value={data.kommentar ?? ""}
            onChange={(e) =>
              patch(
                data,
                { kommentar: e.target.value },
                onChange
              )
            }
            placeholder="T.ex. blandad stomme, källarväggar i betong, ovanmark trä…"
            className="mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm"
          />
        </label>
        <label className="block max-w-xs text-sm">
          <span className="text-xs font-medium text-muted">
            Yta som underlag (m²)
          </span>
          <input
            type="number"
            min={0}
            step={0.1}
            value={värdeKvm}
            onChange={(e) => onVärdeKvmChange(e.target.value)}
            placeholder={forslagKvm || "t.ex. boarea"}
            className="mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm"
          />
          {forslagKvm && forslagKvm !== värdeKvm.trim() && (
            <button
              type="button"
              onClick={() => onVärdeKvmChange(forslagKvm)}
              className="mt-1 text-xs font-medium text-primary-dark underline"
            >
              Hämta {forslagKvm} m² från grunduppgifter
            </button>
          )}
        </label>
      </section>

      <section className="space-y-3 border-t border-[#d4e8da] pt-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            Byggnadens anskaffningsvärde
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            Historiskt anskaffningsvärde för redovisning. Markvärdet anges
            separat och ingår inte i stomme och grund. Fältet får lämnas tomt om
            uppgiften saknas.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-medium text-muted">
              Byggnad (kr, exkl. mark)
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={data.byggnadsAnskaffningsvardeKr ?? ""}
              onChange={(e) =>
                patch(
                  data,
                  { byggnadsAnskaffningsvardeKr: e.target.value },
                  onChange
                )
              }
              placeholder="t.ex. 20000000"
              className="mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-medium text-muted">
              Markvärde (kr, separat)
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={data.markAnskaffningsvardeKr ?? ""}
              onChange={(e) =>
                patch(
                  data,
                  { markAnskaffningsvardeKr: e.target.value },
                  onChange
                )
              }
              placeholder="Ingår inte i stommen"
              className="mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-medium text-muted">Källa</span>
            <select
              value={data.anskaffningskalla ?? ""}
              onChange={(e) =>
                patch(
                  data,
                  {
                    anskaffningskalla: e.target
                      .value as StommeData["anskaffningskalla"],
                  },
                  onChange
                )
              }
              className="mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm"
            >
              <option value="">— välj —</option>
              {STOMME_ANSKAFFNINGSKALLOR.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.etikett}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs font-medium text-muted">Årtal</span>
            <input
              type="number"
              min={1800}
              max={2100}
              value={data.anskaffningsAr ?? ""}
              onChange={(e) =>
                patch(
                  data,
                  { anskaffningsAr: e.target.value },
                  onChange
                )
              }
              className="mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm"
            />
          </label>
        </div>
        {data.anskaffningskalla === "annat" && (
          <label className="block text-sm">
            <span className="text-xs font-medium text-muted">
              Beskriv underlaget
            </span>
            <input
              type="text"
              value={data.anskaffningskallaAnnat ?? ""}
              onChange={(e) =>
                patch(
                  data,
                  { anskaffningskallaAnnat: e.target.value },
                  onChange
                )
              }
              className="mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm"
            />
          </label>
        )}
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">
            Kommentar till anskaffningsvärdet
          </span>
          <textarea
            rows={2}
            value={data.anskaffningsKommentar ?? ""}
            onChange={(e) =>
              patch(
                data,
                { anskaffningsKommentar: e.target.value },
                onChange
              )
            }
            className="mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm"
          />
        </label>
      </section>

      <section className="space-y-3 border-t border-[#d4e8da] pt-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            FAR:s vägledande fördelning
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            FAR anger cirka {FAR_STOMME_ANDEL_MIN}–{FAR_STOMME_ANDEL_MAX} % av
            byggnadens anskaffningsvärde för stomme och grund.{" "}
            {FAR_STOMME_FORESLAGEN_PROCENT} % är ett redigerbart exempelvärde —
            inte ett fastställt värde för föreningen. Detta är en
            schablonmässig redovisningsfördelning, inte en bedömning av framtida
            underhållskostnad. Vid fullständig komponentfördelning ska alla
            komponenter tillsammans motsvara 100 % av byggnadens
            anskaffningsvärde.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-medium text-muted">
              Andel stomme och grund (%)
            </span>
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={data.farAndelProcent ?? String(FAR_STOMME_FORESLAGEN_PROCENT)}
              onChange={(e) =>
                patch(
                  data,
                  { farAndelProcent: e.target.value },
                  onChange
                )
              }
              className="mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-medium text-muted">
              Eget dokumenterat komponentvärde (kr)
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={data.egetKomponentvardeKr ?? ""}
              onChange={(e) =>
                patch(
                  data,
                  { egetKomponentvardeKr: e.target.value },
                  onChange
                )
              }
              placeholder="Lämna tomt för FAR-förslag"
              className="mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm"
            />
          </label>
        </div>
        <div className="rounded-lg border border-[#d4e8da] bg-white px-3 py-2.5 text-xs text-foreground">
          {beraknat.byggnadsAnskaffningKr > 0 ? (
            <p>
              Byggnadens anskaffningsvärde:{" "}
              <span className="font-medium tabular-nums">
                {formateraKr(beraknat.byggnadsAnskaffningKr)} kr
              </span>
              {" · "}
              Stomme och grund:{" "}
              <span className="font-medium tabular-nums">
                {formateraKr(beraknat.farProcent)} %
              </span>
              {" · "}
              Beräknat komponentvärde:{" "}
              <span className="font-semibold tabular-nums text-primary-dark">
                {formateraKr(beraknat.komponentvardeKr)} kr
              </span>
              {beraknat.kalla === "eget" ? " (dokumenterat)" : " (FAR-förslag)"}
            </p>
          ) : parseKrBelopp(data.egetKomponentvardeKr) > 0 ? (
            <p>
              Dokumenterat komponentvärde:{" "}
              <span className="font-semibold tabular-nums text-primary-dark">
                {formateraKr(beraknat.komponentvardeKr)} kr
              </span>
            </p>
          ) : (
            <p className="text-muted">
              Ange byggnadens anskaffningsvärde eller ett eget komponentvärde för
              att beräkna beloppet. Exempel: 20 000 000 kr × 65 % = 13 000 000 kr.
            </p>
          )}
          {anskaffningskallaEtikett(data) && (
            <p className="mt-1 text-muted">
              Källa: {anskaffningskallaEtikett(data)}
              {data.anskaffningsAr?.trim()
                ? ` (${data.anskaffningsAr.trim()})`
                : ""}
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3 border-t border-[#d4e8da] pt-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            Uppdelning (frivillig)
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            Standardvalet är en samlad komponent. Uppdelning på underkomponenter
            är frivillig och presenteras inte som en officiell FAR-schablon.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              patch(
                data,
                { uppdelning: "samlad" },
                onChange
              )
            }
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
              data.uppdelning !== "uppdelad"
                ? "border-primary bg-[#e2f0e6] text-primary-dark"
                : "border-border bg-white text-muted hover:bg-[#f7f9f8]"
            }`}
          >
            Samlad komponent — stomme och grund
          </button>
          <button
            type="button"
            onClick={() =>
              patch(
                data,
                { uppdelning: "uppdelad" },
                onChange
              )
            }
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
              data.uppdelning === "uppdelad"
                ? "border-primary bg-[#e2f0e6] text-primary-dark"
                : "border-border bg-white text-muted hover:bg-[#f7f9f8]"
            }`}
          >
            Dela upp stomme och grund
          </button>
        </div>

        {data.uppdelning === "uppdelad" && (
          <div className="space-y-2 rounded-lg border border-border/80 bg-white p-3">
            <p className="text-xs text-muted">
              Fördela huvudkomponentens värde procentuellt. Beloppen beräknas
              automatiskt. Summan ska bli 100 %.
            </p>
            <ul className="space-y-2">
              {STOMME_UNDERKOMPONENTER.map((u) => {
                const andel = data.underkomponentAndelar?.find(
                  (a) => a.id === u.id,
                );
                const ber = underBelopp.find((b) => b.id === u.id);
                return (
                  <li
                    key={u.id}
                    className="flex flex-wrap items-end gap-2 border-b border-border/50 pb-2 last:border-0 last:pb-0"
                  >
                    <label className="min-w-[10rem] flex-1 text-xs text-muted">
                      {u.etikett}
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        value={andel?.procent ?? ""}
                        onChange={(e) => sattAndel(u.id, e.target.value)}
                        placeholder="%"
                        className="mt-0.5 w-full max-w-[7rem] rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm"
                      />
                    </label>
                    <p className="pb-1.5 text-xs tabular-nums text-foreground">
                      {ber && ber.beloppKr > 0
                        ? `${formateraKr(ber.beloppKr)} kr`
                        : "—"}
                    </p>
                  </li>
                );
              })}
            </ul>
            <p
              className={`text-xs font-medium ${
                fordOk ? "text-primary-dark" : "text-amber-800"
              }`}
            >
              Summa: {formateraKr(procentSumma)} %
              {fordOk ? " ✓" : " — justera så att summan blir 100 %"}
            </p>
          </div>
        )}
      </section>

      <section className="space-y-3 border-t border-[#d4e8da] pt-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            Skick och underhåll
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            Stommen är normalt mycket långlivad. Planen föreslår inte byte av
            hela stommen efter ett visst antal år. Registrera skick,
            observationer och konkreta reparations- eller förstärkningsåtgärder.
            Planerade kostnader ska avse verkliga underhållsåtgärder — inte
            stommens historiska anskaffningsvärde (kostnader justeras i steg 3).
          </p>
        </div>
        <label className="block max-w-md text-sm">
          <span className="text-xs font-medium text-muted">
            Konstruktionens skick
          </span>
          <select
            value={data.skick ?? ""}
            onChange={(e) =>
              patch(
                data,
                { skick: e.target.value as StommeSkickId },
                onChange
              )
            }
            className="mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm"
          >
            <option value="">— välj —</option>
            {STOMME_SKICK.map((s) => (
              <option key={s.id} value={s.id}>
                {s.etikett}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">
            Sprickor, sättningar, fuktskador eller andra observationer
          </span>
          <textarea
            rows={2}
            value={data.skadorAnteckning ?? ""}
            onChange={(e) =>
              patch(
                data,
                { skadorAnteckning: e.target.value },
                onChange
              )
            }
            className="mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">
            Genomförda undersökningar
          </span>
          <textarea
            rows={2}
            value={data.undersokningarAnteckning ?? ""}
            onChange={(e) =>
              patch(
                data,
                { undersokningarAnteckning: e.target.value },
                onChange
              )
            }
            placeholder="T.ex. geoteknisk utredning, besiktning, sprickövervakning…"
            className="mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm"
          />
        </label>
        <label className="flex cursor-pointer items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(data.fortsattKontroll)}
            onChange={(e) =>
              patch(
                data,
                { fortsattKontroll: e.target.checked },
                onChange
              )
            }
            className="mt-0.5"
          />
          <span>Behov av fortsatt kontroll / uppföljning</span>
        </label>
        {data.fortsattKontroll && (
          <label className="block text-sm">
            <span className="text-xs font-medium text-muted">
              Fortsatt kontroll — anteckning
            </span>
            <textarea
              rows={2}
              value={data.fortsattKontrollAnteckning ?? ""}
              onChange={(e) =>
                patch(
                  data,
                  { fortsattKontrollAnteckning: e.target.value },
                  onChange
                )
              }
              className="mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm"
            />
          </label>
        )}
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">
            Konkreta reparations- eller förstärkningsåtgärder
          </span>
          <textarea
            rows={2}
            value={data.atgarderAnteckning ?? ""}
            onChange={(e) =>
              patch(
                data,
                { atgarderAnteckning: e.target.value },
                onChange
              )
            }
            placeholder="T.ex. injektering, förstärkning av bjälklag, dränering…"
            className="mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm"
          />
        </label>
      </section>

      <section className="space-y-3 border-t border-[#d4e8da] pt-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            Underhållsansvar
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            Redovisningsmässig komponentindelning (K3/FAR) är inte detsamma som
            föreningens underhållsansvar. Utgå från bostadsrättslagen och
            föreningens stadgar. Kostnader som hör till bostadsrättshavarens
            underhållsansvar ska inte automatiskt belasta föreningens
            underhållsbudget.
          </p>
        </div>
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">
            Anteckning om gränsdragning / ansvar
          </span>
          <textarea
            rows={2}
            value={data.underhallsansvarAnteckning ?? ""}
            onChange={(e) =>
              patch(
                data,
                { underhallsansvarAnteckning: e.target.value },
                onChange
              )
            }
            placeholder="T.ex. bärande väggar = föreningen; lägenhetsinnerväggar = medlem…"
            className="mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm"
          />
        </label>
      </section>

      {data.konstruktionsdelar.some((d) => d.vald) && (
        <p className="text-[11px] text-muted">
          Valda delar:{" "}
          {data.konstruktionsdelar
            .filter((d) => d.vald)
            .map((d) => {
              const etikett =
                STOMME_KONSTRUKTIONSDELAR.find((x) => x.id === d.id)?.etikett ??
                d.id;
              const mat = materialEtikett(d.materialId, d.materialAnnat);
              return mat ? `${etikett} (${mat})` : etikett;
            })
            .join(" · ")}
        </p>
      )}
    </div>
  );
}
