import {
  KONTAKT_EPOST,
  KONTAKT_EPOST_ETIKETTER,
  kontaktMailto,
  type KontaktEpostNyckel,
} from "@/lib/kontakt-epost";

type Props = {
  /** Vilka adresser som ska listas — standard: alla fyra. */
  nycklar?: KontaktEpostNyckel[];
  className?: string;
  /** Vertikal lista (standard) eller horisontell rad. */
  layout?: "lista" | "rad";
};

/**
 * Synliga mejladresser så styrelser enkelt hittar rätt kontakt.
 */
export function KontaktEpostLista({
  nycklar = ["johan", "support", "info", "offert"],
  className = "",
  layout = "lista",
}: Props) {
  const Tag = layout === "lista" ? "ul" : "div";
  const itemKlass =
    layout === "lista"
      ? "text-sm text-muted"
      : "inline-flex items-center gap-1 text-sm text-muted after:content-['·'] last:after:content-none after:mx-2";

  return (
    <Tag
      className={
        layout === "lista"
          ? `space-y-1.5 ${className}`
          : `flex flex-wrap items-center gap-y-1 ${className}`
      }
    >
      {nycklar.map((nyckel) => {
        const epost = KONTAKT_EPOST[nyckel];
        const etikett = KONTAKT_EPOST_ETIKETTER[nyckel];
        const Wrapper = layout === "lista" ? "li" : "span";
        return (
          <Wrapper key={nyckel} className={itemKlass}>
            <span className="text-foreground">{etikett}: </span>
            <a
              href={kontaktMailto(epost, `Styrelse-Navet — ${etikett.toLowerCase()}`)}
              className="font-medium text-primary-dark underline hover:no-underline"
            >
              {epost}
            </a>
          </Wrapper>
        );
      })}
    </Tag>
  );
}
