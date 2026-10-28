/** Delar dokumenttext i redigerbara block (avsnitt). */
export function delaDokumentIAvsnitt(text: string): string[] {
  const normaliserad = text.replace(/\r\n/g, "\n");
  if (!normaliserad.trim()) return [""];

  const lines = normaliserad.split("\n");
  const avsnitt: string[] = [];
  let buf: string[] = [];

  function flush() {
    const chunk = buf.join("\n").trimEnd();
    if (chunk || avsnitt.length === 0) avsnitt.push(chunk);
    buf = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const trim = lines[i].trim();
    const nextTrim = (lines[i + 1] ?? "").trim();
    const nyttAvsnitt =
      buf.some((l) => l.trim()) &&
      (/^\d+\.\s+[A-ZÅÄÖ]/.test(trim) ||
        (trim.length > 0 && /^=+$/.test(nextTrim)) ||
        (trim === trim.toUpperCase() &&
          trim.length > 4 &&
          trim.length < 80 &&
          /^=+$/.test(nextTrim)));

    if (nyttAvsnitt) flush();
    buf.push(lines[i]);
  }
  flush();

  return avsnitt.length > 0 ? avsnitt : [normaliserad];
}

export function sammanfogaDokumentAvsnitt(avsnitt: string[]): string {
  return avsnitt
    .map((a) => a.trimEnd())
    .filter((a, i, arr) => a.length > 0 || arr.length === 1)
    .join("\n\n");
}
