"use client";

import {
  balkongAtgardAlternativ,
  balkongAtgardEtikett,
  balkongTypEtikett,
  balkongTyper,
  normaliseraBalkongPost,
  type BalkongAtgardId,
  type BalkongPost,
  type BalkongTypId,
} from "@/components/underhallsplan/balkonger";

type BalkongRenoveringFaltProps = {
  balkongTyp: string;
  balkongAtgard: string;
  balkongRadId: string;
  registerPoster?: BalkongPost[];
  onChange: (patch: {
    balkongTyp?: string;
    balkongAtgard?: string;
    balkongRadId?: string;
  }) => void;
};

export function BalkongRenoveringFalt({
  balkongTyp,
  balkongAtgard,
  balkongRadId,
  registerPoster = [],
  onChange,
}: BalkongRenoveringFaltProps) {
  const normaliserade = registerPoster.map(normaliseraBalkongPost);
  const valtAtgard = (balkongAtgard || "renovering") as BalkongAtgardId;
  const valtTyp = balkongTyp as BalkongTypId;
  const atgardInfo = balkongAtgardAlternativ.find((a) => a.id === valtAtgard);
  const typInfo = balkongTyper.find((t) => t.id === valtTyp);

  function väljRegisterRad(radId: string) {
    if (!radId) {
      onChange({ balkongRadId: "" });
      return;
    }
    const rad = normaliserade.find((p) => p.id === radId);
    if (!rad) {
      onChange({ balkongRadId: radId });
      return;
    }
    onChange({
      balkongRadId: radId,
      balkongTyp: rad.balkongTyp,
      balkongAtgard: rad.atgard,
    });
  }

  return (
    <div className="rounded-lg border border-primary/25 bg-[#fafcfa] p-3 space-y-3">
      <p className="text-xs font-semibold text-primary-dark">
        Balkong — typ och åtgärd
      </p>
      <p className="text-xs leading-relaxed text-muted">
        Ange om arbetet gäller renovering av befintlig balkong, ny inskaffning
        (t.ex. tillbyggd modul) eller ny investering. Vid flera balkongtyper i
        fastigheten — välj vilken typ arbetet avser.
      </p>

      {normaliserade.length > 0 && (
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">
            Koppla till balkong i registret (valfritt)
          </span>
          <select
            value={balkongRadId}
            onChange={(e) => väljRegisterRad(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="">— Välj balkongrad —</option>
            {normaliserade.map((p) => (
              <option key={p.id} value={p.id}>
                {p.namn.trim() || balkongTypEtikett(p.balkongTyp)} (
                {balkongAtgardEtikett(p.atgard)})
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">Åtgärd</span>
          <select
            value={valtAtgard}
            onChange={(e) =>
              onChange({ balkongAtgard: e.target.value as BalkongAtgardId })
            }
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          >
            {balkongAtgardAlternativ.map((alt) => (
              <option key={alt.id} value={alt.id}>
                {alt.etikett}
              </option>
            ))}
          </select>
          {atgardInfo?.beskrivning && (
            <span className="mt-1 block text-xs text-muted">
              {atgardInfo.beskrivning}
            </span>
          )}
        </label>

        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">Balkongtyp</span>
          <select
            value={balkongTyp || "utvandig-balkong"}
            onChange={(e) =>
              onChange({
                balkongTyp: e.target.value as BalkongTypId,
                balkongRadId: "",
              })
            }
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          >
            {balkongTyper.map((t) => (
              <option key={t.id} value={t.id}>
                {t.etikett}
              </option>
            ))}
          </select>
          {typInfo?.beskrivning && (
            <span className="mt-1 block text-xs text-muted">
              {typInfo.beskrivning}
            </span>
          )}
        </label>
      </div>
    </div>
  );
}

export function formateraBalkongRenoveringMeta(post: {
  balkongTyp?: BalkongTypId;
  balkongAtgard?: BalkongAtgardId;
}): string | null {
  const delar: string[] = [];
  if (post.balkongAtgard) {
    delar.push(balkongAtgardEtikett(post.balkongAtgard));
  }
  if (post.balkongTyp) {
    delar.push(balkongTypEtikett(post.balkongTyp));
  }
  return delar.length > 0 ? delar.join(" · ") : null;
}
