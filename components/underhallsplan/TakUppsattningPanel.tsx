"use client";

import type { FastighetsHus } from "@/components/underhallsplan/fastighets-ytor";
import {
  ettTakPerHus,
  flyttaHusTillTak,
  nyttTakNamn,
  slaIhopTillEttTak,
  TAK_KOMPONENT_NAMN,
  type TakEnhet,
} from "@/components/underhallsplan/tak-enheter";

type TakUppsattningPanelProps = {
  hus: FastighetsHus[];
  tak: TakEnhet[];
  foreningsAdresser: string[];
  harInnehall: (takNamn: string) => boolean;
  onChange: (next: TakEnhet[]) => void;
  onAdress: (takNamn: string, adress: string) => void;
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
        adress: ledigtHus?.husnummer.trim() || undefined,
      },
    ]);
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-[#eef6f0]/50 px-3 py-3">
      <p className="text-sm font-semibold text-foreground">
        Hur många tak har fastigheten?
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Sitter husen ihop slås taken ihop till ett tak. Fristående hus får ett
        tak var. Varje tak byggs sedan upp på samma sätt — takpartier med
        takform, ytskikt, yta och kulör, och därefter komponenter som nock,
        takfönster och skorstenar. Kostnaden sammanställs per tak.
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

      <datalist id="tak-adresser">
        {foreningsAdresser.map((a) => (
          <option key={a} value={a} />
        ))}
      </datalist>

      <ul className="mt-3 space-y-2">
        {tak.map((t) => (
          <li
            key={t.namn}
            className="rounded-lg border border-[#d4e8da] bg-white px-3 py-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{t.namn}</p>
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
              Adress
              <input
                type="text"
                list="tak-adresser"
                value={t.adress ?? ""}
                onChange={(e) => onAdress(t.namn, e.target.value)}
                placeholder="t.ex. Storgatan 5"
                className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm text-foreground"
              />
            </label>
            {flerHus ? (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
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
                          flyttaHusTillTak(tak, t.namn, h.id, e.target.checked),
                        )
                      }
                    />
                    {h.husnummer.trim() || "Byggnad"}
                  </label>
                ))}
              </div>
            ) : null}
            {flerHus && t.husIds.length === 0 ? (
              <p className="mt-1 text-[11px] text-amber-800">
                Inget hus valt för taket.
              </p>
            ) : null}
          </li>
        ))}
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
