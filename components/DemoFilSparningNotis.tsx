type DemoFilSparningNotisProps = {
  className?: string;
};

/** Notis när filuppladdning sparar metadata lokalt (inte filinnehåll i molnet). */
export function DemoFilSparningNotis({ className = "" }: DemoFilSparningNotisProps) {
  return (
    <p className={`text-xs text-muted ${className}`.trim()}>
      Just nu sparas filnamn och metadata lokalt — själva filen lagras ännu inte i
      molnet.
    </p>
  );
}
