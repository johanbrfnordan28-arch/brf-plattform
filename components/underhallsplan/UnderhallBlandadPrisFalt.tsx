"use client";

import { formatKr } from "@/components/underhallsplan/besiktningar";
import { BlandadStyckPosterLista } from "@/components/underhallsplan/BlandadStyckPosterLista";
import {
  beraknaImplikeradeEnhetspriser,
  hamtaStyckPosterFranUnderkomponent,
  patchFordelaTotalHalvaHalva,
  parseBlandadFranUnderkomponent,
  summeraBlandadPris,
  UNDERHALL_BLANDAD_RESERVATION,
} from "@/components/underhallsplan/underhall-blandad-pris";
import type { UnderkomponentRad } from "@/components/underhallsplan/komponentregister";

type UnderhallBlandadPrisFaltProps = {
  rad: UnderkomponentRad;
  onChange: (patch: Partial<UnderkomponentRad>) => void;
  ytaHint?: string;
};

export function UnderhallBlandadPrisFalt({
  rad,
  onChange,
  ytaHint,
}: UnderhallBlandadPrisFaltProps) {
  const delar = parseBlandadFranUnderkomponent(rad);
  const summering = summeraBlandadPris(delar);
  const impl = beraknaImplikeradeEnhetspriser(delar);
  const styckPoster = hamtaStyckPosterFranUnderkomponent(rad);

  function uppdatera(patch: Partial<UnderkomponentRad>) {
    onChange({ ...patch, underhallPrisEnhet: "blandad" });
  }

  return (
    <div className="space-y-3 rounded-lg border border-primary/25 bg-white p-3">
      <p className="text-xs leading-relaxed text-muted">
        {UNDERHALL_BLANDAD_RESERVATION}
      </p>

      <div className="rounded-md border border-border/80 bg-background/50 p-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-primary-dark">
          Yta
        </p>
        <div className="mt-2 grid max-w-md grid-cols-2 gap-2">
          <label className="block text-sm">
            <span className="text-xs text-muted">m²</span>
            <input
              type="number"
              min={0}
              step={0.1}
              value={rad.värde}
              onChange={(e) => uppdatera({ värde: e.target.value })}
              className="mt-0.5 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs text-muted">kr/m²</span>
            <input
              type="number"
              min={0}
              step={10}
              value={rad.underhallEnhetsprisKr ?? ""}
              onChange={(e) =>
                uppdatera({ underhallEnhetsprisKr: e.target.value })
              }
              className="mt-0.5 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
            />
          </label>
        </div>
        {summering.delKvmKr > 0 && (
          <p className="mt-1 text-xs text-primary-dark">
            Ytdel: {formatKr(summering.delKvmKr)}
          </p>
        )}
      </div>

      <div className="rounded-md border border-border/80 bg-background/50 p-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-primary-dark">
          Styck — flera poster
        </p>
        <p className="mt-0.5 text-[10px] text-muted">
          T.ex. ställning, etablering, takluckor. Varje rad: benämning, antal och
          kr/st.
        </p>
        <div className="mt-2">
          <BlandadStyckPosterLista
            poster={styckPoster}
            onChange={(poster) =>
              uppdatera({ underhallStyckPoster: poster })
            }
          />
        </div>
      </div>

      {ytaHint && <p className="text-[10px] text-muted">{ytaHint}</p>}

      <label className="block text-sm">
        <span className="text-xs font-medium text-muted">
          Total kostnad (offert / entreprenad) — styr budgeten
        </span>
        <input
          type="number"
          min={0}
          step={1000}
          value={rad.underhallKostnadKr ?? ""}
          onChange={(e) => uppdatera({ underhallKostnadKr: e.target.value })}
          placeholder="Tomt = summa yta + styck om ifyllda"
          className="mt-1 w-full max-w-xs rounded-lg border border-border px-3 py-2 text-sm"
        />
      </label>

      <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border pt-2">
        <div className="text-sm">
          <span className="text-muted">Beräknad summa (yta + styck): </span>
          <span className="font-semibold text-foreground">
            {summering.beraknadSummaKr > 0
              ? formatKr(summering.beraknadSummaKr)
              : "—"}
          </span>
        </div>
        <div className="text-sm">
          <span className="text-muted">Används i plan: </span>
          <span className="text-lg font-bold text-primary-dark">
            {summering.effektivTotalKr > 0
              ? formatKr(summering.effektivTotalKr)
              : "—"}
          </span>
        </div>
      </div>

      {summering.totalSkiljerSig && (
        <p className="rounded-md border border-amber-200 bg-amber-50/90 px-2.5 py-1.5 text-xs text-amber-950">
          Totalen skiljer sig från ytdel + styckdel med{" "}
          <strong>{formatKr(Math.abs(summering.restKr))}</strong>
          {summering.restKr > 0 ? " (övrigt i totalen)" : ""}.
        </p>
      )}

      {impl && (
        <div className="rounded-md border border-[#d4e8da] bg-[#eef6f0]/60 px-2.5 py-2 text-xs text-foreground">
          <p className="font-medium text-primary-dark">Fördelningsförslag</p>
          <p className="mt-0.5 text-muted">{impl.forklaring}</p>
          {impl.krPerKvm != null && (
            <p className="mt-1">
              Yta: ca {impl.krPerKvm.toLocaleString("sv-SE")} kr/m²
            </p>
          )}
          {impl.styckPoster && impl.styckPoster.length > 0 && (
            <ul className="mt-1 list-inside list-disc text-muted">
              {impl.styckPoster
                .filter((p) => p.antal && p.enhetsprisKr)
                .map((p) => (
                  <li key={p.id}>
                    {p.etikett || "Styck"}: ca{" "}
                    {Number.parseInt(p.enhetsprisKr, 10).toLocaleString("sv-SE")}{" "}
                    kr/st
                  </li>
                ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() =>
              onChange({
                ...patchFordelaTotalHalvaHalva(rad),
                underhallPrisEnhet: "blandad",
              })
            }
            className="mt-2 text-xs font-semibold text-primary-dark underline"
          >
            Applicera schablon (50/50 yta / styckposter)
          </button>
        </div>
      )}
    </div>
  );
}
