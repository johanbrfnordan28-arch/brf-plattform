/** Djup-länkar till Google Earth, Maps och Street View (öppnas i ny flik, ingen API-kostnad). */

export type KartKallaId = "google-earth" | "google-maps" | "street-view";

export type KartKontext = "tak" | "fasad" | "allmant";

export type KartLank = {
  id: KartKallaId;
  etikett: string;
  beskrivning: string;
  url: string;
  /** Visas som primär knapp för kontexten */
  rekommenderad?: boolean;
};

function normaliseraSok(adress: string): string {
  return adress.trim().replace(/\s+/g, " ");
}

export function hamtaPrimarAdress(adresser: string[]): string {
  const första = adresser.map((a) => a.trim()).find(Boolean);
  return första ?? "";
}

/** Alla Google-länkar för en adress. */
export function byggKartLankar(adress: string): KartLank[] {
  const q = encodeURIComponent(normaliseraSok(adress) || "Sverige");
  return [
    {
      id: "google-earth",
      etikett: "Google Earth",
      beskrivning:
        "Bäst för tak: 3D-vy och mätverktyg (linjal/polygon). Läs av ytan i m² och fyll i nedan eller ladda upp skärmbild.",
      url: `https://earth.google.com/web/search/${q}`,
      rekommenderad: true,
    },
    {
      id: "google-maps",
      etikett: "Google Maps (satellit)",
      beskrivning:
        "Flygfoto ovanifrån — bra översikt av tak och gård. Växla till satellit om kartan öppnas i kartläge.",
      url: `https://www.google.com/maps/search/?api=1&query=${q}&basemap=satellite&zoom=19`,
    },
    {
      id: "street-view",
      etikett: "Google Street View",
      beskrivning:
        "Fasad mot gatan: gå runt byggnaden på gatunivå. Dra den orangea figuren till fasaden om vyn inte startar automatiskt.",
      url: `https://www.google.com/maps/search/?api=1&query=${q}`,
    },
  ];
}

/** Sorterar och markerar rekommenderad länk utifrån tak/fasad. */
export function hamtaKartLankarForKontext(
  adress: string,
  kontext: KartKontext,
): KartLank[] {
  const alla = byggKartLankar(adress).map((l) => ({ ...l, rekommenderad: false }));

  if (kontext === "tak") {
    return sorteraMedForst(alla, "google-earth");
  }
  if (kontext === "fasad") {
    const sorterade = sorteraMedForst(alla, "street-view");
    return sorterade.map((l) =>
      l.id === "street-view" ? { ...l, rekommenderad: true } : l,
    );
  }
  return alla.map((l) =>
    l.id === "google-earth" ? { ...l, rekommenderad: true } : l,
  );
}

function sorteraMedForst(lankar: KartLank[], id: KartKallaId): KartLank[] {
  const primär = lankar.find((l) => l.id === id);
  const rest = lankar.filter((l) => l.id !== id);
  return primär ? [primär, ...rest] : lankar;
}

export const kartMatningsInstruktioner = {
  tak: [
    "Öppna Google Earth och sök fastighetens adress (knapp ovan).",
    "Luta kartan / använd 3D så takytan syns.",
    "Klicka på mätverktyget (linjal) → välj Area (yta) → rita polygon runt taket.",
    "Läs av arean i m². Vid brant tak: lägg på lutningsfaktor (ofta 1,05–1,25) eller mät takflator var för sig.",
    "Fyll i m² nedan, eller ladda upp skärmbild och mät i verktyget.",
  ],
  fasad: [
    "Fasad mot gata: öppna Street View och gå runt huset längs gatan.",
    "Fasad mot gård: använd Maps satellit eller egen bild från innergården.",
    "Mät eller uppskatta m² per sida — summera till total fasadyta.",
    "Jämför med registervärdet och fyll i gata/gård separat om det underlättar.",
  ],
  allmant: [
    "Använd Earth för takytor, Maps satellit för översikt och Street View för fasad mot gata.",
    "Alla tjänster är gratis att öppna i webbläsaren — ingen inbäddad karta i plattformen.",
  ],
} as const;
