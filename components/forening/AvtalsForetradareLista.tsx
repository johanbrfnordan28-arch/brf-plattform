import type { AvtalsForetradare } from "@/lib/forening-avtal";

export function AvtalsForetradareLista({
  personer,
  tomText,
}: {
  personer: AvtalsForetradare[];
  tomText?: string;
}) {
  const rader = personer.filter((p) => p.namn.trim());
  if (rader.length === 0) {
    return tomText ? (
      <p className="text-sm text-muted">{tomText}</p>
    ) : null;
  }

  return (
    <ul className="space-y-2">
      {rader.map((p, i) => (
        <li key={`${p.namn}-${i}`}>
          <p className="font-medium text-foreground">{p.namn.trim()}</p>
          {p.roll?.trim() ? (
            <p className="text-xs text-muted">{p.roll.trim()}</p>
          ) : null}
          {p.epost?.trim() ? (
            <p className="text-xs text-muted">{p.epost.trim()}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
