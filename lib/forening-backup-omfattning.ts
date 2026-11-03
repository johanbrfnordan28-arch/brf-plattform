/**
 * Vad en föreningssäkerhetskopia omfattar (all localStorage med brf-f-{id}--).
 */

export const FORENING_BACKUP_KORT =
  "Hela Styrelse-Navet för er förening — allt som lagrats i webbläsaren för ert förenings-id.";

/** När återställning från server fungerar — och vad som krävs. */
export const FORENING_AATERSTALL_FORKLARING =
  "Om data försvinner i webbläsaren (t.ex. efter fel, oavsiktlig radering eller en uppdatering som rensat lagringen) kan styrelsen återställa senaste sparade kopia. All föreningsdata i kopian skrivs tillbaka och sidan laddas om. Det som sparades efter kopian togs försvinner — därför ska ni spara regelbundet.";

export const FORENING_AATERSTALL_KRAV = [
  "Minst en säkerhetskopia sparad på servern (eller en nedladdad JSON-fil) från innan datan försvann.",
  "Inloggad styrelse för samma förening (eller giltig access-nyckel).",
  "Databas tillgänglig — annars använd «Ladda upp tidigare version» från fil.",
] as const;

export const FORENING_BACKUP_MODULER = [
  "Föreningsprofil och grunduppgifter",
  "Underhållsplan (grund, komponenter, renoveringar, besiktningar, budget)",
  "Årshjul och kopplade dokument/signeringar",
  "Lägenhetsregister och renoveringsmappar",
  "Dokumentbank (egna dokument och uppladdade filer)",
  "Upphandlingar, bilagor och entreprenörsregister",
  "Rondering, driftavtal och signeringsscheman",
  "Projekt, prislistor och föreningsinformation",
  "Felanmälan, skador och övriga moduler ni använt",
] as const;

/** Kända lagringsnycklar → modulnamn (prefix match på del efter brf-f-{id}--). */
const NYCKEL_TILL_MODUL: { prefix: string; etikett: string }[] = [
  { prefix: "brf-underhallsplan", etikett: "Underhållsplan" },
  { prefix: "brf-arshjul", etikett: "Årshjul" },
  { prefix: "brf-lagenhetsarkiv", etikett: "Lägenhetsregister" },
  { prefix: "brf-forenings-dokument", etikett: "Dokumentbank" },
  { prefix: "brf-dokumentbank", etikett: "Dokumentbank" },
  { prefix: "brf-upphandling", etikett: "Upphandling" },
  { prefix: "brf-rondering", etikett: "Rondering" },
  { prefix: "brf-grundmall-projekt", etikett: "Projekt" },
  { prefix: "brf-tidsplan", etikett: "Projekt/tidsplan" },
  { prefix: "brf-medlemmar-renovering", etikett: "Medlemsrenovering" },
  { prefix: "brf-plan-", etikett: "Planmodul" },
  { prefix: "brf-fastighets-skador", etikett: "Fastighetsskador" },
  { prefix: "brf-felanmalan", etikett: "Felanmälan" },
  { prefix: "brf-prislistor", etikett: "Prislistor" },
  { prefix: "brf-forening-sotning", etikett: "Sotning" },
  { prefix: "brf-kundavtal", etikett: "Avtal" },
  { prefix: "brf-forening-profil", etikett: "Föreningsprofil" },
  { prefix: "brf-server-access", etikett: "Synk (server)" },
];

export function hamtaBasNyckelFranLagring(
  fullKey: string,
  foreningId: string,
): string {
  const prefix = `brf-f-${foreningId}--`;
  if (!fullKey.startsWith(prefix)) return "";
  return fullKey.slice(prefix.length);
}

/** Unika modulnamn som faktiskt finns i en backup. */
export function modulerFranBackupNycklar(
  foreningId: string,
  keys: Record<string, string>,
): string[] {
  const etiketter = new Set<string>();
  for (const key of Object.keys(keys)) {
    const bas = hamtaBasNyckelFranLagring(key, foreningId);
    if (!bas) continue;
    let match = "Övrigt";
    for (const rad of NYCKEL_TILL_MODUL) {
      if (bas.startsWith(rad.prefix)) {
        match = rad.etikett;
        break;
      }
    }
    etiketter.add(match);
  }
  return [...etiketter].sort((a, b) => a.localeCompare(b, "sv"));
}
