export type RonderingMappDefinition = {
  id: string;
  titel: string;
  beskrivning: string;
  vägledning: string;
};

export const ronderingMappar: RonderingMappDefinition[] = [
  {
    id: "fastighetsskotare",
    titel: "Rondering Fastighetsskötare",
    beskrivning: "Schema, checklistor och rapporter för fastighetsskötsel.",
    vägledning:
      "Ladda upp ronderingsunderlag, avtal eller instruktioner för fastighetsskötaren så styrelsen och entreprenören har samma referens.",
  },
  {
    id: "stadschema",
    titel: "Städschema",
    beskrivning: "Schema och moment för städning i trapphus och gemensamma ytor.",
    vägledning:
      "Spara gällande städschema och eventuella tillägg. Underlättar uppföljning när städning ska signeras eller avvikelse rapporteras.",
  },
  {
    id: "ovrigt",
    titel: "Övrigt",
    beskrivning: "Övriga dokument kopplade till rondering och städ.",
    vägledning:
      "T.ex. entreprenörsavtal, kontaktlistor eller historik som inte passar i de andra mapparna.",
  },
];

export function skapaRonderingDokumentId(): string {
  return `rondering-doc-${Date.now()}`;
}
