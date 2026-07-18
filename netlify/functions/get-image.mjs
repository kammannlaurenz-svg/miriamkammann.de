import { imagesStore } from "./_shared.mjs";

export default async (req) => {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") || "";

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
