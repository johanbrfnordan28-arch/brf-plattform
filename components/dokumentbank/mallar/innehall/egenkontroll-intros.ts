import { egenkontrollIntroGemensamDel } from "@/components/dokumentbank/mallar/innehall/egenkontroll-intro-gemensam";
import type { EgenkontrollBransch } from "@/components/dokumentbank/mallar/egenkontroll-typer";

const VVS_REGEL = `Entreprenören ska följa handling, BBR och AMA VVS & AF, genomföra
egenkontroll och dokumentera avvikelser.`;

const EL_REGEL = `Entreprenören ska följa handling, BBR, SS 436 40 00 (Elinstallationer)
och Elsäkerhetslagen. Elarbete ska utföras av behörig elinstallatör hos
auktoriserat företag.`;

const MALNING_REGEL = `Entreprenören ska följa handling, BBR, AMA och tillverkares anvisningar
för ytbehandling — särskilt avseende torktider mellan skikt.`;

const BYGG_REGEL = `Entreprenören ska följa handling, BBR, AMA Hus och gällande
konstruktions- och brandskyddskrav.`;

const FASAD_REGEL = `Entreprenören ska följa handling, BBR, AMA och tillverkares
systemdokumentation för fasad — inklusive torktider och fuktsäker montering.`;

const TAK_REGEL = `Entreprenören ska följa handling, BBR, AMA och tillverkares
tätningssystem — inklusive torktider och fall/lutning.`;

const BADRUM_REGEL = `Entreprenören ska följa handling, BBR, BKR/GVK (våtrum),
Säker Vatteninstallation där VVS ingår, samt AMA VVS & AF vid stambyte.`;

export const EGENKONTROLL_INTROS: Record<EgenkontrollBransch, string> = {
  vvs: egenkontrollIntroGemensamDel("EGENKONTROLL VVS", VVS_REGEL),
  el: egenkontrollIntroGemensamDel("EGENKONTROLL EL", EL_REGEL),
  malning: egenkontrollIntroGemensamDel("EGENKONTROLL MÅLNING", MALNING_REGEL),
  bygg: egenkontrollIntroGemensamDel("EGENKONTROLL BYGG", BYGG_REGEL),
  fasad: egenkontrollIntroGemensamDel("EGENKONTROLL FASAD", FASAD_REGEL),
  tak: egenkontrollIntroGemensamDel("EGENKONTROLL TAK", TAK_REGEL),
  badrum_stam: egenkontrollIntroGemensamDel(
    "EGENKONTROLL BADRUM OCH STAMBYTE",
    BADRUM_REGEL,
  ),
};
