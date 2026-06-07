export type ForeningsUndermapp = {
  id: string;
  titel: string;
  beskrivning: string;
  vägledning: string;
  /** Undermappar — t.ex. Hiss med Besiktning, Service rapport och Reparationer */
  barn?: ForeningsUndermapp[];
  /** Styrelsen skapar egna undermappar i gränssnittet (t.ex. Protokoll under sotning) */
  dynamiskaUndermappar?: boolean;
  /** Nyckel kvittenser — BankID-kvittering, inga dokumentuppladdningar */
  nyckelKvittenser?: boolean;
};

export type ForeningsHuvudmapp = {
  id: string;
  titel: string;
  beskrivning: string;
  undermappar: ForeningsUndermapp[];
};

export type ForeningsUndermappNod = {
  path: string;
  under: ForeningsUndermapp;
  isLeaf: boolean;
};

/** Fem huvudmappar — dokument laddas upp i undermapparna (eller i bladmappar). */
export const foreningsHuvudmappar: ForeningsHuvudmapp[] = [
  {
    id: "styrelse-stadgar",
    titel: "1. Styrelse och stadgar",
    beskrivning:
      "Styrelseprotokoll, stadgar, ekonomisk plan, avtal, försäkring och nyckel kvittenser.",
    undermappar: [
      {
        id: "styrelseprotokoll",
        titel: "Styrelseprotokoll",
        beskrivning: "Protokoll från styrelsemöten och beslut.",
        vägledning:
          "Ladda upp protokoll kronologiskt. Märk gärna datum i filnamnet.",
      },
      {
        id: "nyckel-kvittenser",
        titel: "Nyckel kvittenser",
        beskrivning:
          "Kvittera ut och in nycklar — med uppsamlingsplats för vilka som är utlämnade, till vem och när.",
        vägledning:
          "Översikten visar utlämnade nycklar. Vid ny kvittens: välj nycklar, ange mottagare (och företag för entreprenör) och signera med BankID.",
        nyckelKvittenser: true,
      },
      {
        id: "stadgar",
        titel: "Stadgar",
        beskrivning: "Gällande stadgar och ändringar.",
        vägledning:
          "Spara senaste versionen av stadgarna så styrelsen snabbt hittar rätt underlag.",
      },
      {
        id: "ekonomisk-plan",
        titel: "Ekonomisk plan",
        beskrivning: "Ekonomisk plan enligt bostadsrättslagen.",
        vägledning:
          "Aktuell plan och äldre versioner — underlag inför avgiftsbeslut och underhåll.",
      },
      {
        id: "avtal",
        titel: "Avtal",
        beskrivning: "Förvaltningsavtal, entreprenadavtal m.m.",
        vägledning: "Centrala avtal som styrelsen behöver tillgång till.",
      },
      {
        id: "forsakring",
        titel: "Försäkring",
        beskrivning: "Försäkringsbrev och skadehistorik.",
        vägledning: "Gällande försäkringshandlingar.",
      },
    ],
  },
  {
    id: "besiktningar",
    titel: "2. Besiktningar",
    beskrivning: "Hissbesiktning, systematiskt brandskyddsarbete (SBA) och tillhörande protokoll.",
    undermappar: [
      {
        id: "sba",
        titel: "Systematiskt brandskyddsarbete (SBA)",
        beskrivning:
          "Egenkontroller, brandkonsult och dokumentation för systematiskt brandskyddsarbete.",
        vägledning:
          "Spara protokoll från årlig SBA-rond och extern brandkonsult. Kontrollmall finns i underhållsplanen under Brandskydd.",
        barn: [
          {
            id: "egenkontroll",
            titel: "Egenkontroll",
            beskrivning: "Årlig SBA-rond enligt kontrollmall för systematiskt brandskyddsarbete.",
            vägledning: "Protokoll per år — branddörrar, utrymningsvägar m.m.",
          },
          {
            id: "brandkonsult",
            titel: "Brandkonsult",
            beskrivning: "Extern genomgång och rådgivning.",
            vägledning: "Rapporter och åtgärdsförslag från brandkonsult.",
          },
        ],
      },
      {
        id: "hiss",
        titel: "Hiss",
        beskrivning: "Hissbesiktning, service och reparationer.",
        vägledning:
          "Om föreningen har hiss — välj rätt undermapp för protokoll, servicerapporter eller reparationsunderlag.",
        barn: [
          {
            id: "besiktning",
            titel: "Hiss besikning",
            beskrivning: "Besiktningsprotokoll för hiss.",
            vägledning: "Årliga eller periodiska besiktningsprotokoll.",
          },
          {
            id: "service-rapport",
            titel: "Service rapport",
            beskrivning: "Servicerapporter från hissunderhåll.",
            vägledning: "Rapporter från servicebesök och löpande underhåll.",
          },
          {
            id: "reparationer",
            titel: "Reparationer",
            beskrivning: "Dokumentation av hissreparationer.",
            vägledning: "Offerter, arbetsorder och protokoll efter reparationer.",
          },
        ],
      },
    ],
  },
  {
    id: "service",
    titel: "3. Service",
    beskrivning: "Service och underhåll av undercentral.",
    undermappar: [
      {
        id: "undercentral",
        titel: "Undercentral",
        beskrivning: "Värme, varmvatten och fjärrvärme — service och åtgärder.",
        vägledning:
          "Dokumentation för undercentralen — servicerapporter och åtgärder från leverantör eller tekniker.",
        barn: [
          {
            id: "service-rapport",
            titel: "Service rapport",
            beskrivning: "Servicerapporter från undercentralen.",
            vägledning:
              "Rapporter från planerat service, löpande kontroller och besök.",
          },
          {
            id: "atgarder",
            titel: "Åtgärder",
            beskrivning: "Felrapporter, reparationer och andra åtgärder.",
            vägledning:
              "Felrapporter, avvikelser, offerter, arbetsorder och protokoll efter åtgärder.",
          },
        ],
      },
    ],
  },
  {
    id: "ventilation",
    titel: "4. Ventilation",
    beskrivning:
      "OVK, sotning och övriga ventilations- och skorstensrelaterade handlingar.",
    undermappar: [
      {
        id: "ovk",
        titel: "OVK-besiktning",
        beskrivning: "OVK-protokoll och ventilationshandlingar.",
        vägledning: "Protokoll från obligatorisk ventilationskontroll.",
      },
      {
        id: "sotning",
        titel: "Sotning",
        beskrivning: "Protokoll per tillfälle och övriga sotningshandlingar.",
        vägledning:
          "Under Protokoll skapar ni undermappar (t.ex. per år) och anger datum på varje dokument.",
        barn: [
          {
            id: "protokoll",
            titel: "Protokoll",
            beskrivning: "Sotningsprotokoll sorterade i egna undermappar.",
            vägledning:
              "Skapa undermappar som i projektmodulen — t.ex. 2024 eller Våren 2023. Vid uppladdning anger ni protokollets datum.",
            dynamiskaUndermappar: true,
          },
          {
            id: "ovrigt",
            titel: "Övrigt",
            beskrivning: "Avtal, fakturor och annat som inte är protokoll.",
            vägledning: "Övriga handlingar från sotare eller skorstensfejare.",
          },
        ],
      },
    ],
  },
  {
    id: "tioarskontroller",
    titel: "5. Tioårsbesiktningar",
    beskrivning:
      "Energideklaration och radonmätning — åtgärder som normalt utförs vart tionde år.",
    undermappar: [
      {
        id: "energideklaration",
        titel: "Energideklaration",
        beskrivning: "Energideklaration för fastigheten.",
        vägledning:
          "Gällande och äldre energideklarationer. Planera för ny deklaration cirka vart 10:e år.",
      },
      {
        id: "radon",
        titel: "Radonmätning",
        beskrivning: "Radonmätningar och åtgärdsrapporter.",
        vägledning:
          "Dokumentation från radonmätningar. Uppföljning rekommenderas ungefär vart 10:e år.",
      },
      {
        id: "ovrigt",
        titel: "Övrigt",
        beskrivning:
          "Myndighetsbeslut, stämmoprotokoll och handlingar som inte passar i övriga mappar.",
        vägledning:
          "Arkivera här tills respektive huvudmapp har fått sin understruktur.",
      },
    ],
  },
];

/** Antal huvudmappar — uppdateras automatiskt när `foreningsHuvudmappar` ändras. */
export const antalForeningsHuvudmappar = foreningsHuvudmappar.length;

export function undermappNyckel(huvudId: string, underPath: string): string {
  return underPath ? `${huvudId}/${underPath}` : huvudId;
}

function samlaNoder(
  undermappar: ForeningsUndermapp[],
  prefix = "",
): ForeningsUndermappNod[] {
  const noder: ForeningsUndermappNod[] = [];
  for (const under of undermappar) {
    const path = prefix ? `${prefix}/${under.id}` : under.id;
    const barn = under.barn ?? [];
    if (under.dynamiskaUndermappar || under.nyckelKvittenser) {
      noder.push({ path, under, isLeaf: false });
    } else if (barn.length > 0) {
      noder.push({ path, under, isLeaf: false });
      noder.push(...samlaNoder(barn, path));
    } else {
      noder.push({ path, under, isLeaf: true });
    }
  }
  return noder;
}

export function undermappNoderForHuvud(huvud: ForeningsHuvudmapp): ForeningsUndermappNod[] {
  return samlaNoder(huvud.undermappar);
}

export function allaUndermappNycklar(): string[] {
  return foreningsHuvudmappar.flatMap((huvud) =>
    undermappNoderForHuvud(huvud)
      .filter((nod) => nod.isLeaf)
      .map((nod) => undermappNyckel(huvud.id, nod.path)),
  );
}

export function skapaForeningsDokumentId(): string {
  return `forening-doc-${Date.now()}`;
}
