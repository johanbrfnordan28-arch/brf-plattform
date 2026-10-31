/** SHA-256 av föreningens nycklar i fast ordning — samma värde i webbläsare och server. */
export async function beraknaInnehallHash(
  keys: Record<string, string>,
): Promise<string> {
  const ordnad = Object.keys(keys)
    .sort()
    .map((k) => [k, keys[k]]);
  const data = new TextEncoder().encode(JSON.stringify(ordnad));
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
