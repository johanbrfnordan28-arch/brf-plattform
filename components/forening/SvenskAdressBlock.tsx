import {
  svenskAdressRader,
  type SvenskAdress,
} from "@/lib/svensk-adress";

type Props = SvenskAdress & {
  className?: string;
  tomText?: string;
};

/** Vanligt svenskt adressblock — gata skild från postnummer/ort. */
export function SvenskAdressBlock({
  className = "text-sm leading-relaxed text-muted",
  tomText,
  ...adress
}: Props) {
  const rader = svenskAdressRader(adress);
  if (rader.length === 0) {
    return tomText ? <p className={className}>{tomText}</p> : null;
  }

  return (
    <address className={`not-italic ${className}`}>
      {rader.map((rad) => (
        <span key={rad} className="block">
          {rad}
        </span>
      ))}
    </address>
  );
}
