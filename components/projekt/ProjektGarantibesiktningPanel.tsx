"use client";

import {
  beraknaSenastGarantibesiktning,
  formatSvensktDatum,
  GARANTI_BESIKTNING_STANDARD_AR,
  hamtaAktivaGarantiPåminnelser,
  idagIso,
  månaderKvarTill,
  type GarantibesiktningPåminnelse,
  type GarantibesiktningStatus,
  type PåminnelseNivå,
} from "@/components/projekt/garantibesiktning";

type ProjektGarantibesiktningPanelProps = {
  status: GarantibesiktningStatus;
  onChange: (status: GarantibesiktningStatus) => void;
  onÖppnaMapp?: (mappId: "garantibesiktning" | "besiktningar") => void;
};

function nivåKlass(nivå: PåminnelseNivå): string {
  switch (nivå) {
    case "försenad":
      return "border-red-300 bg-red-50 text-red-950";
    case "kritisk":
      return "border-red-200 bg-red-50/80 text-red-900";
    case "varning":
      return "border-amber-300 bg-amber-50 text-amber-950";
    default:
      return "border-primary/30 bg-[#eef6f0] text-primary-dark";
  }
}

function PåminnelseKort({
  påminnelse,
  onAvfärda,
}: {
  påminnelse: GarantibesiktningPåminnelse;
  onAvfärda: () => void;
}) {
  return (
    <div className={`rounded-lg border px-4 py-3 ${nivåKlass(påminnelse.nivå)}`}>
      <p className="text-sm font-semibold">{påminnelse.rubrik}</p>
      <p className="mt-1 text-xs leading-relaxed opacity-90">{påminnelse.text}</p>
      <button
        type="button"
        onClick={onAvfärda}
        className="mt-2 text-xs font-medium underline-offset-2 hover:underline"
      >
        Markera som hanterad (dölj tills nästa nivå)
      </button>
    </div>
  );
}

export function ProjektGarantibesiktningPanel({
  status,
  onChange,
  onÖppnaMapp,
}: ProjektGarantibesiktningPanelProps) {
  const senastDatum = status.slutbesiktningDatum
    ? beraknaSenastGarantibesiktning(
        status.slutbesiktningDatum,
        status.garantiAr,
      )
    : null;
  const månaderKvar = senastDatum ? månaderKvarTill(senastDatum) : null;
  const påminnelser = hamtaAktivaGarantiPåminnelser(status);

  function patch(p: Partial<GarantibesiktningStatus>) {
    onChange({ ...status, ...p });
  }

  function avfärdaPåminnelse(id: string) {
    patch({
      avfärdadePåminnelser: [...new Set([...status.avfärdadePåminnelser, id])],
    });
  }

  return (
    <details className="group rounded-2xl border border-amber-200/80 bg-amber-50/30">
      <summary className="cursor-pointer list-none px-4 py-4 sm:px-5 [&::-webkit-details-marker]:hidden">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Garantibesiktning (2-årsbesiktning)
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {status.utförd
                ? `Utförd${status.utfördDatum ? ` ${formatSvensktDatum(status.utfördDatum)}` : ""}`
                : status.slutbesiktningDatum && senastDatum
                  ? månaderKvar != null && månaderKvar >= 0
                    ? `${månaderKvar} mån kvar · senast ${formatSvensktDatum(senastDatum)}`
                    : `Försenad — senast ${formatSvensktDatum(senastDatum)}`
                  : "Ange datum för slutbesiktning för att starta påminnelser"}
            </p>
          </div>
          <span className="text-sm text-muted group-open:hidden">Visa ▼</span>
          <span className="hidden text-sm text-muted group-open:inline">Dölj ▲</span>
        </div>
        {påminnelser.length > 0 && !status.utförd && (
          <p className="mt-2 text-xs font-medium text-amber-900">
            {påminnelser.length} aktiv påminnelse
            {påminnelser.length > 1 ? "r" : ""}
          </p>
        )}
      </summary>

      <div className="space-y-4 border-t border-amber-200/60 px-4 pb-5 pt-2 sm:px-5">
        <p className="text-xs leading-relaxed text-muted">
          Efter slutbesiktning ska garantibesiktning normalt utföras inom{" "}
          {status.garantiAr} år. Det tar tid att boka besiktningsman och kalla
          entreprenör — systemet påminner i god tid.
        </p>

        {!status.utförd && påminnelser.length > 0 && (
          <div className="space-y-2">
            {påminnelser.map((p) => (
              <PåminnelseKort
                key={p.id}
                påminnelse={p}
                onAvfärda={() => avfärdaPåminnelse(p.id)}
              />
            ))}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-foreground">Slutbesiktning genomförd</span>
            <input
              type="date"
              value={status.slutbesiktningDatum ?? ""}
              onChange={(e) =>
                patch({
                  slutbesiktningDatum: e.target.value || null,
                  avfärdadePåminnelser: [],
                })
              }
              className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() =>
                patch({
                  slutbesiktningDatum: idagIso(),
                  avfärdadePåminnelser: [],
                })
              }
              className="mt-1 text-xs font-medium text-primary-dark hover:underline"
            >
              Sätt till idag
            </button>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-foreground">Garantitid (år)</span>
            <select
              value={status.garantiAr}
              onChange={(e) =>
                patch({
                  garantiAr: Number(e.target.value),
                  avfärdadePåminnelser: [],
                })
              }
              className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            >
              {[1, 2, 3, 4, 5].map((ar) => (
                <option key={ar} value={ar}>
                  {ar} år{ar === GARANTI_BESIKTNING_STANDARD_AR ? " (standard)" : ""}
                </option>
              ))}
            </select>
          </label>
        </div>

        {senastDatum && !status.utförd && (
          <p className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground">
            <strong>Senast för garantibesiktning:</strong>{" "}
            {formatSvensktDatum(senastDatum)}
            {månaderKvar != null && månaderKvar >= 0 && (
              <span className="text-muted"> ({månaderKvar} månader kvar)</span>
            )}
          </p>
        )}

        <fieldset className="rounded-xl border border-border bg-white p-4">
          <legend className="px-1 text-sm font-semibold text-foreground">
            Förberedelse
          </legend>
          <ul className="mt-2 space-y-2">
            <li>
              <label className="flex cursor-pointer gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={status.besiktningsmanBokad}
                  onChange={(e) => patch({ besiktningsmanBokad: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary"
                />
                <span>Besiktningsman är bokad (datum reserverat)</span>
              </label>
            </li>
            <li>
              <label className="flex cursor-pointer gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={status.entreprenorKallad}
                  onChange={(e) => patch({ entreprenorKallad: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary"
                />
                <span>Entreprenör är kallad till garantibesiktningen</span>
              </label>
            </li>
          </ul>
        </fieldset>

        <div className="flex flex-wrap gap-2">
          {onÖppnaMapp && (
            <>
              <button
                type="button"
                onClick={() => onÖppnaMapp("besiktningar")}
                className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
              >
                → Slutbesiktning (mapp)
              </button>
              <button
                type="button"
                onClick={() => onÖppnaMapp("garantibesiktning")}
                className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-[#eef6f0]"
              >
                → Garantibesiktning (mapp)
              </button>
            </>
          )}
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-primary/30 bg-[#eef6f0]/50 p-3">
          <input
            type="checkbox"
            checked={status.utförd}
            onChange={(e) =>
              patch({
                utförd: e.target.checked,
                utfördDatum: e.target.checked ? status.utfördDatum ?? idagIso() : null,
              })
            }
            className="mt-0.5 h-4 w-4 rounded border-border text-primary"
          />
          <span className="text-sm font-medium text-primary-dark">
            Garantibesiktning är utförd och protokoll är arkiverat
          </span>
        </label>

        {status.utförd && (
          <label className="block text-sm">
            <span className="font-medium text-foreground">Datum garantibesiktning</span>
            <input
              type="date"
              value={status.utfördDatum ?? ""}
              onChange={(e) => patch({ utfördDatum: e.target.value || null })}
              className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            />
          </label>
        )}

        <label className="block text-sm">
          <span className="font-medium text-foreground">Anteckning</span>
          <textarea
            value={status.anteckning}
            onChange={(e) => patch({ anteckning: e.target.value })}
            rows={2}
            placeholder="t.ex. kontakt hos besiktningsman, särskilda villkor…"
            className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
      </div>
    </details>
  );
}
