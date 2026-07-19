import { checkPassword, clientIp, isRateLimited, recordFailedAttempt, clearFailedAttempts, readJsonBody, json } from "./_shared.mjs";

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
  return json(200, { ok: true });
};
