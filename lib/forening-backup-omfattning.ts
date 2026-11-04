/**
 * Kundtext och teknisk karta för föreningssäkerhetskopia (localStorage brf-f-{id}--).
 */

/** Kort beskrivning — utan tekniska detaljer. */
export const FORENING_BACKUP_KORT =
  "En kopia av ert arbete i Styrelse-Navet sparas på våra servrar.";

export const FORENING_LOGGA_UT_BACKUP_RAD =
  "Tips: avsluta gärna med Logga ut — då får ni möjlighet att spara en säkerhetskopia innan ni lämnar plattformen.";

/** Endast återställning — visas under Föreningsuppgifter. */
export const FORENING_AATERSTALL_KORT =
  "Behöver ni hämta tillbaka sparade uppgifter: tryck Återställ på rätt datum i listan. Sidan laddas om med det sparade läget.";

/** Expanderbar lista under Föreningsuppgifter (frivillig läsning). */
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
