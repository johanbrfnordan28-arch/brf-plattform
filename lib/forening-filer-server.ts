export const MAX_FORENING_FIL_BYTE = 200 * 1024 * 1024;

export const TILLATNA_FIL_TYPER = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
];

export function blobArKonfigurerad(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** Alla föreningens filer ligger under ett eget prefix; behörighet kontrolleras mot det. */
export function foreningFilPrefix(foreningId: string): string {
  return `foreningar/${foreningId}/`;
}

export function arGiltigFilSokvag(foreningId: string, pathname: string): boolean {
  return (
    pathname.startsWith(foreningFilPrefix(foreningId)) &&
    !pathname.includes("..") &&
    !pathname.includes("//")
  );
}
