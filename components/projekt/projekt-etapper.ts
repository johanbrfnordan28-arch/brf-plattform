export type ProjektEtapp = {
  id: string;
  namn: string;
};

export function skapaEtappId(): string {
  return `etapp-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
}

export function normaliseraProjektEtapper(raw: unknown): ProjektEtapp[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((e) => e && typeof e === "object")
    .map((e) => {
      const x = e as Partial<ProjektEtapp>;
      const namn = (x.namn ?? "").trim();
      if (!namn) return null;
      return {
        id: x.id?.trim() || skapaEtappId(),
        namn,
      };
    })
    .filter((e): e is ProjektEtapp => e !== null);
}

/** En etapp per rad — anges när projektet skapas. */
export function etapperFranText(text: string): ProjektEtapp[] {
  return text
    .split(/\n/)
    .map((rad) => rad.trim())
    .filter(Boolean)
    .map((namn) => ({ id: skapaEtappId(), namn }));
}

export function etapperTillText(etapper: ProjektEtapp[]): string {
  return etapper.map((e) => e.namn).join("\n");
}
