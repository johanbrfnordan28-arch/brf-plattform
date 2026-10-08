import { FELANMALAN_BILDER } from "@/lib/felanmalan/felanmalan-typer";

/**
 * Förminskar en bild i webbläsaren till JPEG. Ritningen via canvas tar också
 * bort EXIF-data (bl.a. GPS-position) innan bilden lämnar telefonen.
 */
export async function forminskaBild(fil: File): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(fil);
  } catch {
    throw new Error(
      `«${fil.name}» kunde inte läsas. Välj en JPG- eller PNG-bild (eller ta en skärmbild av den).`,
    );
  }
  const skala = Math.min(1, FELANMALAN_BILDER.maxSida / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * skala);
  canvas.height = Math.round(bitmap.height * skala);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Webbläsaren kan inte förminska bilder.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  for (const kvalitet of [0.82, 0.7, 0.55]) {
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/jpeg", kvalitet),
    );
    if (blob && blob.size <= FELANMALAN_BILDER.maxBytes) {
      const namn = fil.name.replace(/\.[^.]+$/, "") || "bild";
      return new File([blob], `${namn}.jpg`, { type: "image/jpeg" });
    }
  }
  throw new Error(`«${fil.name}» är för stor även efter förminskning.`);
}
