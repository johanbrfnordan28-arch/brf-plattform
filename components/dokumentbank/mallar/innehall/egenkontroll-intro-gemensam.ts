/** Gemensam del av introtexter för alla egenkontrollbranscher. */
export function egenkontrollIntroGemensamDel(rubrik: string, regelverk: string): string {
  return `${rubrik}
====================================================

VAD FÖRENINGEN SKA FÅ
Som beställare ska ni kunna ta del av en tydlig kontrollplan, hur varje moment
är bedömt (utfört eller avvikelse), eventuella reservationer samt vem som
signerat med BankID och när. Det stärker spårbarheten inför slutbesiktning,
garanti och arkiv.

OMFATTNING — ADRESS, LÄGENHET, YTA OCH ETAPP
En egenkontroll kan avse flera adresser, lägenheter och en etapp i projektet.
Vid avvikelse ska entreprenören ange så smal omfattning som möjligt.

FÖRENINGENS ROLL
Styrelsen kan tidigt granska och anpassa kontrollpunkterna — även innan
entreprenör är tilldelad. Ifyllnad och attest är entreprenörens ansvar.

ENTREPRENÖRENS ANSVAR OCH HUVUDANSVAR
Huvudentreprenören ansvarar för fullständig egenkontroll, spårbara avvikelser
och BankID-signering innan underlaget lämnas in.

${regelverk}

KRAV PÅ BANKID (STARKT REKOMMENDERAT)
Föreningen bör kräva BankID-signatur med datum och tid från utförare och
arbetsledare (huvud- och ev. underentreprenör).
`;
}
