/** Empreinte du clip, calculée dans le navigateur : sert à nommer le fichier envoyé au coach. */

/** Empreinte rapide : taille + 4 Mo du début + 4 Mo de la fin. Suffisant pour reconnaître le même fichier. */
export async function clipFingerprint(file: File) {
  const chunk = 4 * 1024 * 1024;
  const head = await file.slice(0, chunk).arrayBuffer();
  const tail = await file.slice(Math.max(0, file.size - chunk)).arrayBuffer();
  const size = new TextEncoder().encode(String(file.size));
  const buf = new Uint8Array(size.byteLength + head.byteLength + tail.byteLength);
  buf.set(size, 0);
  buf.set(new Uint8Array(head), size.byteLength);
  buf.set(new Uint8Array(tail), size.byteLength + head.byteLength);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
