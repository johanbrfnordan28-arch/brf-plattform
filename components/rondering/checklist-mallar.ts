/** Förslag på kompletta checklistor — rondering (utvändigt/invändigt) och städning. */

export type RonderingChecklistaTyp =
  | "rondering-utvandig"
  | "rondering-invandig"
  | "stadning";

export type RonderingChecklistaPunkt = {
  id: string;
  text: string;
};

export type RonderingChecklistaSektion = {
  id: string;
  etikett: string;
  beskrivning?: string;
  punkter: RonderingChecklistaPunkt[];
};

export type RonderingChecklistaMall = {
  typ: RonderingChecklistaTyp;
  titel: string;
  beskrivning: string;
  sektioner: RonderingChecklistaSektion[];
};

export const ronderingChecklistaEtiketter: Record<RonderingChecklistaTyp, string> = {
  "rondering-utvandig": "Rondering — utvändigt",
  "rondering-invandig": "Rondering — invändigt",
  stadning: "Städning",
};

export const ronderingChecklistaBeskrivningar: Record<RonderingChecklistaTyp, string> = {
  "rondering-utvandig":
    "Fastighetsskötsel utomhus: mark, fasad, tak, gård, teknik och säkerhet.",
  "rondering-invandig":
    "Fastighetsskötsel inomhus: trapphus, källare, tvätt, soprum, hiss och fukt.",
  stadning:
    "Städrutin inomhus — golv (sopa, våttorka), dörrar och hissar (grus bort). Vissa moment i intervall enligt föreningen (t.ex. fönsterputs).",
};

const utvandigRondering: RonderingChecklistaSektion[] = [
  {
    id: "mark",
    etikett: "Mark, gångvägar och parkering",
    beskrivning: "Säker framkomlighet året runt.",
    punkter: [
      { id: "halka", text: "Gångvägar, ramper och uppfarter — fria från is, halka och hinder." },
      { id: "trappor-ut", text: "Trappor och trappsteg utvändigt — inga lösa eller vassa kanter." },
      { id: "parkering", text: "Parkeringsytor och körvägar — skyltning och markering läsbara." },
      { id: "plantering", text: "Buskar och planteringar vid gångväg — beskurna så sikt och passage inte blockeras." },
      { id: "belysning-mark", text: "Utomhusbelysning längs gångvägar fungerar." },
    ],
  },
  {
    id: "fasad",
    etikett: "Fasad, fönster och balkonger",
    punkter: [
      { id: "fasad-skada", text: "Fasad — synliga skador, lossnad puts, sprickor eller fuktfläckar noterade." },
      { id: "fonster-ut", text: "Fönster och balkongdörrar utvändigt — karmar, färg, tätningar och beslag." },
      { id: "balkong-ut", text: "Balkonger och altaner — räcken, golv, avvattning och insynsskydd." },
      { id: "entré-ut", text: "Entrépartier och portar utvändigt — skador, tätning, rost eller slitage." },
      { id: "sockel", text: "Sockel och dränering vid fasad — inga vattenansamlingar eller växtlighet mot vägg." },
    ],
  },
  {
    id: "tak",
    etikett: "Tak och takavvattning",
    punkter: [
      { id: "takyta", text: "Takytor — synlig skada, lösa delar, mossa eller vittrad plåt." },
      { id: "rannor", text: "Takrännor och stuprör — fria, inga blockeringar eller läckage vid anslutning." },
      { id: "snorass", text: "Snörasskydd, takstege och fästen — sitter fast." },
      { id: "takfonster", text: "Takfönster, luckor och genomföringar — tätning och beslag." },
      { id: "skorsten", text: "Skorstenar och plåtdetaljer — tätslut och utan synlig vittring." },
    ],
  },
  {
    id: "gard",
    etikett: "Gård, sophantering och lek",
    punkter: [
      { id: "sop-ut", text: "Soprum / miljörum utvändigt — dörr, lås och yta runt behållare." },
      { id: "sortering", text: "Sopsortering och skyltning — tydlig och hel." },
      { id: "lekplats", text: "Lekplats och gård — utrustning, underlag och staket i skäligt skick." },
      { id: "cykel-ut", text: "Cykelparkering utvändigt — ordning och fastsäkring." },
      { id: "brand-ut", text: "Brandskydd utvändigt — handbrandsläckare, brandpost, väg för räddningstjänst." },
    ],
  },
  {
    id: "teknik-ut",
    etikett: "Teknik och installationer utvändigt",
    punkter: [
      { id: "porttelefon", text: "Porttelefon och passersystem vid entré fungerar." },
      { id: "belysning-entré", text: "Belysning vid entréer och skyltning fungerar." },
      { id: "el-ut", text: "Elcentral / ställverk utvändigt — låst och skyltat." },
      { id: "vent-tak", text: "Ventilationsutrustning på tak — synliga skador, oljud eller vibration." },
      { id: "varme-ut", text: "Värmepump, fjärrvärme eller kyl — synlig skada eller läckage." },
    ],
  },
  {
    id: "sakerhet-ut",
    etikett: "Säkerhet och övrigt utvändigt",
    punkter: [
      { id: "handrade-ut", text: "Handräcken och glaspartier utvändigt — hela och fasta." },
      { id: "snorojning", text: "Snöröjning / sandning — behov dokumenterat vid vinterförhållanden." },
      { id: "skyltar", text: "Skyltar, namnskyltar och informationsmärken — läsbara och hela." },
      { id: "skadedjur", text: "Tecken på skadedjur eller angrepp vid fasad, källareingång eller soprum noterade." },
    ],
  },
];

const invandigRondering: RonderingChecklistaSektion[] = [
  {
    id: "trapphus",
    etikett: "Entréer och trapphus",
    punkter: [
      { id: "entré-in", text: "Entré, porttelefon och passersystem fungerar." },
      { id: "vaggar-tak", text: "Trapphus — väggar, tak och golv utan synliga skador eller fukt." },
      { id: "trappa-in", text: "Trappor — halkrisk, lösa mattor, belysning och handräcken." },
      { id: "post", text: "Post- och anslagstavla — ordning och inga brandfarliga anslag vid utrymningsväg." },
      { id: "belysning-trapp", text: "Belysning i trapphus och källargångar fungerar." },
    ],
  },
  {
    id: "kallare",
    etikett: "Källare och förråd",
    punkter: [
      { id: "kallargang", text: "Källargångar — belysning, ordning och inga starka fukt- eller mögeldofter." },
      { id: "forrad", text: "Förråd och galler — lås, ventilation och inga blockerade utrymningsvägar." },
      { id: "teknikrum", text: "Teknikrum i källare — tillgängligt, skyltat och utan vatten på golv." },
      { id: "golvbrunn", text: "Golvbrunnar och avlopp i källare — inga synliga stopp eller läckage." },
      { id: "kallarport", text: "Källarportar och luckor — tätning och beslag." },
    ],
  },
  {
    id: "tvatt",
    etikett: "Tvättstuga",
    punkter: [
      { id: "maskiner", text: "Tvättmaskiner och tork — fungerar, filter och filterlådor rengjorda." },
      { id: "ventilation-tvatt", text: "Ventilation och fukt i tvättstuga — inga kondens- eller mögeltecken." },
      { id: "ordning-tvatt", text: "Ordning, klotter och säkerhet — inga brandfarliga föremål." },
      { id: "belysning-tvatt", text: "Belysning och eluttag i tvättstuga fungerar." },
    ],
  },
  {
    id: "soprum",
    etikett: "Soprum och miljörum",
    punkter: [
      { id: "renlighet-sop", text: "Renlighet, sortering och lås på soprum." },
      { id: "ventilation-sop", text: "Ventilation och lukt i soprum/miljörum acceptabel." },
      { id: "behallare", text: "Behållare och kärl — hela, inga läckage på golv." },
    ],
  },
  {
    id: "hiss",
    etikett: "Hiss och tillgänglighet",
    punkter: [
      { id: "hisskorg", text: "Hiss — korg, dörrar, nödlarm och belysning (rutin enligt avtal)." },
      { id: "hisschakt", text: "Hisschakt och maskinrum — inga ovanliga ljud eller läckage noterat." },
      { id: "ramp", text: "Ramper, dörröppnare och tillgänglighetsanpassning fungerar." },
    ],
  },
  {
    id: "gemensamt",
    etikett: "Gemensamma utrymmen",
    punkter: [
      { id: "foreningslokal", text: "Föreningslokal, gym, bastu eller liknande — ordning och skador." },
      { id: "cykel-in", text: "Cykelförråd invändigt — ordning och brandsäkerhet." },
      { id: "miljorum-in", text: "Miljörum / grovsopor — tillgängligt och märkt." },
    ],
  },
  {
    id: "fukt",
    etikett: "Fukt, lukt och invändig skada",
    punkter: [
      { id: "kakel", text: "Läckage eller fuktfläckar vid kakel, golv eller tak invändigt." },
      { id: "kondens", text: "Kondens eller mögel vid fönster eller kalla ytor i gemensamma utrymmen." },
      { id: "lukt", text: "Avvikande lukt (avlopp, mögel, brand) — plats noterad för uppföljning." },
    ],
  },
  {
    id: "sakerhet-in",
    etikett: "Säkerhet invändigt",
    punkter: [
      { id: "brand-in", text: "Handbrandsläckare och utrymningsvägar — fria och skyltade." },
      { id: "lås", text: "Portautomatik, lås och nödöppning fungerar." },
      { id: "radon", text: "Ventilationsdon och tilluft i gemensamma utrymmen — inga blockerade galler." },
    ],
  },
];

const stadning: RonderingChecklistaSektion[] = [
  {
    id: "entré-stad",
    etikett: "Entréer och trapphus",
    beskrivning: "Synliga ytor som medlemmar möter dagligen.",
    punkter: [
      { id: "golv-entré", text: "Golv i entré och trapphus — först sopas, sedan våttorkas." },
      { id: "trappa-stad", text: "Trappsteg, ledstångar, handtag och trappräcken avtorkade." },
      { id: "dörrar", text: "Dörrar och karmar avtorkade — grus och sand bort vid dörrar så de fungerar." },
      { id: "hiss-grus", text: "Hiss — korg och dörrar städade; grus/sand bort vid hissdörrar (servicedagbok vid rondering)." },
      { id: "fonster-in", text: "Glas i trapphus — fläckar borttagna (full puts enligt föreningens intervall, t.ex. vår/höst)." },
      { id: "sop-entré", text: "Sopor och skräp i trapphus och vid entré bortplockade." },
    ],
  },
  {
    id: "sop-stad",
    etikett: "Soprum och miljörum",
    punkter: [
      { id: "golv-sop", text: "Golv soprum — först sopat, sedan våttorkat/diskat vid behov." },
      { id: "behallare-stad", text: "Behållare utvändigt och invändigt — rena och utan spill." },
      { id: "väggar-sop", text: "Väggar och luckor i soprum avtorkade." },
      { id: "lukt-sop", text: "Luftning och lukt — acceptabel efter städ." },
    ],
  },
  {
    id: "tvatt-stad",
    etikett: "Tvättstuga",
    punkter: [
      { id: "maskin-yta", text: "Tvättmaskiner, tork och bänkar — avtorkade." },
      { id: "golv-tvatt", text: "Golv tvättstuga — sopat och våttorkat." },
      { id: "sopor-tvatt", text: "Ludd, förpackningar och kvarlämnat bortplockat (filter vid rondering)." },
    ],
  },
  {
    id: "kallare-stad",
    etikett: "Källargångar och förråd",
    punkter: [
      { id: "golv-källare", text: "Källargångar — sopade och fläckar borttagna." },
      { id: "belysning-stad", text: "Damm på armaturer avtorkad (funktion på lampor kontrolleras vid rondering)." },
      { id: "spindlar", text: "Spindelnät och grova fläckar i källare borttagna." },
    ],
  },
  {
    id: "toalett",
    etikett: "Toaletter och handfat (gemensamma)",
    punkter: [
      { id: "wc", text: "Toaletter — rengjorda, påfyllt förbrukningsmaterial." },
      { id: "handfat", text: "Handfat och speglar — avtorkade." },
      { id: "golv-wc", text: "Golv toalett — sopat och våttorkat." },
    ],
  },
  {
    id: "utvändig-stad",
    etikett: "Utvändiga entréområden (städ)",
    punkter: [
      { id: "matta", text: "Entrémattor och trappsteg utvändigt — sopade / borstade." },
      { id: "port-ut", text: "Portar och glas vid entré — avtorkade." },
      { id: "sop-ut-stad", text: "Cigarettfimpar och skräp vid entré och port bortplockade." },
    ],
  },
  {
    id: "fonster-stad",
    etikett: "Fönsterputs (intervall)",
    beskrivning: "Frekvens bestämmer föreningen — t.ex. vår och höst.",
    punkter: [
      {
        id: "fonster-puts-intervall",
        text: "Fönster och glasytor putsade om det ingår i aktuellt intervall — annars ej denna gång.",
      },
    ],
  },
  {
    id: "ovrig-stad",
    etikett: "Övrigt och uppföljning",
    punkter: [
      { id: "foreningslokal-stad", text: "Föreningslokal eller gym — städat enligt avtalad frekvens." },
      { id: "material", text: "Städmaterial och nycklar — tillbaka på avtalad plats." },
      { id: "avvikelse-stad", text: "Avvikelser under städ rapporterade (skador, fukt, saknat material)." },
    ],
  },
];

export const ronderingChecklistaMallar: RonderingChecklistaMall[] = [
  {
    typ: "rondering-utvandig",
    titel: ronderingChecklistaEtiketter["rondering-utvandig"],
    beskrivning: ronderingChecklistaBeskrivningar["rondering-utvandig"],
    sektioner: utvandigRondering,
  },
  {
    typ: "rondering-invandig",
    titel: ronderingChecklistaEtiketter["rondering-invandig"],
    beskrivning: ronderingChecklistaBeskrivningar["rondering-invandig"],
    sektioner: invandigRondering,
  },
  {
    typ: "stadning",
    titel: ronderingChecklistaEtiketter.stadning,
    beskrivning: ronderingChecklistaBeskrivningar.stadning,
    sektioner: stadning,
  },
];

export function hamtaRonderingChecklista(
  typ: RonderingChecklistaTyp,
): RonderingChecklistaMall {
  const mall = ronderingChecklistaMallar.find((m) => m.typ === typ);
  if (!mall) throw new Error(`Okänd checklisttyp: ${typ}`);
  return mall;
}

export function checklistaPunktNyckel(
  typ: RonderingChecklistaTyp,
  sektionId: string,
  punktId: string,
): string {
  return `${typ}:${sektionId}:${punktId}`;
}

export function allaChecklistaPunktNycklar(typ: RonderingChecklistaTyp): string[] {
  const mall = hamtaRonderingChecklista(typ);
  return mall.sektioner.flatMap((s) =>
    s.punkter.map((p) => checklistaPunktNyckel(typ, s.id, p.id)),
  );
}

export function beraknaChecklistaFramsteg(
  typ: RonderingChecklistaTyp,
  klaraPunkter: string[],
): { klara: number; totalt: number; procent: number } {
  const alla = allaChecklistaPunktNycklar(typ);
  const klaraSet = new Set(klaraPunkter);
  const klara = alla.filter((k) => klaraSet.has(k)).length;
  const totalt = alla.length;
  return {
    klara,
    totalt,
    procent: totalt > 0 ? Math.round((klara / totalt) * 100) : 0,
  };
}

export function hittaChecklistaPunktText(
  typ: RonderingChecklistaTyp,
  nyckel: string,
): string | undefined {
  const mall = hamtaRonderingChecklista(typ);
  for (const sektion of mall.sektioner) {
    for (const punkt of sektion.punkter) {
      if (checklistaPunktNyckel(typ, sektion.id, punkt.id) === nyckel) {
        return punkt.text;
      }
    }
  }
  return undefined;
}
