"use client";

import type { FastighetsHus } from "@/components/underhallsplan/fastighets-ytor";
import {
  ettTakPerHus,
  joinTakAdresser,
  nyttTakNamn,
  parseTakAdresser,
  sattHusPaTak,
  slaIhopTillEttTak,
  TAK_KOMPONENT_NAMN,
  takVisningsnamn,
  type TakEnhet,
} from "@/components/underhallsplan/tak-enheter";

type TakUppsattningPanelProps = {
  hus: FastighetsHus[];
  tak: TakEnhet[];
  foreningsAdresser: string[];
  harInnehall: (takNamn: string) => boolean;
  onChange: (next: TakEnhet[]) => void;
  onAdress: (takNamn: string, adress: string) => void;
  onBenamning?: (takNamn: string, benamning: string) => void;
};

function valKnapp(vald: boolean, onClick: () => void, etikett: string) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        vald
          ? "border-primary bg-[#e2f0e6] text-primary-dark"
          : "border-border bg-white text-foreground hover:border-primary/50"
      }`}
    >
      {vald ? "✓ " : ""}
      {etikett}
    </button>
  );
}

export function TakUppsattningPanel({
  hus,
  tak,
  foreningsAdresser,
  harInnehall,
  onChange,
  onAdress,
  onBenamning,
}: TakUppsattningPanelProps) {
  const flerHus = hus.length > 1;
  const arGemensamt = tak.length === 1 && tak[0].husIds.length === hus.length;
  const arPerHus =
    flerHus &&
    tak.length === hus.length &&
    tak.every((t) => t.husIds.length === 1);

  function bekraftaBorttag(next: TakEnhet[]): boolean {
    const kvar = new Set(next.map((t) => t.namn));
    const medInnehall = tak
      .filter((t) => !kvar.has(t.namn) && harInnehall(t.namn))
      .map((t) => t.namn);
    if (medInnehall.length === 0) return true;
    return window.confirm(
      `${medInnehall.join(", ")} har ifyllda takpartier eller komponenter som tas bort. Fortsätta?`,
    );
  }

  function andra(next: TakEnhet[]) {
    if (!bekraftaBorttag(next)) return;
    onChange(next);
  }

  function laggTillTak() {
    const ledigtHus = hus.find((h) => !tak.some((t) => t.husIds.includes(h.id)));
    const namn = nyttTakNamn(
      tak.map((t) => t.namn),
      ledigtHus?.husnummer,
    );
    onChange([
      ...tak,
      {
        namn,
        husIds: ledigtHus ? [ledigtHus.id] : [],
        adress: ledigtHus?.husnummer.trim() || foreningsAdresser[0] || undefined,
        benamning: tak.length === 0 ? "huvudtak" : undefined,
      },
    ]);
  }

  function toggleAdress(t: TakEnhet, adress: string, med: boolean) {
    const nu = parseTakAdresser(t.adress);
    const next = med
      ? joinTakAdresser([...nu, adress])
      : joinTakAdresser(nu.filter((a) => a !== adress));
    onAdress(t.namn, next);
    onChange(
      tak.map((x) => (x.namn === t.namn ? { ...x, adress: next } : x)),
    );
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-[#eef6f0]/50 px-3 py-3">
      <p className="text-sm font-semibold text-foreground">
        Tak på fastigheten
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Varje tak har egen identitet med adress och eventuell benämning (t.ex.
        &quot;Storgatan 12–14, huvudtak&quot;). Flera adresser kan tillhöra samma
        tak, och samma adress kan ha flera tak. Öppna respektive tak nedan för
        att registrera yta, beläggning och komponenter på samma ställe.
      </p>

      {flerHus ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {valKnapp(
            arGemensamt,
            () => andra(slaIhopTillEttTak(tak, hus)),
            "Husen sitter ihop — ett gemensamt tak",
          )}
          {valKnapp(
            arPerHus,
            () => andra(ettTakPerHus(tak, hus)),
            "Fristående hus — ett tak per hus",
          )}
        </div>
      ) : null}

      <ul className="mt-3 space-y-2">
        {tak.map((t) => {
          const valdaAdresser = parseTakAdresser(t.adress);
          const visning = takVisningsnamn({
            komponentNamn: t.namn,
            adress: t.adress,
            benamning: t.benamning,
          });
          return (
            <li
              key={t.namn}
              className="rounded-lg border border-[#d4e8da] bg-white px-3 py-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{visning}</p>
                {t.namn !== TAK_KOMPONENT_NAMN ? (
                  <button
                    type="button"
                    onClick={() => andra(tak.filter((x) => x.namn !== t.namn))}
                    className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-50"
                  >
                    Ta bort tak
                  </button>
                ) : null}
              </div>

              <label className="mt-2 block max-w-md text-xs text-muted">
                Benämning (valfritt)
                <input
                  type="text"
                  value={t.benamning ?? ""}
                  onChange={(e) => {
                    const benamning = e.target.value;
                    onChange(
                      tak.map((x) =>
                        x.namn === t.namn ? { ...x, benamning } : x,
                      ),
                    );
                    onBenamning?.(t.namn, benamning);
                  }}
                  placeholder="t.ex. huvudtak, gårdsbyggnad"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm text-foreground"
                />
              </label>

              {foreningsAdresser.length > 0 ? (
                <div className="mt-2">
                  <p className="text-xs font-medium text-muted">
                    Adresser (från grunduppgifter)
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    {foreningsAdresser.map((adress) => (
                      <label
                        key={adress}
                        className="flex items-center gap-1.5 text-xs text-foreground"
                      >
                        <input
                          type="checkbox"
                          checked={valdaAdresser.includes(adress)}
                          onChange={(e) =>
                            toggleAdress(t, adress, e.target.checked)
                          }
                        />
                        {adress}
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <label className="mt-2 block max-w-md text-xs text-muted">
                  Adress
                  <input
                    type="text"
                    value={t.adress ?? ""}
                    onChange={(e) => {
                      onAdress(t.namn, e.target.value);
                      onChange(
                        tak.map((x) =>
                          x.namn === t.namn
                            ? { ...x, adress: e.target.value }
                            : x,
                        ),
                      );
                    }}
                    placeholder="t.ex. Storgatan 5"
                    className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm text-foreground"
                  />
                </label>
              )}

              {flerHus ? (
                <div className="mt-2">
                  <p className="text-xs font-medium text-muted">
                    Byggnader som ingår
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    {hus.map((h) => (
                      <label
                        key={h.id}
                        className="flex items-center gap-1.5 text-xs text-foreground"
                      >
                        <input
                          type="checkbox"
                          checked={t.husIds.includes(h.id)}
                          onChange={(e) =>
                            onChange(
                              sattHusPaTak(
                                tak,
                                t.namn,
                                h.id,
                                e.target.checked,
                              ),
                            )
                          }
                        />
                        {h.husnummer.trim() || "Byggnad"}
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
              {flerHus && t.husIds.length === 0 ? (
                <p className="mt-1 text-[11px] text-amber-800">
                  Inget hus valt för taket.
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={laggTillTak}
        className="mt-3 rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary-dark hover:bg-[#e2f0e6]"
      >
        + Lägg till tak
      </button>
    </div>
  );
}
