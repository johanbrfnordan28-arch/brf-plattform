import {
  hamtaKomponentMall,
  type KomponentDetaljData,
} from "@/components/underhallsplan/komponentregister";

const TAKYTA_ID = "takyta";
const FASADMATERIAL_ID = "fasadmaterial";

export type RegisterYtaTak = {
  takytaKvm: number | null;
  kvmDelar: { etikett: string; kvm: number }[];
  boareaKvm: number | null;
  schablonTakKvm: number | null;
};

export type RegisterYtaFasad = {
  totalKvm: number | null;
  valdaMaterial: string[];
};

function parseKvm(värde: string | undefined): number | null {
  if (!värde?.trim()) return null;
  const n = Number.parseFloat(värde.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function hamtaRegisterYtaTak(
  data: KomponentDetaljData | undefined,
  boareaKvm: number | null,
): RegisterYtaTak {
  const kvmDelar: { etikett: string; kvm: number }[] = [];
  let takytaKvm: number | null = null;

  if (data) {
    const mall = hamtaKomponentMall("Tak");
    for (const rad of data.underkomponenter) {
      if (!rad.aktiv || rad.måttenhet !== "kvm") continue;
      const kvm = parseKvm(rad.värde);
      if (kvm == null) continue;
      const etikett =
        mall.underkomponenter.find((u) => u.id === rad.id)?.etikett ?? rad.etikett;
      if (rad.id === TAKYTA_ID) {
        takytaKvm = kvm;
      } else {
        kvmDelar.push({ etikett, kvm });
      }
    }
  }

  const schablonTakKvm =
    boareaKvm != null && boareaKvm > 0 ? Math.round(boareaKvm * 1.2) : null;

  return {
    takytaKvm,
    kvmDelar,
    boareaKvm,
    schablonTakKvm,
  };
}

export function hamtaRegisterYtaFasad(
  data: KomponentDetaljData | undefined,
): RegisterYtaFasad {
  if (!data) return { totalKvm: null, valdaMaterial: [] };
  const mall = hamtaKomponentMall("Fasad");
  const rad = data.underkomponenter.find((r) => r.id === FASADMATERIAL_ID);
  const valdaMaterial = data.valdaDeltyper.map(
    (id) => mall.deltyper.find((d) => d.id === id)?.etikett ?? id,
  );
  return {
    totalKvm: parseKvm(rad?.värde),
    valdaMaterial,
  };
}

export function skillnadProcent(
  uppmatt: number | null,
  register: number | null,
): number | null {
  if (uppmatt == null || register == null || register <= 0) return null;
  return Math.round((Math.abs(uppmatt - register) / register) * 1000) / 10;
}

export function sattTakYtaIKomponent(
  data: KomponentDetaljData,
  kvm: number,
): KomponentDetaljData {
  const värde = String(Math.round(kvm * 10) / 10);
  return {
    ...data,
    underkomponenter: data.underkomponenter.map((rad) =>
      rad.id === TAKYTA_ID
        ? { ...rad, aktiv: true, måttenhet: "kvm", värde }
        : rad,
    ),
  };
}

export function sattFasadYtaIKomponent(
  data: KomponentDetaljData,
  kvm: number,
): KomponentDetaljData {
  const värde = String(Math.round(kvm * 10) / 10);
  return {
    ...data,
    underkomponenter: data.underkomponenter.map((rad) =>
      rad.id === FASADMATERIAL_ID
        ? { ...rad, aktiv: true, måttenhet: "kvm", värde }
        : rad,
    ),
  };
}

export { TAKYTA_ID, FASADMATERIAL_ID };
