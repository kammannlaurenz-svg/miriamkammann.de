import {
  checkPassword,
  readJsonBody,
  loadOverrides,
  saveOverrides,
  imagesStore,
  ALLOWED_IMAGE_EXT,
  json,
} from "./_shared.mjs";

const UPLOAD_MAX_BYTES = 8 * 1024 * 1024;

export default async (req) => {
  const payload = await readJsonBody(req);
  if (payload === null) {
    return json(400, { ok: false, error: "Datei zu groß oder ungültig (max. 8 MB)" });
  }

  if (!(await checkPassword(payload.password))) {
    return json(401, { ok: false, error: "Falsches Passwort" });
  }

  const key = payload.key || "";
  const filename = payload.filename || "";
  const dataUrl = payload.data || "";

  if (!/^[a-z0-9_]+$/.test(key)) {
    return json(400, { ok: false, error: "Ungültiger Bildschlüssel" });
  }

  const dotIndex = filename.lastIndexOf(".");
  const ext = dotIndex === -1 ? "" : filename.slice(dotIndex).toLowerCase();
  const contentType = ALLOWED_IMAGE_EXT[ext];
  if (!contentType) {
    return json(400, { ok: false, error: "Nicht erlaubtes Dateiformat. Erlaubt: JPG, PNG, WEBP, SVG" });
  }

  const match = /^data:[^;]+;base64,([\s\S]+)$/.exec(dataUrl);
  if (!match) return json(400, { ok: false, error: "Ungültige Bilddaten" });

  let buffer;
  try {
    buffer = Buffer.from(match[1], "base64");
  } catch {
    return json(400, { ok: false, error: "Bilddaten konnten nicht gelesen werden" });
  }

  if (buffer.length > UPLOAD_MAX_BYTES) {
    return json(400, { ok: false, error: "Datei zu groß (max. 8 MB)" });
  }

  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  await imagesStore().set(key, arrayBuffer, { metadata: { contentType } });

  const relativerPfad = `/api/image/${key}?v=${Date.now()}`;

  const overrides = await loadOverrides();
  overrides.images[key] = relativerPfad;
  await saveOverrides(overrides);

  return json(200, { ok: true, path: relativerPfad });
};
