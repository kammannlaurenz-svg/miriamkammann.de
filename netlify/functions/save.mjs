import { checkPassword, readJsonBody, loadOverrides, saveOverrides, json } from "./_shared.mjs";

export default async (req) => {
  const payload = await readJsonBody(req);
  if (payload === null) return json(400, { ok: false, error: "Ungültige Anfrage" });

  if (!(await checkPassword(payload.password))) {
    return json(401, { ok: false, error: "Falsches Passwort" });
  }

  const neueTexte = payload.text;
  if (!neueTexte || typeof neueTexte !== "object") {
    return json(400, { ok: false, error: "Kein Textinhalt übergeben" });
  }

  const overrides = await loadOverrides();
  for (const [key, value] of Object.entries(neueTexte)) {
    if (typeof key === "string" && typeof value === "string") {
      overrides.text[key] = value;
    }
  }
  await saveOverrides(overrides);
  return json(200, { ok: true });
};
