/**
 * Kort sammanfattning av lag och Boverkets föreskrifter kring teknisk
 * underhållsplan — för upplysning i verktyget (ej juridisk rådgivning).
 *
 * Källor nov 2025/2026:
 * - Bostadsrättslagen 3 kap. 1 a § (Lag 2022:1026)
 * - BFS 2025:2, 2 kap. 8–9 §
 * - Boverket: teknisk underhållsplan, ekonomisk prognos
 * - BFN K3 punkt 38.2 d (upplysning om plan, inte krav att ha plan)
 */

export const PLAN_LAGKRAV_STYRELSE_RUBRIK =
  "Lag och Boverket — information för styrelsen";

export const PLAN_LAGKRAV_STYRELSE_INGANG =
  "Informationen gäller hela underhållsmodulen — den ingår inte som steg i planen. Här kan styrelsen läsa om lagkrav, Boverket och K3.";

/** Text på knappen när rutan är stängd — ska tydligt säga vad som finns inuti. */
export const PLAN_LAGKRAV_KNAPP_OPPNA =
  "Öppna: teknisk plan (50 år), avsättning, K3 och länkar till Boverket";

export const PLAN_LAGKRAV_KNAPP_STANG =
  "Stäng information om lag, Boverket och K3";

/** Ankar-id på modulsidan — wizard länkar hit utan att duplicera innehållet. */
export const PLAN_LAGKRAV_MODUL_ANKAR_ID = "underhallsplan-lag-och-boverket";

export const PLAN_LAGKRAV_TEKNISK_PLAN = [
  "En teknisk underhållsplan på 50 år ska ingå i föreningens ekonomiska plan (bostadsrättslagen 3 kap. 1 a §). Det gäller vid nybildning/ombildning och när en ny ekonomisk plan ska upprättas — inte generellt för alla befintliga föreningar som inte ska ha ny ekonomisk plan.",
  "Enligt Boverkets föreskrifter (BFS 2025:2, 2 kap. 8 §) ska planen vara komponentuppdelad, omfatta alla byggnader och mark, och ange planerade åtgärder med beräknat genomförandeår och kostnad. Byggnadens egenskaper ska styra utformningen; mer detalj nära i tid, grovre längre fram.",
  "Vid ombildning ska besiktningsprotokoll enligt 9 kap. 20 § bostadsrättslagen ligga till grund för underhållsplanen.",
  "Boverket anger att lagen inte i detalj styr hur finansiering ska ske, och att det inte finns krav på att föreningen löpande måste hålla planen uppdaterad — men en aktuell plan är bra underlag (särskilt inför K3-upplysning i årsredovisningen).",
] as const;

export const PLAN_LAGKRAV_AVSATTNING = [
  "Grunderna för avsättning till underhåll ska finnas i stadgarna (9 kap. 5 § 7 bostadsrättslagen). I ekonomiska planen ska det framgå hur avsättning säkerställs och hur underhåll finansieras (BFS 2025:2, 2 kap. 9 §) — inte en viss kr/m²-formel i lagen.",
  "Verktygets avsättning per kvm och år och budgetunderlag är ett beslutsstöd för styrelsen, i linje med Boverkets vägledning om långsiktig planering — styrelsen och stadgarna avgör nivå och finansiering.",
] as const;

export const PLAN_LAGKRAV_K3 =
  "K3 kräver inte att föreningen har en underhållsplan, men i förvaltningsberättelsen ska det anges om föreningen har eller inte har en aktuell underhållsplan (uppdaterad utifrån kända förhållanden).";

export type PlanLagkravKalla = {
  etikett: string;
  url: string;
  beskrivning?: string;
};

export const PLAN_LAGKRAV_KALLOR: readonly PlanLagkravKalla[] = [
  {
    etikett: "Boverket — teknisk underhållsplan",
    url: "https://www.boverket.se/sv/ekonomiska-planer/ekonomisk-plan/teknisk-underhallsplan/",
    beskrivning: "Krav på innehåll, 50 år, komponenter och ombildning.",
  },
  {
    etikett: "Boverket — avsättning och ekonomisk prognos",
    url: "https://www.boverket.se/sv/ekonomiska-planer/ekonomisk-plan/ekonomisk-prognos/",
    beskrivning: "Hur avsättning och finansiering ska framgå i planen.",
  },
  {
    etikett: "Boverket — underhållsplan (Energiguiden)",
    url: "https://www.boverket.se/sv/energiguiden/energieffektivisera-flerbostadshus/energiforvalta/samla-dokumentation/",
    beskrivning: "Vad en underhållsplan är och varför den används.",
  },
  {
    etikett: "BFS 2025:2 — föreskrifter (pdf)",
    url: "https://rinfo.boverket.se/BFS2025-2/pdf/BFS2025-2.pdf",
    beskrivning: "2 kap. 8–9 § teknisk plan och avsättning.",
  },
  {
    etikett: "Bostadsrättslagen (SFS 1991:614)",
    url: "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/bostadsrattslag-1991614_sfs-1991-614/",
    beskrivning: "3 kap. ekonomisk plan, 9 kap. stadgar och ombildning.",
  },
  {
    etikett: "BFN — K3 och underhållsplan (frågor och svar)",
    url: "https://www.bfn.se/fler-fragor-och-svar-om-andringarna-i-k2-och-k3-fran-2026/",
    beskrivning: "Upplysning i årsredovisningen — inte krav att ha plan.",
  },
] as const;
