import { hamtaSynkadForeningGrund } from "@/lib/forening-grund-synk";
import type { AvtalsForetradare, AvtalsPart } from "@/lib/forening-avtal";
import type { ForeningProfil } from "@/lib/forening-registry";

export function avtalsForetradareFranProfil(
  profil: ForeningProfil,
): AvtalsForetradare[] {
  const markerade = profil.styrelseledamoter.filter(
    (l) => l.signerarAvtal && l.namn.trim(),
  );
  const kalla = markerade.length > 0 ? markerade : profil.styrelseledamoter;
  const ledamoter = kalla
    .filter((l) => l.namn.trim())
    .map((l) => ({
      namn: l.namn.trim(),
      roll: l.roll.trim(),
      epost: l.epost.trim(),
    }));
  if (ledamoter.length > 0) return ledamoter;

  const namn = profil.kontaktperson.trim();
  if (!namn) return [];
  return [
    {
      namn,
      roll: "Kontaktperson",
      epost: profil.epost.trim(),
    },
  ];
}

/** Kunduppgifter till avtalet — synkad grund + personer som tecknar. */
export function avtalsPartFranProfil(profil: ForeningProfil): AvtalsPart {
  const synkad = hamtaSynkadForeningGrund(profil);
  const gatadresser = synkad.adresser.map((a) => a.trim()).filter(Boolean);
  const gata = gatadresser[0] || profil.postadress.trim();

  return {
    foreningsNamn: profil.namn,
    organisationsnummer:
      synkad.organisationsnummer || profil.organisationsnummer,
    gatadresser: gatadresser.length > 0 ? gatadresser : undefined,
    postadress: gata,
    postnummer: synkad.postnummer || profil.postnummer,
    ort: synkad.ort || profil.ort,
    fakturaEpost: profil.fakturaEpost,
    epost: profil.epost,
    foretradare: avtalsForetradareFranProfil(profil),
  };
}
