"use client";

import type { RadiatorTypPost } from "@/components/underhallsplan/radiator-typer";
import {
  byggVarmeStamOversikt,
  type VarmeSystemTypId,
  type VarmestamPost,
} from "@/components/underhallsplan/varmestammar";

type Props = {
  post: VarmestamPost;
  radiatorTyper?: RadiatorTypPost[];
  systemTyp?: VarmeSystemTypId;
};

/** Kompakt översikt inbyggd i respektive värmestam. */
export function VarmeStamOversiktKort({
  post,
  radiatorTyper = [],
  systemTyp = "tva-ror",
}: Props) {
  const s = byggVarmeStamOversikt(post, radiatorTyper, systemTyp);
  const harInnehall =
    s.fakta.length > 0 ||
    s.radiatorer.length > 0 ||
    Boolean(s.tilloppsventil) ||
    Boolean(s.returventil);

  if (!harInnehall) return null;

  return (
    <div className="mb-4 rounded-xl border border-[#d4e8da] bg-gradient-to-br from-[#f3f8f5] to-white px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary-dark">
        Översikt för denna stam
      </p>
      <div
        className={`mt-2 grid gap-2 ${systemTyp === "tva-ror" ? "sm:grid-cols-2" : ""}`}
      >
        <p className="text-xs text-stone-700">
          <span className="block text-[10px] font-medium uppercase tracking-wide text-stone-500">
            {systemTyp === "tva-ror" ? "Tilloppsventil" : "Stamventil"}
          </span>
          {s.tilloppsventil}
          {s.tilloppHarBild ? " · bild" : ""}
        </p>
        {systemTyp === "tva-ror" ? (
          <p className="text-xs text-stone-700">
            <span className="block text-[10px] font-medium uppercase tracking-wide text-stone-500">
              Returventil
            </span>
            {s.returventil}
            {s.returHarBild ? " · bild" : ""}
          </p>
        ) : null}
      </div>
      {s.fakta.length > 0 ? (
        <dl className="mt-2 grid gap-x-4 gap-y-1 border-t border-[#e2ebe5] pt-2 sm:grid-cols-2">
          {s.fakta.map((f) => (
            <div
              key={f.etikett}
              className="flex justify-between gap-3 text-xs"
            >
              <dt className="text-stone-500">{f.etikett}</dt>
              <dd className="text-right font-medium text-stone-800">{f.varde}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {s.radiatorer.length > 0 ? (
        <ul className="mt-2 space-y-1 border-t border-[#e2ebe5] pt-2">
          {s.radiatorer.map((r, i) => (
            <li key={`${s.id}-r-${i}`} className="text-xs text-stone-700">
              {r.varde}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 border-t border-[#e2ebe5] pt-2 text-xs italic text-stone-500">
          Radiatorer anges nedan på denna stam.
        </p>
      )}
    </div>
  );
}
