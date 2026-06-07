import Link from "next/link";
import {
  LIVSLANGD_EXEMPEL,
  LIVSLANGD_FORKLARING,
} from "@/components/underhallsplan/komponent-livslangd";

type Props = {
  /** Kompakt variant i komponentpaneler */
  kompakt?: boolean;
};

export function LivslangdForklaringPanel({ kompakt = false }: Props) {
  if (kompakt) {
    return (
      <div className="rounded-lg border border-primary/25 bg-[#f7fbf8] px-3 py-2 text-xs text-muted">
        <p className="font-medium text-primary-dark">{LIVSLANGD_FORKLARING.rubrik}</p>
        <p className="mt-1">
          <strong className="text-foreground">Byte</strong> = teknisk livslängd (långt
          intervall). <strong className="text-foreground">Underhåll/energi</strong> =
          löpande åtgärder som kan förlänga livslängd eller sänka driftkostnad.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-[#eef6f0] p-4 sm:p-5">
      <h3 className="text-base font-semibold text-primary-dark">
        {LIVSLANGD_FORKLARING.rubrik}
      </h3>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
        <p>
          <strong className="text-foreground">Teknisk livslängd:</strong>{" "}
          {LIVSLANGD_FORKLARING.teknisk}
        </p>
        <p>
          <strong className="text-foreground">Underhåll:</strong>{" "}
          {LIVSLANGD_FORKLARING.underhall}
        </p>
        <p>
          <strong className="text-foreground">Energiåtgärder:</strong>{" "}
          {LIVSLANGD_FORKLARING.energi}
        </p>
        <p>{LIVSLANGD_FORKLARING.koppling}</p>
      </div>

      <div className="mt-4 overflow-auto rounded-lg border border-border bg-background">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-background text-xs uppercase text-muted">
            <tr>
              <th className="px-3 py-2">Komponent</th>
              <th className="px-3 py-2">Tekniskt byte</th>
              <th className="px-3 py-2">Underhåll / energi</th>
              <th className="px-3 py-2">Effekt</th>
            </tr>
          </thead>
          <tbody>
            {LIVSLANGD_EXEMPEL.map((rad) => (
              <tr key={rad.komponent} className="border-t border-border">
                <td className="px-3 py-2 font-medium text-foreground">{rad.komponent}</td>
                <td className="px-3 py-2 text-muted">{rad.tekniskLivslangd}</td>
                <td className="px-3 py-2 text-muted">{rad.underhallEllerEnergi}</td>
                <td className="px-3 py-2 text-muted">{rad.effekt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-sm text-muted">
        Fler energiförslag finns i{" "}
        <Link
          href="/forening/energi"
          className="font-medium text-primary-dark underline hover:no-underline"
        >
          Energi &amp; drift
        </Link>
        .
      </p>
    </div>
  );
}
