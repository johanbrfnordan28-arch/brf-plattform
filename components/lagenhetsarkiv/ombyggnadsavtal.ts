import {
  grupperaMedlemsKrav,
  type MedlemsKravPunkt,
} from "@/components/lagenhetsarkiv/medlems-krav";

export type OmbyggnadsavtalMeta = {
  foreningsnamn: string;
  organisationsnummer?: string;
  lagenhetsnummer: string;
  mappNamn: string;
  mallEtikett: string;
  datum: string;
  postadress?: string;
  ort?: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function filnamnBas(meta: OmbyggnadsavtalMeta): string {
  const bas = `Ombyggnadsavtal-lght-${meta.lagenhetsnummer}-${meta.mappNamn}`;
  return bas
    .replace(/[^\wÅÄÖåäö\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function laddaNerBlob(blob: Blob, filnamn: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filnamn;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Bygger fullständigt ombyggnadsavtal (utkast/färdigt) med juridisk bastext. */
export function byggOmbyggnadsavtalText(
  punkter: MedlemsKravPunkt[],
  meta: OmbyggnadsavtalMeta,
): string {
  const grupper = grupperaMedlemsKrav(punkter);
  const forening = meta.foreningsnamn || "(föreningens namn)";
  const adressRad = [meta.postadress, meta.ort].filter(Boolean).join(", ");

  const rader: string[] = [
    "OMBYGGNADSAVTAL",
    "================",
    "",
    "Mellan bostadsrättsföreningen (nedan \"Föreningen\") och bostadsrättshavaren",
    "(nedan \"Medlemmen\") avseende ombyggnad/renovering i Medlemmens lägenhet.",
    "",
    "§ 1 Parter och lägenhet",
    "----------------------",
    `Förening: ${forening}`,
  ];

  if (meta.organisationsnummer) {
    rader.push(`Organisationsnummer: ${meta.organisationsnummer}`);
  }
  if (adressRad) {
    rader.push(`Fastighet/adress: ${adressRad}`);
  }

  rader.push(
    `Lägenhet: ${meta.lagenhetsnummer}`,
    `Arbetsbeskrivning: ${meta.mappNamn} (${meta.mallEtikett})`,
    `Datum (utkast/avtal): ${meta.datum}`,
    "",
    "§ 2 Ägande och utgångspunkt",
    "--------------------------",
    "Föreningen äger fastigheten. Medlemmen innehar bostadsrätt till angiven",
    "lägenhet. Ombyggnad och renovering får endast ske i enlighet med lag,",
    "föreningens stadgar, styrelsens beslut och detta ombyggnadsavtal.",
    "Föreningens gemensamma utrymmen, bärande konstruktion, stamledningar,",
    "fasad, tak och övriga gemensamma anläggningar får inte påverkas utan",
    "styrelsens uttryckliga godkännande.",
    "",
    "§ 3 Ansvar för skador och kostnader",
    "-----------------------------------",
    "Medlemmen ansvarar för att arbetet utförs fackmässigt och för skador som",
    "orsakas av renoveringen, oavsett om skadan uppstår i den egna lägenheten,",
    "i annan lägenhet eller i gemensamma utrymmen. Exempelvis kan vatten-,",
    "fukt- eller rivningsskador drabba boende längre ner i fastigheten eller",
    "angränsande lägenheter och då medföra kostnader för sanering, återställande,",
    "tillfällig boende och andra följdkostnader.",
    "",
    "Uppstår skada till följd av Medlemmens ombyggnad ska Medlemmen — i den",
    "utsträckning lag och stadgar medger — bära kostnaden och samarbeta med",
    "styrelsen och berörda försäkringsbolag. Medlemmen ska omgående anmäla",
    "misstänkta skador till styrelsen.",
    "",
    "§ 4 Entreprenör, försäkring och beställning",
    "------------------------------------------",
    "Medlemmen ska anlita behörig entreprenör där så krävs (t.ex. våtrum, el,",
    "VVS) och se till att giltig försäkring finns. Skriftlig beställning eller",
    "entreprenadavtal ska finnas innan arbetet startar. Medlemmen ansvarar för",
    "att kontrollera referenser och att beställningen är tydlig avseende",
    "omfattning, tidplan och pris.",
    "",
    "§ 5 Handlingar före och efter",
    "-----------------------------",
    "Medlemmen ska lämna de handlingar styrelsen begär före start (t.ex.",
    "anmälan, offert/avtal, försäkringsintyg, ritning) och efter avslutat",
    "arbete (t.ex. egenkontroll, foton, garantibevis, slutdokumentation).",
    "Arbetet får inte påbörjas innan styrelsen godkänt erforderliga underlag,",
    "om styrelsen beslutat om sådan ordning. Uppföljning sker i föreningens",
    "renoveringsmapp.",
    "",
    "§ 6 Tillträde",
    "-------------",
    "Styrelsen, eller den styrelsen utser, har rätt till skäligt tillträde till",
    "lägenheten för tillsyn, besiktning och uppföljning i samband med",
    "ombyggnaden, enligt lag och stadgar.",
    "",
    "§ 7 Specifika kravmoment för denna ombyggnad",
    "--------------------------------------------",
  );

  if (grupper.length === 0) {
    rader.push("(Inga särskilda moment valda i detta utkast.)");
  } else {
    for (const grupp of grupper) {
      rader.push("");
      rader.push(grupp.sektionEtikett.toUpperCase());
      for (const punkt of grupp.punkter) {
        rader.push(`• ${punkt.text}`);
      }
    }
  }

  rader.push(
    "",
    "§ 8 Godkännande och signering",
    "-----------------------------",
    "När styrelsen godkänt utkastet skickas ombyggnadsavtalet till Medlemmen",
    "för genomläsning. Medlemmen bekräftar avtalet genom signering med BankID",
    "(eller annan av föreningen anvisad metod). Signeringen innebär att",
    "Medlemmen tagit del av och accepterar villkoren ovan samt de specifika",
    "kravmomenten.",
    "",
    "§ 9 Övrigt",
    "----------",
    "Detta dokument är ett ombyggnadsavtal / överenskommelse mellan Föreningen",
    "och Medlemmen. Vid oklarhet gäller bostadsrättslagen, föreningens stadgar",
    "och styrelsens beslut. Dokumentet är en praktisk mall på basnivå och",
    "ersätter inte individuellt juridiskt råd när ärendet är komplicerat.",
    "",
    "Ort och datum: ________________________",
    "",
    "För Föreningen: ________________________",
    "",
    "Medlemmen (BankID/underskrift): ________________________",
    "",
  );

  return rader.join("\n");
}

/** HTML-version för Word-export och utskrift/PDF. */
export function byggOmbyggnadsavtalHtml(
  punkter: MedlemsKravPunkt[],
  meta: OmbyggnadsavtalMeta,
): string {
  const text = byggOmbyggnadsavtalText(punkter, meta);
  const stycken = text.split("\n").map((rad) => {
    if (!rad.trim()) return "<br/>";
    if (/^§\s*\d+/.test(rad) || rad === "OMBYGGNADSAVTAL") {
      return `<h2 style="font-size:14pt;margin:18px 0 8px;">${escapeHtml(rad)}</h2>`;
    }
    if (/^[=-]+$/.test(rad.trim())) return "";
    if (rad.startsWith("• ")) {
      return `<li>${escapeHtml(rad.slice(2))}</li>`;
    }
    if (rad === rad.toUpperCase() && rad.length > 2 && !rad.includes(":")) {
      return `<h3 style="font-size:11pt;margin:12px 0 4px;">${escapeHtml(rad)}</h3>`;
    }
    return `<p style="margin:0 0 6px;">${escapeHtml(rad)}</p>`;
  });

  return `<!DOCTYPE html>
<html lang="sv">
<head>
<meta charset="utf-8"/>
<title>Ombyggnadsavtal — lght ${escapeHtml(meta.lagenhetsnummer)}</title>
<style>
  body { font-family: Georgia, "Times New Roman", serif; font-size: 11pt; line-height: 1.45; color: #111; max-width: 720px; margin: 24px auto; padding: 0 16px; }
  h1 { font-size: 18pt; }
  ul { margin: 0 0 12px 18px; padding: 0; }
  @media print { body { margin: 0; max-width: none; } }
</style>
</head>
<body>
<h1>Ombyggnadsavtal</h1>
${stycken.join("\n")}
</body>
</html>`;
}

/** Ladda ner som Word-kompatibel .doc (HTML som Word öppnar). */
export function laddaNerOmbyggnadsavtalWord(
  punkter: MedlemsKravPunkt[],
  meta: OmbyggnadsavtalMeta,
): void {
  const html = byggOmbyggnadsavtalHtml(punkter, meta);
  const blob = new Blob(["\ufeff", html], {
    type: "application/msword;charset=utf-8",
  });
  laddaNerBlob(blob, `${filnamnBas(meta) || "Ombyggnadsavtal"}.doc`);
}

/**
 * Öppnar utskriftsvänlig HTML — användaren sparar som PDF via
 * Skriv ut → Spara som PDF.
 */
export function skrivUtOmbyggnadsavtalPdf(
  punkter: MedlemsKravPunkt[],
  meta: OmbyggnadsavtalMeta,
): void {
  const html = byggOmbyggnadsavtalHtml(punkter, meta);
  const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!w) {
    // Popup blockerad — fall tillbaka till nedladdning av HTML.
    const blob = new Blob(["\ufeff", html], {
      type: "text/html;charset=utf-8",
    });
    laddaNerBlob(blob, `${filnamnBas(meta) || "Ombyggnadsavtal"}.html`);
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  window.setTimeout(() => {
    w.print();
  }, 300);
}
