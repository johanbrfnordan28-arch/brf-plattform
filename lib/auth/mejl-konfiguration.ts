/** Vilka mejltransportörer som är konfigurerade (inga hemligheter exponeras). */

export type MejlTransportStatus = {
  resend: boolean;
  smtp: boolean;
  mejlFran: boolean;
  aktivTransport: "resend" | "smtp" | "ingen";
};

export function hamtaMejlTransportStatus(): MejlTransportStatus {
  const resend = Boolean(process.env.RESEND_API_KEY?.trim());
  const smtp = Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim(),
  );
  const mejlFran = Boolean(
    process.env.MEJL_FRAN?.trim() || process.env.SMTP_FROM?.trim(),
  );

  let aktivTransport: MejlTransportStatus["aktivTransport"] = "ingen";
  if (resend) aktivTransport = "resend";
  else if (smtp) aktivTransport = "smtp";

  return { resend, smtp, mejlFran, aktivTransport };
}

export function hamtaMejlFranAdress(): string {
  return (
    process.env.MEJL_FRAN?.trim() ||
    process.env.SMTP_FROM?.trim() ||
    "Styrelse-Navet <onboarding@resend.dev>"
  );
}

/** True när mejlet faktiskt skickades (Resend eller SMTP). */
export function mejlSkickades(via: string): boolean {
  return via === "resend" || via === "smtp";
}
