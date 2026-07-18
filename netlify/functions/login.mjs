import { checkPassword, readJsonBody, json } from "./_shared.mjs";

export default async (req) => {
  const payload = await readJsonBody(req);
  if (payload === null) return json(400, { ok: false, error: "Ungültige Anfrage" });

  if (!(await checkPassword(payload.password))) {
    return json(401, { ok: false, error: "Falsches Passwort" });
  }
  return json(200, { ok: true });
};
