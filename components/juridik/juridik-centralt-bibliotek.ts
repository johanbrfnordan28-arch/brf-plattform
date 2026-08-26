import type {
  JuridikTipsKategori,
  JuridikTipsRad,
  JuridikUppladdatDokument,
} from "@/components/juridik/juridik-lager";

/** Domar och vägledning som fylls på centralt av BRF Företag — samma för alla föreningar. */
export const centralaDomarPerMapp: Record<string, JuridikUppladdatDokument[]> = {
  ytskikt: [
    {
      id: "central-ytskikt-1",
      filnamn: "Vägledning — medlemmens ansvar för ytskikt (HFD-praxis).pdf",
      uppladdad: "Centralt bibliotek",
    },
  ],
  rokkanaler: [
    {
      id: "central-rok-1",
      filnamn: "Domstolsavgörande — sotning och ansvar rökkanal.pdf",
      uppladdad: "Centralt bibliotek",
    },
  ],
  storningar: [
    {
      id: "central-stor-1",
      filnamn: "Vägledning — störningsärenden och varning till medlem.pdf",
      uppladdad: "Centralt bibliotek",
    },
  ],
  tilltrade: [
    {
      id: "central-tilltrade-1",
      filnamn: "Praxis — tillträde vid underhåll och akut åtgärd.pdf",
      uppladdad: "Centralt bibliotek",
    },
  ],
  "vatten-skador": [
    {
      id: "central-vatten-1",
      filnamn: "Vägledning — fördelning av ansvar vid vattenskada.pdf",
      uppladdad: "Centralt bibliotek",
    },
  ],
};

export const centralaJuridikTips: JuridikTipsRad[] = [
  {
    id: "central-tips-1",
    titel: "Läs vägledningen innan ni skickar brev till medlem",
    text: "Många tvister eskalerar för att parterna inte delar samma bild av stadgar och praxis. Gå igenom relevant mapp i biblioteket och skriv tydligt vad som gäller — innan advokat tillkallas.",
    kategori: "mote-medlem",
    uppladdad: "Centralt bibliotek",
  },
  {
    id: "central-tips-2",
    titel: "Sammanställ ett ärendepaket till juristen",
    text: "Protokoll, e-post, bilder och vägledande domar i ett dokument minskar juristens genomgångstid och er kostnad.",
    kategori: "juridiskt-ombud",
    uppladdad: "Centralt bibliotek",
  },
  {
    id: "central-tips-3",
    titel: "Medling kan vara billigare än rättegång",
    text: "I grann- och störningsärenden lönar det sig ofta att försöka medling eller strukturerad dialog innan full process — särskilt när parterna ska bo kvar i samma hus.",
    kategori: "kostnadstvist",
    uppladdad: "Centralt bibliotek",
  },
];

export function hamtaCentralaDomar(mappId: string): JuridikUppladdatDokument[] {
  return centralaDomarPerMapp[mappId] ?? [];
}

export function centralTipsKategoriEtikett(kategori: JuridikTipsKategori): string {
  switch (kategori) {
    case "mote-medlem":
      return "Inför möte med medlem";
    case "juridiskt-ombud":
      return "Inför juridiskt ombud";
    case "kostnadstvist":
      return "Minska kostnader vid tvist";
    default:
      return "Allmänt råd";
  }
}
