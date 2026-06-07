import type { ForeningEgenskap } from "@/components/rondering/forening-egenskaper";

/** Vilka egenskaper som krävs för att en punkt ska ingå (nyckel = typ:sektion:punkt). */
export const checklistPunktKrav: Record<string, ForeningEgenskap[]> = {
  "rondering-utvandig:fasad:balkong-ut": ["balkonger"],
  "rondering-utvandig:tak:takyta": ["tak"],
  "rondering-utvandig:tak:rannor": ["tak"],
  "rondering-utvandig:tak:snorass": ["tak"],
  "rondering-utvandig:tak:takfonster": ["tak"],
  "rondering-utvandig:tak:skorsten": ["tak"],
  "rondering-utvandig:tak:vent-tak": ["tak"],
  "rondering-utvandig:gard:lekplats": ["lekplats"],
  "rondering-utvandig:gard:cykel-ut": ["cykelforrad"],
  "rondering-utvandig:mark:parkering": ["markOchGard", "garage"],
  "rondering-utvandig:teknik-ut:vent-tak": ["tak"],

  "rondering-invandig:kallare:kallargang": ["kallare"],
  "rondering-invandig:kallare:forrad": ["kallare"],
  "rondering-invandig:kallare:teknikrum": ["kallare"],
  "rondering-invandig:kallare:golvbrunn": ["kallare"],
  "rondering-invandig:kallare:kallarport": ["kallare"],
  "rondering-invandig:tvatt:maskiner": ["tvattstuga"],
  "rondering-invandig:tvatt:ventilation-tvatt": ["tvattstuga"],
  "rondering-invandig:tvatt:ordning-tvatt": ["tvattstuga"],
  "rondering-invandig:tvatt:belysning-tvatt": ["tvattstuga"],
  "rondering-invandig:soprum:renlighet-sop": ["soprum"],
  "rondering-invandig:soprum:ventilation-sop": ["soprum"],
  "rondering-invandig:soprum:behallare": ["soprum"],
  "rondering-invandig:hiss:hisskorg": ["hiss"],
  "rondering-invandig:hiss:hisschakt": ["hiss"],
  "rondering-invandig:gemensamt:foreningslokal": ["foreningslokal"],
  "rondering-invandig:gemensamt:cykel-in": ["cykelforrad"],
  "rondering-invandig:gemensamt:miljorum-in": ["soprum"],

  "stadning:sop-stad:golv-sop": ["soprum"],
  "stadning:sop-stad:behallare-stad": ["soprum"],
  "stadning:sop-stad:väggar-sop": ["soprum"],
  "stadning:sop-stad:lukt-sop": ["soprum"],
  "stadning:tvatt-stad:maskin-yta": ["tvattstuga"],
  "stadning:tvatt-stad:golv-tvatt": ["tvattstuga"],
  "stadning:tvatt-stad:sopor-tvatt": ["tvattstuga"],
  "stadning:kallare-stad:golv-källare": ["kallare"],
  "stadning:kallare-stad:belysning-stad": ["kallare"],
  "stadning:kallare-stad:spindlar": ["kallare"],
  "stadning:toalett:wc": ["gemensamToalett"],
  "stadning:toalett:handfat": ["gemensamToalett"],
  "stadning:toalett:golv-wc": ["gemensamToalett"],
  "stadning:ovrig-stad:foreningslokal-stad": ["foreningslokal"],
};

export function hamtaPunktKrav(nyckel: string): ForeningEgenskap[] | undefined {
  return checklistPunktKrav[nyckel];
}

/** Sektion döljs om alla punkter filtreras bort — eller om sektion har eget krav. */
export const checklistSektionKrav: Record<string, ForeningEgenskap[]> = {
  "rondering-invandig:tvatt": ["tvattstuga"],
  "rondering-invandig:hiss": ["hiss"],
  "rondering-invandig:soprum": ["soprum"],
  "rondering-invandig:kallare": ["kallare"],
  "rondering-utvandig:tak": ["tak"],
  "stadning:tvatt-stad": ["tvattstuga"],
  "stadning:sop-stad": ["soprum"],
  "stadning:kallare-stad": ["kallare"],
  "stadning:toalett": ["gemensamToalett"],
};
