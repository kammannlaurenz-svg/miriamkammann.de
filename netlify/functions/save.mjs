import {
  checkPassword,
  clientIp,
  isRateLimited,
  recordFailedAttempt,
  clearFailedAttempts,
  readJsonBody,
  loadOverrides,
  saveOverrides,
  sanitizeFraming,
  json,
} from "./_shared.mjs";

export default async (req, context) => {
  const payload = await readJsonBody(req);
  if (payload === null) return json(400, { ok: false, error: "Ungültige Anfrage" });

  const ip = clientIp(req, context);
  if (await isRateLimited(ip)) {
    return json(429, { ok: false, error: "Zu viele Fehlversuche. Bitte in 15 Minuten erneut versuchen." });
  }

  if (!(await checkPassword(payload.password))) {
    await recordFailedAttempt(ip);
    return json(401, { ok: false, error: "Falsches Passwort" });
  }
  await clearFailedAttempts(ip);

  const neueTexte = payload.text;
  const neuesFraming = payload.framing;
  const hatTexte = neueTexte && typeof neueTexte === "object";
  const hatFraming = neuesFraming && typeof neuesFraming === "object";
  if (!hatTexte && !hatFraming) {
    return json(400, { ok: false, error: "Kein Inhalt übergeben" });
  }

  const overrides = await loadOverrides();

  if (hatTexte) {
    for (const [key, value] of Object.entries(neueTexte)) {
      if (typeof key === "string" && typeof value === "string") {
        overrides.text[key] = value;
      }
    }
  }

  if (hatFraming) {
    for (const [key, value] of Object.entries(neuesFraming)) {
      if (!/^[a-z0-9_]+$/.test(key)) continue;
      const sauber = sanitizeFraming(value);
      if (sauber) overrides.framing[key] = sauber;
    }
  }

  await saveOverrides(overrides);
  return json(200, { ok: true });
};
