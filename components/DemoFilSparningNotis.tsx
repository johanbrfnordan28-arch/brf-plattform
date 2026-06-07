type DemoFilSparningNotisProps = {
  className?: string;
};

/** Prototyp: uppladdade filer sparas som metadata, inte filinnehåll. */
export function DemoFilSparningNotis({ className = "" }: DemoFilSparningNotisProps) {
  return (
    <p className={`text-xs text-muted ${className}`.trim()}>
      I prototypen sparas endast filnamn — inte själva filen.
    </p>
  );
}
