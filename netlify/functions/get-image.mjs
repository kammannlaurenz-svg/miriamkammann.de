import { imagesStore } from "./_shared.mjs";

export default async (req) => {
  const url = new URL(req.url);

  // Der Bildschlüssel steht im Pfad (/api/image/<key>). Früher wurde er nur aus
  // dem Query-Parameter der Weiterleitung gelesen – der kollidierte aber mit dem
  // "?v="-Zeitstempel an der Bild-URL, wodurch jedes hochgeladene Bild 404 lieferte.
  // Der Query-Parameter bleibt als Rückfallebene, falls die Function doch mit
  // dem umgeschriebenen Pfad (/.netlify/functions/get-image) aufgerufen wird –
  // dort greift die Pfad-Regex nicht, weil "get-image" einen Bindestrich enthält.
  const ausPfad = /\/([a-z0-9_]+)\/?$/.exec(url.pathname);
  const key = (ausPfad && ausPfad[1]) || url.searchParams.get("key") || "";

  if (!/^[a-z0-9_]+$/.test(key)) {
    return new Response("Nicht gefunden", { status: 404 });
  }

  const result = await imagesStore().getWithMetadata(key, { type: "arrayBuffer" });
  if (!result) return new Response("Nicht gefunden", { status: 404 });

  const contentType = (result.metadata && result.metadata.contentType) || "application/octet-stream";
  return new Response(result.data, {
    status: 200,
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
};
