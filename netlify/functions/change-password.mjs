import { checkPassword, hashPassword, adminStore, readJsonBody, json } from "./_shared.mjs";

export default async (req) => {
  const payload = await readJsonBody(req);
  if (payload === null) return json(400, { ok: false, error: "Ungültige Anfrage" });

  if (!(await checkPassword(payload.password))) {
    return json(401, { ok: false, error: "Falsches Passwort" });
  }

  const neuesPasswort = payload.new_password;
  if (typeof neuesPasswort !== "string" || neuesPasswort.length < 6) {
    return json(400, { ok: false, error: "Neues Passwort muss mind. 6 Zeichen haben" });
  }

  await adminStore().set("password_hash", hashPassword(neuesPasswort));
  return json(200, { ok: true });
};
